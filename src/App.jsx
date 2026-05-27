import React, { useState } from 'react';
import CustomerFlow from './components/CustomerFlow';
import AdminDashboard from './components/AdminDashboard';
import TechnicianPanel from './components/TechnicianPanel';
import { 
  Wrench, ShieldCheck, MapPin, CheckCircle, Smartphone, 
  AlertOctagon, Laptop, Calendar, Truck, Search, Send, 
  Star, Crown, Smile, ArrowUpRight, Menu, X, Landmark, Compass
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('customer'); // 'customer' | 'admin' | 'technician'
  const [toasts, setToasts] = useState([]);
  
  // Controls modal visibility for booking flow
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // Toast notification dispatcher
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fdfdfd' }}>
      
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type} animate-fade-in`}>
            {toast.type === 'error' && <AlertOctagon size={18} color="var(--danger)" />}
            {toast.type === 'success' && <CheckCircle size={18} color="var(--success)" />}
            {toast.type === 'info' && <Compass size={18} color="var(--info)" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* 1. Header Navigation Bar */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        padding: '16px 0'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Brand Logo & Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => { setIsBookingOpen(false); setIsTrackingOpen(false); }} className="nav-link">
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: '900', fontSize: '1.7rem', letterSpacing: '-0.04em', color: '#111111' }}>
                LAP<span style={{ color: 'var(--secondary)' }}>FIX</span>
              </span>
              <div style={{ fontSize: '0.55rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold', marginTop: '-3px' }}>
                FIX IT. TRUST IT. USE IT.
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <span className="nav-link active" onClick={() => { setIsBookingOpen(false); setIsTrackingOpen(false); }}>Home</span>
            <span className="nav-link" onClick={() => setIsBookingOpen(true)}>Services</span>
            <span className="nav-link" onClick={() => setIsBookingOpen(true)}>How It Works</span>
            <span className="nav-link" onClick={() => { setIsTrackingOpen(true); setIsBookingOpen(false); }}>Track Repair</span>
            <span className="nav-link">About Us</span>
            <span className="nav-link">Contact</span>
          </nav>

          {/* Call to Action Button */}
          <div>
            <button className="btn btn-black" onClick={() => setIsBookingOpen(true)} style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Book a Service
              <div style={{
                background: 'var(--primary)',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000'
              }}>
                <ArrowUpRight size={12} strokeWidth={3} />
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* DYNAMIC SCREEN ROUTING BASED ON DEVELOPER ROLE SWITCHER */}
      {role === 'customer' ? (
        /* CUSTOMER FLOW LANDING VIEW */
        <div style={{ flex: 1 }}>
          
          {/* A. HERO SECTION */}
          <div className="container">
            <div className="hero-container">
              
              {/* Left Column Text & CTA */}
              <div>
                <h1 style={{ fontSize: '3.6rem', lineHeight: '1.1', marginBottom: '20px', color: '#09090b', fontFamily: 'var(--font-display)', fontWeight: '800' }}>
                  Laptop problems?<br />
                  We <span className="highlight-got">got</span> your back.
                </h1>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '35px', maxWidth: '440px', lineHeight: '1.6' }}>
                  Fast, reliable & hassle-free laptop repair with doorstep pickup & live updates.
                </p>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                  <button className="btn btn-primary" onClick={() => setIsBookingOpen(true)} style={{ padding: '14px 28px' }}>
                    Book a Repair <ArrowUpRight size={18} />
                  </button>
                  <button className="btn btn-outline" onClick={() => setIsBookingOpen(true)} style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={18} /> Pickup & Drop <ArrowUpRight size={18} />
                  </button>
                </div>

                {/* Overlapping Client Avatars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar-group">
                    <img className="avatar-img" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Customer avatar" />
                    <img className="avatar-img" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Customer avatar" />
                    <img className="avatar-img" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80" alt="Customer avatar" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#27272a', fontWeight: '600' }}>
                      Trusted by <span style={{ color: 'var(--secondary)' }}>2500+</span> happy customers
                    </span>
                    {/* Hand-drawn wiggly line simulation */}
                    <div style={{ borderBottom: '2px dashed var(--secondary)', width: '120px', marginTop: '2px', opacity: 0.6 }} />
                  </div>
                </div>
              </div>

              {/* Right Column MacBook Display */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                <div className="laptop-mockup">
                  
                  {/* Dashed Pickup Badge on top */}
                  <div className="badge-doorstep">
                    DOORSTEP PICKUP & DROP ↩
                  </div>

                  {/* Pink circle Live updates badge */}
                  <div className="badge-pink-circle">
                    <Smile size={20} style={{ marginBottom: '4px' }} />
                    <span>LIVE</span>
                    <span>STATUS</span>
                    <span>UPDATES</span>
                  </div>

                  {/* MacBook mockup body */}
                  <div className="laptop-screen">
                    <div className="laptop-screen-content">
                      <div style={{ fontSize: '2.5rem', lineHeight: '1.2', letterSpacing: '-0.02em', fontStyle: 'italic', transform: 'rotate(-4deg)' }}>
                        WE FIX.<br/>
                        <span style={{ color: '#fff' }}>YOU FLEX.</span>
                      </div>
                      <div style={{ fontSize: '1.5rem', marginTop: '10px' }}>☺</div>
                    </div>
                  </div>
                  <div className="laptop-base" />

                  {/* Purple Ribbon Warranty */}
                  <div className="badge-warranty-ribbon">
                    <Crown size={16} />
                    <span>90 DAYS WARRANTY</span>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* B. HOW IT WORKS SECTION */}
          <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.03)', padding: '80px 0' }}>
            <div className="container">
              
              <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                  HOW IT WORKS?
                </h2>
                <div style={{ borderBottom: '3px solid var(--secondary)', width: '80px', margin: '8px auto 0 auto', borderRadius: '9999px' }} />
              </div>

              <div className="steps-container">
                
                {/* Step 1 */}
                <div className="step-card">
                  <div className="step-number">1</div>
                  <Calendar size={28} color="var(--primary-hover)" style={{ marginBottom: '16px' }} />
                  <h4 style={{ marginBottom: '8px', fontSize: '1.05rem' }}>Book Online</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Choose a time slot that works for you.</p>
                </div>

                {/* Step 2 */}
                <div className="step-card">
                  <div className="step-number">2</div>
                  <Truck size={28} color="var(--secondary)" style={{ marginBottom: '16px' }} />
                  <h4 style={{ marginBottom: '8px', fontSize: '1.05rem' }}>We Pickup</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>We'll pickup your laptop from your location.</p>
                </div>

                {/* Step 3 */}
                <div className="step-card">
                  <div className="step-number">3</div>
                  <Search size={28} color="var(--primary-hover)" style={{ marginBottom: '16px' }} />
                  <h4 style={{ marginBottom: '8px', fontSize: '1.05rem' }}>Diagnose</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Our experts will diagnose the issue.</p>
                </div>

                {/* Step 4 */}
                <div className="step-card">
                  <div className="step-number">4</div>
                  <Wrench size={28} color="var(--secondary)" style={{ marginBottom: '16px' }} />
                  <h4 style={{ marginBottom: '8px', fontSize: '1.05rem' }}>Repair</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>We fix it with care and precision.</p>
                </div>

                {/* Step 5 */}
                <div className="step-card">
                  <div className="step-number">5</div>
                  <Send size={28} color="var(--primary-hover)" style={{ marginBottom: '16px' }} />
                  <h4 style={{ marginBottom: '8px', fontSize: '1.05rem' }}>Return & Relax</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>We deliver it back, good as new!</p>
                </div>

              </div>

            </div>
          </div>

          {/* C. BOTTOM CARDS SECTION */}
          <div className="container" style={{ paddingBottom: '80px' }}>
            <div className="bottom-cards-container">
              
              {/* Card 1: Black Brand Card */}
              <div className="card-black">
                <div>
                  <h3 style={{ fontSize: '1.4rem', lineHeight: '1.2', fontStyle: 'italic', color: '#ffffff', marginBottom: '12px' }}>
                    WE FIX MORE THAN JUST LAPTOPS!
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get expert chip-level repair for all major brands and devices.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '30px', opacity: 0.8, fontSize: '0.85rem', fontWeight: 'bold' }}>
                  <span> Apple</span>
                  <span>Dell</span>
                  <span>HP</span>
                  <span>Lenovo</span>
                  <span>ASUS</span>
                  <span style={{ color: 'var(--primary)' }}>& more</span>
                </div>
              </div>

              {/* Card 2: Lime Statistics Card */}
              <div className="card-lime">
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Smile size={24} style={{ marginBottom: '6px' }} />
                  <strong style={{ fontSize: '1.2rem', display: 'block' }}>2500+</strong>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)', fontWeight: '500' }}>Happy Customers</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Laptop size={24} style={{ marginBottom: '6px' }} />
                  <strong style={{ fontSize: '1.2rem', display: 'block' }}>3500+</strong>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)', fontWeight: '500' }}>Devices Repaired</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Star size={24} style={{ marginBottom: '6px' }} />
                  <strong style={{ fontSize: '1.2rem', display: 'block' }}>4.8/5</strong>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)', fontWeight: '500' }}>Customer Rating</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <ShieldCheck size={24} style={{ marginBottom: '6px' }} />
                  <strong style={{ fontSize: '1.2rem', display: 'block' }}>90 Days</strong>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)', fontWeight: '500' }}>Warranty on Repairs</span>
                </div>
              </div>

              {/* Card 3: Purple Student Card */}
              <div className="card-purple">
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: '#ffffff', fontStyle: 'italic', marginBottom: '8px' }}>
                    STUDENT DISCOUNT
                  </h3>
                  <div className="glass-card" style={{ background: '#000', color: 'var(--primary)', display: 'inline-block', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '800', border: 'none', marginBottom: '10px' }}>
                    Get 10% OFF
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Show your valid student ID & save!</p>
                </div>
                
                {/* Overlapping Smiling Student Image */}
                <div style={{
                  position: 'absolute',
                  right: '-10px',
                  bottom: '-10px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid var(--secondary-hover)'
                }}>
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=180&auto=format&fit=crop&q=80" 
                    alt="Student discount promo avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : role === 'admin' ? (
        /* ADMIN DASHBOARD ROUTE */
        <div className="container" style={{ padding: '40px 20px' }}>
          <AdminDashboard showToast={showToast} />
        </div>
      ) : (
        /* TECHNICIAN PANEL ROUTE */
        <div className="container" style={{ padding: '40px 20px' }}>
          <TechnicianPanel showToast={showToast} />
        </div>
      )}

      {/* BOOKING WIZARD OVERLAY MODAL */}
      {isBookingOpen && (
        <div className="modal-overlay" onClick={() => setIsBookingOpen(false)}>
          <div className="modal-content-wrapper animate-fade-in" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsBookingOpen(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: 'none', 
                border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.4rem'
              }}
            >
              &times;
            </button>
            <CustomerFlow showToast={showToast} initialTab="book" />
          </div>
        </div>
      )}

      {/* TRACKING TIMELINE OVERLAY MODAL */}
      {isTrackingOpen && (
        <div className="modal-overlay" onClick={() => setIsTrackingOpen(false)}>
          <div className="modal-content-wrapper animate-fade-in" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsTrackingOpen(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: 'none', 
                border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.4rem'
              }}
            >
              &times;
            </button>
            {/* Renders tracking view directly by triggering activeTab prop simulation inside CustomerFlow */}
            <CustomerFlow showToast={showToast} initialTab="track" />
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ 
        borderTop: '1px solid rgba(0,0,0,0.05)', padding: '30px 20px', 
        textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: '#ffffff',
        marginTop: 'auto'
      }}>
        <div className="container">
          <div>&copy; 2026 LapFix Systems Private Limited. All Rights Reserved.</div>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '8px' }}>
            <span>🔧 Certified Technicians</span>
            <span>🛡️ Insured Handovers</span>
            <span>🔒 Encrypted Data</span>
          </div>
        </div>
      </footer>

      {/* FLOATING DEVELOPER ROLE SWITCHER */}
      <div className="role-switcher">
        <button 
          className={`role-switcher-btn ${role === 'customer' ? 'active' : ''}`}
          onClick={() => { setRole('customer'); setIsBookingOpen(false); setIsTrackingOpen(false); }}
        >
          Customer
        </button>
        <button 
          className={`role-switcher-btn ${role === 'technician' ? 'active' : ''}`}
          onClick={() => { setRole('technician'); setIsBookingOpen(false); setIsTrackingOpen(false); }}
        >
          Technician
        </button>
        <button 
          className={`role-switcher-btn ${role === 'admin' ? 'active' : ''}`}
          onClick={() => { setRole('admin'); setIsBookingOpen(false); setIsTrackingOpen(false); }}
        >
          Admin Portal
        </button>
      </div>

    </div>
  );
}
