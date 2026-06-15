import React, { useState, useEffect } from 'react';
import { api } from '../supabase';
import { 
  Laptop, Monitor, Smartphone, CheckCircle, Calendar, MapPin, 
  Upload, QrCode, CreditCard, ArrowRight, Search, Star, User, 
  Phone, Mail, Clock, AlertTriangle, ChevronRight, Check, X
} from 'lucide-react';

export default function CustomerFlow({ showToast, initialTab }) {
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [problems, setProblems] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // Selection states
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [macModel, setMacModel] = useState('');
  const [selectedProblem, setSelectedProblem] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState({ min: 0, max: 0 });

  // Booking states
  const [serviceType, setServiceType] = useState('pickup'); // 'pickup' or 'walk_in'
  const [pincode, setPincode] = useState('');
  const [isPincodeValid, setIsPincodeValid] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  // Customer info
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Files & Payment
  const [deviceFiles, setDeviceFiles] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_pickup');
  const [paymentProof, setPaymentProof] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Success state
  const [createdBooking, setCreatedBooking] = useState(null);

  // Tracking Search States
  const [searchRef, setSearchRef] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [trackedBooking, setTrackedBooking] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab || 'book'); // 'book' or 'track'

  // Sync activeTab when initialTab prop updates
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load metadata catalog
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [bList, dtList, pList, tsList] = await Promise.all([
          api.brands.list(),
          api.deviceTypes.list(),
          api.problemCategories.list(),
          api.timeSlots.list()
        ]);
        setBrands(bList);
        setDeviceTypes(dtList);
        setProblems(pList);
        setTimeSlots(tsList);
      } catch (err) {
        showToast('Error loading catalog metadata', 'error');
      }
    }
    loadCatalog();
  }, []);

  // Update price estimates dynamically
  useEffect(() => {
    if (selectedDeviceType && selectedBrand && selectedProblem) {
      async function updateEstimate() {
        const est = await api.pricingRules.getEstimate(selectedDeviceType, selectedBrand, selectedProblem);
        setEstimatedPrice(est);
      }
      updateEstimate();
    }
  }, [selectedDeviceType, selectedBrand, selectedProblem]);

  const handlePincodeValidate = async () => {
    if (!pincode) return;
    const valid = await api.pincodes.validate(pincode);
    setIsPincodeValid(valid);
    if (valid) {
      showToast('Pincode serviceable for Doorstep Pickup!', 'success');
    } else {
      showToast('Service unavailable in this area', 'error');
    }
  };

  const handleDeviceImageChange = (e) => {
    if (e.target.files) {
      setDeviceFiles(Array.from(e.target.files));
    }
  };

  const handlePaymentProofChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const submitBooking = async () => {
    if (paymentMethod === 'razorpay') {
      setIsProcessingPayment(true);
      // Simulate Razorpay Gateway Opening
      await new Promise(r => setTimeout(r, 2000));
      setIsProcessingPayment(false);
      showToast('Razorpay Payment Successful!', 'success');
    }

    try {
      const bookingData = {
        customer_id: null,
        customer_name: name,
        customer_mobile: mobile,
        customer_email: email,
        customer_address: serviceType === 'pickup' ? address : 'Walk-in Service Center',
        pincode: serviceType === 'pickup' ? pincode : '110001',
        device_type_id: selectedDeviceType,
        brand_id: selectedBrand,
        problem_category_id: selectedProblem,
        service_type: serviceType,
        scheduled_date: selectedDate,
        time_slot_id: selectedSlot,
        estimated_price_min: estimatedPrice.min,
        estimated_price_max: estimatedPrice.max,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'razorpay' ? 'verified' : 'pending'
      };

      const result = await api.bookings.create(bookingData);

      // Upload files
      if (deviceFiles.length > 0) {
        for (const file of deviceFiles) {
          await api.bookings.uploadImage(result.id, file, 'device');
        }
      }

      if (paymentProof) {
        await api.bookings.uploadImage(result.id, paymentProof, 'payment');
      }

      setCreatedBooking(result);
      setStep(6);
      showToast('Booking submitted successfully!', 'success');
    } catch (err) {
      console.error('Supabase error:', err);
      showToast(`Booking failed: ${err.message || JSON.stringify(err)}`, 'error');
    }
  };

  const handleSearchTracking = async (e) => {
    e.preventDefault();
    if (!searchRef || !searchContact) return;
    setTrackingLoading(true);
    try {
      const match = await api.bookings.get(searchRef, searchContact);
      if (match) {
        setTrackedBooking(match);
        showToast('Booking found!', 'success');
      } else {
        setTrackedBooking(null);
        showToast('No matching booking found', 'error');
      }
    } catch (err) {
      showToast('Error tracking booking', 'error');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Real-time tracking subscription
  useEffect(() => {
    if (!trackedBooking) return;
    const unsub = api.bookings.subscribeStatus(trackedBooking.id, (newBooking) => {
      setTrackedBooking(prev => ({
        ...prev,
        status: newBooking.status,
        actual_price: newBooking.actual_price,
        payment_status: newBooking.payment_status,
        invoice_url: newBooking.invoice_url
      }));
      showToast(`Live Update: Status changed to "${newBooking.status}"`, 'info');
    });
    return () => unsub();
  }, [trackedBooking?.id]);

  const handleStatusApproval = async (approve) => {
    if (!trackedBooking) return;
    try {
      const nextStatus = approve ? 'Repair In Progress' : 'Closed';
      await api.bookings.update(trackedBooking.id, { 
        status: nextStatus,
        feedback: approve ? null : 'Estimate Rejected by Customer'
      });
      showToast(approve ? 'Estimate approved! Repair started.' : 'Repair cancelled.', 'info');
    } catch (err) {
      showToast('Error updating status approval', 'error');
    }
  };

  const handleFeedbackSubmit = async (rating, feedbackText) => {
    if (!trackedBooking) return;
    try {
      await api.bookings.update(trackedBooking.id, { rating, feedback: feedbackText });
      showToast('Thank you for your rating & feedback!', 'success');
      // Refresh local state
      setTrackedBooking(prev => ({ ...prev, rating, feedback: feedbackText }));
    } catch (err) {
      showToast('Error saving feedback', 'error');
    }
  };

  // Lifecycle steps constant
  const LIFECYCLE_STEPS = [
    'Booking Received', 'Pickup Scheduled', 'Device Received', 'Diagnosis Completed', 
    'Waiting for Approval', 'Repair In Progress', 'Quality Check', 'Ready for Delivery', 'Delivered', 'Closed'
  ];

  const getLifecycleIndex = (status) => LIFECYCLE_STEPS.indexOf(status);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
        <button 
          className={`btn ${activeTab === 'book' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setActiveTab('book'); setStep(1); setCreatedBooking(null); }}
        >
          Book a Repair
        </button>
        <button 
          className={`btn ${activeTab === 'track' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('track')}
        >
          Track Live Status
        </button>
      </div>

      {activeTab === 'book' ? (
        <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
          {/* Step Headers */}
          {step < 6 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '15px' }}>
              {[1, 2, 3, 4, 5].map(num => (
                <div key={num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: step >= num ? 1 : 0.4 }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: step === num ? 'var(--primary)' : step > num ? 'var(--secondary)' : 'transparent',
                    color: step === num ? '#05070c' : 'white',
                    border: '2px solid ' + (step >= num ? 'transparent' : 'var(--border-glass)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                  }}>
                    {step > num ? <Check size={16} /> : num}
                  </div>
                  <span className="step-label" style={{ color: step >= num ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: step >= num ? '600' : '400' }}>
                    {num === 1 && 'Device'}
                    {num === 2 && 'Schedule'}
                    {num === 3 && 'Details'}
                    {num === 4 && 'Photos'}
                    {num === 5 && 'Payment'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* STEP 1: DEVICE / PROBLEM SELECTION */}
          {step === 1 && (
            <div>
              <h2 style={{ marginBottom: '8px' }}>Select Device & Problem</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Fill in details to view immediate service estimates.</p>
              
              <div className="form-group">
                <label className="form-label">Device Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {deviceTypes.map(dt => (
                    <button
                      key={dt.id}
                      type="button"
                      className={`glass-card`}
                      style={{
                        padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        borderColor: selectedDeviceType === dt.id ? 'var(--primary)' : 'var(--border-glass)',
                        background: selectedDeviceType === dt.id ? 'rgba(198, 255, 0, 0.05)' : 'var(--bg-glass)',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedDeviceType(dt.id);
                        if (dt.name === 'MacBook') {
                          setSelectedBrand('dummy_apple_id');
                        } else if (selectedBrand === 'dummy_apple_id') {
                          setSelectedBrand('');
                          setMacModel('');
                        }
                      }}
                    >
                      {dt.name === 'Laptop' && <Laptop size={28} color={selectedDeviceType === dt.id ? 'var(--primary)' : 'white'} />}
                      {dt.name === 'Desktop' && <Monitor size={28} color={selectedDeviceType === dt.id ? 'var(--primary)' : 'white'} />}
                      {dt.name === 'MacBook' && <Smartphone size={28} color={selectedDeviceType === dt.id ? 'var(--primary)' : 'white'} />}
                      <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{dt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {deviceTypes.find(d => d.id === selectedDeviceType)?.name !== 'MacBook' && (
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <select 
                    className="form-input form-select" 
                    value={selectedBrand} 
                    onChange={e => setSelectedBrand(e.target.value)}
                  >
                    <option value="">Select Laptop/Desktop Brand</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {deviceTypes.find(d => d.id === selectedDeviceType)?.name === 'MacBook' && (
                <div className="form-group">
                  <label className="form-label">Mac Model</label>
                  <select 
                    className="form-input form-select" 
                    value={macModel} 
                    onChange={e => setMacModel(e.target.value)}
                  >
                    <option value="">Select Mac Model</option>
                    <option value="Macbook Air">Macbook Air</option>
                    <option value="Macbook Pro">Macbook Pro</option>
                    <option value="IMac">IMac</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">What is the problem?</label>
                <select 
                  className="form-input form-select" 
                  value={selectedProblem} 
                  onChange={e => setSelectedProblem(e.target.value)}
                >
                  <option value="">Select Problem Category</option>
                  {problems.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Estimate Display Card */}
              {selectedDeviceType && selectedBrand && selectedProblem && (
                <div className="glass-card animate-fade-in" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--primary)', borderStyle: 'dashed', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: 'var(--primary)' }}>Estimated Repair Cost</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Inclusive of parts & inspection</p>
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'white' }}>
                      ₹{estimatedPrice.min.toLocaleString()} - ₹{estimatedPrice.max.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  className="btn btn-primary"
                  disabled={
                    !selectedDeviceType || 
                    !selectedBrand || 
                    !selectedProblem || 
                    (deviceTypes.find(d => d.id === selectedDeviceType)?.name === 'MacBook' && !macModel)
                  }
                  onClick={() => setStep(2)}
                >
                  Configure Appointment <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SERVICE TYPE, PINCODE & SCHEDULE */}
          {step === 2 && (
            <div>
              <h2 style={{ marginBottom: '8px' }}>Service Type & Schedule</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Select if you want doorstep pickup or walk-in and schedule a slot.</p>

              <div className="form-group">
                <label className="form-label">Service Option</label>
                <div className="grid-2-cols">
                  <button
                    type="button"
                    className={`glass-card`}
                    style={{
                      padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      borderColor: serviceType === 'pickup' ? 'var(--primary)' : 'var(--border-glass)',
                      background: serviceType === 'pickup' ? 'rgba(198, 255, 0, 0.05)' : 'var(--bg-glass)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setServiceType('pickup')}
                  >
                    <MapPin size={24} color={serviceType === 'pickup' ? 'var(--primary)' : 'white'} />
                    <span style={{ fontWeight: '600' }}>Doorstep Pickup</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>We pick and drop from your location</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`glass-card`}
                    style={{
                      padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      borderColor: serviceType === 'walk_in' ? 'var(--primary)' : 'var(--border-glass)',
                      background: serviceType === 'walk_in' ? 'rgba(198, 255, 0, 0.05)' : 'var(--bg-glass)',
                      cursor: 'pointer'
                    }}
                    onClick={() => { setServiceType('walk_in'); setIsPincodeValid(true); }}
                  >
                    <Clock size={24} color={serviceType === 'walk_in' ? 'var(--primary)' : 'white'} />
                    <span style={{ fontWeight: '600' }}>Walk-in Service</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Visit our service center directly</span>
                  </button>
                </div>
              </div>

              {serviceType === 'pickup' && (
                <div className="form-group animate-fade-in">
                  <label className="form-label">Pincode Validation</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter 6-digit Pincode"
                      value={pincode}
                      onChange={e => { setPincode(e.target.value); setIsPincodeValid(null); }}
                    />
                    <button type="button" className="btn btn-secondary" onClick={handlePincodeValidate}>Check</button>
                  </div>
                  {isPincodeValid === true && (
                    <span style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '6px', display: 'block' }}>✓ Service available in your location.</span>
                  )}
                  {isPincodeValid === false && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '6px', display: 'block' }}>✗ Service not available. Try walk-in service.</span>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Preferred Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time Slot</label>
                <select
                  className="form-input form-select"
                  value={selectedSlot}
                  onChange={e => setSelectedSlot(e.target.value)}
                >
                  <option value="">Select Time Slot</option>
                  {timeSlots.map(slot => (
                    <option key={slot.id} value={slot.id}>{slot.slot_time}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                <button
                  className="btn btn-primary"
                  disabled={!selectedDate || !selectedSlot || (serviceType === 'pickup' && !isPincodeValid)}
                  onClick={() => setStep(3)}
                >
                  Customer Info <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CUSTOMER DETAILS */}
          {step === 3 && (
            <div>
              <h2 style={{ marginBottom: '8px' }}>Customer Contact Details</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Provide contact info for invoice and tracking updates.</p>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="10-digit number"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {serviceType === 'pickup' && (
                <div className="form-group animate-fade-in">
                  <label className="form-label">Complete Address</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    placeholder="House No, Building, Street, Area..."
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
                <button
                  className="btn btn-primary"
                  disabled={!name || !mobile || !email || (serviceType === 'pickup' && !address)}
                  onClick={() => setStep(4)}
                >
                  Upload Photos <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: UPLOAD DEVICE IMAGES */}
          {step === 4 && (
            <div>
              <h2 style={{ marginBottom: '8px' }}>Upload Device Images (Optional)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Upload physical photos of the damage to assist diagnosis.</p>

              <div style={{
                border: '2px dashed var(--border-glass)', borderRadius: '12px', padding: '40px 20px', 
                textAlign: 'center', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.01)',
                marginBottom: '20px'
              }} onClick={() => document.getElementById('device-file-input').click()}>
                <Upload size={40} color="var(--secondary)" style={{ marginBottom: '12px' }} />
                <h4 style={{ marginBottom: '6px' }}>Drag & Drop or Click to Upload</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supported formats: PNG, JPG, JPEG (Max 3 files)</p>
                <input
                  id="device-file-input"
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleDeviceImageChange}
                />
              </div>

              {deviceFiles.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">Files Selected ({deviceFiles.length})</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {deviceFiles.map((file, i) => (
                      <div key={i} className="glass-card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                        <X size={14} color="var(--danger)" style={{ cursor: 'pointer' }} onClick={() => setDeviceFiles(prev => prev.filter((_, idx) => idx !== i))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button className="btn btn-outline" onClick={() => setStep(3)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(5)}>
                  Checkout & Payment <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: PAYMENT */}
          {step === 5 && (
            <div>
              <h2 style={{ marginBottom: '8px' }}>Select Payment Method</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Choose how you would like to clear the balance.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {/* Cash on Pickup option */}
                <label className="glass-card" style={{
                  display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer',
                  borderColor: paymentMethod === 'cash_on_pickup' ? 'var(--primary)' : 'var(--border-glass)',
                  background: paymentMethod === 'cash_on_pickup' ? 'rgba(198, 255, 0, 0.03)' : 'var(--bg-glass)'
                }}>
                  <input
                    type="radio"
                    name="payOpt"
                    checked={paymentMethod === 'cash_on_pickup'}
                    onChange={() => setPaymentMethod('cash_on_pickup')}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CreditCard size={20} color="var(--primary)" />
                    <div>
                      <h4 style={{ margin: 0 }}>{serviceType === 'pickup' ? 'Cash on Pickup' : 'Cash on Walk-in'}</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pay cash/UPI directly at the time of handoff</p>
                    </div>
                  </div>
                </label>

                {/* QR Payment option */}
                <label className="glass-card" style={{
                  display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer',
                  borderColor: paymentMethod === 'qr_payment' ? 'var(--primary)' : 'var(--border-glass)',
                  background: paymentMethod === 'qr_payment' ? 'rgba(198, 255, 0, 0.03)' : 'var(--bg-glass)'
                }}>
                  <input
                    type="radio"
                    name="payOpt"
                    checked={paymentMethod === 'qr_payment'}
                    onChange={() => setPaymentMethod('qr_payment')}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <QrCode size={20} color="var(--primary)" />
                    <div>
                      <h4 style={{ margin: 0 }}>Scan QR Code (Pre-pay)</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scan QR code and upload transfer confirmation receipt</p>
                    </div>
                  </div>
                </label>

                {/* Razorpay (Simulated) */}
                <label className="glass-card" style={{
                  display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer',
                  borderColor: paymentMethod === 'razorpay' ? 'var(--primary)' : 'var(--border-glass)',
                  background: paymentMethod === 'razorpay' ? 'rgba(198, 255, 0, 0.03)' : 'var(--bg-glass)'
                }}>
                  <input
                    type="radio"
                    name="payOpt"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CreditCard size={20} color="var(--primary)" />
                    <div>
                      <h4 style={{ margin: 0 }}>Razorpay Instant Checkout</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Secure online netbanking / credit card checkout</p>
                    </div>
                  </div>
                </label>
              </div>

              {paymentMethod === 'qr_payment' && (
                <div className="glass-card animate-fade-in" style={{ marginBottom: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                  <h4 style={{ marginBottom: '12px' }}>Wachstum Solution UPI QR code</h4>
                  <div style={{ background: 'white', padding: '12px', display: 'inline-block', borderRadius: '8px', marginBottom: '15px' }}>
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=wachstumsolution@okaxis%26pn=Wachstum%2520Solution%26am=0"
                      alt="UPI QR Code"
                      style={{ display: 'block' }}
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>Pay the inspection charge / total amount and upload the screenshot.</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button type="button" className="btn btn-outline" onClick={() => document.getElementById('qr-receipt-input').click()}>
                      <Upload size={16} /> Upload Screenshot
                    </button>
                    <input
                      id="qr-receipt-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePaymentProofChange}
                    />
                  </div>
                  {paymentProof && (
                    <span style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '10px', display: 'block' }}>✓ {paymentProof.name} attached.</span>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button className="btn btn-outline" onClick={() => setStep(4)}>Back</button>
                <button
                  className="btn btn-primary"
                  disabled={isProcessingPayment || (paymentMethod === 'qr_payment' && !paymentProof)}
                  onClick={submitBooking}
                >
                  {isProcessingPayment ? 'Connecting Payment Gateway...' : 'Confirm & Book Service'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: CONFIRMATION */}
          {step === 6 && createdBooking && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle size={60} color="var(--primary)" style={{ marginBottom: '15px' }} />
              <h2>Booking Confirmed!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>We have registered your device repair ticket successfully.</p>
              
              <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', display: 'inline-block', padding: '16px 30px', marginBottom: '30px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking Reference</span>
                <h3 style={{ fontSize: '1.5rem', color: 'white', marginTop: '4px' }}>{createdBooking.booking_number}</h3>
              </div>

              <div style={{
                maxWidth: '400px', margin: '0 auto 30px auto', background: 'rgba(139, 92, 246, 0.05)', 
                border: '1px solid rgba(139, 92, 246, 0.2)', padding: '14px', borderRadius: '12px', fontSize: '0.85rem'
              }}>
                📧 Confirmation email and SMS notifications have been sent to <strong>{createdBooking.customer_email}</strong>.
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setSearchRef(createdBooking.booking_number);
                    setSearchContact(createdBooking.customer_mobile);
                    setActiveTab('track');
                    // Fetch directly
                    setTrackingLoading(true);
                    api.bookings.get(createdBooking.booking_number, createdBooking.customer_mobile).then(data => {
                      setTrackedBooking(data);
                      setTrackingLoading(false);
                    });
                  }}
                >
                  Track Live Progress
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => {
                    setStep(1);
                    setSelectedDeviceType('');
                    setSelectedBrand('');
                    setSelectedProblem('');
                    setName('');
                    setMobile('');
                    setEmail('');
                    setAddress('');
                    setPincode('');
                    setIsPincodeValid(null);
                    setDeviceFiles([]);
                    setPaymentProof(null);
                  }}
                >
                  New Booking
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TRACKING VIEW */
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div className="glass-card" style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '8px' }}>Track Repair Ticket</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Enter your booking ID (WS-XXXX) and mobile number/email to track live progress.</p>
            
            <form onSubmit={handleSearchTracking} className="tracking-form-grid">
              <div>
                <label className="form-label">Booking Reference</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. WS-2026-0001"
                  value={searchRef}
                  onChange={e => setSearchRef(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Mobile / Email</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 9810012345"
                  value={searchContact}
                  onChange={e => setSearchContact(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ height: '46px' }} disabled={trackingLoading}>
                <Search size={18} /> {trackingLoading ? 'Searching...' : 'Track'}
              </button>
            </form>
          </div>

          {trackedBooking && (
            <div className="glass-card animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '15px', marginBottom: '24px' }}>
                <div>
                  <span className="badge badge-info" style={{ marginBottom: '6px' }}>{trackedBooking.status}</span>
                  <h2>{trackedBooking.booking_number}</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Booked on: {new Date(trackedBooking.created_at).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Device Configuration</span>
                  <strong style={{ fontSize: '1.1rem', color: 'white' }}>
                    {trackedBooking.brands?.name} {trackedBooking.device_types?.name}
                  </strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--primary)' }}>
                    Problem: {trackedBooking.problem_categories?.name}
                  </span>
                </div>
              </div>

              {/* TIMELINE PROGRESS */}
              <div style={{ marginBottom: '35px' }}>
                <h4 style={{ marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Repair Lifecycle Tracking</h4>
                
                <div className="timeline">
                  {LIFECYCLE_STEPS.map((statusName, idx) => {
                    const bookingIdx = getLifecycleIndex(trackedBooking.status);
                    const isCompleted = bookingIdx > idx;
                    const isActive = bookingIdx === idx;
                    
                    return (
                      <div key={statusName} className={`timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                        <div className="timeline-badge" />
                        <div className="timeline-content" style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: isActive ? 'var(--primary)' : isCompleted ? 'white' : 'var(--text-muted)' }}>
                              {statusName}
                            </strong>
                            {isActive && (
                              <span style={{ fontSize: '0.7rem', background: 'rgba(198, 255, 0, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                LIVE STATUS
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTION BLOCK FOR CLIENT (Waiting for Approval State) */}
              {trackedBooking.status === 'Diagnosis Completed' && trackedBooking.actual_price && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'center'
                }}>
                  <AlertTriangle size={36} color="var(--warning)" style={{ marginBottom: '8px' }} />
                  <h3>Action Required: Approve Price Estimate</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '8px 0 15px 0' }}>
                    The technician has completed the diagnosis. The final repair cost is calculated at <strong>₹{Number(trackedBooking.actual_price).toLocaleString()}</strong>.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => handleStatusApproval(true)}>
                      Approve & Start Repair
                    </button>
                    <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }} onClick={() => handleStatusApproval(false)}>
                      Decline & Cancel Booking
                    </button>
                  </div>
                </div>
              )}

              {/* FEEDBACK BLOCK (Delivered / Closed State) */}
              {(trackedBooking.status === 'Delivered' || trackedBooking.status === 'Closed') && (
                <div className="glass-card" style={{ background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed', padding: '20px' }}>
                  <h3>Customer Review & Rating</h3>
                  {trackedBooking.rating ? (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={18} fill={star <= trackedBooking.rating ? 'var(--primary)' : 'none'} color="var(--primary)" />
                        ))}
                      </div>
                      <p style={{ color: 'white', fontStyle: 'italic' }}>"{trackedBooking.feedback}"</p>
                    </div>
                  ) : (
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>How was your experience with Wachstum Solution? Please rate our service.</p>
                      <FeedbackForm onSubmit={(r, f) => handleFeedbackSubmit(r, f)} />
                    </div>
                  )}
                </div>
              )}

              {/* DETAILS SUMMARY */}
              <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="glass-card" style={{ padding: '15px' }}>
                  <h4 style={{ marginBottom: '10px', color: 'var(--secondary)' }}>Customer Details</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span>Name: <strong>{trackedBooking.customer_name}</strong></span>
                    <span>Contact: <strong>{trackedBooking.customer_mobile}</strong></span>
                    <span>Service: <strong>{trackedBooking.service_type === 'pickup' ? 'Doorstep Pickup' : 'Walk-in'}</strong></span>
                    {trackedBooking.service_type === 'pickup' && <span>Address: <strong>{trackedBooking.customer_address}</strong></span>}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '15px' }}>
                  <h4 style={{ marginBottom: '10px', color: 'var(--secondary)' }}>Billing Summary</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span>Estimate Min/Max: <strong>₹{Number(trackedBooking.estimated_price_min).toLocaleString()} - ₹{Number(trackedBooking.estimated_price_max).toLocaleString()}</strong></span>
                    <span>Actual Bill: <strong style={{ color: 'white' }}>{trackedBooking.actual_price ? `₹${Number(trackedBooking.actual_price).toLocaleString()}` : 'Inspection Pending'}</strong></span>
                    <span>Payment: <strong style={{ color: trackedBooking.payment_status === 'verified' ? 'var(--success)' : 'var(--warning)' }}>{trackedBooking.payment_status.toUpperCase()} ({trackedBooking.payment_method.replace('_', ' ')})</strong></span>
                    {trackedBooking.invoice_url && (
                      <a href={trackedBooking.invoice_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', marginTop: '5px', display: 'block', fontWeight: 'bold' }}>
                        📥 Download PDF Invoice
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Inner helper class for rendering star/feedback selections
function FeedbackForm({ onSubmit }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  
  return (
    <div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button 
            type="button" 
            key={star} 
            onClick={() => setRating(star)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <Star size={24} fill={star <= rating ? 'var(--primary)' : 'none'} color="var(--primary)" />
          </button>
        ))}
      </div>
      <textarea
        className="form-input"
        rows="2"
        placeholder="Type comments about device repair experience..."
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        style={{ marginBottom: '12px' }}
      />
      <button 
        type="button" 
        className="btn btn-secondary" 
        disabled={!feedback.trim()}
        onClick={() => onSubmit(rating, feedback)}
      >
        Submit Rating
      </button>
    </div>
  );
}
