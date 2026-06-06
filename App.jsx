import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase'; 
import { 
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile 
} from 'firebase/auth';
import { 
  collection, doc, setDoc, getDoc, addDoc, onSnapshot, query, orderBy, 
  updateDoc, arrayUnion, arrayRemove, getDocs, where 
} from 'firebase/firestore';

// 🎨 গ্লোবাল ফেসবুক-লাক্সারি ডার্ক থিম স্টাইল শিট
const styles = {
  container: { background: '#090D13', color: '#E6EDF3', minHeight: '100vh', paddingBottom: '90px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  loading: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#090D13', color: '#58A6FF' },
  header: { background: '#161B22', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #30363D' },
  logo: { fontSize: '24px', fontWeight: '900', color: '#58A6FF', letterSpacing: '0.5px', cursor: 'pointer' },
  card: { maxWidth: '400px', margin: '40px auto', padding: '30px', background: '#161B22', borderRadius: '16px', border: '1px solid #30363D', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' },
  input: { width: '100%', padding: '12px 16px', margin: '8px 0', borderRadius: '8px', border: '1px solid #30363D', background: '#0D1117', color: '#F0F6FC', fontSize: '14px', boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#238636', color: '#FFFFFF', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  btnSecondary: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #30363D', background: '#21262D', color: '#58A6FF', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
  mainContent: { maxWidth: '550px', margin: '0 auto', padding: '15px' },
  postCard: { background: '#161B22', borderRadius: '14px', padding: '16px', border: '1px solid #30363D', marginBottom: '16px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#1F6FEB', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px' },
  badge: { background: '#FF7B72', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', position: 'absolute', top: '-5px', right: '-10px' },
  settingsSection: { background: '#161B22', padding: '16px', borderRadius: '12px', border: '1px solid #30363D', marginBottom: '15px' },
  settingsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #21262D' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#161B22', display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderTop: '1px solid #30363D', zIndex: 999 },
  navItem: { background: 'none', border: 'none', color: '#8B949E', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' },
  chatBubbleLeft: { background: '#21262D', padding: '10px 14px', borderRadius: '14px 14px 14px 0px', margin: '5px 0', maxWidth: '75%', alignSelf: 'flex-start', color: '#F0F6FC' },
  chatBubbleRight: { background: '#1F6FEB', padding: '10px 14px', borderRadius: '14px 14px 0px 14px', margin: '5px 0', maxWidth: '75%', alignSelf: 'flex-end', color: '#FFFFFF' }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); 
  const [screen, setScreen] = useState('login');
  const [error, setError] = useState('');

  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState({ fullName: '', friends: [], sentRequests: [], receivedRequests: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [activeChatFriend, setActiveChatFriend] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [postText, setPostText] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState({});

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpForm, setSignUpForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  
  const chatBottomRef = useRef(null);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            const defaultData = { fullName: currentUser.displayName || 'Lexal User', uid: currentUser.uid, friends: [], sentRequests: [], receivedRequests: [] };
            setDoc(docRef, defaultData);
            setUserData(defaultData);
          }
        });

        const notifQuery = query(collection(db, `users/${currentUser.uid}/notifications`), orderBy("createdAt", "desc"));
        onSnapshot(notifQuery, (snap) => {
          setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !activeChatFriend) return;
    const chatRoomId = user.uid > activeChatFriend.uid ? `${user.uid}_${activeChatFriend.uid}` : `${activeChatFriend.uid}_${user.uid}`;
    const chatQuery = query(collection(db, `chats/${chatRoomId}/messages`), orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(chatQuery, (snap) => {
      setChatMessages(snap.docs.map(d => d.data()));
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [user, activeChatFriend]);

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

  const sendFriendRequest = async (targetUser) => {
    const myDocRef = doc(db, "users", user.uid);
    const targetDocRef = doc(db, "users", targetUser.uid);
    try {
      await updateDoc(myDocRef, { sentRequests: arrayUnion(targetUser.uid) });
      await updateDoc(targetDocRef, { receivedRequests: arrayUnion(user.uid) });

      await addDoc(collection(db, `users/${targetUser.uid}/notifications`), {
        senderName: userData.fullName, senderUid: user.uid, type: "friend_request",
        message: `${userData.fullName} আপনাকে একটি ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছেন।`,
        createdAt: Date.now(), status: "unread"
      });
      alert(`রিকোয়েস্ট পাঠানো হয়েছে!`);
    } catch (err) { alert("রিকোয়েস্ট পাঠানো সম্ভব হয়নি।"); }
  };

  const acceptFriendRequest = async (senderUid, senderName, notifId) => {
    const myDocRef = doc(db, "users", user.uid);
    const senderDocRef = doc(db, "users", senderUid);
    try {
      await updateDoc(myDocRef, { friends: arrayUnion(senderUid), receivedRequests: arrayRemove(senderUid) });
      await updateDoc(senderDocRef, { friends: arrayUnion(user.uid), sentRequests: arrayRemove(user.uid) });

      await updateDoc(doc(db, `users/${user.uid}/notifications`, notifId), { type: "accepted", message: `আপনি এবং ${senderName} এখন বন্ধু।`, status: "read" });

      await addDoc(collection(db, `users/${senderUid}/notifications`), {
        senderName: userData.fullName, senderUid: user.uid, type: "request_accepted",
        message: `${userData.fullName} আপনার ফ্রেন্ড রিকোয়েস্ট গ্রহণ করেছেন।`,
        createdAt: Date.now(), status: "unread"
      });
      alert("অভিনন্দন! আপনারা এখন বন্ধু।");
    } catch (err) { alert("কনফার্ম করা যায়নি।"); }
  };

  const rejectFriendRequest = async (senderUid, notifId) => {
    try {
      await updateDoc(doc(db, "users", user.uid), { receivedRequests: arrayRemove(senderUid) });
      await updateDoc(doc(db, "users", senderUid), { sentRequests: arrayRemove(user.uid) });
      await updateDoc(doc(db, `users/${user.uid}/notifications`, notifId), { type: "rejected", message: "রিকোয়েস্টটি বাতিল করা হয়েছে।", status: "read" });
    } catch (err) {}
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatFriend) return;
    const chatRoomId = user.uid > activeChatFriend.uid ? `${user.uid}_${activeChatFriend.uid}` : `${activeChatFriend.uid}_${user.uid}`;
    
    const messageData = { senderUid: user.uid, text: typedMessage, createdAt: Date.now() };
    setTypedMessage('');
    await addDoc(collection(db, `chats/${chatRoomId}/messages`), messageData);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    await addDoc(collection(db, "posts"), { author: userData.fullName, uid: user.uid, content: postText, createdAt: Date.now(), likes: [] });
    setPostText('');
  };

  const handleLikePost = async (postId, likesArray) => {
    const postRef = doc(db, "posts", postId);
    if (likesArray?.includes(user.uid)) {
      await updateDoc(postRef, { likes: arrayRemove(user.uid) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(user.uid) });
    }
  };

  const handleOpenComments = async (postId) => {
    setActiveCommentPostId(postId);
    const q = query(collection(db, `posts/${postId}/comments`), orderBy("createdAt", "asc"));
    onSnapshot(q, (snap) => {
      setPostComments(prev => ({ ...prev, [postId]: snap.docs.map(d => d.data()) }));
    });
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addDoc(collection(db, `posts/${postId}/comments`), { author: userData.fullName, text: commentText, createdAt: Date.now() });
    setCommentText('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPassword); } catch (err) { setError('ইমেইল বা পাসওয়ার্ড ভুল!'); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, signUpForm.email, signUpForm.password);
      const fullName = `${signUpForm.firstName} ${signUpForm.lastName}`;
      await updateProfile(cred.user, { displayName: fullName });
      const defaultProfile = { fullName, email: signUpForm.email, uid: cred.user.uid, friends: [], sentRequests: [], receivedRequests: [] };
      await setDoc(doc(db, "users", cred.user.uid), defaultProfile);
      setUserData(defaultProfile);
      setScreen('login');
      alert('রেজিস্ট্রেশন সফল!');
    } catch (err) { setError(err.message); }
  };

  if (loading) return <div style={styles.loading}><h2>Lexal Facebook Core Engine Activating...</h2></div>;

  return (
    <div style={styles.container}>
      {user && (
        <div style={styles.header}>
          <div style={styles.logo} onClick={() => { setActiveChatFriend(null); navigateTo('home'); }}>Lexal Net</div>
          <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
            <span onClick={() => navigateTo('notifications')} style={{ cursor: 'pointer', fontSize: '20px', position: 'relative' }}>
              🔔{notifications.filter(n => n.status === 'unread').length > 0 && (
                <span style={styles.badge}>{notifications.filter(n => n.status === 'unread').length}</span>
              )}
            </span>
            <span onClick={() => navigateTo('settings')} style={{ cursor: 'pointer', fontSize: '20px' }}>⚙️</span>
          </div>
        </div>
      )}

      {user ? (
        <div style={styles.mainContent}>
          
          {activeTab === 'home' && !activeChatFriend && (
            <div>
              <input type="text" style={{ ...styles.input, background: '#161B22', borderRadius: '25px', marginBottom: '18px' }} placeholder="🔍 বন্ধুদের নাম লিখে সার্চ করুন..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

              {searchResults.length > 0 && (
                <div style={{ background: '#161B22', padding: '15px', borderRadius: '12px', border: '1px solid #30363D', marginBottom: '15px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#58A6FF' }}>অনুসন্ধানের ফলাফল:</h5>
                  {searchResults.map(targetUser => {
                    const isFriend = userData.friends?.includes(targetUser.uid);
                    const hasSent = userData.sentRequests?.includes(targetUser.uid);
                    const hasReceived = userData.receivedRequests?.includes(targetUser.uid);

                    return (
                      <div key={targetUser.uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #21262D' }}>
                        <strong>{targetUser.fullName}</strong>
                        <div>
                          {isFriend ? <span style={{ color: '#8B949E', fontSize: '13px' }}>🤝 বন্ধু</span> :
                           hasSent ? <span style={{ color: '#F2C94C', fontSize: '13px' }}>⏳ পেন্ডিং</span> :
                           hasReceived ? <button onClick={() => navigateTo('notifications')} style={{ background: '#58A6FF', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px' }}>Respond</button> :
                           <button onClick={() => sendFriendRequest(targetUser)} style={{ background: '#238636', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold' }}>+ Add Friend</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={styles.postCard}>
                <textarea style={{ ...styles.input, height: '65px', resize: 'none', marginTop: 0 }} placeholder={`আপনার মনে কী চলছে?`} value={postText} onChange={(e) => setPostText(e.target.value)} />
                <button onClick={handleCreatePost} style={{ ...styles.btnPrimary, width: 'auto', padding: '6px 18px', float: 'right', fontSize: '13px' }}>Post</button>
                <div style={{ clear: 'both' }}></div>
              </div>

              {posts.map(post => (
                <div key={post.id} style={styles.postCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={styles.avatar}>{post.author?.[0]?.toUpperCase() || 'L'}</div>
                    <h5 style={{ margin: 0 }}>{post.author}</h5>
                  </div>
                  <p style={{ fontSize: '15px', color: '#F0F6FC' }}>{post.content}</p>
                  
                  <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid #21262D', paddingTop: '10px', marginTop: '10px' }}>
                    <span onClick={() => handleLikePost(post.id, post.likes)} style={{ cursor: 'pointer', color: post.likes?.includes(user.uid) ? '#58A6FF' : '#8B949E', fontSize: '14px' }}>
                      👍 {post.likes?.length || 0} Likes
                    </span>
                    <span onClick={() => handleOpenComments(post.id)} style={{ cursor: 'pointer', color: '#8B949E', fontSize: '14px' }}>
                      💬 Comments
                    </span>
                  </div>

                  {activeCommentPostId === post.id && (
                    <div style={{ marginTop: '15px', background: '#0D1117', padding: '10px', borderRadius: '8px' }}>
                      {postComments[post.id]?.map((c, idx) => (
                        <div key={idx} style={{ fontSize: '13px', margin: '6px 0', borderBottom: '1px solid #21262D', paddingBottom: '4px' }}>
                          <strong style={{ color: '#58A6FF' }}>{c.author}: </strong><span>{c.text}</span>
                        </div>
                      ))}
                      <form onSubmit={(e) => handleAddComment(e, post.id)} style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                        <input type="text" style={{ ...styles.input, margin: 0, padding: '8px' }} placeholder="একটি কমেন্ট লিখুন..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                        <button type="submit" style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 12px' }}>Send</button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ color: '#58A6FF', marginBottom: '15px' }}>🔔 নোটিফিকেশন সেন্টার</h3>
              {notifications.length === 0 ? <p style={{ color: '#8B949E' }}>নতুন কোনো নোটিফিকেশন নেই।</p> : 
                notifications.map(n => (
                  <div key={n.id} style={{ ...styles.postCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: n.status === 'unread' ? '#1C212A' : '#161B22' }}>
                    <div style={{ fontSize: '14px', color: '#F0F6FC' }}>{n.message}</div>
                    {n.type === 'friend_request' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => acceptFriendRequest(n.senderUid, n.senderName, n.id)} style={{ background: '#238636', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>Confirm</button>
                        <button onClick={() => rejectFriendRequest(n.senderUid, n.id)} style={{ background: '#FF7B72', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>Delete</button>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              {!activeChatFriend ? (
                <div>
                  <h3 style={{ color: '#58A6FF', marginBottom: '15px' }}>💬 মেসেঞ্জার ইনবক্স</h3>
                  <p style={{ fontSize: '13px', color: '#8B949E' }}>বন্ধুদের সাথে চ্যাট করতে ক্লিক করুন:</p>
                  {posts.filter(p => userData.friends?.includes(p.uid))
                    .filter((v, i, a) => a.findIndex(t => (t.uid === v.uid)) === i)
                    .map(f => (
                      <div key={f.uid} onClick={() => setActiveChatFriend({ uid: f.uid, fullName: f.author })} style={{ background: '#161B22', padding: '14px', borderRadius: '10px', border: '1px solid #30363D', marginBottom: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.avatar}>{f.author?.[0]?.toUpperCase()}</div>
                        <strong>{f.author}</strong>
                      </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#161B22', borderRadius: '14px', border: '1px solid #30363D', height: '60vh', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '14px', borderBottom: '1px solid #30363D', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>🟢 {activeChatFriend.fullName}</strong>
                    <button onClick={() => setActiveChatFriend(null)} style={{ background: '#21262D', color: '#FF7B72', border: 'none', padding: '4px 10px', borderRadius: '4px' }}>Close</button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column' }}>
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={msg.senderUid === user.uid ? styles.chatBubbleRight : styles.chatBubbleLeft}>
                        {msg.text}
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>
                  <form onSubmit={handleSendMessage} style={{ padding: '10px', borderTop: '1px solid #30363D', display: 'flex', gap: '8px' }}>
                    <input type="text" style={{ ...styles.input, margin: 0 }} placeholder="একটি মেসেজ..." value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} />
                    <button type="submit" style={{ background: '#1F6FEB', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px' }}>Send</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 style={{ color: '#58A6FF', marginBottom: '15px' }}>⚙️ settings</h3>
              <div style={styles.settingsSection}>
                <div style={styles.settingsRow}><span>নাম:</span><span style={{ color: '#8B949E' }}>{userData.fullName}</span></div>
                <div style={styles.settingsRow}><span>ইমেইল:</span><span style={{ color: '#8B949E' }}>{user.email}</span></div>
              </div>
              <button onClick={() => signOut(auth)} style={{ ...styles.btnPrimary, background: '#FF7B72' }}>Log Out</button>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={styles.postCard}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...styles.avatar, width: '75px', height: '75px', fontSize: '28px', margin: '0 auto 12px auto' }}>{userData.fullName?.[0]?.toUpperCase()}</div>
                <h3>{userData.fullName}</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '20px' }}>
                  <div><strong>{userData.friends?.length || 0}</strong><div>Friends</div></div>
                </div>
              </div>
            </div>
          )}

          <div style={styles.bottomNav}>
            <button onClick={() => { setActiveChatFriend(null); navigateTo('home'); }} style={{ ...styles.navItem, ...(activeTab === 'home' ? { color: '#58A6FF' } : {}) }}><span>🏠</span>Home</button>
            <button onClick={() => navigateTo('messages')} style={{ ...styles.navItem, ...(activeTab === 'messages' ? { color: '#58A6FF' } : {}) }}><span>💬</span>Messenger</button>
            <button onClick={() => navigateTo('profile')} style={{ ...styles.navItem, ...(activeTab === 'profile' ? { color: '#58A6FF' } : {}) }}><span>👤</span>Profile</button>
          </div>

        </div>
      ) : (
        <div style={styles.card}>
          <h2 style={{ textAlign: 'center', color: '#58A6FF', margin: '0 0 20px 0' }}>Lexal Social</h2>
          {screen === 'login' ? (
            <form onSubmit={handleLogin}>
              <input type="email" style={styles.input} placeholder="আপনার ইমেইল" onChange={(e) => setLoginEmail(e.target.value)} required />
              <input type="password" style={styles.input} placeholder="পাসওয়ার্ড" onChange={(e) => setLoginPassword(e.target.value)} required />
              <button type="submit" style={styles.btnPrimary}>Log In</button>
              <button type="button" onClick={() => setScreen('signup')} style={styles.btnSecondary}>নতুন একাউন্ট খুলুন</button>
            </form>
          ) : (
            <form onSubmit={handleSignUp}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" style={styles.input} placeholder="First Name" onChange={(e)=>setSignUpForm({...signUpForm, firstName: e.target.value})} required />
                <input type="text" style={styles.input} placeholder="Last Name" onChange={(e)=>setSignUpForm({...signUpForm, lastName: e.target.value})} required />
              </div>
              <input type="email" style={styles.input} placeholder="ইমেইল এড্রেস" onChange={(e)=>setSignUpForm({...signUpForm, email: e.target.value})} required />
              <input type="password" style={styles.input} placeholder="নতুন পাসওয়ার্ড" onChange={(e)=>setSignUpForm({...signUpForm, password: e.target.value})} required />
              <button type="submit" style={styles.btnPrimary}>Sign Up</button>
              <div onClick={() => setScreen('login')} style={{ color: '#58A6FF', textAlign: 'center', marginTop: '15px', cursor: 'pointer' }}>লগইন করুন</div>
            </form>
          )}
          {error && <div style={{ color: '#FF7B72', textAlign: 'center', marginTop: '12px' }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

export default App;
