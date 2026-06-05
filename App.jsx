import React, { useState, useEffect } from 'react';
// ইমপোর্ট পাথ সরাসরি রুট ডিরেক্টরির firebase.js ফাইলের সাথে লিংক করা হলো
import { auth } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#121212', color: '#fff' }}>
        <h2>Loading Lexal Social...</h2>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ background: '#121212', color: '#fff', minHeight: '100vh', paddingBottom: '60px' }}>
      <Navbar user={user} />
      
      <main style={{ padding: '20px' }}>
        {user ? (
          <div className="feed-section">
            <h1>Welcome to Lexal Social Feed</h1>
            <p>Hello, {user.displayName || user.email}! You are successfully logged in.</p>
            {/* আপনার ফিড বা অন্যান্য কম্পোনেন্ট এখানে যুক্ত থাকবে */}
          </div>
        ) : (
          <div className="auth-section" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Connect with the World</h1>
            <p>Please log in or sign up to join the popular Lexal Social platform.</p>
            {/* আপনার লগইন/সাইনআপ কম্পোনেন্ট এখানে থাকবে */}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default App;
