import React from 'react';
import { auth } from '../config/firebase.js';

export default function ProfileScreen() {
  const user = auth.currentUser;

  const handleLogout = () => {
    auth.signOut()
      .then(() => alert("সফলভাবে লগআউট হয়েছে!"))
      .catch((err) => alert(err.message));
  };

  return (
    <div className="screen-container">
      <div className="profile-card">
        <div className="profile-avatar-large">
          {user?.email ? user.email.charAt(0).toUpperCase() : '👤'}
        </div>
        <h2 style={{ marginBottom: '5px' }}>{user?.displayName || user?.email?.split('@')[0] || "ইউজার নাম"}</h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>{user?.email || "ইউজার ইমেইল"}</p>
        
        <div className="profile-stats">
          <div className="stat-box">
            <h4>১</h4>
            <p>প্রোফাইল</p>
          </div>
          <div className="stat-box">
            <h4>একটিভ</h4>
            <p>স্ট্যাটাস</p>
          </div>
        </div>
      </div>

      <button onClick={handleLogout} style={{ background: '#dc2626', marginTop: '20px' }}>
        লগআউট করুন 🚪
      </button>
    </div>
  );
}
