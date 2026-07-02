import React, { useEffect, useState } from 'react';
import { db, auth } from '../config/firebase';
import { 
  collection, query, orderBy, onSnapshot, doc, 
  setDoc, updateDoc, deleteDoc, getDocs, where, addDoc, serverTimestamp 
} from 'firebase/firestore';

export default function HomeScreen() {
  // মেইন নেভিগেশন ট্যাব স্টেট (feed, friends, messages, create, notifications, profile)
  const [activeTab, setActiveTab] = useState('feed'); 
  
  // ডাটা স্টেটসমূহ
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  
  // ১. Create Post-এর জন্য ইনপুট স্টেট
  const [postContent, setPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image'); // image বা video

  const currentUserId = auth.currentUser?.uid;
  const currentUserName = auth.currentUser?.displayName || "Beauty Akter";
  const currentUserAvatar = auth.currentUser?.photoURL || "https://via.placeholder.com/150";

  // রিয়েল-টাইম ডাটা লোড (পোস্ট, স্টোরি, রিকোয়েস্ট, ফ্রেন্ডস)
  useEffect(() => {
    if (!currentUserId) return;

    // পোস্ট ও স্টোরি
    const qPosts = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qStories = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsubStories = onSnapshot(qStories, (snapshot) => {
      setStories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // ফ্রেন্ড রিকোয়েস্ট
    const qRequests = query(collection(db, "friendRequests"), where("toUid", "==", currentUserId), where("status", "==", "pending"));
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      setFriendRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // ফ্রেন্ড লিস্ট
    const qFriends = query(collection(db, "friends"), where("users", "arrayContains", currentUserId));
    const unsubFriends = onSnapshot(qFriends, (snapshot) => {
      setFriendsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubPosts(); unsubStories(); unsubRequests(); unsubFriends(); };
  }, [currentUserId]);

  // ইউজার সার্চ ফাংশন
  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      const q = query(collection(db, "users"), where("name", ">=", searchQuery), where("name", "<=", searchQuery + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUserId) users.push({ uid: doc.id, ...doc.data() });
      });
      setAllUsers(users);
      setActiveTab('friends'); 
    } catch (error) {
      console.error("Error searching users: ", error);
    }
  };

  // ফ্রেন্ড রিকোয়েস্ট পাঠানো ও এক্সেপ্ট করা
  const sendFriendRequest = async (targetUser) => {
    const requestId = `${currentUserId}_${targetUser.uid}`;
    await setDoc(doc(db, "friendRequests", requestId), {
      fromUid: currentUserId,
      fromName: currentUserName,
      fromAvatar: currentUserAvatar,
      toUid: targetUser.uid,
      status: "pending",
      timestamp: serverTimestamp()
    });
    alert(`🎉 ${targetUser.name}-কে রিকোয়েস্ট পাঠানো হয়েছে!`);
  };

  const acceptFriendRequest = async (request) => {
    const friendDocId = `${currentUserId}_${request.fromUid}`;
    await setDoc(doc(db, "friends", friendDocId), {
      users: [currentUserId, request.fromUid],
      userNames: [currentUserName, request.fromName],
      avatars: [currentUserAvatar, request.fromAvatar],
      createdAt: serverTimestamp()
    });
    await deleteDoc(doc(db, "friendRequests", request.id));
    alert(`🤝 আপনি এখন ${request.fromName}-এর সাথে বন্ধু!`);
  };

  // লাইক মেকানিজম
  const handleLike = async (postId, currentLikes = []) => {
    const postRef = doc(db, "posts", postId);
    if (currentLikes.includes(currentUserId)) {
      await updateDoc(postRef, { likes: currentLikes.filter(id => id !== currentUserId) });
    } else {
      await updateDoc(postRef, { likes: [...currentLikes, currentUserId] });
    }
  };

  // ২. রিয়েল পোস্ট ক্রিয়েশন ফাংশন (CREATE BUTTON-এর কাজ)
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && !mediaUrl.trim()) return;

    try {
      await addDoc(collection(db, "posts"), {
        author: currentUserName,
        authorAvatar: currentUserAvatar,
        authorUid: currentUserId,
        content: postContent,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        likes: [],
        createdAt: serverTimestamp()
      });
      setPostContent('');
      setMediaUrl('');
      setActiveTab('feed'); // পোস্ট হওয়ার পর অটোমেটিক হোম ফিডে নিয়ে যাবে
      alert('🚀 আপনার পোস্টটি সফলভাবে পাবলিশ হয়েছে!');
    } catch (error) {
      console.error("Error adding post: ", error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1117', color: '#C9D1D9', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      {/* টপ হেডার */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#161B22', borderBottom: '1px solid #30363D', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyStyle: 'space-between', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#58A6FF' }}>LexalSpace</span>
          
          {/* সার্চ বার */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0D1117', borderRadius: '20px', padding: '4px 12px', border: '1px solid #30363D', width: '55%' }}>
            <input 
              type="text" 
              placeholder="Search Users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
              style={{ width: '100%', background: 'none', border: 'none', color: '#FFF', outline: 'none', fontSize: '13px' }}
            />
            <button onClick={handleSearchUsers} style={{ background: 'none', border: 'none', color: '#58A6FF', cursor: 'pointer' }}>🔍</button>
          </div>
        </div>

        {/* টপ ক্যাটাগরি ট্যাব */}
        <div style={{ display: 'flex', borderTop: '1px solid #21262D', paddingTop: '8px' }}>
          <button onClick={() => setActiveTab('feed')} style={{ flex: 1, padding: '8px', background: 'none', border: 'none', color: activeTab === 'feed' ? '#58A6FF' : '#8B949E', borderBottom: activeTab === 'feed' ? '2px solid #58A6FF' : 'none', fontWeight: 'bold', cursor: 'pointer' }}>🏠 ফীড</button>
          <button onClick={() => setActiveTab('friends')} style={{ flex: 1, padding: '8px', background: 'none', border: 'none', color: activeTab === 'friends' ? '#58A6FF' : '#8B949E', borderBottom: activeTab === 'friends' ? '2px solid #58A6FF' : 'none', fontWeight: 'bold', cursor: 'pointer', position: 'relative' }}>🔍 ফ্রেন্ডস</button>
          <button onClick={() => setActiveTab('messages')} style={{ flex: 1, padding: '8px', background: 'none', border: 'none', color: activeTab === 'messages' ? '#58A6FF' : '#8B949E', borderBottom: activeTab === 'messages' ? '2px solid #58A6FF' : 'none', fontWeight: 'bold', cursor: 'pointer' }}>💬 মেসেজ</button>
        </div>
      </header>

      {/* মেইন ভিউ কন্টেনার */}
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px 12px', paddingBottom: '100px' }}>
        
        {/* ==================== ১. FEED VIEW ==================== */}
        {activeTab === 'feed' && (
          <>
            {/* স্টোরি বার */}
            <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '12px', display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '16px' }}>
              <div onClick={() => alert('স্টোরি আপলোড ফিচার ওপেন হচ্ছে...')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, cursor: 'pointer' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#238636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#FFF', fontWeight: 'bold' }}>+</div>
                <span style={{ fontSize: '11px', marginTop: '4px', color: '#8B949E' }}>Your Story</span>
              </div>
              {stories.map(story => (
                <div key={story.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <img src={story.userAvatar} alt="" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #58A6FF', objectFit: 'cover' }} />
                  <span style={{ fontSize: '11px', marginTop: '4px' }}>{story.userName}</span>
                </div>
              ))}
            </div>

            {/* পোস্ট ফিড লিস্ট */}
            {posts.map(post => {
              const isLiked = post.likes?.includes(currentUserId);
              return (
                <div key={post.id} style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <img src={post.authorAvatar || currentUserAvatar} style={{ width: '40px', height: '40px', borderRadius: '50%' }} alt="" />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px' }}>{post.author}</h4>
                      <span style={{ fontSize: '11px', color: '#8B949E' }}>Just now</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0 0 12px 0' }}>{post.content}</p>
                  {post.mediaUrl && (
                    <img src={post.mediaUrl} style={{ width: '100%', borderRadius: '8px', marginBottom: '12px', maxHeight: '300px', objectFit: 'cover' }} alt="Post media" />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #21262D', paddingTop: '8px' }}>
                    <button onClick={() => handleLike(post.id, post.likes)} style={{ background: 'none', border: 'none', color: isLiked ? '#FF4D4F' : '#8B949E', cursor: 'pointer', fontWeight: 'bold' }}>❤️ {post.likes?.length || 0} Like</button>
                    <button style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer' }}>💬 Comment</button>
                    <button style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer' }}>🔄 Share</button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ==================== ২. FRIENDS VIEW ==================== */}
        {activeTab === 'friends' && (
          <div>
            {friendRequests.map(req => (
              <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#161B22', borderRadius: '8px', marginBottom: '8px' }}>
                <span>{req.fromName} sent you a request</span>
                <button onClick={() => acceptFriendRequest(req)} style={{ backgroundColor: '#238636', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Accept</button>
              </div>
            ))}
            {allUsers.map(user => (
              <div key={user.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#161B22', borderRadius: '8px', marginBottom: '8px' }}>
                <span>{user.name}</span>
                <button onClick={() => sendFriendRequest(user)} style={{ backgroundColor: '#58A6FF', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Add Friend</button>
              </div>
            ))}
          </div>
        )}

        {/* ==================== ৩. MESSAGES VIEW ==================== */}
        {activeTab === 'messages' && (
          <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '16px' }}>
            {friendsList.map(friend => {
              const targetIndex = friend.users.indexOf(currentUserId) === 0 ? 1 : 0;
              return (
                <div key={friend.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #21262D' }}>
                  <span>{friend.userNames[targetIndex]}</span>
                  <button onClick={() => alert('Chat interface starting...')} style={{ background: '#21262D', color: '#58A6FF', border: 'none', padding: '6px 12px', borderRadius: '4px' }}>Chat</button>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================== ৪. CREATE POST VIEW (সচল করা হলো) ==================== */}
        {activeTab === 'create' && (
          <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#58A6FF' }}>Create New Post</h3>
            <form onSubmit={handleCreatePost}>
              <textarea 
                placeholder="What's on your mind?" 
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                style={{ width: '100%', height: '100px', backgroundColor: '#0D1117', color: '#FFF', border: '1px solid #30363D', borderRadius: '8px', padding: '10px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }}
              />
              <input 
                type="text" 
                placeholder="Optional: Image/Video URL" 
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                style={{ width: '100%', backgroundColor: '#0D1117', color: '#FFF', border: '1px solid #30363D', borderRadius: '8px', padding: '10px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }}
              />
              <button type="submit" style={{ width: '100%', backgroundColor: '#238636', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Publish Post 🚀</button>
            </form>
          </div>
        )}

        {/* ==================== ৫. NOTIFICATIONS VIEW (সচল করা হলো) ==================== */}
        {activeTab === 'notifications' && (
          <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ marginTop: 0, color: '#58A6FF' }}>Notifications</h3>
            {friendRequests.length === 0 ? (
              <p style={{ color: '#8B949E', fontSize: '13px' }}>আপনার কোনো নতুন নোটিফিকেশন নেই।</p>
            ) : (
              friendRequests.map(req => (
                <div key={req.id} style={{ padding: '10px', backgroundColor: '#0D1117', borderRadius: '6px', marginBottom: '8px', border: '1px solid #30363D' }}>
                  🔔 <strong>{req.fromName}</strong> আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছেন। অ্যাকশন নিতে ফ্রেন্ডস ট্যাবে যান।
                </div>
              ))
            )}
          </div>
        )}

        {/* ==================== 💻 ৬. PROFILE VIEW (সচল করা হলো) ==================== */}
        {activeTab === 'profile' && (
          <div style={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <img src={currentUserAvatar} style={{ width: '90px', height: '90px', borderRadius: '50%', border: '3px solid #58A6FF', marginBottom: '12px' }} alt="" />
            <h2 style={{ margin: '0 0 4px 0' }}>{currentUserName}</h2>
            <p style={{ color: '#8B949E', margin: '0 0 16px 0', fontSize: '14px' }}>LexalSpace Certified User</p>
            <hr style={{ borderColor: '#21262D', marginBottom: '16px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '14px' }}>
              <div><strong>{posts.filter(p => p.authorUid === currentUserId).length}</strong><br/><span style={{color:'#8B949E'}}>Posts</span></div>
              <div><strong>{friendsList.length}</strong><br/><span style={{color:'#8B949E'}}>Friends</span></div>
            </div>
          </div>
        )}

      </div>

      {/* বটম ফিক্সড নেভিগেশন বার - সবগুলো বাটন এখন লাইভ ফাংশনাল */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#161B22', borderTop: '1px solid #30363D', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000 }}>
        
        <button onClick={() => setActiveTab('feed')} style={{ background: 'none', border: 'none', color: activeTab === 'feed' ? '#58A6FF' : '#8B949E', cursor: 'pointer', textAlign: 'center' }}>
          <div>🏠</div><span style={{ fontSize: '10px' }}>Home</span>
        </button>

        <button onClick={() => setActiveTab('friends')} style={{ background: 'none', border: 'none', color: activeTab === 'friends' ? '#58A6FF' : '#8B949E', cursor: 'pointer', textAlign: 'center' }}>
          <div>🧭</div><span style={{ fontSize: '10px' }}>Explore</span>
        </button>

        {/* মাঝখানের গোল প্লাস বাটন (ক্রিয়েট পোস্ট মোড অন করবে) */}
        <button onClick={() => setActiveTab('create')} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
          <div style={{ backgroundColor: '#238636', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-20px', border: '4px solid #0D1117', fontWeight: 'bold', fontSize: '20px' }}>+</div>
          <span style={{ fontSize: '10px', color: activeTab === 'create' ? '#58A6FF' : '#8B949E' }}>Create</span>
        </button>

        <button onClick={() => setActiveTab('notifications')} style={{ background: 'none', border: 'none', color: activeTab === 'notifications' ? '#58A6FF' : '#8B949E', cursor: 'pointer', textAlign: 'center', position: 'relative' }}>
          <div>🔔</div>
          {friendRequests.length > 0 && <span style={{ position: 'absolute', top: '-4px', right: '4px', backgroundColor: '#FF4D4F', color: 'white', fontSize: '9px', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{friendRequests.length}</span>}
          <span style={{ fontSize: '10px' }}>Noti</span>
        </button>

        <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#58A6FF' : '#8B949E', cursor: 'pointer', textAlign: 'center' }}>
          <div>👤</div><span style={{ fontSize: '10px' }}>Profile</span>
        </button>
        
      </nav>

    </div>
  );
  }
      
