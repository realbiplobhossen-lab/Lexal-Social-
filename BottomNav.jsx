import React from 'react';

function BottomNav({ activeScreen, setActiveScreen }) {
  const menus = [
    { id: 'home', label: '🏠 ফিড' },
    { id: 'search', label: '🔍 সার্চ' },
    { id: 'create', label: '➕ পোস্ট' },
    { id: 'chat', label: '💬 মেসেজ' },
    { id: 'profile', label: '👤 প্রোফাইল' }
  ];

  return (
    <nav className="lexal-bottom-nav">
      {menus.map(m => (
        <button 
          key={m.id} 
          onClick={() => setActiveScreen(m.id)}
          className={`nav-btn ${activeScreen === m.id ? 'active' : ''}`}
        >
          {m.label}
        </button>
      ))}
    </nav>
  );
}
export default BottomNav;
