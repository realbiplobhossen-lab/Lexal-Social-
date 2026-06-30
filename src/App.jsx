import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import HomeScreen from './HomeScreen';
import CreatePostScreen from './CreatePostScreen';
import ProfileScreen from './ProfileScreen';
import SearchScreen from './SearchScreen';
import ChatScreen from './ChatScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import BottomNav from './BottomNav';
import Navbar from './Navbar';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('home'); 
  const [activeChatId, setActiveChatId] = useState(null); 

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
          <RegisterScreen setPage={setScreen} />
        ) : (
          <LoginScreen setPage={setScreen} />
        )}
      </div>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <HomeScreen />;
      case 'create': return <CreatePostScreen setPage={setScreen} />;
      case 'profile': return <ProfileScreen userData={userData} />;
      case 'search': return <SearchScreen currentUser={user} userData={userData} />;
      case 'messages': return <ChatScreen chatId={activeChatId} setActiveChatId={setActiveChatId} currentUser={user} />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div style={{ background: '#090D13', color: '#E6EDF3', minHeight: '100vh', paddingBottom: '80px' }}>
      <Navbar userData={userData} setActiveScreen={setScreen} />
      
      {/* টপ শর্টকাট বার */}
      <div style={{ display: 'flex', justifyContent: 'space-around', background: '#161B22', padding: '10px', borderBottom: '1px solid #30363D' }}>
        <button style={styles.topBtn} onClick={() => setScreen('home')}>🏠 ফিড</button>
        <button style={styles.topBtn} onClick={() => setScreen('search')}>🔍 ফ্রেন্ড খুঁজুন ({userData?.friendRequests?.length || 0})</button>
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

