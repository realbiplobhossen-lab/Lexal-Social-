import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase.js';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  // ফায়ারবেস থেকে লাইভ পোস্ট ডাটা রিড করার রিয়েল-টাইম লজিক
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    }, (error) => {
      console.error("Post loading error: ", error);
    });
    return () => unsubscribe();
  }, []);

  // ডাটাবেজে পোস্ট সাবমিট করার লজিক
  const handlePost = async () => {
    if (!text.trim()) {
      alert("দয়া করে কিছু লিখুন!");
      return;
    }
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
      {/* পোস্ট তৈরি করার বক্স */}
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

      {/* লাইভ পোস্ট ফিড লিস্ট (আলাদা ফাইল ছাড়া সরাসরি এখানেই ডিজাইন করা) */}
      <div className="posts-list">
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>এখনো কোনো পোস্ট নেই। প্রথম পোস্টটি আপনিই করুন!</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-avatar">
                  {post.userName ? post.userName.charAt(0).toUpperCase() : '👤'}
                </div>
                <div className="post-user-info">
                  <h3>{post.userName}</h3>
                  <span>{new Date(post.createdAt).toLocaleDateString('bn-BD')}</span>
                </div>
              </div>
              <div className="post-content">
                <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
              </div>
              {/* লাইক ও কমেন্টের ডাইনামিক বাটন অ্যাকশন */}
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

