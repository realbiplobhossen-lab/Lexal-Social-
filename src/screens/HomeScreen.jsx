import React, { useState, useEffect } from 'react';
import { db, auth } from '../App.jsx';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error(error);
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
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-container">
      <div className="create-post-box">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="আজকে আপনার মনে কি চলছে? এখানে লিখুন..." />
        <button onClick={handlePost} disabled={loading}>{loading ? "পোস্ট হচ্ছে..." : "পোস্ট করুন 🚀"}</button>
      </div>

      <div className="posts-list">
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>এখনো কোনো পোস্ট নেই।</p>
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
