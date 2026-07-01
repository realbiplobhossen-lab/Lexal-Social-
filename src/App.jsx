import React, { useState, useEffect } from 'react';
import { auth, db } from './config/firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// ১. আপনার তৈরি করা আসল স্ক্রিনগুলো সব বহাল রাখা হলো
import HomeScreen from './screens/HomeScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';
import ChatScreen from './screens/ChatScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// ২. নেভিগেশনাল কম্পোনেন্টস
import BottomNav from './components/BottomNav';
import Navbar from './components/Navbar';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('home'); 
  const [activeChatId, setActiveChatId] = useState('global_chat'); 

  // 🛠️ মোবাইল ব্যাক বাটন ফিক্স লজিক (যা আপনার অ্যাপকে ফ্রিজ হওয়া থেকে বাঁচাবে)
  useEffect(() => {
    // যখনই স্ক্রিন চেঞ্জ হবে, ব্রাউজার হিস্ট্রিতে একটা স্টেট পুশ হবে
    window.history.pushState({ page: screen }, "");

    const handleBackButton = (event) => {
      if (screen !== 'home') {
        event.preventDefault();
        setScreen('home'); // হোম স্ক্রিন ছাড়া অন্য কোথাও থাকলে ব্যাক বাটন চাপলে হোমে ফিরবে
      }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [screen]);

  // 🔄 রিয়েল-টাইম ফায়ারবেস অথ ও ইউজার ডাটা লিসেনার
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // onSnapshot ব্যবহারের ফলে ডাটাবেজে প্রোফাইল পিক বা বায়ো চেঞ্জ হলে অ্যাপ অটো আপডেট হবে
        const userRef = doc(db, "users", currentUser.uid);
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        }, (error) => {
          console.error("ইউজার ডাটা সিঙ্ক করতে সমস্যা:", error);
        });

        return () => unsubscribeUser();
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // লোডিং স্ক্রিন
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#090D13', color: '#58A6FF' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Lexal Social</h2>
          <p style={{ color: '#8b949e' }}>লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
        </div>
      </div>
    );
  }

  // ইউজার লগইন না থাকলে সাইন-ইন বা রেজিস্টার স্ক্রিন রেন্ডার হবে
  if (!user) {
    return (
      <div style={{ background: '#090D13', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        {screen === 'register' ? (
          <RegisterScreen setAuthView={(view) => setScreen(view === 'login' ? 'login' : 'register')} />
        ) : (
          <LoginScreen setAuthView={(view) => setScreen(view === 'signup' ? 'register' : 'login')} />
        )}
      </div>
    );
  }

  // ৩. ডাইনামিক স্ক্রিন রেন্ডারিং সিস্টেম (আপনার আগের স্টেট নেমগুলোর সাথে সিঙ্ক করা)
  const renderScreen = () => {
    switch (screen) {
      case 'home': 
        return <HomeScreen currentUser={user} userData={userData} />;
      case 'create': 
      case 'studio': // আপনার নতুন CreatePostScreen এর সাপেক্ষে ব্যাকআপ কেস
        return <CreatePostScreen setPage={setScreen} userData={userData} />;
      case 'profile': 
        return <ProfileScreen userData={userData} currentUser={user} setPage={setScreen} />;
      case 'search': 
      case 'friends':
        return <SearchScreen currentUser={user} userData={userData} setPage={setScreen} />;
      case 'messages': 
        return <ChatScreen chatId={activeChatId} currentUser={user} userData={userData} setPage={setScreen} />;
      default: 
        return <HomeScreen currentUser={user} userData={userData} />;
    }
  };

  return (
    <div style={{ background: '#090D13', color: '#E6EDF3', minHeight: '100vh', paddingBottom: '90px', fontFamily: 'sans-serif' }}>
      
      {/* প্রফেশনাল টপ নেভিগেশন বার */}
      <Navbar userData={userData} setActiveScreen={setScreen} currentScreen={screen} />
      
      {/* ফেসবুক স্টাইল টপ শর্টকাট ট্যাব বার (ডিজাইন আরও উন্নত করা হলো) */}
      <div style={{ display: 'flex', justifyContent: 'space-around', background: '#161B22', padding: '12px', borderBottom: '1px solid #30363D', sticky: 'top', zIndex: 40 }}>
        <button style={{ ...styles.topBtn, borderBottom: screen === 'home' ? '2px solid #58A6FF' : '1px solid #30363D' }} onClick={() => setScreen('home')}>🏠 ফিড</button>
        <button style={{ ...styles.topBtn, borderBottom: (screen === 'search' || screen === 'friends') ? '2px solid #58A6FF' : '1px solid #30363D' }} onClick={() => setScreen('search')}>🔍 ফ্রেন্ডস</button>
        <button style={{ ...styles.topBtn, borderBottom: screen === 'messages' ? '2px solid #58A6FF' : '1px solid #30363D' }} onClick={() => setScreen('messages')}>💬 মেসেজ</button>
      </div>

      {/* মূল কন্টেন্ট এরিয়া */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '15px' }}>
        {renderScreen()}
      </div>

      {/* বটম নেভিগেশন বার */}
      <BottomNav setPage={setScreen} currentPage={screen} />
    </div>
  );
}

const styles = {
  topBtn: { 
    background: 'transparent', 
    color: '#E6EDF3', 
    border: 'none',
    padding: '8px 20px', 
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  }
};
                   
