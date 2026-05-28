import React from 'react';
import { MapPin, Building, ExternalLink } from 'lucide-react';

export default function Contact() {
  return (
    <div style={{ flex: 1, backgroundColor: '#fdfdfd', padding: '60px 0 80px' }}>
      <div className="container" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#18181b', fontWeight: '900', marginBottom: '20px' }}>
          CONTACT <span style={{ color: 'var(--primary)' }}>US</span>
        </h1>
        <div style={{ borderBottom: '4px solid var(--primary)', width: '80px', margin: '0 auto', borderRadius: '4px' }}></div>
      </div>

      <div className="container">
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          {/* Contact Details Card */}
          <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)' }}>
                <Building size={20} />
                Business Name
              </h2>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#18181b' }}>Lapdesk Station</p>
            </div>

            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: '#18181b' }}>
                <div style={{ backgroundColor: 'var(--primary)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} color="#18181b" />
                </div>
                Address
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Kirloskar Business Park<br />
                C/o AWFIS, 7th Floor<br />
                Hebbal<br />
                Bangalore – 560024<br />
                India
              </p>
            </div>
          </div>

          {/* Map Card */}
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, minHeight: '300px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.680072049877!2d77.5873998148227!3d13.056019990799738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae179326e2e50d%3A0xc3f9a7442eb3a846!2sKirloskar%20Business%20Park!5e0!3m2!1sen!2sus!4v1714561234567!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Location"
              ></iframe>
            </div>
            <a 
              href="https://maps.google.com/maps?q=Kirloskar+Business+Park,+Hebbal,+Bangalore" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', textDecoration: 'none' }}
            >
              View on Google Maps <ExternalLink size={18} />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
