import React, { useState, useEffect } from 'react';
import { auth, db } from './config/firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// আপনার প্রোজেক্টের আসল স্ক্রিনসমূহ
import HomeScreen from './screens/HomeScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';
import ChatScreen from './screens/ChatScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// নেভিগেশনাল কম্পোনেন্টস
import BottomNav from './components/BottomNav';
import Navbar from './components/Navbar';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('home'); 
  const [activeChatId, setActiveChatId] = useState('global_chat'); 

  // 🛠️ ফিজিক্যাল মোবাইল ব্যাক বাটন ফিক্স (মহাশূন্যে হারানো রোধ করতে)
  useEffect(() => {
    window.history.pushState({ page: screen }, "");

    const handleBackButton = (event) => {
      if (screen !== 'home') {
        event.preventDefault();
        setScreen('home'); // চ্যাট বা সার্চে আটকে গেলে ব্যাক বাটন চাপলে হোমে নিয়ে আসবে
      }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [screen]);

  // 🔄 ফায়ারবেস অথ লিসেনার (টাইমআউট সেফটিসহ, যাতে অনন্তকাল লোডিং না দেখায়)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
          setLoading(false); // ডাটা পাওয়া মাত্রই লোডিং শেষ
        }, (error) => {
          console.error("ইউজার ডাটা সিঙ্ক এরর:", error);
          setLoading(false); // এরর খেলেও অ্যাপ চালু হবে, আটকে থাকবে না
        });

        return () => unsubscribeUser();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    // সেফটি নেট: ফায়ারবেস যদি ৫ সেকেন্ডের মধ্যে রেসপন্স না করে, জোর করে লোডিং বন্ধ করবে
    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#090D13', color: '#58A6FF', flexDirection: 'column', gap: '10px' }}>
        <h2 style={{ fontSize: '22px', fontFamily: 'sans-serif' }}>Lexal Social</h2>
        <div style={{ width: '40px', height: '40px', border: '4px solid #161B22', borderTop: '4px solid #58A6FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#8b949e', fontSize: '14px' }}>রিল্যাক্স! অ্যাপটি রানিং করা হচ্ছে...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ background: '#090D13', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {screen === 'register' ? (
          <RegisterScreen setAuthView={(view) => setScreen(view === 'login' ? 'login' : 'register')} />
        ) : (
          <LoginScreen setAuthView={(view) => setScreen(view === 'signup' ? 'register' : 'login')} />
        )}
      </div>
    );
  }

  // স্ক্রিন রেন্ডারিং লজিক (স্টেট প্রপ্স পাসিং ফিক্সড)
  const renderScreen = () => {
    switch (screen) {
      case 'home': 
        return <HomeScreen currentUser={user} userData={userData} />;
      case 'create': 
        return <CreatePostScreen setPage={setScreen} currentUser={user} userData={userData} />;
      case 'profile': 
        return <ProfileScreen userData={userData} currentUser={user} setPage={setScreen} />;
      case 'search': 
        return <SearchScreen currentUser={user} userData={userData} setPage={setScreen} />;
      case 'messages': 
        return <ChatScreen chatId={activeChatId} currentUser={user} userData={userData} setPage={setScreen} />;
      default: 
        return <HomeScreen currentUser={user} userData={userData} />;
    }
  };

  return (
    <div style={{ background: '#090D13', color: '#E6EDF3', minHeight: '100vh', paddingBottom: '90px', fontFamily: 'sans-serif' }}>
      
      {/* আপনার আগের র-স্টাইলের পরিমার্জিত হেডার ও শর্টকাট নেভিগেশন */}
      <Navbar userData={userData} setActiveScreen={setScreen} />
      
      <div style={{ display: 'flex', justifyContent: 'space-around', background: '#161B22', padding: '12px', borderBottom: '1px solid #30363D' }}>
        <button style={{ ...styles.topBtn, color: screen === 'home' ? '#58A6FF' : '#E6EDF3', borderBottom: screen === 'home' ? '2px solid #58A6FF' : 'none' }} onClick={() => setScreen('home')}>🏠 ফিড</button>
        <button style={{ ...styles.topBtn, color: screen === 'search' ? '#58A6FF' : '#E6EDF3', borderBottom: screen === 'search' ? '2px solid #58A6FF' : 'none' }} onClick={() => setScreen('search')}>🔍 ফ্রেন্ডস</button>
        <button style={{ ...styles.topBtn, color: screen === 'messages' ? '#58A6FF' : '#E6EDF3', borderBottom: screen === 'messages' ? '2px solid #58A6FF' : 'none' }} onClick={() => setScreen('messages')}>💬 মেসেজ</button>
      </div>

      {/* মেইন ভিউপোর্ট */}
      <div style={{ padding: '15px', maxWidth: '600px', margin: '0 auto' }}>
        {renderScreen()}
      </div>

      {/* বটম নেভিগেশন */}
      <BottomNav setPage={setScreen} currentPage={screen} />
    </div>
  );
}

const styles = {
  topBtn: { 
    background: 'transparent', 
    border: 'none', 
    padding: '8px 16px', 
    cursor: 'pointer', 
    fontSize: '15px', 
    fontWeight: 'bold',
    borderRadius: '0px',
    transition: 'all 0.2s'
  }
};
                   
