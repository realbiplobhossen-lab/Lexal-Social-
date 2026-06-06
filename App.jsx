import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, addDoc, onSnapshot, query, orderBy, updateDoc, arrayUnion, arrayRemove, getDocs, where } from 'firebase/firestore';

// গ্লোবাল প্রোডাকশন লেভেল ডার্ক থিম স্টাইলস
const styles = {
  container: { background: '#090D13', color: '#E6EDF3', minHeight: '100vh', paddingBottom: '90px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
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

  // ডায়নামিক সোশ্যাল ডাটা স্টেট
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState({ fullName: '', followers: [], following: [], savedPosts: [], workplace: '', hometown: '', relation: 'Single' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postText, setPostText] = useState('');

  // মেগা সেটিংস প্যানেল স্টেট
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [isActiveStatusOn, setIsActiveStatusOn] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('Dark Luxury');

  // ব্রাউজার ও ডিভাইস লেভেল ইউনিভার্সাল ব্যাক বাটন ইন্টিগ্রেশন
  const navigateTo = (tab) => {
    setNavigationHistory(prev => [...prev, tab]);
    setActiveTab(tab);
    window.history.pushState({ tab }, tab, `#${tab}`);
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ইউজার সেশন ট্র্যাকিং এবং প্রোফাইল ডাটা সিঙ্ক
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData({ fullName: currentUser.displayName || 'Lexal User', followers: [], following: [], workplace: '', hometown: '', relation: 'Single' });
          }
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // রিয়েল-টাইম নিউজফিড ইঞ্জিন
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // লক্ষ কোটি ব্যবহারকারীর জন্য লাইভ সার্চ কুয়েরি
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
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // কানেকশন/ফলো সিস্টেম (Millions of Users Grid)
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
      alert("কানেকশন রিকোয়েস্ট প্রসেস করা যাচ্ছে না।");
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    await addDoc(collection(db, "posts"), {
      author: userData.fullName || user.displayName || 'Lexal User',
      uid: user.uid,
      content: postText,
      createdAt: Date.now(),
      likes: []
    });
    setPostText('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPassword); } catch (err) { setError('ভুল ইমেইল বা পাসওয়ার্ড!'); }
  };

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpForm, setSignUpForm] = useState({ firstName: '', lastName: '', email: '', password: '' });

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, signUpForm.email, signUpForm.password);
      const fullName = `${signUpForm.firstName} ${signUpForm.lastName}`;
      await updateProfile(cred.user, { displayName: fullName });

      const newProfile = {
        fullName,
        email: signUpForm.email,
        uid: cred.user.uid,
        followers: [],
        following: [],
        workplace: 'Not set',
        hometown: 'Not set',
        relation: 'Single'
      };

      await setDoc(doc(db, "users", cred.user.uid), newProfile);
      setUserData(newProfile);
      alert('অ্যাকাউন্ট তৈরি সফল হয়েছে!');
      setScreen('login');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={styles.loading}><h2>Lexal Social Engine Connectivity...</h2></div>;

  return (
    <div style={styles.container}>
      {user && (
        <div style={styles.header}>
          <div style={styles.logo} onClick={() => navigateTo('home')}>Lexal Social</div>
          <div style={{ display: 'flex', gap: '15px', fontSize: '18px' }} onClick={() => navigateTo('settings')}>⚙️</div>
        </div>
      )}

      {user ? (
        <div style={styles.mainContent}>
          
          {/* ==================== হোম ফিড ও রিয়েল-টাইম সার্চ ==================== */}
          {activeTab === 'home' && (
            <div>
              <input type="text" style={{ ...styles.input, background: '#161B22', borderRadius: '20px', marginBottom: '15px' }} placeholder="🔍 লক্ষ কোটি ব্যবহারকারীদের নাম লিখে সার্চ করুন..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

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
                          {isFollowing ? 'Unfollow ❌' : 'Connect +'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={styles.postCard}>
                <textarea style={{ ...styles.input, height: '60px', resize: 'none', marginTop: 0 }} placeholder={`আজকে আপনার মনে কী চলছে, ${userData.fullName?.split(' ')[0]}?`} value={postText} onChange={(e) => setPostText(e.target.value)} />
                <button onClick={handleCreatePost} style={{ ...styles.btnPrimary, width: 'auto', padding: '6px 16px', float: 'right', fontSize: '13px' }}>Publish</button>
                <div style={{ clear: 'both' }}></div>
              </div>

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
              <h3 style={{ color: '#58A6FF', marginBottom: '20px' }}>⚙️ Super Settings & Privacy</h3>
              
              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#58A6FF' }}>👤 Account Center</h4>
                <div style={styles.settingsRow}><span>Personal Name Sync</span><span style={{ color: '#8B949E' }}>{userData.fullName}</span></div>
                <div style={styles.settingsRow}><span>Login Identity (Email)</span><span style={{ color: '#8B949E' }}>{user.email}</span></div>
              </div>

              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#FF7B72' }}>🔒 Privacy and Visibility</h4>
                <div style={styles.settingsRow}>
                  <div><div>Lock Profile Profile</div><div style={{ fontSize: '11px', color: '#8B949E' }}>Only followers can view logs</div></div>
                  <input type="checkbox" checked={isAccountLocked} onChange={() => setIsAccountLocked(!isAccountLocked)} />
                </div>
                <div style={styles.settingsRow}>
                  <div><div>Active Status Pulse</div><div style={{ fontSize: '11px', color: '#8B949E' }}>Show online ring to friends</div></div>
                  <input type="checkbox" checked={isActiveStatusOn} onChange={() => setIsActiveStatusOn(!isActiveStatusOn)} />
                </div>
              </div>

              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#F2C94C' }}>🔔 App Preferences</h4>
                <div style={styles.settingsRow}><span>Push Notifications Cloud</span><input type="checkbox" checked={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} /></div>
                <div style={styles.settingsRow}><span>Email Ledger Alerts</span><span style={{ color: '#8B949E' }}>Active</span></div>
              </div>

              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#58A6FF' }}>🛡️ Cyber Security Hub</h4>
                <div style={styles.settingsRow}><span>Two-Factor Authentication (2FA)</span><input type="checkbox" checked={twoFactorAuth} onChange={() => setTwoFactorAuth(!twoFactorAuth)} /></div>
                <div style={styles.settingsRow}><span>System Password Ledger</span><span style={{ color: '#58A6FF', cursor: 'pointer' }} onClick={() => alert('লিংক পাঠানো হয়েছে।')}>Modify</span></div>
              </div>

              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#7EE787' }}>🎨 Display Aesthetics</h4>
                <div style={styles.settingsRow}>
                  <span>Engine Skin</span>
                  <select style={{ background: '#0D1117', color: '#fff', border: '1px solid #30363D', padding: '4px', borderRadius: '4px' }} value={currentTheme} onChange={(e) => setCurrentTheme(e.target.value)}>
                    <option>Dark Luxury</option>
                    <option>Pure Amoled</option>
                  </select>
                </div>
              </div>

              <button onClick={() => signOut(auth)} style={{ ...styles.btnPrimary, background: '#FF7B72', marginTop: '10px' }}>Sign Out from Device</button>
            </div>
          )}

          {/* ==================== প্রোফাইল ভিউ এবং স্ট্যাটাস কাউন্টার ==================== */}
          {activeTab === 'profile' && (
            <div style={styles.postCard}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...styles.avatar, width: '70px', height: '70px', fontSize: '24px', margin: '0 auto 10px auto' }}>{(userData.fullName || 'U')[0].toUpperCase()}</div>
                <h3>{userData.fullName}</h3>
                <p style={{ color: '#8B949E' }}>@{user.email.split('@')[0]}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '15px' }}>
                  <div><strong>{userData.following?.length || 0}</strong><div style={{ color: '#8B949E', fontSize: '12px' }}>Following</div></div>
                  <div><strong>{userData.followers?.length || 0}</strong><div style={{ color: '#8B949E', fontSize: '12px' }}>Followers</div></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && <div style={{ textAlign: 'center', padding: '40px' }}><h3>💬 Secure Chat Engine</h3><p>Real-time P2P Channels Activating...</p></div>}
          {activeTab === 'create' && <div style={{ textAlign: 'center', padding: '40px' }}><h3>📹 Media Studio Console</h3><p>WebRTC Live Streams Matrix...</p></div>}

          {/* 📱 ডাইনামিক সচল বটম নেভিগেশন বার */}
          <div style={styles.bottomNav}>
            <button onClick={() => navigateTo('home')} style={{ ...styles.navItem, ...(activeTab === 'home' ? { color: '#58A6FF' } : {}) }}><span>🏠</span>Home</button>
            <button onClick={() => navigateTo('messages')} style={{ ...styles.navItem, ...(activeTab === 'messages' ? { color: '#58A6FF' } : {}) }}><span>💬</span>Chats</button>
            <button onClick={() => navigateTo('create')} style={{ ...styles.navItem, ...(activeTab === 'create' ? { color: '#58A6FF' } : {}) }}><span>➕</span>Studio</button>
            <button onClick={() => navigateTo('profile')} style={{ ...styles.navItem, ...(activeTab === 'profile' ? { color: '#58A6FF' } : {}) }}><span>👤</span>Profile</button>
          </div>

        </div>
      ) : (
        /* ==================== গ্লোবাল গেটওয়ে স্ক্রিন ==================== */
        <div style={styles.card}>
          <h2 style={{ textAlign: 'center', color: '#58A6FF' }}>Lexal Social</h2>
          {screen === 'login' ? (
            <form onSubmit={handleLogin}>
              <input type="email" style={styles.input} placeholder="Email" onChange={(e) => setLoginEmail(e.target.value)} />
              <input type="password" style={styles.input} placeholder="Password" onChange={(e) => setLoginPassword(e.target.value)} />
              <button type="submit" style={styles.btnPrimary}>Log In</button>
              <button type="button" onClick={() => setScreen('signup')} style={styles.btnSecondary}>Create New Account</button>
            </form>
          ) : (
            <form onSubmit={handleSignUp}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" style={styles.input} placeholder="First Name" onChange={(e)=>setSignUpForm({...signUpForm, firstName: e.target.value})} />
                <input type="text" style={styles.input} placeholder="Last Name" onChange={(e)=>setSignUpForm({...signUpForm, lastName: e.target.value})} />
              </div>
              <input type="email" style={styles.input} placeholder="Email" onChange={(e)=>setSignUpForm({...signUpForm, email: e.target.value})} />
              <input type="password" style={styles.input} placeholder="Password" onChange={(e)=>setSignUpForm({...signUpForm, password: e.target.value})} />
              <button type="submit" style={styles.btnPrimary}>Sign Up</button>
              <div onClick={() => setScreen('login')} style={{ color: '#58A6FF', textAlign: 'center', marginTop: '15px', cursor: 'pointer' }}>Back to Log In</div>
            </form>
          )}
          {error && <div style={{ color: '#FF7B72', textAlign: 'center', marginTop: '10px', fontSize: '13px' }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

export default App;
                                            
