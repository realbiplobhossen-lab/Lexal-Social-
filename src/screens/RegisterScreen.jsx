import React, { useState } from 'react';
import * as authService from '../services/authService';

function RegisterScreen({ setAuthView }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await authService.register(name, email, pass);
      alert("অ্যাকাউন্ট তৈরি সফল!");
      setAuthView('login');
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="auth-card">
      <h2>Lexal Social - রেজিস্ট্রেশন</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="পূর্ণ নাম" onChange={e=>setName(e.target.value)} required />
        <input type="email" placeholder="ইমেইল" onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="পাসওয়ার্ড" onChange={e=>setPass(e.target.value)} required />
        <button type="submit">নিবন্ধন করুন</button>
      </form>
      <span onClick={() => setAuthView('login')} className="auth-toggle-link">ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন</span>
    </div>
  );
}
export default RegisterScreen;
