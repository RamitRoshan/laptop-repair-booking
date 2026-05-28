import React, { useState } from 'react';
import { api } from '../supabase';
import { Mail, Lock, User, Phone, LogIn, UserPlus } from 'lucide-react';

export default function Auth({ targetRole, onLogin, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    mobile: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          throw new Error('Please enter both email and password.');
        }
        const { user } = await api.auth.login({ email: formData.email, password: formData.password });
        
        // Prevent tech logging into admin portal and vice versa
        if (user.role !== targetRole) {
          await api.auth.logout(); // log them out immediately
          throw new Error(`Access denied. This portal is for ${targetRole}s only.`);
        }
        
        showToast(`Welcome back, ${user.full_name}!`, 'success');
        onLogin(user);
      } else {
        // Signup validation
        if (!formData.email || !formData.password || !formData.fullName || !formData.mobile || !formData.confirmPassword) {
          throw new Error('All fields are required.');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        
        const { user } = await api.auth.signup({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          mobile: formData.mobile,
          role: targetRole // Assumes the user is signing up for the role they are currently trying to access
        });
        
        showToast(`Account created successfully! Welcome to the ${targetRole} portal.`, 'success');
        onLogin(user);
      }
    } catch (err) {
      showToast(err.message || 'An error occurred during authentication.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', background: '#fff', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '12px', background: 'var(--primary)', marginBottom: '15px' }}>
          <Lock size={28} color="#000" />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', fontFamily: 'var(--font-display)', marginBottom: '5px', textTransform: 'capitalize' }}>
          {targetRole} Access
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isLogin ? 'Sign in to access your dashboard' : 'Create a new account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {!isLogin && (
          <>
            <div className="input-group">
              <User size={18} className="input-icon" color="var(--text-muted)" />
              <input
                type="text"
                name="fullName"
                className="form-input"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <Phone size={18} className="input-icon" color="var(--text-muted)" />
              <input
                type="tel"
                name="mobile"
                className="form-input"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div className="input-group">
          <Mail size={18} className="input-icon" color="var(--text-muted)" />
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <Lock size={18} className="input-icon" color="var(--text-muted)" />
          <input
            type="password"
            name="password"
            className="form-input"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        {!isLogin && (
          <div className="input-group">
            <Lock size={18} className="input-icon" color="var(--text-muted)" />
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ padding: '12px', marginTop: '10px', fontSize: '1rem', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          disabled={loading}
        >
          {loading ? 'Processing...' : isLogin ? <><LogIn size={18}/> Sign In</> : <><UserPlus size={18}/> Sign Up</>}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span 
          style={{ color: '#6d28d9', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {
            setIsLogin(!isLogin);
            setFormData({ email: '', password: '', confirmPassword: '', fullName: '', mobile: '' });
          }}
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </span>
      </div>
    </div>
  );
}
