import React, { useState, useEffect } from 'react';
import CustomerFlow from './components/CustomerFlow';
import AdminDashboard from './components/AdminDashboard';
import TechnicianPanel from './components/TechnicianPanel';
import { 
  Wrench, ShieldCheck, MapPin, CheckCircle, Smartphone, 
  AlertOctagon, Laptop, Calendar, Truck, Search, Send, 
  Star, Crown, Smile, ArrowUpRight, Menu, X, Landmark, Compass,
  Globe, Mail, Zap
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('customer'); // 'customer' | 'admin' | 'technician'
  const [toasts, setToasts] = useState([]);
  
  // Controls modal visibility for booking flow
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const [processedStudentAvatar, setProcessedStudentAvatar] = useState('/student_discount_avatar.png');
  const [processedLaptopMockup, setProcessedLaptopMockup] = useState('/tilted_macbook_mockup.png');

  useEffect(() => {
    const img = new Image();
    img.src = '/student_discount_avatar.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          // Convert pixels close to white to fully transparent
          if (r > 240 && g > 240 && b > 240) {
            data[i+3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setProcessedStudentAvatar(canvas.toDataURL());
      } catch (err) {
        console.error("Canvas background removal failed:", err);
      }
    };

    const laptopImg = new Image();
    laptopImg.src = '/tilted_macbook_mockup.png';
    laptopImg.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = laptopImg.width;
      canvas.height = laptopImg.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(laptopImg, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          // Convert pixels close to white to fully transparent
          if (r > 240 && g > 240 && b > 240) {
            data[i+3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setProcessedLaptopMockup(canvas.toDataURL());
      } catch (err) {
        console.error("Canvas laptop background removal failed:", err);
      }
    };
  }, []);

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
        borderBottom: '1px solid #ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        padding: '16px 0'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Brand Logo & Tagline (Wachstum Solutions) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => { setIsBookingOpen(false); setIsTrackingOpen(false); }} className="nav-link">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                {/* W: Purple Crown Shape */}
                <path d="M5,35 L17,85 L32,45 L47,85 L59,35 L44,80 L32,38 L20,80 Z" fill="#6d28d9" />
                {/* Yellow/Gold upward arrow inside W */}
                <path d="M22,72 L28,52 L34,72 L30,72 L30,82 L26,82 L26,72 Z" fill="#fbbf24" />
                {/* S: Gold shape with Purple outline */}
                <path d="M56,38 C68,38 78,38 78,48 L78,54 C78,60 70,62 58,62 L78,62 C78,74 72,82 56,82 L56,72 C68,72 68,70 68,66 L68,66 C68,64 56,64 56,58 L56,58 C56,48 56,38 56,38 Z" fill="#fbbf24" stroke="#6d28d9" strokeWidth="2.5" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: '900', fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#111111', lineHeight: '1.1' }}>
                  WACHSTUM
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '0.8rem', color: 'var(--secondary)', letterSpacing: '0.08em', lineHeight: '1.1', marginTop: '1px' }}>
                  SOLUTIONS
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="desktop-nav">
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
                <h1 className="hero-headline">
                  Laptop problems?<br />
                  <span style={{ color: 'var(--secondary)' }}>We</span> <span className="highlight-got">got</span> <span style={{ color: 'var(--secondary)' }}>your back.</span>
                </h1>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '35px', maxWidth: '440px', lineHeight: '1.6' }}>
                  Fast, reliable & hassle-free laptop repair with doorstep pickup & live updates.
                </p>

                <div className="hero-buttons">
                  <button className="btn btn-primary" onClick={() => setIsBookingOpen(true)} style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} /> Book a Repair <ArrowUpRight size={18} />
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
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', position: 'relative' }}>
                <div className="laptop-mockup-wrapper" style={{ position: 'relative' }}>
                  
                  {/* Neon Yellow/Green Background Splatter Shape */}
                  <div className="laptop-bg-splatter" />

                  {/* Doorstep Pickup badge (Top right) with curved arrow */}
                  <div className="badge-doorstep-wrapper" style={{ position: 'absolute', top: '-40px', right: '-15px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                    <div className="badge-doorstep" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                      <span>DOORSTEP</span>
                      <span>PICKUP & DROP</span>
                    </div>
                    {/* Hand-drawn curved arrow pointing to the laptop */}
                    <svg width="40" height="30" viewBox="0 0 40 30" fill="none" style={{ marginTop: '4px', marginLeft: '-15px', transform: 'rotate(-10deg)' }}>
                      <path d="M35 2 C 35 15, 20 25, 5 20 M5 20 L12 14 M5 20 L10 26" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Black lightning bolt decoration */}
                  <div style={{ position: 'absolute', top: '-40px', right: '-120px', transform: 'rotate(20deg)', opacity: 0.95, zIndex: 10 }}>
                    <svg width="60" height="85" viewBox="0 0 24 36" fill="black" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 0L0 20H10L8 36L24 16H14L18 0" fill="black" stroke="white" strokeWidth="0.5" />
                    </svg>
                  </div>

                  <div className="laptop-mockup">
                    {/* The photorealistic laptop image with background removed */}
                    <img 
                      src={processedLaptopMockup} 
                      alt="Wachstum Solutions MacBook Mockup" 
                      style={{ width: '100%', height: 'auto', display: 'block', mixBlendMode: 'multiply' }} 
                    />

                    {/* Skewed Text Overlay on Black Screen */}
                    <div className="laptop-screen-overlay">
                      <div className="laptop-screen-smiley" style={{ top: '-10px', right: '0px' }}>
                        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="20" cy="20" r="14" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="15" cy="17" r="2.5" fill="var(--primary)" />
                          <circle cx="25" cy="17" r="2.5" fill="var(--primary)" />
                          <path d="M13 24 C 16 29, 24 29, 27 24" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
                          <path d="M35 10 L40 5" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
                          <path d="M38 18 L43 16" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="laptop-screen-text">
                        WE FIX.<br/>
                        <span style={{ color: 'var(--primary)' }}>YOU FLEX.</span>
                      </div>
                      <svg width="140" height="20" viewBox="0 0 120 20" fill="none" style={{ marginTop: '6px', transform: 'rotate(-2deg)' }}>
                        <path d="M5 5 C 40 4, 80 8, 115 5" stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round" />
                        <path d="M15 15 C 45 13, 75 17, 105 14" stroke="#8b5cf6" strokeWidth="4.5" strokeLinecap="round" />
                      </svg>
                    </div>

                    {/* Pink circle Live updates badge */}
                    <div className="badge-pink-circle">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--primary)" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '12px', right: '35%', transform: 'rotate(15deg)' }}>
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--primary)" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', bottom: '12px', left: '35%', transform: 'rotate(-25deg)' }}>
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      <span style={{ position: 'relative', zIndex: 2 }}>LIVE</span>
                      <span style={{ position: 'relative', zIndex: 2 }}>STATUS</span>
                      <span style={{ position: 'relative', zIndex: 2 }}>UPDATES</span>
                    </div>

                    {/* Purple Ribbon Warranty */}
                    <div className="badge-warranty-ribbon">
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                        <span>90 DAYS</span>
                        <span>WARRANTY</span>
                      </div>
                      <div style={{ position: 'absolute', right: '-20px', bottom: '-5px', transform: 'rotate(15deg)' }}>
                        <Crown size={28} fill="#000" color="#000" />
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* B. HOW IT WORKS SECTION */}
          <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid #ffffff', borderBottom: '1px solid #ffffff', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
            
            {/* Decorative background designs on left and right */}
            <div className="how-it-works-left-design">
              <svg width="120" height="240" viewBox="0 0 120 240" fill="none" style={{ opacity: 0.9 }}>
                {/* Solid dark purple slanted bar */}
                <line x1="5" y1="-20" x2="35" y2="260" stroke="#6d28d9" strokeWidth="26" />
                
                {/* Light purple translucent brush strokes with rounded ends */}
                <line x1="-20" y1="90" x2="100" y2="70" stroke="#a78bfa" strokeWidth="26" strokeLinecap="round" opacity="0.75" />
                <line x1="-20" y1="165" x2="90" y2="165" stroke="#a78bfa" strokeWidth="22" strokeLinecap="round" opacity="0.6" />
                <line x1="-20" y1="190" x2="115" y2="105" stroke="#a78bfa" strokeWidth="24" strokeLinecap="round" opacity="0.7" />
                
                {/* Black hand-drawn cursive loop */}
                <path d="M 15 135 C 35 125, 55 105, 48 112 C 40 120, 20 135, 10 130" stroke="#18181b" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </div>

            <div className="how-it-works-right-design">
              <svg width="120" height="200" viewBox="0 0 120 200" fill="none" style={{ opacity: 0.85 }}>
                {/* Top lime paint stroke fragment */}
                <path d="M70 -10 C 90 5, 110 5, 130 -10 L130 -30 Z" fill="var(--primary)" opacity="0.4" />
                {/* Neon green spiral scribble */}
                <path d="M50 40 C 85 45, 95 65, 80 85 C 60 100, 75 125, 95 120 C 115 115, 110 145, 90 160 C 70 175, 85 195, 105 190" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </div>

            <div className="container">
              
              <div style={{ textAlign: 'center', marginBottom: '50px', position: 'relative', zIndex: 2 }}>
                <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#18181b', fontWeight: '800' }}>
                  HOW IT WORKS?
                </h2>
                <div className="how-it-works-underline" />
              </div>

              <div className="steps-container">
                
                {/* Step 1 */}
                <div className="step-card">
                  <div className="step-number">1</div>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--primary)',
                    border: '2px solid #18181b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <Calendar size={22} color="#18181b" strokeWidth={2.5} />
                  </div>
                  <h4 style={{ marginBottom: '8px', fontSize: '1.05rem', fontWeight: '700' }}>Book Online</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.4' }}>Choose a time slot that works for you.</p>
                </div>

                {/* Connector 1 */}
                <div className="step-connector">
                  <svg width="48" height="32" viewBox="0 0 36 24" fill="none" stroke="#000000" strokeWidth="2.8" strokeLinecap="round">
                    <path d="M4 14c5-5 8-5 9-1c1.5 5-2.5 7-4 3c-1.5-4 5-9 13-7c8 2 10 5 12 1" />
                    <path d="M28 9 L34 10 L31 16" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>

                {/* Step 2 */}
                <div className="step-card">
                  <div className="step-number">2</div>
                  <Truck size={42} color="var(--secondary)" strokeWidth={2.2} style={{ marginBottom: '18px' }} />
                  <h4 style={{ marginBottom: '8px', fontSize: '1.05rem', fontWeight: '700' }}>We Pickup</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.4' }}>We'll pickup your laptop from your location.</p>
                </div>

                {/* Connector 2 */}
                <div className="step-connector">
                  <svg width="48" height="32" viewBox="0 0 36 24" fill="none" stroke="#000000" strokeWidth="2.8" strokeLinecap="round">
                    <path d="M4 14c5-5 8-5 9-1c1.5 5-2.5 7-4 3c-1.5-4 5-9 13-7c8 2 10 5 12 1" />
                    <path d="M28 9 L34 10 L31 16" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>

                {/* Step 3 */}
                <div className="step-card">
                  <div className="step-number">3</div>
                  <div style={{ position: 'relative', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{
                      position: 'absolute',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      top: '6px',
                      left: '10px',
                      zIndex: 1
                    }} />
                    <Search size={34} color="#18181b" strokeWidth={2.5} style={{ position: 'relative', zIndex: 2 }} />
                  </div>
                  <h4 style={{ marginBottom: '8px', fontSize: '1.05rem', fontWeight: '700' }}>Diagnose</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.4' }}>Our experts will diagnose the issue.</p>
                </div>

                {/* Connector 3 */}
                <div className="step-connector">
                  <svg width="48" height="32" viewBox="0 0 36 24" fill="none" stroke="#000000" strokeWidth="2.8" strokeLinecap="round">
                    <path d="M4 14c5-5 8-5 9-1c1.5 5-2.5 7-4 3c-1.5-4 5-9 13-7c8 2 10 5 12 1" />
                    <path d="M28 9 L34 10 L31 16" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>

                {/* Step 4 */}
                <div className="step-card">
                  <div className="step-number">4</div>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '22px' }}>
                    <line x1="4" y1="20" x2="20" y2="4" />
                    <path d="M4 20l2.5-2.5" strokeWidth="4.5" />
                    <path d="M19 5l1-1" strokeWidth="3" />
                    <line x1="20" y1="20" x2="10" y2="10" />
                    <path d="M9 11a3.5 3.5 0 1 1 2-5L8 9" />
                    <circle cx="20" cy="20" r="1.5" fill="var(--secondary)" />
                  </svg>
                  <h4 style={{ marginBottom: '8px', fontSize: '1.05rem', fontWeight: '700' }}>Repair</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.4' }}>We fix it with care and precision.</p>
                </div>

                {/* Connector 4 */}
                <div className="step-connector">
                  <svg width="48" height="32" viewBox="0 0 36 24" fill="none" stroke="#000000" strokeWidth="2.8" strokeLinecap="round">
                    <path d="M4 14c5-5 8-5 9-1c1.5 5-2.5 7-4 3c-1.5-4 5-9 13-7c8 2 10 5 12 1" />
                    <path d="M28 9 L34 10 L31 16" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>

                {/* Step 5 */}
                <div className="step-card">
                  <div className="step-number">5</div>
                  <Send size={34} color="var(--primary-hover)" strokeWidth={2.2} style={{ marginBottom: '18px', transform: 'rotate(-10deg)' }} />
                  <h4 style={{ marginBottom: '8px', fontSize: '1.05rem', fontWeight: '700' }}>Return & Relax</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.4' }}>We deliver it back, good as new!</p>
                </div>

              </div>

            </div>
          </div>

          {/* C. BOTTOM CARDS SECTION */}
          <div className="container" style={{ paddingBottom: '80px' }}>
            <div className="bottom-cards-container">
              
              {/* Card 1: Black Brand Card */}
              <div className="card-black">
                <h3 style={{ fontSize: '1.45rem', lineHeight: '1.25', color: '#ffffff', marginBottom: '24px', fontFamily: 'var(--font-display)', fontWeight: '800' }}>
                  WE FIX MORE THAN<br />
                  <span style={{ color: 'var(--primary)', fontStyle: 'italic', position: 'relative', display: 'inline-block' }}>
                    JUST LAPTOPS!
                    <span style={{ position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '3px', borderBottom: '3px solid var(--primary)', borderRadius: '9999px', transform: 'rotate(-1deg)' }}></span>
                  </span>
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.9, gap: '15px' }}>
                    {/* Apple Logo */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.62.72-1.16 1.86-1.01 2.97 1.12.09 2.27-.6 2.96-1.41z"/>
                    </svg>
                    
                    {/* Dell Text */}
                    <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.2rem', fontFamily: 'sans-serif', letterSpacing: '-0.05em' }}>DELL</span>
                    
                    {/* HP Circle */}
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', color: '#ffffff', fontFamily: 'sans-serif' }}>hp</div>
                    
                    {/* Lenovo Text */}
                    <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.9rem', fontFamily: 'sans-serif', fontStyle: 'italic' }}>lenovo</span>
                    
                    {/* ASUS Text */}
                    <span style={{ color: '#ffffff', fontWeight: '900', fontSize: '1.1rem', fontFamily: 'sans-serif', fontStyle: 'italic', letterSpacing: '-0.02em' }}>ASUS</span>
                  </div>
                  
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: '600', alignSelf: 'flex-end', marginRight: '4px' }}>
                    & more
                  </div>
                </div>
              </div>

              {/* Card 2: Lime Statistics Card */}
              <div className="card-lime">
                {/* Stat 1 */}
                <div className="stat-col">
                  <div className="stat-circle" style={{ backgroundColor: '#8b5cf6' }}>
                    <Smile size={20} color="#0c0a09" strokeWidth={2.5} />
                  </div>
                  <strong>2500+</strong>
                  <span>Happy Customers</span>
                </div>
                
                {/* Stat 2 */}
                <div className="stat-col">
                  <div className="stat-circle" style={{ backgroundColor: '#2dd4bf' }}>
                    <Laptop size={20} color="#0c0a09" strokeWidth={2.5} />
                  </div>
                  <strong>3500+</strong>
                  <span>Devices Repaired</span>
                </div>
                
                {/* Stat 3 */}
                <div className="stat-col">
                  <div className="stat-circle" style={{ backgroundColor: '#f472b6' }}>
                    <Star size={20} color="#0c0a09" strokeWidth={2.5} />
                  </div>
                  <strong>4.8/5</strong>
                  <span>Customer Rating</span>
                </div>
                
                {/* Stat 4 */}
                <div className="stat-col">
                  <div className="stat-circle" style={{ backgroundColor: '#8b5cf6' }}>
                    <ShieldCheck size={20} color="#0c0a09" strokeWidth={2.5} />
                  </div>
                  <strong>90 Days</strong>
                  <span>Warranty on Repairs</span>
                </div>
              </div>

              {/* Card 3: Purple Student Card */}
              <div className="card-purple">
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', zIndex: 1 }}>
                  <div>
                    <h3 style={{ fontSize: '1.7rem', color: 'var(--primary)', fontStyle: 'italic', fontWeight: '900', lineHeight: '1.15', marginBottom: '12px' }}>
                      STUDENT<br />DISCOUNT
                    </h3>
                    <div style={{ background: '#000000', color: '#ffffff', display: 'inline-flex', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '14px' }}>
                      Get 10% OFF
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.95)', fontWeight: '500', maxWidth: '130px', lineHeight: '1.4' }}>
                    Show your valid student ID & save!
                  </p>
                </div>
                
                {/* Overlapping Smiling Student Image with hand-drawn crown */}
                <div style={{
                  position: 'absolute',
                  right: '-25px',
                  bottom: '-60px',
                  width: '210px',
                  height: '280px',
                  pointerEvents: 'none',
                  zIndex: 2
                }}>
                  {/* Hand-drawn black crown above student's head */}
                  <svg width="28" height="22" viewBox="0 0 24 18" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '90px',
                    transform: 'rotate(15deg)',
                    zIndex: 3
                  }}>
                    <path d="M3 14 L5 5 L10 10 L14 5 L19 14 Z" fill="none" />
                    <circle cx="5" cy="4" r="1" fill="#000000" />
                    <circle cx="12" cy="4" r="1" fill="#000000" />
                    <circle cx="19" cy="4" r="1" fill="#000000" />
                  </svg>
                  
                  <img 
                    src={processedStudentAvatar} 
                    alt="Smiling Student giving thumbs up" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      mixBlendMode: 'multiply',
                      transform: 'scaleX(-1)', /* Flip the boy horizontally to face the left side */
                      clipPath: 'inset(0px 0px 60px 0px)' /* Crop to show only the half image (waist up) */
                    }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* D. CTA SECTION */}
          <div className="cta-container">
            <div className="cta-card">
              <h2 className="cta-title">Ready to fix your device?</h2>
              <p className="cta-subtitle">
                Don't let a broken screen or slow performance hold you back. Our techs are ready for action.
              </p>
              <button className="btn-cta-action" onClick={() => setIsBookingOpen(true)}>
                Book Your Repair Now <Zap size={16} fill="currentColor" style={{ marginLeft: '4px' }} />
              </button>
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
      <footer className="app-footer">
        <div className="container">
          <div className="footer-grid">
            
            {/* Column 1 */}
            <div>
              <div className="footer-logo">WACHSTUM SOLUTIONS</div>
              <p className="footer-desc">
                Expert laptop repairs with a human touch. We make tech stress disappear.
              </p>
              <div className="footer-socials">
                <a href="#" className="footer-social-btn" aria-label="Globe">
                  <Globe size={18} />
                </a>
                <a href="#" className="footer-social-btn" aria-label="Mail">
                  <Mail size={18} />
                </a>
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="footer-col-title">SERVICES</h4>
              <ul className="footer-links-list">
                <li><span className="footer-link" onClick={() => setIsBookingOpen(true)}>Screen Repair</span></li>
                <li><span className="footer-link" onClick={() => setIsBookingOpen(true)}>Battery Replace</span></li>
                <li><span className="footer-link" onClick={() => setIsBookingOpen(true)}>OS Upgrade</span></li>
                <li><span className="footer-link" onClick={() => setIsBookingOpen(true)}>Water Damage</span></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="footer-col-title">QUICK LINKS</h4>
              <ul className="footer-links-list">
                <li><span className="footer-link" onClick={() => { setIsTrackingOpen(true); setIsBookingOpen(false); }}>Track Repair</span></li>
                <li><span className="footer-link" onClick={() => setIsBookingOpen(true)}>Pricing</span></li>
                <li><span className="footer-link" onClick={() => setIsBookingOpen(true)}>Warranty</span></li>
                <li><span className="footer-link" onClick={() => setIsBookingOpen(true)}>FAQ</span></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="footer-col-title">SUPPORT</h4>
              <ul className="footer-links-list">
                <li><span className="footer-link" onClick={() => setIsBookingOpen(true)}>Contact Us</span></li>
                <li><span className="footer-link" onClick={() => setIsBookingOpen(true)}>Privacy Policy</span></li>
                <li><span className="footer-link" onClick={() => setIsBookingOpen(true)}>Terms of Service</span></li>
              </ul>
            </div>

          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 Wachstum Solutions. Pro Repair, Playful Service. All rights reserved.</p>
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
