import React from 'react';
import { authService } from '../services/authService';

function Navbar({ userData, setActiveScreen }) {
  return (
    <header className="lexal-navbar">
      <div className="nav-logo" onClick={() => setActiveScreen('home')}>Lexal Space</div>
      <div className="nav-right">
        <span className="user-name-badge" onClick={() => setActiveScreen('profile')}>
          👤 {userData?.fullName || 'ইউজার'}
        </span>
        <button onClick={() => authService.logout()} className="logout-btn">লগআউট</button>
      </div>
    </header>
  );
}
export default Navbar;
