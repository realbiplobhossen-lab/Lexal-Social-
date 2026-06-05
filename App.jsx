import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; 
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

// ইনলাইন স্টাইলস (সহজ ডিজাইনের জন্য)
const styles = {
  container: { background: '#121212', color: '#fff', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#121212', color: '#fff' },
  authBox: { maxWidth: '350px', margin: '40px auto', padding: '20px', background: '#1e1e1e', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
  input: { width: '90%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #333', background: '#2c2c2c', color: '#fff', fontSize: '16px' },
  button: { width: '96%', padding: '10px', margin: '15px 0', borderRadius: '5px', border: 'none', background: '#007bff', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  toggleText: { color: '#bbb', fontSize: '14px', marginTop: '10px', cursor: 'pointer' },
  feed: { textAlign: 'center', marginTop: '50px', padding: '20px' }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // লগইন ও সাইনআপ স্টেট
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // অ্যাকাউন্ট তৈরি ও লগইন ফাংশন
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('পাসওয়ার্ড এবং ইমেইল দুটোই লিখুন!');
      return;
    }
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase:', ''));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <div style={styles.loading}><h2>Loading Lexal Social...</h2></div>;
  }

  return (
    <div style={styles.container}>
      <Navbar user={user} />
      
      <main style={{ padding: '10px' }}>
        {user ? (
          /* লগরিন করার পর যা দেখা যাবে (ফিড সেকশন) */
          <div style={styles.feed}>
            <h1>🎉 Welcome to Lexal Social Feed</h1>
            <p style={{ color: '#00ffcc' }}>Logged in as: {user.email}</p>
            <div style={{ margin: '30px 0', padding: '20px', background: '#1e1e1e', borderRadius: '8px' }}>
              <h3>🔥 Create a Post</h3>
              <p>এখানে আপনার সামাজিক যোগাযোগ মাধ্যমের নতুন পোস্ট বা ফিচারগুলো যোগ করতে পারবেন।</p>
            </div>
            <button onClick={handleLogout} style={{ ...styles.button, background: '#dc3545', width: 'auto', padding: '10px 20px' }}>Logout</button>
          </div>
        ) : (
          /* লগইন না থাকলে ফর্ম দেখা যাবে */
          <div style={styles.authBox}>
            <h2 style={{ fontSize: '26px', marginBottom: '5px' }}>Connect with the World</h2>
            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>Join the popular Lexal Social platform.</p>
            
            <form onSubmit={handleAuth}>
              <input 
                type="email" 
                placeholder="Your Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={styles.input}
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={styles.input}
              />
              
              {error && <p style={{ color: '#ff4d4d', fontSize: '14px', margin: '5px 0' }}>{error}</p>}
              
              <button type="submit" style={styles.styles?.button || styles.button}>
                {isSignUp ? 'Sign Up (নতুন অ্যাকাউন্ট)' : 'Log In (লগইন করুন)'}
              </button>
            </form>

            <p onClick={() => setIsSignUp(!isSignUp)} style={styles.toggleText}>
              {isSignUp ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন' : 'নতুন ইউজার? এখানে ক্লিক করে অ্যাকাউন্ট খুলুন'}
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default App;
             
