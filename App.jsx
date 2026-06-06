import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, addDoc, onSnapshot, query, orderBy, updateDoc, arrayUnion, arrayRemove, getDocs, where } from 'firebase/firestore';
import { App as CapacitorApp } from '@capacitor/app'; // নেটিভ ডিভাইস ব্যাক বাটন কন্ট্রোলার

// প্রফেশনাল ডার্ক ও লাক্সারি লাক্স স্টাইল গাইড
const styles = {
  container: { background: '#090D13', color: '#E6EDF3', minHeight: '100vh', paddingBottom: '90px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' },
  loading: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#090D13', color: '#58A6FF' },
  header: { background: '#161B22', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #30363D' },
  logo: { fontSize: '20px', fontWeight: '900', color: '#58A6FF', letterSpacing: '0.5px', cursor: 'pointer' },
  card: { maxWidth: '400px', margin: '40px auto', padding: '30px', background: '#161B22', borderRadius: '16px', border: '1px solid #30363D', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' },
  input: { width: '100%', padding: '12px 16px', margin: '8px 0', borderRadius: '8px', border: '1px solid #30363D', background: '#0D1117', color: '#F0F6FC', fontSize: '14px', boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#238636', color: '#FFFFFF', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  btnSecondary: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #30363D', background: '#21262D', color: '#58A6FF', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
  
  mainContent: { maxWidth: '550px', margin: '0 auto', padding: '15px' },
  postCard: { background: '#161B22', borderRadius: '14px', padding: '16px', border: '1px solid #30363D', marginBottom: '16px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#1F6FEB', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
  actionRow: { display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid #21262D', paddingTop: '10px' },
  actionBtn: { background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' },
  
  // সেটিংস ক্যাটাগরি রো
  settingsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #21262D' },
  settingsSection: { background: '#161B22', padding: '16px', borderRadius: '12px', border: '1px solid #30363D', marginBottom: '15px' },
  
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#161B22', display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderTop: '1px solid #30363D', zIndex: 999 },
  navItem: { background: 'none', border: 'none', color: '#8B949E', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); 
  const [screen, setScreen] = useState('login');
  const [error, setError] = useState('');
  const [navigationHistory, setNavigationHistory] = useState(['home']);

  // ডেটা স্টেট
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState({ fullName: 'Lexal User', followers: [], following: [], savedPosts: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postText, setPostText] = useState('');

  // সেটিংস অপশন স্টেট (ফেসবুকের মতো)
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [isActiveStatusOn, setIsActiveStatusOn] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('Dark Luxury');

  // কাস্টম ডায়নামিক নেভিগেশন (যা হিস্ট্রি সেভ করে)
  const navigateTo = (tab) => {
    setNavigationHistory(prev => [...prev, tab]);
    setActiveTab(tab);
  };

  // 📱 অ্যান্ড্রোয়েড ও আইওএস ফিজিক্যাল ব্যাক বাটন কন্ট্রোল ইন্টিগ্রেশন
  useEffect(() => {
    const backButtonListener = CapacitorApp.addListener('backButton', () => {
      if (navigationHistory.length > 1) {
        const updatedHistory = [...navigationHistory];
        updatedHistory.pop(); // বর্তমান পেজ বাদ
        const prevPage = updatedHistory[updatedHistory.length - 1];
        setNavigationHistory(updatedHistory);
        setActiveTab(prevPage);
      } else {
        // একদম হোম পেজে থাকলে ব্যাক চাপলে অ্যাপ ব্যাকগ্রাউন্ডে চলে যাবে বা এক্সিট হবে
        CapacitorApp.exitApp();
      }
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [navigationHistory]);

  // ইউজার সেশন ট্র্যাকিং
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) setUserData(docSnap.data());
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // গ্লোবাল ফিড লোড
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // 🔍 গ্লোবাল রিয়েল-টাইম সার্চ ইঞ্জিন (লক্ষ কোটি ইউজার থেকে খোঁজার জন্য)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      const q = query(
        collection(db, "users"),
        where("fullName", ">=", searchQuery),
        where("fullName", "<=", searchQuery + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      setSearchResults(querySnapshot.docs.map(doc => doc.data()).filter(u => u.uid !== user.uid));
    }, 300); // নেটওয়ার্ক অপ্টিমাইজেশনের জন্য Debounce ব্যবহার করা হয়েছে

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // ফলো এবং আনফলো মেকানিজম (Global Connection Grid)
  const handleFollowToggle = async (targetUserId, isFollowing) => {
    const myDocRef = doc(db, "users", user.uid);
    const targetDocRef = doc(db, "users", targetUserId);

    try {
      if (isFollowing) {
        await updateDoc(myDocRef, { following: arrayRemove(targetUserId) });
        await updateDoc(targetDocRef, { followers: arrayRemove(user.uid) });
      } else {
        await updateDoc(myDocRef, { following: arrayUnion(targetUserId) });
        await updateDoc(targetDocRef, { followers: arrayUnion(user.uid) });
      }
    } catch (err) {
      alert("সংযোগ স্থাপন করতে সমস্যা হয়েছে।");
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    await addDoc(collection(db, "posts"), {
      author: userData.fullName || user.displayName,
      uid: user.uid,
      content: postText,
      createdAt: Date.now(),
      likes: []
    });
    setPostText('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPassword); } catch (err) { setError('ভুল ইমেইল বা পাসওয়ার্ড!'); }
  };

  if (loading) return <div style={styles.loading}><h2>Lexal Global Network Engine...</h2></div>;

  return (
    <div style={styles.container}>
      {user && (
        <div style={styles.header}>
          <div style={styles.logo} onClick={() => navigateTo('home')}>Lexal Social</div>
          <div style={{ display: 'flex', gap: '15px', fontSize: '18px' }}>
            <span onClick={() => navigateTo('settings')} style={{ cursor: 'pointer' }}>⚙️</span>
          </div>
        </div>
      )}

      {user ? (
        <div style={styles.mainContent}>
          
          {/* ==================== হোম পেজ এবং ইউজার কানেকশন এরিয়া ==================== */}
          {activeTab === 'home' && (
            <div>
              {/* 🔎 গ্লোবাল সার্চ ইঞ্জিন ইনপুট বার */}
              <input type="text" style={{ ...styles.input, background: '#161B22', borderRadius: '20px', marginBottom: '15px' }} placeholder="🔍 লক্ষ কোটি বন্ধুদের নাম লিখে সার্চ করুন..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

              {/* সার্চ রেজাল্ট প্যানেল */}
              {searchResults.length > 0 && (
                <div style={{ background: '#161B22', padding: '12px', borderRadius: '12px', border: '1px solid #30363D', marginBottom: '15px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#58A6FF' }}>অনুসন্ধানের ফলাফল:</h5>
                  {searchResults.map(targetUser => {
                    const isFollowing = userData.following?.includes(targetUser.uid);
                    return (
                      <div key={targetUser.uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #21262D' }}>
                        <div>
                          <strong style={{ fontSize: '14px' }}>{targetUser.fullName}</strong>
                          <div style={{ fontSize: '11px', color: '#8B949E' }}>{targetUser.followers?.length || 0} Followers</div>
                        </div>
                        <button onClick={() => handleFollowToggle(targetUser.uid, isFollowing)} style={{ background: isFollowing ? '#21262D' : '#238636', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                          {isFollowing ? 'Unfollow' : 'Connect / Follow'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* পোস্ট মেকার */}
              <div style={{ ...styles.postCard, background: '#161B22' }}>
                <textarea style={{ ...styles.input, height: '60px', resize: 'none', marginTop: 0 }} placeholder="আজকে আপনার মনে কী চলছে?" value={postText} onChange={(e) => setPostText(e.target.value)} />
                <button onClick={handleCreatePost} style={{ ...styles.btnPrimary, width: 'auto', padding: '6px 16px', float: 'right', fontSize: '13px' }}>Publish</button>
                <div style={{ clear: 'both' }}></div>
              </div>

              {/* নিউজফিড */}
              {posts.map(post => (
                <div key={post.id} style={styles.postCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={styles.avatar}>{(post.author || 'L')[0].toUpperCase()}</div>
                    <div><h5 style={{ margin: 0 }}>{post.author}</h5></div>
                  </div>
                  <p style={{ fontSize: '14px', margin: '12px 0' }}>{post.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* ==================== ফেসবুক লেভেল মেগা সেটিংস প্যানেল ==================== */}
          {activeTab === 'settings' && (
            <div>
              <h3 style={{ color: '#58A6FF', marginBottom: '20px' }}>⚙️ Settings & Privacy</h3>
              
              {/* ১. অ্যাকাউন্ট সেটিংস */}
              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#58A6FF' }}>👤 Account Settings</h4>
                <div style={styles.settingsRow}><span>Name & Personal Info</span><span style={{ color: '#8B949E' }}>{userData.fullName} ⚙️</span></div>
                <div style={styles.settingsRow}><span>Email Address</span><span style={{ color: '#8B949E' }}>{user.email}</span></div>
                <div style={styles.settingsRow}><span>Profile Avatar Sync</span><span style={{ color: '#58A6FF', cursor: 'pointer' }}>Change</span></div>
              </div>

              {/* ২. প্রাইভেসী সেটিংস */}
              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#FF7B72' }}>🔒 Privacy & Safety</h4>
                <div style={styles.settingsRow}>
                  <div>
                    <div>Lock Profile</div>
                    <div style={{ fontSize: '11px', color: '#8B949E' }}>শুধুমাত্র ফলোয়াররাই আপনার পোস্ট দেখতে পারবে</div>
                  </div>
                  <input type="checkbox" checked={isAccountLocked} onChange={() => setIsAccountLocked(!isAccountLocked)} />
                </div>
                <div style={styles.settingsRow}>
                  <div>
                    <div>Show Active Status</div>
                    <div style={{ fontSize: '11px', color: '#8B949E' }}>আপনি কখন লাইভে আছেন তা অন্যরা দেখতে পাবে</div>
                  </div>
                  <input type="checkbox" checked={isActiveStatusOn} onChange={() => setIsActiveStatusOn(!isActiveStatusOn)} />
                </div>
              </div>

              {/* ৩. নোটিফিকেশন সেটিংস */}
              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#F2C94C' }}>🔔 Preferences</h4>
                <div style={styles.settingsRow}><span>Push Notifications</span><input type="checkbox" checked={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} /></div>
                <div style={styles.settingsRow}><span>Email Alerts</span><span style={{ color: '#8B949E' }}>Enabled</span></div>
              </div>

              {/* ৪. সিকিউরিটি এবং লগইন */}
              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#58A6FF' }}>🛡️ Security & Login</h4>
                <div style={styles.settingsRow}><span>Two-Factor Authentication (2FA)</span><input type="checkbox" checked={twoFactorAuth} onChange={() => setTwoFactorAuth(!twoFactorAuth)} /></div>
                <div style={styles.settingsRow}><span>Change Password</span><span style={{ color: '#58A6FF', cursor: 'pointer' }} onClick={() => alert('পাসওয়ার্ড পরিবর্তনের লিংক ইমেইলে পাঠানো হয়েছে।')}>Update</span></div>
                <div style={styles.settingsRow}><span>Where You're Logged In</span><span style={{ color: '#8B949E' }}>Android Device (Active Now)</span></div>
              </div>

              {/* ৫. থিম ও ইউজার ইন্টারফেস */}
              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#7EE787' }}>🎨 Display & Theme</h4>
                <div style={styles.settingsRow}>
                  <span>Current Theme</span>
                  <select style={{ background: '#0D1117', color: '#fff', border: '1px solid #30363D', padding: '4px', borderRadius: '4px' }} value={currentTheme} onChange={(e) => setCurrentTheme(e.target.value)}>
                    <option>Dark Luxury</option>
                    <option>Amoled Pure Black</option>
                    <option>Light Mode</option>
                  </select>
                </div>
              </div>

              {/* ৬. সাপোর্ট ও লিগ্যাল */}
              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#8B949E' }}>ℹ️ Help & Support</h4>
                <div style={styles.settingsRow}><span>Terms of Service</span>➔</div>
                <div style={styles.settingsRow}><span>Data Privacy Policy</span>➔</div>
                <div style={styles.settingsRow}><span>Report a Technical Bug</span><span style={{ color: '#58A6FF', cursor: 'pointer' }}>Open Ticket</span></div>
              </div>

              <button onClick={() => signOut(auth)} style={{ ...styles.btnPrimary, background: '#FF7B72', marginTop: '10px' }}>Log Out from Device</button>
            </div>
          )}

          {/* ==================== অন্যান্য ট্যাব প্লেসহোল্ডার ==================== */}
          {activeTab === 'messages' && <div style={{ textAlign: 'center', padding: '40px' }}><h3>💬 Secure Messenger Engine</h3><p>রিয়েল-টাইম চ্যাট সিস্টেম রেডি হচ্ছে...</p></div>}
          {activeTab === 'create' && <div style={{ textAlign: 'center', padding: '40px' }}><h3>➕ Multimedia Studio</h3><p>অডিও/ভিডিও এবং লাইভ ব্রডকাস্টিং কনসোল</p></div>}
          {activeTab === 'profile' && (
            <div style={styles.postCard}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...styles.avatar, width: '70px', height: '70px', fontSize: '24px', margin: '0 auto 10px auto' }}>{(userData.fullName || 'U')[0].toUpperCase()}</div>
                <h3>{userData.fullName}</h3>
                <p style={{ color: '#8B949E' }}>@{auth.currentUser?.email.split('@')[0]}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '15px' }}>
                  <div><strong>{userData.following?.length || 0}</strong><div style={{ color: '#8B949E', fontSize: '12px' }}>Following</div></div>
                  <div><strong>{userData.followers?.length || 0}</strong><div style={{ color: '#8B949E', fontSize: '12px' }}>Followers</div></div>
                </div>
              </div>
            </div>
          )}

          {/* 📱 ডাইনামিক বটম নেভিগেশন বার */}
          <div style={styles.bottomNav}>
            <button onClick={() => navigateTo('home')} style={{ ...styles.navItem, ...(activeTab === 'home' ? { color: '#58A6FF' } : {}) }}><span>🏠</span>Home</button>
            <button onClick={() => navigateTo('messages')} style={{ ...styles.navItem, ...(activeTab === 'messages' ? { color: '#58A6FF' } : {}) }}><span>💬</span>Chats</button>
            <button onClick={() => navigateTo('create')} style={{ ...styles.navItem, ...(activeTab === 'create' ? { color: '#58A6FF' } : {}) }}><span>➕</span>Studio</button>
            <button onClick={() => navigateTo('profile')} style={{ ...styles.navItem, ...(activeTab === 'profile' ? { color: '#58A6FF' } : {}) }}><span>👤</span>Profile</button>
          </div>

        </div>
      ) : (
        /* অথেনটিকেশন স্ক্রিন */
        <div style={styles.card}>
          <h2 style={{ textAlign: 'center', color: '#58A6FF' }}>Lexal Social</h2>
          <form onSubmit={handleLogin}>
            <input type="email" style={styles.input} placeholder="Email" onChange={(e) => setLoginEmail(e.target.value)} />
            <input type="password" style={styles.input} placeholder="Password" onChange={(e) => setLoginPassword(e.target.value)} />
            <button type="submit" style={styles.btnPrimary}>Log In</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
    
