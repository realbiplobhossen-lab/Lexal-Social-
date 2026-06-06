import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, addDoc, onSnapshot, query, orderBy, updateDoc, arrayUnion, arrayRemove, getDocs, where } from 'firebase/firestore';

// গ্লোবাল ফেসবুক-ইনস্পায়ার্ড প্রফেশনাল ডার্ক থিম
const styles = {
  container: { background: '#090D13', color: '#E6EDF3', minHeight: '100vh', paddingBottom: '90px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  loading: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#090D13', color: '#58A6FF' },
  header: { background: '#161B22', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #30363D' },
  logo: { fontSize: '22px', fontWeight: '900', color: '#58A6FF', letterSpacing: '0.5px', cursor: 'pointer' },
  card: { maxWidth: '400px', margin: '40px auto', padding: '30px', background: '#161B22', borderRadius: '16px', border: '1px solid #30363D', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' },
  input: { width: '100%', padding: '12px 16px', margin: '8px 0', borderRadius: '8px', border: '1px solid #30363D', background: '#0D1117', color: '#F0F6FC', fontSize: '14px', boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#238636', color: '#FFFFFF', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  btnSecondary: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #30363D', background: '#21262D', color: '#58A6FF', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
  mainContent: { maxWidth: '550px', margin: '0 auto', padding: '15px' },
  postCard: { background: '#161B22', borderRadius: '14px', padding: '16px', border: '1px solid #30363D', marginBottom: '16px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#1F6FEB', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
  badge: { background: '#FF7B72', color: 'white', borderRadius: '50%', padding: '2px 7px', fontSize: '11px', fontWeight: 'bold', marginLeft: '5px' },
  settingsSection: { background: '#161B22', padding: '16px', borderRadius: '12px', border: '1px solid #30363D', marginBottom: '15px' },
  settingsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #21262D' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#161B22', display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderTop: '1px solid #30363D', zIndex: 999 },
  navItem: { background: 'none', border: 'none', color: '#8B949E', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); 
  const [screen, setScreen] = useState('login');
  const [error, setError] = useState('');

  // ফায়ারস্টোর সোশ্যাল ডাটা স্টেট
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState({ fullName: '', friends: [], sentRequests: [], receivedRequests: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [postText, setPostText] = useState('');

  // ফর্ম স্টেইটস
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpForm, setSignUpForm] = useState({ firstName: '', lastName: '', email: '', password: '' });

  // ইন-অ্যাপ ফিজিক্যাল ব্যাক বাটন নেভিগেশন সিমুলেশন
  const navigateTo = (tab) => {
    setActiveTab(tab);
    window.history.pushState({ tab }, tab, `#${tab}`);
  };

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.tab) setActiveTab(e.state.tab);
      else setActiveTab('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ইউজার সেশন ও রিয়েল-টাইম ডাটাবেজ সিঙ্ক
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // ইউজারের সম্পূর্ণ ফ্রেন্ড প্রোফাইল রিয়েল-টাইমে ট্র্যাকিং
        const docRef = doc(db, "users", currentUser.uid);
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) setUserData(docSnap.data());
        });

        // নোটিফিকেশন ইঞ্জিন লাইভ সিঙ্ক
        const notifQuery = query(collection(db, `users/${currentUser.uid}/notifications`), orderBy("createdAt", "desc"));
        onSnapshot(notifQuery, (snap) => {
          setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // গ্লোবাল নিউজফিড ইঞ্জিন
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // গ্লোবাল ইউজার ফাইন্ডার ইঞ্জিন (লক্ষ কোটি ইউজার থেকে খোঁজা)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      const q = query(collection(db, "users"), where("fullName", ">=", searchQuery), where("fullName", "<=", searchQuery + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      setSearchResults(querySnapshot.docs.map(doc => doc.data()).filter(u => u.uid !== user.uid));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // ⚡ ফাংশন ১: ফ্রেন্ড রিকোয়েস্ট পাঠানো + ইনস্ট্যান্ট নোটিফিকেশন ট্রিগার
  const sendFriendRequest = async (targetUser) => {
    const myDocRef = doc(db, "users", user.uid);
    const targetDocRef = doc(db, "users", targetUser.uid);

    try {
      // ১. আমার একাউন্টে রিকোয়েস্ট ট্র্যাকিং যোগ করা হলো
      await updateDoc(myDocRef, { sentRequests: arrayUnion(targetUser.uid) });
      // ২. সামনের ইউজারের একাউন্টে রিকোয়েস্ট পেন্ডিং করা হলো
      await updateDoc(targetDocRef, { receivedRequests: arrayUnion(user.uid) });

      // ৩. সামনের ইউজারের নোটিফিকেশন সাব-কালেকশনে রিয়েল-টাইম এলার্ট পাঠানো হলো
      const notifRef = collection(db, `users/${targetUser.uid}/notifications`);
      await addDoc(notifRef, {
        senderName: userData.fullName,
        senderUid: user.uid,
        type: "friend_request",
        message: `${userData.fullName} আপনাকে একটি ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছেন।`,
        createdAt: Date.now(),
        status: "unread"
      });

      alert(`কমপ্লিট! ${targetUser.fullName}-এর ফোনে রিয়েল-টাইম নোটিফিকেশন চলে গেছে।`);
    } catch (err) {
      alert("রিকোয়েস্ট পাঠানো যায়নি।");
    }
  };

  // ⚡ ফাংশন ২: ফ্রেন্ড রিকোয়েস্ট এক্সেপ্ট করা (টু-ওয়ে মিউচুয়াল কানেকশন)
  const acceptFriendRequest = async (senderUid, senderName, notifId) => {
    const myDocRef = doc(db, "users", user.uid);
    const senderDocRef = doc(db, "users", senderUid);

    try {
      // ১. ডাটাবেজে দুইজনকে একে অপরের ফ্রেন্ড লিস্টে যুক্ত করা হলো
      await updateDoc(myDocRef, {
        friends: arrayUnion(senderUid),
        receivedRequests: arrayRemove(senderUid)
      });
      await updateDoc(senderDocRef, {
        friends: arrayUnion(user.uid),
        sentRequests: arrayRemove(user.uid)
      });

      // ২. নোটিফিকেশনটি এক্সেপ্টেড হিসেবে ক্লিয়ার করা হলো
      const myNotifRef = doc(db, `users/${user.uid}/notifications`, notifId);
      await updateDoc(myNotifRef, { type: "accepted", message: `আপনি এবং ${senderName} এখন বন্ধু।` });

      // ৩. যে রিকোয়েস্ট পাঠিয়েছিল, তাকে আবার একটি ব্যাক-নোটিফিকেশন দেওয়া হলো
      const senderNotifRef = collection(db, `users/${senderUid}/notifications`);
      await addDoc(senderNotifRef, {
        senderName: userData.fullName,
        senderUid: user.uid,
        type: "request_accepted",
        message: `${userData.fullName} আপনার ফ্রেন্ড রিকোয়েস্ট গ্রহণ করেছেন।`,
        createdAt: Date.now()
      });

      alert("রিকোয়েস্ট সফলভাবে গ্রহণ করা হয়েছে!");
    } catch (err) {
      alert("সমস্যা হয়েছে।");
    }
  };

  // ⚡ ফাংশন ৩: ফ্রেন্ড রিকোয়েস্ট রিজেক্ট/ক্যান্সেল করা
  const rejectFriendRequest = async (senderUid, notifId) => {
    const myDocRef = doc(db, "users", user.uid);
    const senderDocRef = doc(db, "users", senderUid);
    try {
      await updateDoc(myDocRef, { receivedRequests: arrayRemove(senderUid) });
      await updateDoc(senderDocRef, { sentRequests: arrayRemove(user.uid) });
      const myNotifRef = doc(db, `users/${user.uid}/notifications`, notifId);
      await updateDoc(myNotifRef, { type: "rejected", message: "রিকোয়েস্টটি মুছে ফেলা হয়েছে।" });
    } catch (err) {}
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    await addDoc(collection(db, "posts"), { author: userData.fullName, uid: user.uid, content: postText, createdAt: Date.now() });
    setPostText('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPassword); } catch (err) { setError('লগইন ব্যর্থ! সঠিক তথ্য দিন।'); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, signUpForm.email, signUpForm.password);
      const fullName = `${signUpForm.firstName} ${signUpForm.lastName}`;
      await updateProfile(cred.user, { displayName: fullName });

      const defaultProfile = {
        fullName, email: signUpForm.email, uid: cred.user.uid,
        friends: [], sentRequests: [], receivedRequests: [],
        workplace: 'Lexal Corporation', hometown: 'Dhaka', relation: 'Single'
      };
      await setDoc(doc(db, "users", cred.user.uid), defaultProfile);
      setUserData(defaultProfile);
      setScreen('login');
      alert('অ্যাকাউন্ট তৈরি সম্পন্ন!');
    } catch (err) { setError(err.message); }
  };

  if (loading) return <div style={styles.loading}><h2>Lexal Global Real-Time Engine Active...</h2></div>;

  return (
    <div style={styles.container}>
      {user && (
        <div style={styles.header}>
          <div style={styles.logo} onClick={() => navigateTo('home')}>Lexal Social</div>
          <div style={{ display: 'flex', gap: '15px', position: 'relative' }}>
            <span onClick={() => navigateTo('notifications')} style={{ cursor: 'pointer', fontSize: '18px' }}>
              🔔{notifications.filter(n => n.status === 'unread').length > 0 && <span style={styles.badge}>{notifications.filter(n => n.status === 'unread').length}</span>}
            </span>
            <span onClick={() => navigateTo('settings')} style={{ cursor: 'pointer', fontSize: '18px' }}>⚙️</span>
          </div>
        </div>
      )}

      {user ? (
        <div style={styles.mainContent}>
          
          {/* ================= TAB 1: HOME & LIVE SEARCH ================= */}
          {activeTab === 'home' && (
            <div>
              <input type="text" style={{ ...styles.input, background: '#161B22', borderRadius: '25px', marginBottom: '15px' }} placeholder="🔍 নাম লিখে লক্ষ কোটি ইউজারদের সার্চ করুন..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

              {/* সার্চ রেজাল্ট গ্রিড এবং রিয়েল-টাইম ফ্রেন্ড রিকোয়েস্ট অ্যাকশন */}
              {searchResults.length > 0 && (
                <div style={{ background: '#161B22', padding: '15px', borderRadius: '12px', border: '1px solid #30363D', marginBottom: '15px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#58A6FF' }}>অনুসন্ধানের ফলাফল:</h5>
                  {searchResults.map(targetUser => {
                    const isFriend = userData.friends?.includes(targetUser.uid);
                    const hasSent = userData.sentRequests?.includes(targetUser.uid);
                    const hasReceived = userData.receivedRequests?.includes(targetUser.uid);

                    return (
                      <div key={targetUser.uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #21262D' }}>
                        <div><strong>{targetUser.fullName}</strong></div>
                        <div>
                          {isFriend ? (
                            <button style={{ background: '#21262D', color: '#8B949E', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }} disabled>🤝 Friend</button>
                          ) : hasSent ? (
                            <button style={{ background: '#21262D', color: '#F2C94C', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }} disabled>⏳ Requested</button>
                          ) : hasReceived ? (
                            <button onClick={() => navigateTo('notifications')} style={{ background: '#58A6FF', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>Respond</button>
                          ) : (
                            <button onClick={() => sendFriendRequest(targetUser)} style={{ background: '#238636', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>+ Add Friend</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={styles.postCard}>
                <textarea style={{ ...styles.input, height: '60px', resize: 'none', marginTop: 0 }} placeholder={`আপনার মনে কী চলছে, ${userData.fullName?.split(' ')[0]}?`} value={postText} onChange={(e) => setPostText(e.target.value)} />
                <button onClick={handleCreatePost} style={{ ...styles.btnPrimary, width: 'auto', padding: '5px 15px', float: 'right', fontSize: '13px' }}>Publish</button>
                <div style={{ clear: 'both' }}></div>
              </div>

              {posts.map(post => (
                <div key={post.id} style={styles.postCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={styles.avatar}>{(post.author || 'L')[0].toUpperCase()}</div>
                    <h5 style={{ margin: 0 }}>{post.author}</h5>
                  </div>
                  <p style={{ fontSize: '14px', margin: '12px 0' }}>{post.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* ================= TAB 2: LIVE NOTIFICATION ENGINE ================= */}
          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ color: '#58A6FF' }}>🔔 Notifications Center</h3>
              {notifications.length === 0 ? <p style={{ color: '#8B949E' }}>কোনো নোটিফিকেশন নেই।</p> : 
                notifications.map(n => (
                  <div key={n.id} style={{ ...styles.postCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: n.status === 'unread' ? '#1C212A' : '#161B22' }}>
                    <div style={{ fontSize: '14px', maxWidth: '70%' }}>{n.message}</div>
                    {n.type === 'friend_request' && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => acceptFriendRequest(n.senderUid, n.senderName, n.id)} style={{ background: '#238636', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Confirm</button>
                        <button onClick={() => rejectFriendRequest(n.senderUid, n.id)} style={{ background: '#FF7B72', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>Delete</button>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          )}

          {/* ================= TAB 3: MEGA SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div>
              <h3 style={{ color: '#58A6FF' }}>⚙️ Settings & Privacy Control</h3>
              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#58A6FF' }}>👤 Account Settings</h4>
                <div style={styles.settingsRow}><span>Active Account Name</span><span style={{ color: '#8B949E' }}>{userData.fullName}</span></div>
                <div style={styles.settingsRow}><span>Primary Email</span><span style={{ color: '#8B949E' }}>{user.email}</span></div>
              </div>
              <div style={styles.settingsSection}>
                <h4 style={{ margin: '0 0 10px 0', color: '#FF7B72' }}>🔒 Profile Privacy</h4>
                <div style={styles.settingsRow}><span>Lock Profile Feed</span><input type="checkbox" defaultChecked /></div>
                <div style={styles.settingsRow}><span>Show Active Ring Pulse</span><input type="checkbox" defaultChecked /></div>
              </div>
              <button onClick={() => signOut(auth)} style={{ ...styles.btnPrimary, background: '#FF7B72' }}>Log Out from Device</button>
            </div>
          )}

          {/* ================= TAB 4: PROFILE STATUS COUNTER ================= */}
          {activeTab === 'profile' && (
            <div style={styles.postCard}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...styles.avatar, width: '70px', height: '70px', fontSize: '26px', margin: '0 auto 10px auto' }}>{(userData.fullName || 'U')[0].toUpperCase()}</div>
                <h2>{userData.fullName}</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '20px' }}>
                  <div><strong>{userData.friends?.length || 0}</strong><div style={{ color: '#8B949E', fontSize: '13px' }}>Friends</div></div>
                  <div><strong>{userData.sentRequests?.length || 0}</strong><div style={{ color: '#8B949E', fontSize: '13px' }}>Sent</div></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && <div style={{ textAlign: 'center', padding: '40px' }}><h3>💬 Secure Chat Room</h3><p>চ্যাট ম্যাট্রিক্স কনফিগার হচ্ছে...</p></div>}
          {activeTab === 'create' && <div style={{ textAlign: 'center', padding: '40px' }}><h3>📹 Live Studio Box</h3><p>ভিডিও স্ট্রিমিং চ্যানেল রেডি হচ্ছে...</p></div>}

          {/* 📱 ১০০% ডাইনামিক নেভিগেশন বার */}
          <div style={styles.bottomNav}>
            <button onClick={() => navigateTo('home')} style={{ ...styles.navItem, ...(activeTab === 'home' ? { color: '#58A6FF' } : {}) }}><span>🏠</span>Home</button>
            <button onClick={() => navigateTo('messages')} style={{ ...styles.navItem, ...(activeTab === 'messages' ? { color: '#58A6FF' } : {}) }}><span>💬</span>Chats</button>
            <button onClick={() => navigateTo('create')} style={{ ...styles.navItem, ...(activeTab === 'create' ? { color: '#58A6FF' } : {}) }}><span>➕</span>Studio</button>
            <button onClick={() => navigateTo('profile')} style={{ ...styles.navItem, ...(activeTab === 'profile' ? { color: '#58A6FF' } : {}) }}><span>👤</span>Profile</button>
          </div>

        </div>
      ) : (
        /* গেটওয়ে পোর্টাল */
        <div style={styles.card}>
          <h2 style={{ textAlign: 'center', color: '#58A6FF' }}>Lexal Social</h2>
          {screen === 'login' ? (
            <form onSubmit={handleLogin}>
              <input type="email" style={styles.input} placeholder="Email" onChange={(e) => setLoginEmail(e.target.value)} />
              <input type="password" style={styles.input} placeholder="Password" onChange={(e) => setLoginPassword(e.target.value)} />
              <button type="submit" style={styles.btnPrimary}>Log In</button>
              <button type="button" onClick={() => setScreen('signup')} style={styles.btnSecondary}>Join Network</button>
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
          {error && <div style={{ color: '#FF7B72', textAlign: 'center', marginTop: '10px' }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

export default App;
