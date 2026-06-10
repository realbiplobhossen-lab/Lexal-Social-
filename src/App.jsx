import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, addDoc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';

// গ্লোবাল ডার্ক লাক্সারি থিম স্টাইলস
const styles = {
  container: { background: '#090D13', color: '#E6EDF3', minHeight: '100vh', paddingBottom: '80px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  loading: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#090D13', color: '#58A6FF' },
  header: { background: '#161B22', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #30363D', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
  logo: { fontSize: '22px', fontWeight: '900', color: '#58A6FF', letterSpacing: '0.5px' },
  card: { maxWidth: '400px', margin: '40px auto', padding: '30px', background: '#161B22', borderRadius: '16px', border: '1px solid #30363D', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' },
  title: { textAlign: 'center', color: '#58A6FF', marginBottom: '20px' },
  input: { width: '100%', padding: '12px 16px', margin: '8px 0', borderRadius: '8px', border: '1px solid #30363D', background: '#0D1117', color: '#F0F6FC', fontSize: '15px', boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#238636', color: '#FFFFFF', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  btnSecondary: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #30363D', background: '#21262D', color: '#58A6FF', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  mainContent: { maxWidth: '550px', margin: '0 auto', padding: '15px' },
  postBox: { background: '#161B22', borderRadius: '14px', padding: '16px', border: '1px solid #30363D', marginBottom: '16px' },
  postCard: { background: '#161B22', borderRadius: '14px', padding: '16px', border: '1px solid #30363D', marginBottom: '16px' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', background: '#1F6FEB', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px', border: '1px solid #30363D' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  actionRow: { display: 'flex', justifyContent: 'space-between', marginTop: '15px', borderTop: '1px solid #21262D', paddingTop: '10px' },
  actionBtn: { background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#161B22', display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderTop: '1px solid #30363D', zIndex: 999 },
  navItem: { background: 'none', border: 'none', color: '#8B949E', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: '600' },
  activeNavItem: { color: '#58A6FF' },
  badge: { background: '#FF7B72', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', position: 'absolute', top: '-5px', right: '-10px' },
  
  // ডাইনামিক চ্যাট ইউআই স্টাইলস
  chatArea: { height: '350px', overflowY: 'auto', background: '#0D1117', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #30363D' },
  msgRow: { display: 'flex', margin: '5px 0' },
  msgText: { padding: '8px 12px', borderRadius: '12px', fontSize: '14px', maxWidth: '75%' }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [screen, setScreen] = useState('login'); // 'login' বা 'signup' কন্ট্রোল করবে
  const [error, setError] = useState('');
  const [history, setHistory] = useState(['home']);

  // ফায়ারস্টোর ডায়নামিক ডাটা স্টেট
  const [posts, setPosts] = useState([]);
  const [chats, setChats] = useState([]); // গ্লোবাল চ্যাটের জন্য নতুন স্টেট
  const [chatInput, setChatInput] = useState(''); // চ্যাট মেসেজ ইনপুট
  const [userData, setUserData] = useState({ fullName: 'Lexal User', country: '', sex: '', workplace: '', status: '', hometown: '', relation: 'Single' });
  
  // ইনপুট স্টেটসমূহ
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpForm, setSignUpForm] = useState({ firstName: '', lastName: '', email: '', password: '', country: 'Bangladesh', sex: 'Male' });
  const [postText, setPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [savedPostIds, setSavedPostIds] = useState([]);

  const navigateTo = (tab) => {
    setHistory(prev => [...prev, tab]);
    setActiveTab(tab);
  };

  const handleBackAction = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setActiveTab(previousPage);
    } else {
      setActiveTab('home');
    }
  };

  // ইউজার সেশন ও ফায়ারস্টোর প্রোফাইল ডাটা সিঙ্ক
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setUserData({ fullName: currentUser.displayName || 'Lexal User', relation: 'Single' });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ফায়ারস্টোর থেকে রিয়েল-টাইম গ্লোবাল নিউজফিড লোড
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // ফায়ারস্টোর থেকে রিয়েল-টাইম গ্লোবাল পাবলিক চ্যাট লোড
  useEffect(() => {
    if (!user || activeTab !== 'messages') return;
    const q = query(collection(db, "global_chats"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user, activeTab]);

  // লগইন প্রসেস
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err) {
      setError('লগইন হয়নি! সঠিক ইমেইল ও পাসওয়ার্ড দিন।');
    }
  };

  // সাইনআপ প্রসেস
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!signUpForm.firstName || !signUpForm.lastName || !signUpForm.email || !signUpForm.password) {
      setError('অনুগ্রহ করে সবগুলো ঘর পূরণ করুন!');
      return;
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, signUpForm.email, signUpForm.password);
      const fullName = `${signUpForm.firstName} ${signUpForm.lastName}`;
      await updateProfile(cred.user, { displayName: fullName });
      
      const newProfile = {
        fullName,
        email: signUpForm.email,
        country: signUpForm.country,
        sex: signUpForm.sex,
        uid: cred.user.uid,
        workplace: 'Not set',
        status: 'Student',
        hometown: signUpForm.country,
        relation: 'Single'
      };
      await setDoc(doc(db, "users", cred.user.uid), newProfile);
      setUserData(newProfile);
      alert('অ্যাকাউন্ট তৈরি সফল হয়েছে! এবার লগইন করুন।');
      setScreen('login');
    } catch (err) {
      setError(err.message.replace('Firebase:', ''));
    }
  };

  // পোস্ট ক্রিয়েট
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    try {
      await addDoc(collection(db, "posts"), {
        author: userData.fullName || user.displayName || 'Lexal User',
        uid: user.uid,
        content: postText,
        createdAt: Date.now(),
        likes: [],
        comments: []
      });
      setPostText('');
      navigateTo('home');
    } catch (err) {
      alert('পোস্ট আপলোড ব্যর্থ: ' + err.message);
    }
  };

  // চ্যাট মেসেজ পাঠানোর ডাইনামিক ফাংশন
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    try {
      await addDoc(collection(db, "global_chats"), {
        senderName: userData.fullName,
        senderUid: user.uid,
        text: chatInput,
        createdAt: Date.now()
      });
      setChatInput('');
    } catch (err) {
      alert('মেসেজ পাঠানো যায়নি: ' + err.message);
    }
  };

  const handleLike = async (postId, currentLikes = []) => {
    try {
      const postRef = doc(db, "posts", postId);
      const updatedLikes = currentLikes.includes(user.uid)
        ? currentLikes.filter(id => id !== user.uid)
        : [...currentLikes, user.uid];
      await updateDoc(postRef, { likes: updatedLikes });
    } catch (err) {}
  };

  const handleAddComment = async (postId, currentComments = []) => {
    const txt = commentInputs[postId];
    if (!txt || !txt.trim()) return;
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: [...currentComments, { author: userData.fullName, text: txt, createdAt: Date.now() }]
      });
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (err) {}
  };

  const toggleSavePost = (postId) => {
    setSavedPostIds(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
  };

  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.author, text: post.content, url: window.location.href });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(post.content);
      alert('পোস্টের টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে!');
    }
  };

  if (loading) return <div style={styles.loading}><h2>Lexal Social Network-এ যুক্ত হচ্ছে...</h2></div>;

  return (
    <div style={styles.container}>
      {user && (
        <div style={styles.header}>
          {history.length > 1 ? (
            <button onClick={handleBackAction} style={{ background: '#21262D', color: '#58A6FF', border: '1px solid #30363D', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>⬅️ Back</button>
          ) : <div style={{ width: '50px' }}></div>}
          <div style={styles.logo}>Lexal Social</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontSize: '20px', cursor: 'pointer' }} onClick={() => navigateTo('settings')}>⚙️</span>
          </div>
        </div>
      )}

      {user ? (
        <div style={styles.mainContent}>
          {/* ট্যাব ১: গ্লোবাল নিউজফিড */}
          {activeTab === 'home' && (
            <div>
              <div style={styles.postBox}>
                <div style={styles.userInfo}>
                  <div style={styles.avatar}>{(userData.fullName || 'U')[0].toUpperCase()}</div>
                  <h4 style={{ margin: 0 }}>{userData.fullName}</h4>
                </div>
                <textarea style={{ ...styles.input, height: '70px', resize: 'none', background: '#090D13', marginTop: '10px' }} placeholder="What's happening globally?" value={postText} onChange={(e) => setPostText(e.target.value)} />
                <button onClick={handleCreatePost} style={{ ...styles.btnPrimary, width: 'auto', float: 'right', padding: '8px 18px', fontSize: '14px' }}>Post</button>
                <div style={{ clear: 'both' }}></div>
              </div>

              {posts.map(post => {
                const isLiked = post.likes?.includes(user.uid);
                const isSaved = savedPostIds.includes(post.id);
                return (
                  <div key={post.id} style={styles.postCard}>
                    <div style={styles.userInfo}>
                      <div style={{ ...styles.avatar, background: '#21262D' }}>{(post.author || 'L')[0].toUpperCase()}</div>
                      <div><h4 style={{ margin: 0 }}>{post.author}</h4></div>
                    </div>
                    <p style={{ margin: '12px 0', fontSize: '15px', lineHeight: '1.5' }}>{post.content}</p>
                    <div style={styles.actionRow}>
                      <button onClick={() => handleLike(post.id, post.likes)} style={{ ...styles.actionBtn, color: isLiked ? '#58A6FF' : '#8B949E' }}>👍 Like ({post.likes?.length || 0})</button>
                      <button style={styles.actionBtn}>💬 Comment ({post.comments?.length || 0})</button>
                      <button onClick={() => handleShare(post)} style={styles.actionBtn}>↗️ Share</button>
                      <button onClick={() => toggleSavePost(post.id)} style={{ ...styles.actionBtn, color: isSaved ? '#F2C94C' : '#8B949E' }}>🔖 {isSaved ? 'Saved' : 'Save'}</button>
                    </div>

                    {post.comments?.length > 0 && (
                      <div style={{ background: '#0D1117', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
                        {post.comments.map((c, i) => (
                          <p key={i} style={{ fontSize: '13px', margin: '4px 0' }}><strong style={{ color: '#58A6FF' }}>{c.author}:</strong> {c.text}</p>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <input type="text" style={{ ...styles.input, padding: '8px', fontSize: '13px', margin: 0 }} placeholder="Write a comment..." value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })} />
                      <button onClick={() => handleAddComment(post.id, post.comments)} style={{ ...styles.btnPrimary, width: 'auto', padding: '2px 12px', fontSize: '13px' }}>Reply</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ট্যাব ২: সম্পূর্ণ ডাইনামিক লাইভ চ্যাট হাব */}
          {activeTab === 'messages' && (
            <div style={styles.postBox}>
              <h3 style={{ textAlign: 'center', color: '#58A6FF', margin: '0 0 5px 0' }}>💬 Lexal Secure Messenger</h3>
              <p style={{ color: '#8B949E', fontSize: '12px', textAlign: 'center', marginBottom: '15px' }}>🌐 Global Public Channel (End-to-End Synced)</p>
              
              {/* চ্যাট এরিয়া যেখানে মেসেজগুলো রিয়েল-টাইম দেখা যাবে */}
              <div style={styles.chatArea}>
                {chats.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#8B949E', fontSize: '13px', marginTop: '150px' }}>কোনো মেসেজ নেই। চ্যাট শুরু করুন!</p>
                ) : (
                  chats.map(chat => {
                    const isMe = chat.senderUid === user.uid;
                    return (
                      <div key={chat.id} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{ ...styles.msgText, background: isMe ? '#238636' : '#21262D', color: '#fff' }}>
                          {!isMe && <small style={{ color: '#58A6FF', display: 'block', fontWeight: 'bold', marginBottom: '2px' }}>{chat.senderName}</small>}
                          {chat.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* মেসেজ টাইপিং ফর্ম */}
              <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '8px' }}>
                <input type="text" style={{ ...styles.input, margin: 0 }} placeholder="টাইপ করুন..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
                <button type="submit" style={{ ...styles.btnPrimary, width: 'auto', padding: '0 20px' }}>Send</button>
              </form>
            </div>
          )}

          {/* ট্যাব ৩: স্টুডিও হাব */}
          {activeTab === 'create' && (
            <div style={{ background: '#161B22', padding: '20px', borderRadius: '12px', border: '1px solid #30363D' }}>
              <h3 style={{ color: '#58A6FF', marginTop: 0 }}>📹 Studio & Broadcasting Studio</h3>
              <p style={{ color: '#8B949E', fontSize: '13px' }}>হাই-ডেফিনিশন মাল্টিমিডিয়া ফাইল আপলোড এবং ব্রডকাস্ট প্যানেল</p>
              <button style={styles.btnSecondary} onClick={() => alert('ভিডিও আপলোডের জন্য স্টোরেজ ওপেন হচ্ছে...')}>📁 Upload Premium Video</button>
              <button style={{ ...styles.btnPrimary, background: '#FF7B72', marginTop: '12px' }} onClick={() => alert('লাইভ ভিডিও স্ট্রিমিং সার্ভার কানেক্ট হচ্ছে...')}>🔴 Go Live Stream</button>
              <button style={{ ...styles.btnPrimary, background: '#1F6FEB', marginTop: '12px' }} onClick={() => alert('WebRTC এর মাধ্যমে এইচডি অডিও/ভিডিও কল শুরু হচ্ছে...')}>📞 Start Audio / Video Call</button>
            </div>
          )}

          {/* 👤 ট্যাব ৪: প্রোফাইল ভিউ */}
          {activeTab === 'profile' && (
            <div style={styles.postBox}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '85px', height: '85px', borderRadius: '50%', background: '#58A6FF', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '32px', margin: '0 auto 10px auto', border: '3px solid #30363D' }}>
                  {(userData.fullName || 'U')[0].toUpperCase()}
                </div>
                <h2 style={{ margin: 0 }}>{userData.fullName}</h2>
                <p style={{ color: '#8B949E', fontSize: '13px' }}>Network Verified Profile</p>
              </div>
              <hr style={{ borderColor: '#21262D' }} />
              <h4>📌 Bio Data & Social Info</h4>
              <p>💼 <strong>Workplace:</strong> {userData.workplace || 'Not set'}</p>
              <p>🎓 <strong>Status:</strong> {userData.status || 'Not set'}</p>
              <p>❤️ <strong>Relationship:</strong> {userData.relation || 'Single'}</p>
              <p>🏠 <strong>Hometown:</strong> {userData.hometown || 'Not set'}</p>
              <button onClick={() => navigateTo('settings')} style={styles.btnSecondary}>✏️ Custom Profile Settings</button>
              <button onClick={() => signOut(auth)} style={{ ...styles.btnPrimary, background: '#FF7B72', marginTop: '25px' }}>Log Out</button>
            </div>
          )}

          {/* ⚙️ ট্যাব ৫: সেটিংস পেজ */}
          {activeTab === 'settings' && (
            <div style={styles.postBox}>
              <h3 style={{ color: '#58A6FF', marginTop: 0 }}>🛠️ Update Base Details</h3>
              <input type="text" style={styles.input} placeholder="Workplace" value={userData.workplace || ''} onChange={(e)=>setUserData({...userData, workplace: e.target.value})} />
              <input type="text" style={styles.input} placeholder="Hometown" value={userData.hometown || ''} onChange={(e)=>setUserData({...userData, hometown: e.target.value})} />
              <select style={styles.input} value={userData.relation || 'Single'} onChange={(e)=>setUserData({...userData, relation: e.target.value})}><option>Single</option><option>In a Relationship</option><option>Married</option></select>
              <button style={styles.btnPrimary} onClick={async () => { await setDoc(doc(db, "users", user.uid), userData, { merge: true }); alert('Cloud Sync Success!'); navigateTo('profile'); }}>Save to Cloud Database</button>
            </div>
          )}

          {/* রিয়েল প্রোডাকশন লেভেল বটম নেভিগেশন বার */}
          <div style={styles.bottomNav}>
            <button onClick={() => navigateTo('home')} style={{ ...styles.navItem, ...(activeTab === 'home' ? styles.activeNavItem : {}) }}><span>🏠</span>Home</button>
            <button onClick={() => navigateTo('messages')} style={{ ...styles.navItem, ...(activeTab === 'messages' ? styles.activeNavItem : {}), position: 'relative' }}><span>💬</span>Chats<span style={styles.badge}>Live</span></button>
            <button onClick={() => navigateTo('create')} style={{ ...styles.navItem, ...(activeTab === 'create' ? styles.activeNavItem : {}) }}><span>➕</span>Studio</button>
            <button onClick={() => navigateTo('profile')} style={{ ...styles.navItem, ...(activeTab === 'profile' ? styles.activeNavItem : {}) }}><span>👤</span>Profile</button>
          </div>
        </div>
      ) : (
        /* ==================== অথেনটিকেশন গেটওয়ে ইন্টারফেস ==================== */
        <div style={styles.card}>
          <h2 style={styles.title}>Lexal Social</h2>
          {screen === 'login' ? (
            <form onSubmit={handleLogin}>
              <input type="email" style={styles.input} placeholder="Email address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              <input type="password" style={styles.input} placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              <button type="submit" style={styles.btnPrimary}>Log In</button>
              <button type="button" onClick={() => setScreen('signup')} style={styles.btnSecondary}>Join Lexal Social Network</button>
            </form>
          ) : (
            <form onSubmit={handleSignUp}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" style={styles.input} placeholder="First Name" value={signUpForm.firstName} onChange={(e)=>setSignUpForm({...signUpForm, firstName: e.target.value})} />
                <input type="text" style={styles.input} placeholder="Last Name" value={signUpForm.lastName} onChange={(e)=>setSignUpForm({...signUpForm, lastName: e.target.value})} />
              </div>
              <input type="email" style={styles.input} placeholder="Email" value={signUpForm.email} onChange={(e)=>setSignUpForm({...signUpForm, email: e.target.value})} />
              <input type="password" style={styles.input} placeholder="Password" value={signUpForm.password} onChange={(e)=>setSignUpForm({...signUpForm, password: e.target.value})} />
              <button type="submit" style={styles.btnPrimary}>Create Account</button>
              <div onClick={() => setScreen('login')} style={{ color: '#58A6FF', textAlign: 'center', marginTop: '15px', cursor: 'pointer', fontSize: '14px' }}>Already registered? Log In</div>
            </form>
          )}
          {error && <div style={{ color: '#FF7B72', textAlign: 'center', marginTop: '10px', fontSize: '13px' }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

export default App;
