import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, addDoc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

// প্রিমিয়াম সোশ্যাল মিডিয়া ডার্ক থিম স্টাইলস
const styles = {
  container: { background: '#0D1117', color: '#C9D1D9', minHeight: '100vh', paddingBottom: '90px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0D1117', color: '#58A6FF' },
  card: { maxWidth: '420px', margin: '30px auto', padding: '30px', background: '#161B22', borderRadius: '16px', border: '1px solid #30363D', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' },
  title: { fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '20px', color: '#58A6FF' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', color: '#8B949E', marginBottom: '6px', fontWeight: '600' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #30363D', background: '#0D1117', color: '#F0F6FC', fontSize: '15px', boxSizing: 'border-box' },
  select: { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #30363D', background: '#0D1117', color: '#F0F6FC', fontSize: '15px', boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#238636', color: '#FFFFFF', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  btnSecondary: { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #30363D', background: '#21262D', color: '#58A6FF', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' },
  error: { color: '#FF7B72', fontSize: '14px', marginTop: '8px', textAlign: 'center', background: 'rgba(255,123,114,0.1)', padding: '10px', borderRadius: '6px' },
  feedContainer: { maxWidth: '600px', margin: '0 auto', padding: '15px' },
  postBox: { background: '#161B22', borderRadius: '12px', padding: '20px', border: '1px solid #30363D', marginBottom: '20px' },
  postCard: { background: '#161B22', borderRadius: '12px', padding: '20px', border: '1px solid #30363D', marginBottom: '15px' },
  avatar: { width: '45px', height: '45px', borderRadius: '50%', background: '#58A6FF', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '18px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }
};

const countries = ["Bangladesh", "United States", "United Kingdom", "India", "Canada", "Saudi Arabia", "UAE", "Malaysia", "Australia"];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [screen, setScreen] = useState('login');
  const [error, setError] = useState('');

  // ফরম স্টেটসমূহ
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpData, setSignUpData] = useState({ firstName: '', lastName: '', country: 'Bangladesh', sex: 'Male', phoneOrEmail: '', password: '', birthday: '' });
  
  // ডায়নামিক ডাটা স্টেট
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [profileSettings, setProfileSettings] = useState({ relationship: 'Single', hometown: '', currentAddress: '', permanentAddress: '', workplace: '', status: 'Student', fullName: '' });

  // অ্যান্ড্রোয়েড ফিজিক্যাল ব্যাক বাটন হ্যান্ডলিং (যাতে হুট করে অ্যাপ বন্ধ না হয়)
  useEffect(() => {
    const handleBackButton = (e) => {
      if (activeTab !== 'home') {
        e.preventDefault();
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [activeTab]);

  // ইউজার অথেনটিকেশন ও ফায়ারস্টোর প্রোফাইল ডাটা লোড
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // ফায়ারস্টোর users কালেকশন থেকে ডাটা আনা (রুলস অনুসারে allow read: if true)
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileSettings(docSnap.data());
        } else {
          setProfileSettings(prev => ({ ...prev, fullName: currentUser.displayName || 'Lexal User' }));
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // রিয়েল-টাইম গ্লোবাল নিউজফিড লোড (allow read: if true রুলস অনুযায়ী)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, [user]);

  // লগইন হ্যান্ডলার
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, loginInput, loginPassword);
    } catch (err) {
      setError('লগইন ব্যর্থ হয়েছে! ইমেইল বা পাসওয়ার্ড সঠিক দিন।');
    }
  };

  // সাইনআপ হ্যান্ডলার (রুলস ম্যাচিং ডাটাবেজ এন্ট্রি)
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!signUpData.firstName || !signUpData.lastName || !signUpData.phoneOrEmail || !signUpData.password) {
      setError('সবগুলো ঘর পূরণ করা আবশ্যক!');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signUpData.phoneOrEmail, signUpData.password);
      const fullName = `${signUpData.firstName} ${signUpData.lastName}`;
      
      // ফায়ারবেস প্রোফাইল আপডেট
      await updateProfile(userCredential.user, { displayName: fullName });

      // 💾 ফায়ারস্টোরে users/{userId} রুলস অনুযায়ী ডাটা সেভ (allow create: if isOwner)
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        fullName: fullName,
        country: signUpData.country,
        sex: signUpData.sex,
        birthday: signUpData.birthday,
        relationship: 'Single',
        hometown: signUpData.country,
        currentAddress: '',
        permanentAddress: '',
        workplace: '',
        status: 'Student',
        uid: userCredential.user.uid // সিকিউরিটি ম্যাচিং
      });

      alert('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! এবার লগইন করুন।');
      setScreen('login');
    } catch (err) {
      setError(err.message.replace('Firebase:', ''));
    }
  };

  // 💾 ফায়ারস্টোরে পোস্ট ক্রিয়েশন (রুলস: allow create: if isSignedIn)
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    try {
      await addDoc(collection(db, "posts"), {
        author: profileSettings.fullName || user?.displayName || 'Lexal User',
        uid: user?.uid, // 👈 এটি অত্যন্ত জরুরি! আপনার রুলস এই uid-টি ভেরিফাই করছে।
        content: newPostText,
        createdAt: Date.now(),
        likes: [], 
        comments: []
      });
      setNewPostText('');
      setActiveTab('home');
    } catch (err) {
      alert('পোস্ট করতে ব্যর্থ! কারণ: ' + err.message);
    }
  };

  // 👍 লাইক সিস্টেম আপডেট (রুলস ফ্রেন্ডলি)
  const handleLike = async (postId, currentLikes = []) => {
    try {
      const postRef = doc(db, "posts", postId);
      const hasLiked = currentLikes.includes(user.uid);
      const updatedLikes = hasLiked 
        ? currentLikes.filter(uid => uid !== user.uid) 
        : [...currentLikes, user.uid];

      await updateDoc(postRef, { likes: updatedLikes });
    } catch (err) {
      alert('লাইক দেওয়া সম্ভব হয়নি: ' + err.message);
    }
  };

  // 💬 কমেন্ট সিস্টেম আপডেট (রুলস ফ্রেন্ডলি)
  const handleAddComment = async (postId, currentComments = []) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      const postRef = doc(db, "posts", postId);
      const newComment = {
        author: profileSettings.fullName || user?.displayName || 'Anonymous',
        text: commentText,
        uid: user.uid,
        createdAt: Date.now()
      };

      await updateDoc(postRef, {
        comments: [...currentComments, newComment]
      });

      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (err) {
      alert('কমেন্ট সাবমিট হয়নি: ' + err.message);
    }
  };

  // 💾 প্রোফাইল আপডেট (রুলস: allow update: if isOwner)
  const handleSaveProfile = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), profileSettings, { merge: true });
      alert('আপনার প্রোফাইল ডাটা ক্লাউডে স্থায়ীভাবে সেভ হয়েছে!');
      setActiveTab('profile');
    } catch (err) {
      alert('প্রোফাইল সেভ হয়নি: ' + err.message);
    }
  };

  if (loading) return <div style={styles.loading}><h2>Connecting Lexal Network...</h2></div>;

  return (
    <div style={styles.container}>
      <Navbar user={user} setActiveTab={setActiveTab} />
      
      {user ? (
        /* ------------------ ইউজার ড্যাশবোর্ড (লগইনড ইন) ------------------ */
        <div style={styles.feedContainer}>
          
          {/* ট্যাব ১: গ্লোবাল নিউজফিড */}
          {activeTab === 'home' && (
            <div>
              <div style={styles.postBox}>
                <div style={styles.userInfo}>
                  <div style={styles.avatar}>{(profileSettings.fullName || 'U')[0].toUpperCase()}</div>
                  <h3 style={{ margin: 0 }}>{profileSettings.fullName || 'Lexal User'}</h3>
                </div>
                <textarea 
                  style={{ ...styles.input, height: '80px', resize: 'none', background: '#10141B' }} 
                  placeholder={`What's on your mind, ${profileSettings.fullName?.split(' ')[0] || ''}?`}
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                />
                <button onClick={handleCreatePost} style={{ ...styles.btnPrimary, width: 'auto', float: 'right', padding: '8px 20px', marginTop: '10px' }}>Post</button>
                <div style={{ clear: 'both' }}></div>
              </div>

              <h3 style={{ color: '#58A6FF', marginBottom: '15px' }}>🌐 Global Newsfeed</h3>
              
              {posts.length === 0 ? <p style={{ textAlign: 'center', color: '#8B949E' }}>নিউজফিডে কোনো পোস্ট নেই। প্রথম পোস্টটি আপনিই করুন!</p> : null}
              
              {posts.map(post => {
                const isLiked = post.likes?.includes(user.uid);
                return (
                  <div key={post.id} style={styles.postCard}>
                    <div style={styles.userInfo}>
                      <div style={{ ...styles.avatar, background: '#21262D', border: '1px solid #58A6FF' }}>{(post.author || 'L')[0].toUpperCase()}</div>
                      <div>
                        <h4 style={{ margin: 0, color: '#F0F6FC' }}>{post.author}</h4>
                        <span style={{ fontSize: '11px', color: '#8B949E' }}>Verified Lexal Post</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '16px', color: '#E1E4E8', lineHeight: '1.5' }}>{post.content}</p>
                    
                    <div style={{ display: 'flex', gap: '20px', marginTop: '15px', borderTop: '1px solid #21262D', paddingTop: '10px' }}>
                      <button onClick={() => handleLike(post.id, post.likes)} style={{ background: 'none', border: 'none', color: isLiked ? '#58A6FF' : '#8B949E', cursor: 'pointer', fontWeight: 'bold' }}>
                        👍 {isLiked ? 'Liked' : 'Like'} ({post.likes?.length || 0})
                      </button>
                      <button style={{ background: 'none', border: 'none', color: '#8B949E', fontWeight: 'bold' }}>💬 Comments ({post.comments?.length || 0})</button>
                    </div>

                    {post.comments?.length > 0 && (
                      <div style={{ background: '#0D1117', padding: '10px', borderRadius: '8px', marginTop: '12px' }}>
                        {post.comments.map((c, i) => (
                          <p key={i} style={{ fontSize: '13px', margin: '4px 0' }}>
                            <strong style={{ color: '#58A6FF' }}>{c.author}:</strong> {c.text}
                          </p>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <input type="text" style={{ ...styles.input, padding: '8px 12px', fontSize: '13px' }} placeholder="Write a comment..." value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })} />
                      <button onClick={() => handleAddComment(post.id, post.comments)} style={{ ...styles.btnPrimary, width: 'auto', padding: '6px 14px', marginTop: 0, fontSize: '13px' }}>Reply</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 👤 ট্যাব ২: পার্সোনাল প্রোফাইল */}
          {activeTab === 'profile' && (
            <div style={styles.postBox}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#58A6FF', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '36px', margin: '0 auto 10px auto', border: '3px solid #30363D' }}>
                  {(profileSettings.fullName || 'U')[0].toUpperCase()}
                </div>
                <h2>{profileSettings.fullName || 'Lexal User'}</h2>
                <p style={{ color: '#8B949E' }}>ID/Email: {user.email}</p>
                <button onClick={() => setActiveTab('settings')} style={{ ...styles.btnSecondary, width: 'auto', padding: '6px 15px', fontSize: '13px' }}>✏️ Edit Profile Settings</button>
              </div>
              <hr style={{ borderColor: '#21262D' }} />
              <h4>📌 About Info (Cloud Firestore)</h4>
              <p>💼 <strong>Workplace:</strong> {profileSettings.workplace || 'Not set yet'}</p>
              <p>🎓 <strong>Education & Status:</strong> {profileSettings.status || 'Not set yet'}</p>
              <p>❤️ <strong>Relationship:</strong> {profileSettings.relationship || 'Not set yet'}</p>
              <p>🏠 <strong>Hometown:</strong> {profileSettings.hometown || 'Not set yet'}</p>
              <p>📍 <strong>Current Address:</strong> {profileSettings.currentAddress || 'Not set yet'}</p>
              <button onClick={() => auth.signOut()} style={{ ...styles.btnPrimary, background: '#FF7B72', marginTop: '30px' }}>Sign Out</button>
            </div>
          )}

          {/* ⚙️ ট্যাব ৩: প্রোফাইল কাস্টমাইজেশন */}
          {activeTab === 'settings' && (
            <div style={styles.postBox}>
              <h3 style={{ color: '#58A6FF' }}>🛠️ Profile Setup & Sync</h3>
              <div style={styles.inputGroup}><label style={styles.label}>Full Name</label>
                <input type="text" style={styles.input} value={profileSettings.fullName} onChange={(e)=>setProfileSettings({...profileSettings, fullName: e.target.value})} />
              </div>
              <div style={styles.inputGroup}><label style={styles.label}>Relationship Status</label>
                <select style={styles.select} value={profileSettings.relationship} onChange={(e)=>setProfileSettings({...profileSettings, relationship: e.target.value})}><option>Single</option><option>In a Relationship</option><option>Married</option><option>Complicated</option></select>
              </div>
              <div style={styles.inputGroup}><label style={styles.label}>Hometown</label>
                <input type="text" style={styles.input} value={profileSettings.hometown} onChange={(e)=>setProfileSettings({...profileSettings, hometown: e.target.value})} />
              </div>
              <div style={styles.inputGroup}><label style={styles.label}>Current Address</label>
                <input type="text" style={styles.input} value={profileSettings.currentAddress} onChange={(e)=>setProfileSettings({...profileSettings, currentAddress: e.target.value})} />
              </div>
              <div style={styles.inputGroup}><label style={styles.label}>Workplace</label>
                <input type="text" style={styles.input} value={profileSettings.workplace} onChange={(e)=>setProfileSettings({...profileSettings, workplace: e.target.value})} />
              </div>
              <div style={styles.inputGroup}><label style={styles.label}>Status</label>
                <select style={styles.select} value={profileSettings.status} onChange={(e)=>setProfileSettings({...profileSettings, status: e.target.value})}><option>Student</option><option>Job Holder</option><option>Business Owner</option><option>Freelancer</option></select>
              </div>
              <button onClick={handleSaveProfile} style={styles.btnPrimary}>Save Profile Info</button>
            </div>
          )}
        </div>
      ) : (
        /* ------------------ অথেনটিকেশন গেটওয়ে ইন্টারফেস ------------------ */
        <div style={styles.card}>
          <h2 style={styles.title}>Lexal Social</h2>
          {screen === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={styles.inputGroup}><input type="text" style={styles.input} placeholder="Phone number or email" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} /></div>
              <div style={styles.inputGroup}><input type="password" style={styles.input} placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} /></div>
              <button type="submit" style={styles.btnPrimary}>Log In</button>
              <div style={{ textAlign: 'center', marginTop: '15px', color: '#58A6FF', fontSize: '14px', cursor: 'pointer' }}>Forgot Password?</div>
              <div style={{ display: 'flex', alignItems: 'center', color: '#8B949E', margin: '20px 0' }}><div style={{ flex: 1, height: '1px', background: '#30363D' }}></div><span style={{ padding: '0 10px' }}>Or</span><div style={{ flex: 1, height: '1px', background: '#30363D' }}></div></div>
              <button type="button" onClick={() => setScreen('signup')} style={styles.btnSecondary}>Create New Lexal Social Account</button>
            </form>
          ) : (
            <form onSubmit={handleSignUp}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <input type="text" style={styles.input} placeholder="First Name" value={signUpData.firstName} onChange={(e)=>setSignUpData({...signUpData, firstName: e.target.value})} />
                <input type="text" style={styles.input} placeholder="Last Name" value={signUpData.lastName} onChange={(e)=>setSignUpData({...signUpData, lastName: e.target.value})} />
              </div>
              <div style={styles.inputGroup}><label style={styles.label}>Country Name</label>
                <select style={styles.select} value={signUpData.country} onChange={(e)=>setSignUpData({...signUpData, country: e.target.value})}>{countries.map((c, i)=><option key={i}>{c}</option>)}</select>
              </div>
              <div style={styles.inputGroup}><label style={styles.label}>Sex</label>
                <select style={styles.select} value={signUpData.sex} onChange={(e)=>setSignUpData({...signUpData, sex: e.target.value})}><option value="Male">Male</option><option value="Female">Female</option></select>
              </div>
              <div style={styles.inputGroup}><input type="text" style={styles.input} placeholder="Email" value={signUpData.phoneOrEmail} onChange={(e)=>setSignUpData({...signUpData, phoneOrEmail: e.target.value})} /></div>
              <div style={styles.inputGroup}><input type="password" style={styles.input} placeholder="Password (10+ characters)" value={signUpData.password} onChange={(e)=>setSignUpData({...signUpData, password: e.target.value})} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Birthday</label><input type="date" style={styles.input} value={signUpData.birthday} onChange={(e)=>setSignUpData({...signUpData, birthday: e.target.value})} /></div>
              <button type="submit" style={styles.btnPrimary}>Sign Up</button>
              <div onClick={() => setScreen('login')} style={{ color: '#58A6FF', textAlign: 'center', marginTop: '15px', cursor: 'pointer' }}>Back to Log In</div>
            </form>
          )}
          {error && <div style={styles.error}>{error}</div>}
        </div>
      )}
      {user && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
}

export default App;
