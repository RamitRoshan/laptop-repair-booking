import React from 'react';
import { ArrowUpRight, Zap, CheckCircle, Smartphone, MapPin } from 'lucide-react';

export default function AboutUs({ onBook }) {
  return (
    <div style={{ flex: 1, backgroundColor: '#fdfdfd' }}>
      {/* HEADER SECTION */}
      <div className="container" style={{ padding: '60px 0 40px 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#18181b', fontWeight: '900', marginBottom: '20px' }}>
          ABOUT <span style={{ color: 'var(--primary)' }}>US</span>
        </h1>
        <div style={{ borderBottom: '4px solid var(--primary)', width: '80px', margin: '0 auto', borderRadius: '4px' }}></div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* ABOUT US */}
          <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--secondary)' }}>Our</span> Story
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              Wachstum Solutions India Pvt Ltd., well known as Lapdesk Station today, was established in 2007 as a Private Limited company. We specialize in motherboard repairs, BIOS solutions, and I/O sections. We provide solutions to our customers with respect to hardware and networking products.
            </p>
          </div>

          {/* WHY LAPDESK STATION? */}
          <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Why <span style={{ color: 'var(--primary)' }}>Lapdesk Station?</span>
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
              We provide end-to-end solutions for our clients in the following areas:
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '0', listStyle: 'none' }}>
              {[
                "IT Networking Products – Routers, switches, patch cords, rack 4U, and Many more",
                "Refurbished laptops and desktops",
                "Building networking for small and medium-sized enterprises",
                "Organizing full setup trading",
                "Educational setup for schools and colleges",
                "Server setup for small and mid-size companies"
              ].map((item, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* SERVICES */}
            <div style={{ backgroundColor: '#18181b', padding: '40px', borderRadius: '16px', color: '#ffffff' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px', color: 'var(--primary)' }}>Services</h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '0', listStyle: 'none' }}>
                {[
                  "Doorstep services",
                  "All kinds of laptops and desktops",
                  "iMac & MacBook services",
                  "Printer services",
                  "All kinds of spares – batteries, panels, chargers, and more"
                ].map((item, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%', marginTop: '8px' }}></div>
                    <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PRODUCTS */}
            <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px', color: 'var(--secondary)' }}>Products</h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
                We deal in refurbished laptops and desktops. For more details, visit:
              </p>
              <a href="http://www.lapdeskstation.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', fontWeight: '700', textDecoration: 'none', borderBottom: '2px solid var(--secondary)', paddingBottom: '2px' }}>
                www.lapdeskstation.com <ArrowUpRight size={18} />
              </a>
            </div>
          </div>

          {/* CONTACT & BOOKING */}
          <div style={{ backgroundColor: 'var(--primary)', padding: '40px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: '900', marginBottom: '16px', color: '#18181b' }}>
              Book an Appointment
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#18181b', opacity: 0.9, marginBottom: '30px', maxWidth: '500px' }}>
              We need your Name, Contact Number, Email ID, Address, and a brief description of the Issue.
            </p>
            <button className="btn btn-black" onClick={onBook} style={{ padding: '14px 30px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
              Book Now <Zap size={20} />
            </button>
          </div>

          {/* CONTACT INFO */}
          <div style={{ textAlign: 'center', padding: '40px 0', borderTop: '1px dashed #e4e4e7' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', color: '#18181b' }}>Contact Us</h3>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} color="var(--secondary)" />
              </div>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Kirloskar Business Park<br />
                C/o AWFIS, 7th Floor<br />
                Hebbal, Bangalore – 560024
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
