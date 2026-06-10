import React, { useState, useEffect } from 'react';
import { auth } from './firebase.js'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';

// সকল লোকাল ফাইল ইম্পোর্ট পাথ ফিক্স
import HomeScreen from './HomeScreen.js';
import CreatePostScreen from './CreatePostScreen.js';
import ProfileScreen from './ProfileScreen.js';
import SearchScreen from './SearchScreen.js';
import ChatScreen from './ChatScreen.js';
import LoginScreen from './LoginScreen.js';
import RegisterScreen from './RegisterScreen.js';
import BottomNav from './BottomNav.jsx.txt';
import Navbar from './Navbar.jsx.txt';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('home'); 
  const [activeChatId, setActiveChatId] = useState('global_chat'); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={styles.loading}>
        <h2>Lexal Social Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.authContainer}>
        {screen === 'register' ? (
          <RegisterScreen setPage={setScreen} />
        ) : (
          <LoginScreen setPage={setScreen} />
        )}
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          {screen === 'register' ? (
            <button style={styles.linkBtn} onClick={() => setScreen('login')}>Already have an account? Log In</button>
          ) : (
            <button style={styles.linkBtn} onClick={() => setScreen('register')}>Don't have an account? Sign Up</button>
          )}
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen />;
      case 'create':
        return <CreatePostScreen setPage={setScreen} />;
      case 'profile':
        return <ProfileScreen />;
      case 'search':
        return <SearchScreen />;
      case 'chat':
        return <ChatScreen chatId={activeChatId} />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      
      <div style={styles.topShortcutBar}>
        <button style={screen === 'chat' ? styles.activeTopBtn : styles.topBtn} onClick={() => { setScreen('chat'); setActiveChatId('global_chat'); }}>
          💬 Chats
        </button>
        <button style={screen === 'search' ? styles.activeTopBtn : styles.topBtn} onClick={() => setScreen('search')}>
          🔍 Search Users
        </button>
        <button style={styles.logoutBtn} onClick={() => signOut(auth)}>
          Logout
        </button>
      </div>

      <div style={styles.contentArea}>
        {renderScreen()}
      </div>

      <BottomNav setPage={setScreen} currentPage={screen} />
    </div>
  );
}

const styles = {
  container: { background: '#090D13', color: '#E6EDF3', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#090D13', color: '#58A6FF' },
  authContainer: { background: '#090D13', color: '#E6EDF3', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' },
  linkBtn: { background: 'none', border: 'none', color: '#58A6FF', cursor: 'pointer', fontSize: '14px' },
  topShortcutBar: { display: 'flex', justifyContent: 'space-around', background: '#161B22', padding: '10px', borderBottom: '1px solid #30363D' },
  topBtn: { background: '#21262D', color: '#E6EDF3', border: '1px solid #30363D', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' },
  activeTopBtn: { background: '#1f6feb', color: '#ffffff', border: '1px solid #58A6FF', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' },
  logoutBtn: { background: '#da3633', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' },
  contentArea: { padding: '10px' }
};
