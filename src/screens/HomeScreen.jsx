import React, { useEffect, useState } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { toggleLike } from '../services/appService';

// ডেমো স্টোরি ডাটা (স্ক্রিনশটের BIPLEX হুবহু লুক আনার জন্য)
const DEMO_STORIES = [
  { id: '1', name: 'Rahim', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', name: 'Sumi', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: '3', name: 'Zakir', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: '4', name: 'Naeem', avatar: 'https://i.pravatar.cc/150?img=13' },
];

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1117', color: '#C9D1D9', fontFamily: 'sans-serif', paddingBottom: '80px', boxSizing: 'border-box' }}>
      
      {/* ১. টপ হেডার (BIPLEX স্টাইল ব্র্যান্ডিং ও আইকন) */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#161B22', borderBottom: '1px solid #30363D', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '22px', fontWeight: '900', color: '#58A6FF', letterSpacing: '-0.5px' }}>BIP</span>
          <span style={{ fontSize: '22px', fontWeight: '900', color: '#F0F6FC', letterSpacing: '-0.5px' }}>LEX</span>
        </div>
        
        {/* সার্চ, নোটিফিকেশন ও প্লাস বাটন */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <button style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer', padding: 0 }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.603z" /></svg>
          </button>
          <button style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer', padding: 0, position: 'relative' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
            <span style={{ position: 'absolute', top: '-5px', right: '-6px', backgroundColor: '#FF4D4F', color: 'white', fontSize: '10px', fontWeight: 'bold', borderRadius: '50%', width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          </button>
          <button style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer', padding: 0 }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </button>
        </div>
      </header>

      {/* মেইন কন্টেন্ট এরিয়া */}
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px 12px', boxSizing: 'border-box' }}>
        
        {/* ২. স্টোরি বার (অনুভূমিক স্ক্রোলিং এবং গোল বাটন সহ পারফেক্ট ফিক্স) */}
        <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '16px', padding: '16px', display: 'flex', gap: '16px', overflowX: 'auto', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          
          {/* Your Story বাটন */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, cursor: 'pointer' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(45deg, #58A6FF, #238636)', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#0D1117', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={auth.currentUser?.photoURL || "https://via.placeholder.com/150"} alt="Your Profile" style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '20px', fontWeight: 'bold' }}>+</div>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#8B949E', marginTop: '6px', fontWeight: '500' }}>Your Story</span>
          </div>

          {/* বন্ধুদের স্টোরি লুপ */}
          {DEMO_STORIES.map(story => (
            <div key={story.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, cursor: 'pointer' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #58A6FF', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={story.avatar} alt={story.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#C9D1D9', marginTop: '6px', fontWeight: '500' }}>{story.name}</span>
            </div>
          ))}
        </div>

        {/* ৩. নিউজ ফিড পোস্ট কার্ড লেআউট */}
        {posts.length === 0 ? (
          <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
            <p style={{ color: '#8B949E', fontSize: '14px', margin: 0 }}>কোনো পোস্ট উপলব্ধ নেই। প্রথম পোস্টটি আপনিই করুন!</p>
          </div>
        ) : (
          posts.map(post => {
            const hasLiked = post.likes?.includes(auth.currentUser?.uid);
            return (
              <div key={post.id} style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '16px', padding: '16px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                
                {/* পোস্ট হেডার (ইউজার ইনফো ও থ্রি-ডট) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={post.authorAvatar || "https://via.placeholder.com/150"} alt="User Avatar" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #30363D' }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#F0F6FC' }}>{post.author}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#8B949E' }}>2 hours ago</p>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer' }}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
                  </button>
                </div>

                {/* পোস্ট কন্টেন্ট টেক্সট */}
                <p style={{ fontSize: '14px', color: '#E6EDF2', lineHeight: '1.5', margin: '0 0 12px 0', whiteSpace: 'pre-wrap' }}>{post.content}</p>

                {/* মিডিয়া ফাইল রেন্ডারিং */}
                {post.mediaUrl && post.mediaType === 'image' && (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #30363D', backgroundColor: '#0D1117', marginBottom: '12px' }}>
                    <img src={post.mediaUrl} alt="Post Media" style={{ width: '100%', maxHeight: '380px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
                {post.mediaUrl && post.mediaType === 'video' && (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #30363D', backgroundColor: '#000', marginBottom: '12px' }}>
                    <video src={post.mediaUrl} controls style={{ width: '100%', maxHeight: '380px', display: 'block' }} />
                  </div>
                )}

                {/* কাউন্টার সেকশন (লাইক, কমেন্ট সংখ্যা) */}
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', fontSize: '12px', color: '#8B949E', borderBottom: '1px solid #21262D', paddingBottom: '10px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                    <span>❤️</span>
                    <span style={{ color: '#C9D1D9', fontWeight: '500' }}>{post.likes?.length || 0}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span>0 comments</span>
                    <span>5 shares</span>
                  </div>
                </div>

                {/* অ্যাকশন বাটন সেকশন (লাইক, কমেন্ট, শেয়ার) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button 
                    onClick={() => toggleLike(post.id, auth.currentUser.uid, hasLiked)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 0', background: 'none', border: 'none', color: hasLiked ? '#FF4D4F' : '#8B949E', fontWeight: '600', fontSize: '13px', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s' }}
                  >
                    <svg width="18" height="18" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                    <span>Like</span>
                  </button>

                  <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 0', background: 'none', border: 'none', color: '#8B949E', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
                    <span>Comment</span>
                  </button>

                  <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 0', background: 'none', border: 'none', color: '#8B949E', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                    <span>Share</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ৪. ফিক্সড বটম নেভিগেশন বার (ইনলাইন স্টাইল দিয়ে হুবহু ফিক্সড লকড লেআউট) */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#161B22', borderTop: '1px solid #30363D', padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000, boxShadow: '0 -4px 16px rgba(0,0,0,0.2)' }}>
        
        <button onClick={() => setActiveTab('home')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: activeTab === 'home' ? '#58A6FF' : '#8B949E', cursor: 'pointer', width: '60px' }}>
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" /><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" /></svg>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Home</span>
        </button>

        <button onClick={() => setActiveTab('explore')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: activeTab === 'explore' ? '#58A6FF' : '#8B949E', cursor: 'pointer', width: '60px' }}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.004 9.004 0 018.716 2.253M12 3a9.004 9.004 0 00-8.716 2.253m0 0A9.003 9.003 0 0112 12c2.485 0 4.5 4.03 4.5 9M3.314 5.253A9.003 9.003 0 0112 12" /></svg>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Explore</span>
        </button>

        {/* ক্রিয়েট বাটন (মাঝখানের ফ্লোটিং আকৃতির গোল প্লাস বাটন) */}
        <button onClick={() => setActiveTab('create')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', width: '60px', position: 'relative' }}>
          <div style={{ backgroundColor: '#238636', color: 'white', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyStyle: 'center', justifyContent: 'center', marginTop: '-20px', border: '4px solid #0D1117', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </div>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: activeTab === 'create' ? '#58A6FF' : '#8B949E', marginTop: '3px' }}>Create</span>
        </button>

        <button onClick={() => setActiveTab('noti')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: activeTab === 'noti' ? '#58A6FF' : '#8B949E', cursor: 'pointer', width: '60px', position: 'relative' }}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
          <span style={{ position: 'absolute', top: '-2px', right: '12px', backgroundColor: '#FF4D4F', color: 'white', fontSize: '9px', fontWeight: 'bold', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #161B22' }}>3</span>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Noti</span>
        </button>

        <button onClick={() => setActiveTab('profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: activeTab === 'profile' ? '#58A6FF' : '#8B949E', cursor: 'pointer', width: '60px' }}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Profile</span>
        </button>
      </nav>

    </div>
  );
      }
                       
