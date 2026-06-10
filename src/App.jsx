import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';

// সকল ডাইনামিক স্ক্রিন ও কম্পোনেন্ট ইম্পোর্ট
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
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('home'); // home, create, profile, search, chat
  const [activeChatId, setActiveChatId] = useState('global_chat'); // ডিফল্ট চ্যাট রুম আইডি

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

  // ইউজার লগইন না থাকলে অথেনটিকেশন স্ক্রিন দেখানো হবে
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

  // ডাইনামিক স্ক্রিন রেন্ডারার লজিক (বাটন ক্লিকে যা পরিবর্তন হবে)
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
      
      {/* স্ট্যাটিক শর্টকাট হেডার বার যা চ্যাট ও সার্চ ওপেন করবে */}
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

      {/* ডাইনামিক কন্টেন্ট এরিয়া */}
      <div style={styles.contentArea}>
        {renderScreen()}
      </div>

      {/* নেভিগেশন বার যা পেজ পরিবর্তন নিয়ন্ত্রণ করবে */}
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
      
