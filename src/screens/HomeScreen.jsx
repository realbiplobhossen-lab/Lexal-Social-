import React, { useEffect, useState } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { toggleLike } from '../services/appService';

// ডেমো স্টোরি ডাটা (স্ক্রিনশটের হুবহু লুক আনার জন্য)
const DEMO_STORIES = [
  { id: '1', name: 'Rahim', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', name: 'Sumi', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: '3', name: 'Zakir', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: '4', name: 'Naeem', avatar: 'https://i.pravatar.cc/150?img=13' },
  { id: '5', name: 'Anika', avatar: 'https://i.pravatar.cc/150?img=24' },
];

export default function HomeScreen({ setAuthView }) {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // রিয়েল-টাইম ডাটা লিসেনার (onSnapshot)
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1D20] font-sans pb-24">
      
      {/* 1. টপ হেডার (Top Header Bar) */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E9ECEF] px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-1">
          <span className="text-2xl font-black tracking-tight text-[#0D6EFD]">LEXAL</span>
          <span className="text-2xl font-black tracking-tight text-[#1A1D20]">SPACE</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-[#495057] hover:text-[#0D6EFD] transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.603z" />
            </svg>
          </button>
          <button className="relative text-[#495057] hover:text-[#0D6EFD] transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-[#DC3545] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </button>
          <button className="text-[#495057] hover:text-[#0D6EFD] transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </header>

      {/* মেইন কন্টেনার */}
      <main className="max-w-xl mx-auto px-4 mt-4 space-y-4">
        
        {/* 2. স্টোরি বার (Horizontal Story Section) */}
        <div className="bg-white border border-[#E9ECEF] rounded-2xl p-4 flex space-x-4 overflow-x-auto scrollbar-none shadow-sm">
          {/* Your Story Button */}
          <div className="flex flex-col items-center flex-shrink-0 cursor-pointer">
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#0D6EFD] to-[#6610F2] p-[2px] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden">
                <img src={auth.currentUser?.photoURL || "https://via.placeholder.com/150"} alt="Your Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white font-bold text-xl">+</div>
              </div>
            </div>
            <span className="text-xs text-[#6C757D] mt-1 font-medium">Your Story</span>
          </div>

          {/* Friends Stories */}
          {DEMO_STORIES.map(story => (
            <div key={story.id} className="flex flex-col items-center flex-shrink-0 cursor-pointer">
              <div className="w-14 h-14 rounded-full border-2 border-[#0D6EFD] p-[2px] flex items-center justify-center">
                <img src={story.avatar} alt={story.name} className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="text-xs text-[#495057] mt-1 font-medium">{story.name}</span>
            </div>
          ))}
        </div>

        {/* 3. পোস্ট ফিড (News Feed Posts) */}
        {posts.length === 0 ? (
          <div className="bg-white border border-[#E9ECEF] rounded-2xl p-8 text-center shadow-sm">
            <p className="text-[#6C757D] text-sm">কোনো পোস্ট উপলব্ধ নেই। প্রথম পোস্টটি আপনিই করুন!</p>
          </div>
        ) : (
          posts.map(post => {
            const hasLiked = post.likes?.includes(auth.currentUser?.uid);
            return (
              <div key={post.id} className="bg-white border border-[#E9ECEF] rounded-2xl p-4 shadow-sm space-y-3">
                
                {/* পোস্ট হেডার */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={post.authorAvatar || "https://via.placeholder.com/150"} alt="User Avatar" className="w-11 h-11 rounded-full object-cover border border-[#E9ECEF]" />
                    <div>
                      <h4 className="font-bold text-sm text-[#1A1D20]">{post.author}</h4>
                      <p className="text-xs text-[#6C757D]">2 hours ago</p>
                    </div>
                  </div>
                  <button className="text-[#6C757D] hover:text-[#1A1D20]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  </button>
                </div>

                {/* পোস্ট টেক্সট */}
                <p className="text-[#343A40] text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                {/* মিডিয়া রেন্ডারিং লজিক */}
                {post.mediaUrl && post.mediaType === 'image' && (
                  <div className="rounded-xl overflow-hidden border border-[#E9ECEF] bg-[#F8F9FA]">
                    <img src={post.mediaUrl} alt="Post Content" className="w-full max-h-[450px] object-cover" />
                  </div>
                )}
                {post.mediaUrl && post.mediaType === 'video' && (
                  <div className="rounded-xl overflow-hidden border border-[#E9ECEF] bg-black">
                    <video src={post.mediaUrl} controls className="w-full max-h-[450px]" />
                  </div>
                )}
                {post.mediaUrl && post.mediaType === 'audio' && <audio src={post.mediaUrl} controls className="w-full mt-2" />}
                {post.mediaUrl && post.mediaType === 'document' && (
                  <a href={post.mediaUrl} target="_blank" rel="noreferrer" className="block p-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl text-[#0D6EFD] hover:underline text-xs truncate">
                    📄 {post.mediaName || "ডকুমেন্টটি ডাউনলোড করুন"}
                  </a>
                )}

                {/* কাউন্টার সেকশন */}
                <div className="flex justify-between items-center text-xs text-[#6C757D] pt-2 px-1">
                  <div className="flex items-center space-x-1">
                    <span>❤️</span>
                    <span className="font-medium text-[#495057]">{post.likes?.length || 0}</span>
                  </div>
                  <div className="flex space-x-3">
                    <span>0 comments</span>
                    <span>5 shares</span>
                  </div>
                </div>

                {/* অ্যাকশন বাটন সেকশন */}
                <div className="flex items-center justify-between border-t border-[#E9ECEF] pt-2 mt-1">
                  <button 
                    onClick={() => toggleLike(post.id, auth.currentUser.uid, hasLiked)} 
                    className={`flex items-center justify-center space-x-2 flex-1 py-2 rounded-xl text-sm font-semibold transition ${hasLiked ? 'text-[#DC3545] bg-[#DC3545]/10' : 'text-[#495057] hover:bg-[#F8F9FA]'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={hasLiked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <span>Like</span>
                  </button>

                  <button className="flex items-center justify-center space-x-2 flex-1 py-2 text-[#495057] hover:bg-[#F8F9FA] rounded-xl text-sm font-semibold transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                    </svg>
                    <span>Comment</span>
                  </button>

                  <button className="flex items-center justify-center space-x-2 flex-1 py-2 text-[#495057] hover:bg-[#F8F9FA] rounded-xl text-sm font-semibold transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </main>

      {/* 4. ফিক্সড বটম নেভিগেশন বার (Fixed Bottom Navigation Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E9ECEF] px-4 py-2 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center space-y-1 ${activeTab === 'home' ? 'text-[#0D6EFD]' : 'text-[#6C757D]'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
          <span className="text-[11px] font-bold">Home</span>
        </button>

        <button onClick={() => setActiveTab('explore')} className={`flex flex-col items-center space-y-1 ${activeTab === 'explore' ? 'text-[#0D6EFD]' : 'text-[#6C757D]'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.004 9.004 0 018.716 2.253M12 3a9.004 9.004 0 00-8.716 2.253m0 0A9.003 9.003 0 0112 12c2.485 0 4.5 4.03 4.5 9M3.314 5.253A9.003 9.003 0 0112 12" />
          </svg>
          <span className="text-[11px] font-bold">Explore</span>
        </button>

        <button onClick={() => setActiveTab('create')} className={`flex flex-col items-center space-y-1 ${activeTab === 'create' ? 'text-[#0D6EFD]' : 'text-[#6C757D]'}`}>
          <div className="bg-[#0D6EFD] text-white p-2 rounded-full shadow-md -mt-5 border-4 border-white transition transform active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-[11px] font-bold">Create</span>
        </button>

        <button onClick={() => setActiveTab('noti')} className={`flex flex-col items-center space-y-1 relative ${activeTab === 'noti' ? 'text-[#0D6EFD]' : 'text-[#6C757D]'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <span className="absolute top-0 right-3 bg-[#DC3545] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">3</span>
          <span className="text-[11px] font-bold">Notifications</span>
        </button>

        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center space-y-1 ${activeTab === 'profile' ? 'text-[#0D6EFD]' : 'text-[#6C757D]'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[11px] font-bold">Profile</span>
        </button>
      </nav>

    </div>
  );
              }
                  
