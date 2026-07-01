import React, { useEffect, useState } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { toggleLike } from '../services/appService';

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // রিয়েল-টাইম ডাটা লিসেনার (onSnapshot) যা লাইক, কমেন্ট বা পোস্ট করা মাত্রই পেজ অটো আপডেট করবে
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-xl mx-auto my-4 px-2 space-y-4 pb-20">
      <h3 className="text-lg font-bold text-gray-300 border-b border-gray-700 pb-2">Recent Feed (নিউজ ফিড)</h3>
      {posts.length === 0 ? (
        <p className="text-gray-400 text-center py-10">কোনো পোস্ট উপলব্ধ নেই। প্রথম পোস্টটি আপনিই করুন!</p>
      ) : (
        posts.map(post => {
          const hasLiked = post.likes?.includes(auth.currentUser?.uid);
          return (
            <div key={post.id} className="bg-[#1f2937] border border-gray-700 p-4 rounded-xl shadow text-white space-y-3">
              <div className="flex items-center space-x-3">
                <img src={post.authorAvatar || "https://via.placeholder.com/150"} alt="User" className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                <div>
                  <h4 className="font-bold text-sm text-blue-400">{post.author}</h4>
                  <p className="text-xs text-gray-400">রিয়েল-টাইম পোস্ট</p>
                </div>
              </div>
              <p className="text-gray-200 text-sm">{post.content}</p>

              {/* কন্টেন্ট টাইপ অনুযায়ী ডাইনামিক রেন্ডারিং */}
              {post.mediaUrl && post.mediaType === 'image' && <img src={post.mediaUrl} alt="Post Media" className="rounded-lg w-full max-h-96 object-cover bg-black" />}
              {post.mediaUrl && post.mediaType === 'video' && <video src={post.mediaUrl} controls className="rounded-lg w-full max-h-96 bg-black" />}
              {post.mediaUrl && post.mediaType === 'audio' && <audio src={post.mediaUrl} controls className="w-full mt-2" />}
              {post.mediaUrl && post.mediaType === 'document' && (
                <a href={post.mediaUrl} target="_blank" rel="noreferrer" className="block p-3 bg-[#111827] rounded-lg text-blue-400 hover:underline text-xs truncate">📄 {post.mediaName || "ডকুমেন্টটি ডাউনলোড করুন"}</a>
              )}

              <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-gray-800">
                <span>❤️ {post.likes?.length || 0} লাইকস</span>
                <span>💬 ০ কমেন্টস</span>
              </div>

              {/* ফেসবুক লাইক ও কমেন্ট অ্যাকশন বাটন */}
              <div className="flex space-x-2 pt-1">
                <button onClick={() => toggleLike(post.id, auth.currentUser.uid, hasLiked)} className={`flex-1 py-2 text-center rounded-lg font-bold text-sm transition ${hasLiked ? 'bg-red-900/30 text-red-500' : 'bg-[#111827] hover:bg-gray-800 text-gray-300'}`}>
                  {hasLiked ? "❤️ লাইকড" : "🤍 লাইক"}
                </button>
                <button className="flex-1 py-2 text-center rounded-lg bg-[#111827] hover:bg-gray-800 text-gray-300 font-bold text-sm">💬 কমেন্ট</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
