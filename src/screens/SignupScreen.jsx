import React, { useState } from 'react';
import * as authService from '../services/authService';

function SignupScreen({ setAuthView }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(email, pass, name);
      alert("Account created successfully! Now Login!");
      setAuthView('login');
    } catch (error) {
      alert("Account creation has failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#0D1117',
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#161B22',
        border: '1px solid #30363D',
        borderRadius: '12px',
        padding: '30px 24px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        {/* অ্যাপ লোগো/হেডার */}
        <h2 style={{ 
          color: '#58A6FF', 
          fontSize: '28px', 
          fontWeight: 'bold', 
          marginBottom: '8px',
          marginTop: 0,
          letterSpacing: '1px'
        }}>
          LexalSpace
        </h2>
        
        <p style={{ color: '#8B949E', fontSize: '14px', marginBottom: '24px' }}>
          Join The Lexal Social World! 🌎<br/>
          CREATE YOUR NEW ACCOUNT
        </p>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* নাম ইনপুট */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ color: '#C9D1D9', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' }}>Full Name</label>
            <input 
              type="text" 
              placeholder="Your full name" 
              value={name}
              onChange={e => setName(e.target.value)} 
              required 
              style={{
                width: '100%',
                padding: '12px',
                background: '#0D1117',
                border: '1px solid #30363D',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#58A6FF'}
              onBlur={(e) => e.target.style.borderColor = '#30363D'}
            />
          </div>

          {/* ইমেইল ইনপুট */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ color: '#C9D1D9', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{
                width: '100%',
                padding: '12px',
                background: '#0D1117',
                border: '1px solid #30363D',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#58A6FF'}
              onBlur={(e) => e.target.style.borderColor = '#30363D'}
            />
          </div>

          {/* পাসওয়ার্ড ইনপুট */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ color: '#C9D1D9', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' }}>Password</label>
            <input 
              type="password" 
              placeholder="•••••••• (Min 6 characters)" 
              value={pass}
              onChange={e => setPass(e.target.value)} 
              required 
              style={{
                width: '100%',
                padding: '12px',
                background: '#0D1117',
                border: '1px solid #30363D',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#58A6FF'}
              onBlur={(e) => e.target.style.borderColor = '#30363D'}
            />
          </div>

          {/* সাইনআপ বাটন */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: loading ? '#1f6feb' : '#238636',
              color: '#FFF',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              transition: 'background 0.2s',
              boxShadow: '0 4px 12px rgba(35, 134, 54, 0.2)'
            }}
          >
            {loading ? 'Creating your account in Lexal Social World...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* লগইন স্ক্রিনে ফিরে যাওয়ার লিঙ্ক */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #30363D', paddingTop: '16px' }}>
          <span 
            onClick={() => setAuthView('login')} 
            style={{ 
              color: '#58A6FF', 
              cursor: 'pointer', 
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Already have an account? SIGN IN
          </span>
        </div>
      </div>
    </div>
  );
}

export default SignupScreen;

