import React, { useState, useEffect } from 'react';
import { api } from '../supabase';
import { 
  Users, CheckSquare, RefreshCw, BarChart2, Star, Check, AlertCircle, 
  UserPlus, FileText, Landmark, Search, Eye, Filter, Sparkles
} from 'lucide-react';

export default function AdminDashboard({ showToast }) {
  const [kpis, setKpis] = useState({
    totalBookings: 0,
    pendingRepairs: 0,
    completedRepairs: 0,
    revenue: 0,
    avgRating: 'N/A',
    technicianPerformance: '92%'
  });
  
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  
  // Selection/Detail states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignTechId, setAssignTechId] = useState('');
  const [priceInput, setPriceInput] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pincodeFilter, setPincodeFilter] = useState('');

  // Image zoom modal
  const [zoomProofUrl, setZoomProofUrl] = useState(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      const [bList, tList, kpiStats] = await Promise.all([
        api.bookings.list(),
        api.profiles.list('technician'),
        api.dashboard.getKPIs()
      ]);
      setBookings(bList);
      setTechnicians(tList);
      setKpis({ ...kpiStats, technicianPerformance: '92%' });
    } catch (err) {
      showToast('Error loading dashboard analytics', 'error');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...bookings];
    
    // Status Filter
    if (statusFilter === 'new') {
      result = result.filter(b => b.status === 'Booking Received');
    } else if (statusFilter === 'ongoing') {
      result = result.filter(b => !['Booking Received', 'Delivered', 'Closed'].includes(b.status));
    } else if (statusFilter === 'completed') {
      result = result.filter(b => ['Delivered', 'Closed'].includes(b.status));
    }
    
    // Pincode filter
    if (pincodeFilter.trim()) {
      result = result.filter(b => b.pincode.includes(pincodeFilter.trim()));
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b => 
        b.booking_number.toLowerCase().includes(term) ||
        b.customer_name.toLowerCase().includes(term) ||
        b.customer_mobile.includes(term)
      );
    }

    setFilteredBookings(result);
  }, [bookings, statusFilter, searchTerm, pincodeFilter]);

  // Dispatch work order
  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !assignTechId) return;
    try {
      await api.assignments.assign(selectedBooking.id, assignTechId, 'admin-user');
      showToast('Technician assigned successfully!', 'success');
      loadDashboardData();
      
      // Update local detailed view
      setSelectedBooking(prev => ({
        ...prev,
        status: 'Pickup Scheduled'
      }));
    } catch (err) {
      showToast('Failed to assign technician', 'error');
    }
  };

  // Update booking status directly
  const handleStatusUpdate = async (status) => {
    if (!selectedBooking) return;
    try {
      // If setting actual price
      const updates = { status };
      if (status === 'Diagnosis Completed' && priceInput) {
        updates.actual_price = Number(priceInput);
      }

      await api.bookings.update(selectedBooking.id, updates);
      showToast(`Status updated to "${status}"`, 'success');
      loadDashboardData();
      
      setSelectedBooking(prev => ({
        ...prev,
        ...updates
      }));
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Payment Verification
  const handleVerifyPayment = async () => {
    if (!selectedBooking) return;
    try {
      await api.bookings.update(selectedBooking.id, { payment_status: 'verified' });
      showToast('Payment verified successfully!', 'success');
      loadDashboardData();
      
      setSelectedBooking(prev => ({
        ...prev,
        payment_status: 'verified'
      }));
    } catch (err) {
      showToast('Failed to verify payment', 'error');
    }
  };

  // Invoice Generator
  const handleGenerateInvoice = async () => {
    if (!selectedBooking) return;
    try {
      // Simulate generating a PDF and saving invoice url
      const mockPdfUrl = `https://pdf-invoice-generator.mock/invoice-${selectedBooking.booking_number}.pdf`;
      await api.bookings.update(selectedBooking.id, { 
        invoice_url: mockPdfUrl,
        status: selectedBooking.status === 'Ready for Delivery' ? 'Delivered' : selectedBooking.status
      });
      showToast('Invoice generated successfully!', 'success');
      loadDashboardData();
      
      setSelectedBooking(prev => ({
        ...prev,
        invoice_url: mockPdfUrl,
        status: prev.status === 'Ready for Delivery' ? 'Delivered' : prev.status
      }));
    } catch (err) {
      showToast('Failed to generate invoice', 'error');
    }
  };

  // Close ticket
  const handleCloseTicket = async () => {
    if (!selectedBooking) return;
    try {
      await api.bookings.update(selectedBooking.id, { status: 'Closed' });
      showToast('Booking ticket closed successfully!', 'success');
      loadDashboardData();
      
      setSelectedBooking(prev => ({
        ...prev,
        status: 'Closed'
      }));
    } catch (err) {
      showToast('Failed to close ticket', 'error');
    }
  };

  const getStatusClass = (status) => {
    if (['Delivered', 'Closed'].includes(status)) return 'badge-success';
    if (['Booking Received'].includes(status)) return 'badge-pending';
    return 'badge-info';
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Admin Control Room</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage repair lifecycles, assign staff, and audit billing metrics.</p>
        </div>
        <button className="btn btn-outline" onClick={loadDashboardData} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <RefreshCw size={16} /> Sync Live Data
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="grid-cols-layout" style={{ marginBottom: '30px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="var(--secondary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Repairs</span>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{kpis.totalBookings}</h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={24} color="var(--warning)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pending Repairs</span>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{kpis.pendingRepairs}</h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckSquare size={24} color="var(--success)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completed</span>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{kpis.completedRepairs}</h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(198, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Landmark size={24} color="var(--primary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Revenue</span>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>₹{kpis.revenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={24} color="var(--info)" fill="var(--info)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg Rating</span>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{kpis.avgRating} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 5</span></h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={24} color="#ec4899" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tech Performance</span>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{kpis.technicianPerformance}</h2>
          </div>
        </div>
      </div>

      {/* DASHBOARD PANEL GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedBooking ? '1.2fr 1fr' : '1fr', gap: '20px' }}>
        
        {/* LISTING COLUMN */}
        <div>
          <div className="glass-card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
              <h3>Booking Queue ({filteredBookings.length})</h3>
              
              {/* FILTERS TOOLBAR */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                  className="form-input form-select" 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ width: '130px', padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New Received</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
                
                <input
                  type="text"
                  className="form-input"
                  placeholder="Pincode..."
                  value={pincodeFilter}
                  onChange={e => setPincodeFilter(e.target.value)}
                  style={{ width: '90px', padding: '6px 12px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by ID, name or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            </div>

            {/* QUEUE TABLE */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 8px' }}>Ref ID</th>
                    <th style={{ padding: '12px 8px' }}>Customer</th>
                    <th style={{ padding: '12px 8px' }}>Device Details</th>
                    <th style={{ padding: '12px 8px' }}>Scheduled</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No matching booking requests in database.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr 
                        key={b.id} 
                        style={{ 
                          borderBottom: '1px solid var(--border-glass)', 
                          background: selectedBooking?.id === b.id ? 'rgba(198, 255, 0, 0.03)' : 'transparent',
                          cursor: 'pointer' 
                        }}
                        onClick={() => {
                          setSelectedBooking(b);
                          setAssignTechId('');
                          setPriceInput(b.actual_price || '');
                        }}
                      >
                        <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{b.booking_number}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <div>{b.customer_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customer_mobile}</div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ color: 'black', fontWeight: '600' }}>{b.brands?.name} {b.device_types?.name}</span>
                          <div style={{ fontSize: '0.75rem', color: 'black', fontWeight: '600' }}>{b.problem_categories?.name}</div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div>{b.scheduled_date}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.service_type.toUpperCase()}</div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className={`badge ${getStatusClass(b.status)}`}>{b.status}</span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Eye size={12} /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* DETAILED SIDE PANEL */}
        {selectedBooking && (
          <div className="glass-card animate-fade-in" style={{ alignSelf: 'start', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '15px', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '6px' }}>{selectedBooking.status}</span>
                <h2>{selectedBooking.booking_number}</h2>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.9rem' }}>
              {/* Customer Contact */}
              <div>
                <strong style={{ color: 'var(--secondary)' }}>Customer Profile</strong>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-glass)', marginTop: '5px' }}>
                  <div>Name: <strong>{selectedBooking.customer_name}</strong></div>
                  <div>Mobile: <strong>{selectedBooking.customer_mobile}</strong></div>
                  <div>Email: <strong>{selectedBooking.customer_email}</strong></div>
                  <div>Pincode: <strong>{selectedBooking.pincode}</strong></div>
                  {selectedBooking.service_type === 'pickup' && <div>Address: <strong style={{ fontSize: '0.8rem' }}>{selectedBooking.customer_address}</strong></div>}
                </div>
              </div>

              {/* Device Issue */}
              <div>
                <strong style={{ color: 'var(--secondary)' }}>Device & Problem</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-glass)', marginTop: '5px' }}>
                  <span>{selectedBooking.brands?.name} {selectedBooking.device_types?.name}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{selectedBooking.problem_categories?.name}</span>
                </div>
              </div>

              {/* Dynamic Dispatcher Dropdown */}
              {selectedBooking.status === 'Booking Received' && (
                <div className="glass-card" style={{ background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                  <strong style={{ display: 'block', marginBottom: '8px' }}><UserPlus size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Assign Work Ticket</strong>
                  <form onSubmit={handleAssignTechnician} style={{ display: 'flex', gap: '10px' }}>
                    <select
                      className="form-input form-select"
                      value={assignTechId}
                      onChange={e => setAssignTechId(e.target.value)}
                      required
                      style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                    >
                      <option value="">Choose Technician...</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.full_name}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Assign</button>
                  </form>
                </div>
              )}

              {/* Invoice Generation & Diagnosis approval section */}
              {selectedBooking.status === 'Diagnosis Completed' && (
                <div className="glass-card" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                  <strong>💵 Diagnosis Pricing Clearance</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '5px 0 10px 0' }}>Estimate range: ₹{Number(selectedBooking.estimated_price_min).toLocaleString()} - ₹{Number(selectedBooking.estimated_price_max).toLocaleString()}</p>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter Actual Bill (₹)"
                      value={priceInput}
                      onChange={e => setPriceInput(e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      disabled={!priceInput}
                      onClick={() => handleStatusUpdate('Diagnosis Completed')}
                    >
                      Save Bill
                    </button>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>*Saving bill triggers estimate approval notification to client.</span>
                </div>
              )}

              {/* Payment Verification section */}
              {selectedBooking.payment_method === 'qr_payment' && (
                <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <strong>💸 QR Code Payment Verification</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div>
                      <span>Payment Status: <strong style={{ color: selectedBooking.payment_status === 'verified' ? 'var(--success)' : 'var(--warning)' }}>{selectedBooking.payment_status.toUpperCase()}</strong></span>
                      {selectedBooking.payment_proof_url && (
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '2px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}
                          onClick={() => setZoomProofUrl(selectedBooking.payment_proof_url)}
                        >
                          <FileText size={12} /> View Proof Screenshot
                        </button>
                      )}
                    </div>
                    {selectedBooking.payment_status !== 'verified' && (
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={handleVerifyPayment}>
                        <Check size={14} /> Verify
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Status transition operations */}
              <div>
                <strong style={{ color: 'var(--secondary)' }}>Lifecycle Status Actions</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {selectedBooking.status === 'Pickup Scheduled' && (
                    <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => handleStatusUpdate('Device Received')}>
                      Mark Device Received
                    </button>
                  )}
                  {selectedBooking.status === 'Quality Check' && (
                    <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => handleStatusUpdate('Ready for Delivery')}>
                      Mark Ready for Delivery
                    </button>
                  )}
                  {selectedBooking.status === 'Ready for Delivery' && (
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={handleGenerateInvoice}>
                      <FileText size={14} /> Generate Invoice & Deliver
                    </button>
                  )}
                  {selectedBooking.status === 'Delivered' && (
                    <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={handleCloseTicket}>
                      Close Repair Ticket
                    </button>
                  )}
                  {['Delivered', 'Closed'].includes(selectedBooking.status) && selectedBooking.invoice_url && (
                    <a href={selectedBooking.invoice_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                      View Invoice PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Zoom Lightbox Modal */}
      {zoomProofUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
        }}>
          <img src={zoomProofUrl} alt="QR Payment Proof zoomed" style={{ maxWidth: '85%', maxHeight: '80%', borderRadius: '8px', border: '2px solid white' }} />
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setZoomProofUrl(null)}>Close Lightbox</button>
        </div>
      )}
    </div>
  );
}
