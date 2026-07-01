import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar({ userData, setActiveScreen }) {
  const [showDropdown, setShowDropdown] = useState(false);

  // লগআউট হ্যান্ডলার
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert("লগআউট করতে সমস্যা হয়েছে: " + error.message);
    }
  };

  return (
    <nav style={{
      background: '#161B22',
      color: '#white',
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #30363D',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      fontFamily: 'sans-serif'
    }}>
      {/* লোগো */}
      <div 
        style={{ text2xl: '20px', fontWeight: 'bold', color: '#58A6FF', cursor: 'pointer', trackingWider: '1px' }} 
        onClick={() => setActiveScreen('home')}
      >
        LexalSpace
      </div>
      
      {/* 👤 প্রোফাইল এবং ড্রপডাউন সেটিংস */}
      <div style={{ position: 'relative' }}>
        <div 
          onClick={() => setShowDropdown(!showDropdown)} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#21262D', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #30363D' }}
        >
          <img 
            src={userData?.avatar || "https://via.placeholder.com/150"} 
            alt="Avatar" 
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #58A6FF' }} 
          />
          <span style={{ color: '#E6EDF3', fontSize: '14px', fontWeight: '500' }}>
            {userData?.name || "ইউজার"}
          </span>
        </div>

        {/* ড্রপডাউন বক্স (লগআউট বাটনটি এখানে চমৎকারভাবে কাজ করবে) */}
        {showDropdown && (
          <div style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            width: '160px',
            background: '#161B22',
            border: '1px solid #30363D',
            borderRadius: '8px',
            boxShadow: '0px 8px 24px rgba(0,0,0,0.5)',
            padding: '6px 0',
            zIndex: 101
          }}>
            <button 
              onClick={() => { setActiveScreen('profile'); setShowDropdown(false); }} 
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#E6EDF3', textLeft: 'left', padding: '10px 16px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              👤 প্রোফাইল সেটিংস
            </button>
            <hr style={{ border: 'none', borderTop: '1px solid #30363D', margin: '4px 0' }} />
            <button 
              onClick={handleLogout} 
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#FF7B72', textLeft: 'left', padding: '10px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🚪 লগআউট (Logout)
            </button>
          </div>
        )}
      </div>
    </nav>
  );
            }

