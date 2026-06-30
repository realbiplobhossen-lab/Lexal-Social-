import React, { useState, useEffect } from 'react';
import { auth, db } from './config/firebase'; // src/config/firebase.js
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// screens ফোল্ডারের স্ক্রিনগুলো
import HomeScreen from './screens/HomeScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';
import ChatScreen from './screens/ChatScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// components ফোল্ডারের নেভিগেশনাল ফাইলগুলো (পাথ ফিক্স করা হয়েছে)
import BottomNav from './components/BottomNav';
import Navbar from './components/Navbar';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('home'); 
  const [activeChatId, setActiveChatId] = useState('global_chat'); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) setUserData(docSnap.data());
        });
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#090D13', color: '#58A6FF' }}>
        <h2>Lexal Social লোড হচ্ছে...</h2>
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

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <HomeScreen currentUser={user} />;
      case 'create': return <CreatePostScreen setPage={setScreen} />;
      case 'profile': return <ProfileScreen userData={userData} />;
      case 'search': return <SearchScreen currentUser={user} userData={userData} />;
      case 'messages': return <ChatScreen chatId={activeChatId} currentUser={user} />;
      default: return <HomeScreen currentUser={user} />;
    }
  };

  return (
    <div style={{ background: '#090D13', color: '#E6EDF3', minHeight: '100vh', paddingBottom: '80px' }}>
      <Navbar userData={userData} setActiveScreen={setScreen} />
      
      {/* টপ শর্টকাট বার */}
      <div style={{ display: 'flex', justifyContent: 'space-around', background: '#161B22', padding: '10px', borderBottom: '1px solid #30363D' }}>
        <button style={styles.topBtn} onClick={() => setScreen('home')}>🏠 ফিড</button>
        <button style={styles.topBtn} onClick={() => setScreen('search')}>🔍 ফ্রেন্ডস</button>
        <button style={styles.topBtn} onClick={() => setScreen('messages')}>💬 মেসেজ</button>
      </div>

      <div style={{ padding: '15px' }}>
        {renderScreen()}
      </div>

      <BottomNav setPage={setScreen} currentPage={screen} />
    </div>
  );
}

const styles = {
  topBtn: { background: '#21262D', color: '#E6EDF3', border: '1px solid #30363D', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }
};

