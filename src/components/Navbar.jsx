import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar({ userData, currentScreen, setScreen }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-[#1f2937] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md border-b border-gray-700">
      <div className="text-2xl font-black tracking-wider text-blue-500 cursor-pointer" onClick={() => setScreen('home')}>
        LexalSpace
      </div>
      
      {/* মেইন ফেসবুক স্টাইল ট্যাব নেভিগেশন */}
      <div className="flex space-x-6 md:space-x-12">
        <button onClick={() => setScreen('home')} className={`text-xl ${currentScreen === 'home' ? 'text-blue-500 border-b-2 border-blue-500 pb-1' : 'text-gray-400'}`}>🏠</button>
        <button onClick={() => setScreen('chats')} className={`text-xl ${currentScreen === 'chats' ? 'text-blue-500 border-b-2 border-blue-500 pb-1' : 'text-gray-400'}`}>💬</button>
        <button onClick={() => setScreen('studio')} className={`text-xl ${currentScreen === 'studio' ? 'text-blue-500 border-b-2 border-blue-500 pb-1' : 'text-gray-400'}`}>➕</button>
        <button onClick={() => setScreen('friends')} className={`text-xl ${currentScreen === 'friends' ? 'text-blue-500 border-b-2 border-blue-500 pb-1' : 'text-gray-400'}`}>👥</button>
      </div>

      {/* প্রোফাইল এবং ড্রপডাউন সেটিংস (যেখানে লগআউট বাটনটি লুকিয়ে থাকবে) */}
      <div className="relative">
        <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-2 bg-gray-800 p-1.5 rounded-full hover:bg-gray-700 transition">
          <img src={userData?.avatar || "https://via.placeholder.com/150"} alt="Avatar" className="w-8 h-8 rounded-full border border-blue-500 object-cover" />
          <span className="hidden md:inline font-medium text-sm">{userData?.username || "ইউজার"}</span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-gray-700 rounded-lg shadow-xl py-2 text-gray-200">
            <button onClick={() => { setScreen('profile'); setShowDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-800 flex items-center gap-2">👤 প্রোফাইল সেটিংস</button>
            <hr className="border-gray-700 my-1" />
            <button onClick={() => signOut(auth)} className="w-full text-left px-4 py-2 hover:bg-red-900/40 text-red-400 flex items-center gap-2">Logout (লগআউট)</button>
          </div>
        )}
      </div>
    </nav>
  );
}
