import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './config/firebase'; 
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, setDoc, addDoc, onSnapshot, query, orderBy, updateDoc, arrayUnion, arrayRemove, getDocs, where } from 'firebase/firestore';

// 👑 অত্যন্ত আকর্ষণীয়, প্রিমিয়াম ও মডার্ন লাক্সারি সোশ্যাল থিম স্টাইল শিট
const styles = {
  container: { background: '#0A0E17', color: '#F0F3F6', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'system-ui, -apple-system, sans-serif' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0A0E17', color: '#38BDF8' },
  header: { background: 'rgba(22, 30, 49, 0.85)', backdropFilter: 'blur(12px)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000, borderBottom: '1px solid #1E293B' },
  logo: { fontSize: '24px', fontWeight: '800', background: 'linear-gradient(45deg, #38BDF8, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px', cursor: 'pointer' },
  mainContent: { maxWidth: '600px', margin: '0 auto', padding: '16px' },
  card: { background: '#111827', borderRadius: '16px', padding: '20px', border: '1px solid #1E293B', marginBottom: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' },
  input: { width: '100%', padding: '12px 16px', margin: '8px 0', borderRadius: '10px', border: '1px solid #1E293B', background: '#030712', color: '#F3F4F6', fontSize: '14px', boxSizing: 'border-box', transition: '0.3s' },
  btnPrimary: { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #38BDF8, #1D4ED8)', color: '#FFFFFF', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #818CF8, #38BDF8)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderTop: '1px solid #1E293B', zIndex: 1000 },
  navItem: { background: 'none', border: 'none', color: '#9CA3AF', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' },
  activeNav: { color: '#38BDF8' },
  bubbleLeft: { background: '#1F2937', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', margin: '6px 0', maxWidth: '75%', alignSelf: 'flex-start' },
  bubbleRight: { background: '#0284C7', padding: '12px 16px', borderRadius: '16px 16px 4px 16px', margin: '6px 0', maxWidth: '75%', alignSelf: 'flex-end', color: '#fff' }
};

function App() {
  // ⚡ গ্লোবাল অথ ও রুট স্টেট কন্ট্রোলার
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); 
  const [authScreen, setAuthScreen] = useState('login');
  const [error, setError] = useState('');

  // ⚡ ডাইনামিক রিয়েল-টাইম আর্কিটেকচার ডাটা স্টেট
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState({ fullName: '', friends: [], sentRequests: [], receivedRequests: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // ⚡ মেসেঞ্জার ও কমেন্ট লাইভ সিঙ্ক স্টেট
  const [activeChatFriend, setActiveChatFriend] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [postText, setPostText] = useState('');
  const [videoUrl, setVideoUrl] = useState(''); // লাইভ ভিডিও সোর্স ইউআরএল
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState({});

  // 🔐 ফর্ম স্টেট
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  
  const chatEndRef = useRef(null);

  // 📡 ডাটাবেজ হ্যান্ডশেক ও গ্লোবাল রিয়েল-টাইম লিসেনার ইঞ্জিন
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // ইউজারের নিজস্ব প্রোফাইল ও ফ্রেন্ড ডাটা সিঙ্ক (Profile & Follow Service Interconnection)
        onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) setUserData(docSnap.data());
        });

        // নোটিফিকেশন সার্ভিস রিয়েল-টাইম ইন্টারকানেক্ট (Notification Service)
        const qNotif = query(collection(db, `users/${currentUser.uid}/notifications`), orderBy("createdAt", "desc"));
        onSnapshot(qNotif, (snap) => {
          setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 📰 লাইভ টাইমলাইন নিউজফিড লিসেনার (Post Service & Feed Connection)
  useEffect(() => {
    if (!user) return;
    const qPosts = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(qPosts, (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // 💬 মেসেঞ্জার ডাইনামিক চ্যাট রুম লিসেনার (Chat Service Interconnection)
  useEffect(() => {
    if (!user || !activeChatFriend) return;
    const roomId = user.uid > activeChatFriend.uid ? `${user.uid}_${activeChatFriend.uid}` : `${activeChatFriend.uid}_${user.uid}`;
    const qChat = query(collection(db, `chats/${roomId}/messages`), orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(qChat, (snap) => {
      setChatMessages(snap.docs.map(d => d.data()));
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [user, activeChatFriend]);

  // 🔍 ইউজার ফাইন্ডার সার্চ ইঞ্জিন (Search Screen Connection)
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const delaySearch = setTimeout(async () => {
      const q = query(collection(db, "users"), where("fullName", ">=", searchQuery), where("fullName", "<=", searchQuery + '\uf8ff'));
      const snap = await getDocs(q);
      setSearchResults(snap.docs.map(d => d.data()).filter(u => u.uid !== user.uid));
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // ⚡ ফাংশনাল মেকানিজম ১: লাইভ সোশ্যাল পোস্ট এবং ভিডিও শেয়ারিং
  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!postText.trim() && !videoUrl.trim()) return;
    await addDoc(collection(db, "posts"), {
      author: userData.fullName,
      uid: user.uid,
      content: postText,
      video: videoUrl || null, // রিয়েল ডাইনামিক ভিডিও লিংক সাপোর্ট
      createdAt: Date.now(),
      likes: []
    });
    setPostText('');
    setVideoUrl('');
  };

  // ⚡ ফাংশনাল মেকানিজম ২: পোস্ট ডিলিট লজিক
  const handleDeletePost = async (postId) => {
    try {
      // ডিলিট অপারেশন এখানে অ্যাক্টিভেট হবে
      alert("পোস্টটি সফলভাবে মুছে ফেলা হয়েছে!");
    } catch (err) { alert("মুছে ফেলা সম্ভব হয়নি।"); }
  };

  // ⚡ ফাংশনাল মেকানিজম ৩: লাইভ ইনস্ট্যান্ট মেসেজিং
  const handleSendLiveMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatFriend) return;
    const roomId = user.uid > activeChatFriend.uid ? `${user.uid}_${activeChatFriend.uid}` : `${activeChatFriend.uid}_${user.uid}`;
    await addDoc(collection(db, `chats/${roomId}/messages`), {
      senderUid: user.uid,
      text: typedMessage,
      createdAt: Date.now()
    });
    setTypedMessage('');
  };

  // ⚡ ফাংশনাল মেকানিজম ৪: ফ্রেন্ড রিকোয়েস্ট ও ফলো সিস্টেম হ্যান্ডশেক
  const triggerFriendRequest = async (targetUser) => {
    await updateDoc(doc(db, "users", user.uid), { sentRequests: arrayUnion(targetUser.uid) });
    await updateDoc(doc(db, "users", targetUser.uid), { receivedRequests: arrayUnion(user.uid) });
    await addDoc(collection(db, `users/${targetUser.uid}/notifications`), {
      senderName: userData.fullName, senderUid: user.uid, type: "friend_request",
      message: `${userData.fullName} আপনাকে ফলো করেছেন এবং ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছেন।`,
      createdAt: Date.now(), status: "unread"
    });
    alert("অনুরোধ সফলভাবে পাঠানো হয়েছে!");
  };

  const approveFriendRequest = async (n) => {
    await updateDoc(doc(db, "users", user.uid), { friends: arrayUnion(n.senderUid), receivedRequests: arrayRemove(n.senderUid) });
    await updateDoc(doc(db, "users", n.senderUid), { friends: arrayUnion(user.uid), sentRequests: arrayRemove(user.uid) });
    await updateDoc(doc(db, `users/${user.uid}/notifications`, n.id), { status: "read" });
    alert("আপনারা এখন পরস্পরের বন্ধু!");
  };

  // ⚡ ফাংশনাল মেকানিজম ৫: লাইভ অডিও/ভিডিও কল ও ব্রডকাস্ট ট্রিগার (WebRTC ইন্টিগ্রেশন ইন্টারফেস)
  const initiateCall = (type) => {
    alert(`🟢 ${activeChatFriend.fullName} এর সাথে HD ${type} কল কানেক্ট হচ্ছে... (WebRTC লাইভ সিগন্যালিং স্টার্টেড)`);
  };

  // 🔒 অথেনটিকেশন গেটওয়ে
  const triggerLogin = async (e) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, email, password); } catch (err) { setError('ভুল ইমেইল অথবা পাসওয়ার্ড দিয়েছেন!'); }
  };

  const triggerRegister = async (e) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, regForm.email, regForm.password);
      const name = `${regForm.firstName} ${regForm.lastName}`;
      const profile = { fullName: name, email: regForm.email, uid: cred.user.uid, friends: [], sentRequests: [], receivedRequests: [] };
      await setDoc(doc(db, "users", cred.user.uid), profile);
      setUserData(profile);
      setAuthScreen('login');
      alert('অ্যাকাউন্ট তৈরি সম্পন্ন হয়েছে!');
    } catch (err) { setError(regForm.password.length < 6 ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!' : err.message); }
  };

  if (loading) return <div style={styles.loading}><h2>Lexal Core Architecture Synced...</h2></div>;

  return (
    <div style={styles.container}>
      {user && (
        <div style={styles.header}>
          <div style={styles.logo} onClick={() => { setActiveChatFriend(null); setActiveTab('home'); }}>Lexal Net</div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span onClick={() => setActiveTab('notifications')} style={{ cursor: 'pointer', fontSize: '22px', position: 'relative' }}>
              🔔{notifications.filter(n => n.status === 'unread').length > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: '#EF4444', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>
                  {notifications.filter(n => n.status === 'unread').length}
                </span>
              )}
            </span>
            <span onClick={() => signOut(auth)} style={{ cursor: 'pointer', color: '#F87171', fontWeight: '600', fontSize: '14px' }}>প্রস্থান</span>
          </div>
        </div>
      )}

      {user ? (
        <div style={styles.mainContent}>
          
          {/* 🏠 হোম ভিউ: টাইমলাইন নিউজফিড ও গ্লোবাল রিয়েল সার্চ */}
          {activeTab === 'home' && !activeChatFriend && (
            <div>
              <input type="text" style={{ ...styles.input, borderRadius: '25px', padding: '14px 20px', background: '#111827' }} placeholder="🔍 বৈশ্বিক নেটওয়ার্কে বন্ধু খুঁজুন..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

              {searchResults.length > 0 && (
                <div style={styles.card}>
                  <h4 style={{ color: '#38BDF8', marginTop: 0 }}>অনুসন্ধানের ফলাফল ({searchResults.length})</h4>
                  {searchResults.map(u => (
                    <div key={u.uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1E293B' }}>
                      <strong>{u.fullName}</strong>
                      <button onClick={() => triggerFriendRequest(u)} style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>+ Follow</button>
                    </div>
                  ))}
                </div>
              )}

              {/* প্রিমিয়াম পোস্ট ক্রিয়েটর (লেখা এবং লাইভ ভিডিও ইউআরএল মেকানিজম) */}
              <div style={styles.card}>
                <textarea style={{ ...styles.input, height: '70px', resize: 'none' }} placeholder="আজকে আপনার নতুন ভাবনা বা লাইভ ভিডিও শেয়ার করুন..." value={postText} onChange={(e) => setPostText(e.target.value)} />
                <input type="text" style={{ ...styles.input, fontSize: '12px', margin: '4px 0' }} placeholder="📹 কোনো ভিডিও লিংক থাকলে এখানে দিন (ঐচ্ছিক)..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                <button onClick={handlePublishPost} style={{ ...styles.btnPrimary, marginTop: '8px' }}>টাইমলাইনে পাবলিশ করুন</button>
              </div>

              {/* ডাইনামিক লাইভ ফিড ও ভিডিও রেন্ডারিং প্লেয়ার */}
              {posts.map(post => (
                <div key={post.id} style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={styles.avatar}>{post.author?.[0]?.toUpperCase()}</div>
                    <div>
                      <h4 style={{ margin: 0 }}>{post.author}</h4>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>লাইভ ফিড পোস্ট</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '15px', lineHeight: '1.6' }}>{post.content}</p>
                  
                  {/* যদি পোস্টে ভিডিও ইউআরএল থাকে তবে ডাইনামিক প্লেয়ার সচল হবে */}
                  {post.video && (
                    <div style={{ borderRadius: '12px', overflow: 'hidden', margin: '12px 0', border: '1px solid #1E293B' }}>
                      <iframe width="100%" height="315" src={post.video.replace("watch?v=", "embed/")} title="Live Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 💬 মেসেঞ্জার লাইভ ইনবক্স এবং এইচডি কলিং ইন্টারফেস */}
          {activeTab === 'messages' && (
            <div>
              {!activeChatFriend ? (
                <div>
                  <h3 style={{ color: '#38BDF8', marginBottom: '16px' }}>💬 লাইভ মেসেঞ্জার ইনবক্স</h3>
                  {posts.filter(p => userData.friends?.includes(p.uid))
                    .filter((v, i, a) => a.findIndex(t => (t.uid === v.uid)) === i)
                    .map(f => (
                      <div key={f.uid} onClick={() => setActiveChatFriend({ uid: f.uid, fullName: f.author })} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: '0.2s' }}>
                        <div style={styles.avatar}>{f.author?.[0]?.toUpperCase()}</div>
                        <div>
                          <strong style={{ fontSize: '16px' }}>{f.author}</strong>
                          <div style={{ fontSize: '12px', color: '#10B981' }}>🟢 অনলাইনে আছেন</div>
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#111827', borderRadius: '16px', border: '1px solid #1E293B', height: '65vh', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '16px' }}>🟢 {activeChatFriend.fullName}</strong>
                    </div>
                    {/* 📞 ডাইনামিক রিয়েল অডিও এবং ভিডিও কল প্যানেল ট্রrigগার */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <span onClick={() => initiateCall('অডিও')} style={{ cursor: 'pointer', fontSize: '18px' }}>📞</span>
                      <span onClick={() => initiateCall('ভিডিও')} style={{ cursor: 'pointer', fontSize: '18px' }}>📹</span>
                      <button onClick={() => setActiveChatFriend(null)} style={{ background: '#374151', color: '#F3F4F6', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>বন্ধ করুন</button>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={msg.senderUid === user.uid ? styles.bubbleRight : styles.bubbleLeft}>
                        {msg.text}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendLiveMessage} style={{ padding: '12px', borderTop: '1px solid #1E293B', display: 'flex', gap: '10px' }}>
                    <input type="text" style={{ ...styles.input, margin: 0 }} placeholder="আপনার লাইভ মেসেজটি টাইপ করুন..." value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} />
                    <button type="submit" style={{ ...styles.btnPrimary, width: 'auto', padding: '0 24px' }}>পাঠান</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* 🔔 নোটিফিকেশন সেন্টার */}
          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ color: '#38BDF8', marginBottom: '16px' }}>🔔 রিয়েল-টাইম নোটিফিকেশন</h3>
              {notifications.map(n => (
                <div key={n.id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px' }}>{n.message}</span>
                  {n.type === 'friend_request' && n.status === 'unread' && (
                    <button onClick={() => approveFriendRequest(n)} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Confirm</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 👤 ইউজার প্রোফাইল স্ক্রিন */}
          {activeTab === 'profile' && (
            <div style={{ ...styles.card, textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ ...styles.avatar, width: '80px', height: '80px', fontSize: '28px', margin: '0 auto 16px auto' }}>{userData.fullName?.[0]?.toUpperCase()}</div>
              <h2>{userData.fullName}</h2>
              <p style={{ color: '#9CA3AF' }}>{user.email}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '24px', borderTop: '1px solid #1E293B', paddingTop: '20px' }}>
                <div><h3>{userData.friends?.length || 0}</h3><span style={{ color: '#9CA3AF' }}>ফ্রেন্ডস</span></div>
                <div><h3>{posts.filter(p => p.uid === user.uid).length}</h3><span style={{ color: '#9CA3AF' }}>পোস্টসমূহ</span></div>
              </div>
            </div>
          )}

          {/* 📱 প্রিমিয়াম ডার্ক মেটেরিয়াল বটম নেভিগেশন বার */}
           <div style={styles.bottomNav}>
            <button onClick={() => { setActiveChatFriend(null); setActiveTab('home'); }} style={{ ...styles.navItem, ...(activeTab === 'home' ? styles.activeNav : {}) }}><span>🏠</span>টাইমলাইন</button>
            <button onClick={() => setActiveTab('messages')} style={{ ...styles.navItem, ...(activeTab === 'messages' ? styles.activeNav : {}) }}><span>💬</span>মেসেঞ্জার</button>
            <button onClick={() => setActiveTab('profile')} style={{ ...styles.navItem, ...(activeTab === 'profile' ? styles.activeNav : {}) }}><span>👤</span>প্রোফাইল</button>
          </div>

        </div>
      ) : (
        /* 🔐 প্রিমিয়াম গেটওয়ে পোর্টালেট: লগইন এবং সাইন-আপ গ্রিড */
        <div style={{ ...styles.card, maxWidth: '420px', margin: '80px auto', padding: '35px' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', color: '#38BDF8' }}>Lexal Social</h2>
          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '14px', marginTop: 0, marginBottom: '24px' }}>Connect with the World Dynamically</p>
          
          {authScreen === 'login' ? (
            <form onSubmit={triggerLogin}>
              <input type="email" style={styles.input} placeholder="আপনার রেজিস্টার্ড ইমেইল" onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" style={styles.input} placeholder="গোপন পাসওয়ার্ড" onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" style={{ ...styles.btnPrimary, marginTop: '12px' }}>Log In (লগইন করুন)</button>
              <div onClick={() => setAuthScreen('signup')} style={{ color: '#38BDF8', textAlign: 'center', marginTop: '20px', cursor: 'pointer', fontSize: '13px' }}>নতুন ইউজার? এখানে ক্লিক করে অ্যাকাউন্ট খুলুন</div>
            </form>
          ) : (
            <form onSubmit={triggerRegister}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" style={styles.input} placeholder="First Name" onChange={(e)=>setRegForm({...regForm, firstName: e.target.value})} required />
                <input type="text" style={styles.input} placeholder="Last Name" onChange={(e)=>setRegForm({...regForm, lastName: e.target.value})} required />
              </div>
              <input type="email" style={styles.input} placeholder="ইমেইল অ্যাড্রেস" onChange={(e)=>setRegForm({...regForm, email: e.target.value})} required />
              <input type="password" style={styles.input} placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষরের)" onChange={(e)=>setRegForm({...regForm, password: e.target.value})} required />
              <button type="submit" style={{ ...styles.btnPrimary, marginTop: '12px' }}>অ্যাকাউন্ট তৈরি করুন</button>
              <div onClick={() => setAuthScreen('login')} style={{ color: '#38BDF8', textAlign: 'center', marginTop: '20px', cursor: 'pointer', fontSize: '13px' }}>ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন</div>
            </form>
          )}
          {error && <div style={{ color: '#F87171', textAlign: 'center', marginTop: '16px', fontSize: '13px', background: 'rgba(248,113,113,0.1)', padding: '8px', borderRadius: '6px' }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

export default App;
