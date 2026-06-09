import React, { useState, useEffect } from 'react';
import { auth } from './config/firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import HomeScreen from './screens/HomeScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';
import './styles/global.css';

// বটম ন্যাভবার কম্পোনেন্টটি সরাসরি এখানেই ডিফাইন করা হলো যাতে কোনো পাথ এরর না আসে
function BottomNav({ currentScreen, setCurrentScreen }) {
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
          style={{ background: 'transparent', boxShadow: 'none', width: 'auto', padding: '5px', color: currentScreen === item.id ? '#4f46e5' : '#6b7280' }}
        >
          <span style={{ fontSize: '20px', display: 'block', marginBottom: '3px' }}>{item.icon}</span>
          <span style={{ fontSize: '11px', fontWeight: currentScreen === item.id ? '600' : '500' }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("সবগুলো ঘর পূরণ করুন");
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("অ্যাকাউন্ট তৈরি সফল হয়েছে!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div className="screen-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}>
        <h1 style={{ textAlign: 'center', color: '#4f46e5', marginBottom: '30px', fontWeight: '700' }}>Lexal Social</h1>
        <form onSubmit={handleAuth} className="create-post-box">
          <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>{isRegistering ? "নতুন অ্যাকাউন্ট তৈরি" : "লগইন করুন"}</h3>
          <input type="email" placeholder="ইমেইল এড্রেস" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" style={{ marginTop: '10px' }}>{isRegistering ? "সাইন আপ" : "প্রবেশ করুন"}</button>
          <p onClick={() => setIsRegistering(!isRegistering)} style={{ textAlign: 'center', color: '#4f46e5', marginTop: '15px', cursor: 'pointer', fontSize: '14px' }}>
            {isRegistering ? "আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন" : "নতুন অ্যাকাউন্ট প্রয়োজন? এখানে চাপুন"}
          </p>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="app-header">
        <h1>Lexal Social</h1>
        <span style={{ fontSize: '20px', cursor: 'pointer' }} onClick={() => alert("কোনো নতুন নোটিফিকেশন নেই")}>🔔</span>
      </div>
      
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'profile' && <ProfileScreen />}
      {(currentScreen === 'chat' || currentScreen === 'friends' || currentScreen === 'notifications') && (
        <div className="screen-container" style={{ textAlign: 'center', marginTop: '50px', color: '#6b7280' }}>
          <h3>এই ফিচারটি আগামী আপডেটে আসছে...</h3>
        </div>
      )}

      <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </>
  );
        }
