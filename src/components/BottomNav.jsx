import React from 'react';

export default function BottomNav({ currentScreen, setCurrentScreen }) {
  // ন্যাভবারের ৫টি অপশন প্রফেশনাল আইকন টেক্সটসহ সাজানো হলো
  const navItems = [
    { id: 'home', label: 'ফিড', icon: '🏠' },
    { id: 'chat', label: 'চ্যাট', icon: '💬' },
    { id: 'friends', label: 'বন্ধুরা', icon: '👥' },
    { id: 'notifications', label: 'নোটিফিকেশন', icon: '🔔' },
    { id: 'profile', label: 'প্রোফাইল', icon: '👤' }
  ];

  return (
    <div className="bottom-navbar">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${currentScreen === item.id ? 'active' : ''}`}
          onClick={() => setCurrentScreen(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
