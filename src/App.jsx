import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import './styles/global.css';

// ১. ফায়ারবেস কনফিগারেশন ও ইনিশিয়ালাইজেশন
const firebaseConfig = {
  authDomain: "lexal-social-network.firebaseapp.com",
  projectId: "lexal-social-network",
  storageBucket: "lexal-social-network.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:123456:web:abcde"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ২. হোম স্ক্রিন কম্পোনেন্ট (সরাসরি এখানেই ডিফাইন করা হলো)
function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Firestore error:", error);
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!text.trim()) return alert("দয়া করে কিছু লিখুন!");
    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        uid: auth.currentUser?.uid || "anonymous",
        userName: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "ব্যবহারকারী",
        content: text,
        createdAt: new Date().toISOString()
      });
      setText('');
    } catch (error) {
      alert("পোস্ট করতে সমস্যা হয়েছে: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-container">
      <div className="create-post-box">
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="আজকে আপনার মনে কি চলছে? এখানে লিখুন..." 
        />
        <button onClick={handlePost} disabled={loading}>
          {loading ? "পোস্ট হচ্ছে..." : "পোস্ট করুন 🚀"}
        </button>
      </div>

      <div className="posts-list">
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>এখনো কোনো পোস্ট নেই। প্রথম পোস্টটি আপনিই করুন!</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-avatar">{post.userName ? post.userName.charAt(0).toUpperCase() : '👤'}</div>
                <div className="post-user-info">
                  <h3>{post.userName}</h3>
                  <span>{new Date(post.createdAt).toLocaleDateString('bn-BD')}</span>
                </div>
              </div>
              <div className="post-content">
                <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
              </div>
              <div className="post-actions">
                <button className="action-btn" onClick={() => alert("লাইক ফিচারটি আগামী আপডেটে যুক্ত হবে!")}>❤️ লাইক</button>
                <button className="action-btn" onClick={() => alert("কমেন্ট ফিচারটি আগামী আপডেটে যুক্ত হবে!")}>💬 কমেন্ট</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ৩. প্রোফাইল স্ক্রিন কম্পোনেন্ট
function ProfileScreen() {
  const user = auth?.currentUser;

  const handleLogout = () => {
    auth.signOut()
      .then(() => alert("সফলভাবে লগআউট হয়েছে!"))
      .catch((err) => alert(err.message));
  };

  return (
    <div className="screen-container">
      <div className="profile-card">
        <div className="profile-avatar-large">
          {user?.email ? user.email.charAt(0).toUpperCase() : '👤'}
        </div>
        <h2>{user?.displayName || user?.email?.split('@')[0] || "ইউজার নাম"}</h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '5px' }}>{user?.email || "ইউজার ইমেইল"}</p>
        
        <div className="profile-stats">
          <div className="stat-box">
            <h4>১</h4>
            <p>প্রোফাইল</p>
          </div>
          <div className="stat-box">
            <h4>একটিভ</h4>
            <p>স্ট্যাটাস</p>
          </div>
        </div>
      </div>
      <button onClick={handleLogout} style={{ background: '#dc2626', marginTop: '20px', width: '100%' }}>
        লগআউট করুন 🚪
      </button>
    </div>
  );
}

// ৪. বটম ন্যাভিগেশন বার কম্পোনেন্ট
function BottomNav({ currentScreen, setCurrentScreen }) {
  const navItems = [
    { id: 'home', label: 'ফিড', icon: '🏠' },
    { id: 'chat', label: 'চ্যাট', icon: '💬' },
    { id: 'friends', label: 'বন্ধুরা', icon: '👥' },
    { id: 'notifications', label: 'নোটিফিকেশন', icon: '🔔' },
    { id: 'profile', label: 'প্রোফাইল', icon: '👤' }
  ];

  return (
    <div className="bottom-navbar">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${currentScreen === item.id ? 'active' : ''}`}
          onClick={() => setCurrentScreen(item.id)}
          style={{ background: 'transparent', boxShadow: 'none', width: 'auto', padding: '5px', color: currentScreen === item.id ? '#4f46e5' : '#6b7280' }}
        >
          <span style={{ fontSize: '20px', display: 'block', marginBottom: '3px' }}>{item.icon}</span>
          <span style={{ fontSize: '11px', fontWeight: currentScreen === item.id ? '600' : '500' }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ৫. মেইন অ্যাপ কন্ট্রোলার (Default Export)
export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("সবগুলো ঘর পূরণ করুন");
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("অ্যাকাউন্ট তৈরি সফল হয়েছে!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div className="screen-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}>
        <h1 style={{ textAlign: 'center', color: '#4f46e5', marginBottom: '30px', fontWeight: '700' }}>Lexal Social</h1>
        <form onSubmit={handleAuth} className="create-post-box">
          <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>{isRegistering ? "নতুন অ্যাকাউন্ট তৈরি" : "লগইন করুন"}</h3>
          <input type="email" placeholder="ইমেইল এড্রেস" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" style={{ marginTop: '10px', width: '100%' }}>{isRegistering ? "সাইন আপ" : "প্রবেশ করুন"}</button>
          <p onClick={() => setIsRegistering(!isRegistering)} style={{ textAlign: 'center', color: '#4f46e5', marginTop: '15px', cursor: 'pointer', fontSize: '14px' }}>
            {isRegistering ? "আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন" : "নতুন অ্যাকাউন্ট প্রয়োজন? এখানে চাপুন"}
          </p>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="app-header">
        <h1>Lexal Social</h1>
        <span style={{ fontSize: '20px', cursor: 'pointer' }} onClick={() => alert("কোনো নতুন নোটিফিকেশন নেই")}>🔔</span>
      </div>
      
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'profile' && <ProfileScreen />}
      {(currentScreen === 'chat' || currentScreen === 'friends' || currentScreen === 'notifications') && (
        <div className="screen-container" style={{ textAlign: 'center', marginTop: '50px', color: '#6b7280' }}>
          <h3>এই ফিচারটি আগামী আপডেটে আসছে...</h3>
        </div>
      )}

      <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </>
  );
                }
      
