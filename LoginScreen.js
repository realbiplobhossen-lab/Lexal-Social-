import React, { useState } from 'react';
import { authService } from '../services/authService';

function LoginScreen({ setAuthView }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try { await authService.login(email, pass); } catch { alert("ইমেইল বা পাসওয়ার্ড ভুল!"); }
  };

  return (
    <div className="auth-card">
      <h2>Lexal Social - লগইন</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="ইমেইল" onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="পাসওয়ার্ড" onChange={e=>setPass(e.target.value)} required />
        <button type="submit">প্রবেশ করুন</button>
      </form>
      <span onClick={() => setAuthView('signup')} className="auth-toggle-link">নতুন অ্যাকাউন্ট তৈরি করুন</span>
    </div>
  );
}
export default LoginScreen;
