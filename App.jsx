import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; 
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

// প্রফেশনাল এবং প্রিমিয়াম ডার্ক থিম স্টাইলস
const styles = {
  container: { background: '#0B0E14', color: '#FFFFFF', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0B0E14', color: '#007AFF' },
  card: { maxWidth: '400px', margin: '30px auto', padding: '30px', background: '#161B22', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid #21262D' },
  title: { fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '25px', color: '#FFFFFF', letterSpacing: '0.5px' },
  inputGroup: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '14px', color: '#8B949E', marginBottom: '6px', fontWeight: '500' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #30363D', background: '#0D1117', color: '#FFFFFF', fontSize: '16px', boxSizing: 'border-box', transition: 'border-color 0.3s' },
  select: { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #30363D', background: '#0D1117', color: '#FFFFFF', fontSize: '16px', boxSizing: 'border-box' },
  row: { display: 'flex', gap: '12px' },
  btnPrimary: { width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#238636', color: '#FFFFFF', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(35,134,54,0.3)' },
  btnSecondary: { width: '100%', padding: '14px', borderRadius: '8px', border: '2px solid #30363D', background: 'transparent', color: '#58A6FF', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' },
  linkText: { color: '#58A6FF', fontSize: '14px', textAlign: 'center', marginTop: '15px', cursor: 'pointer', display: 'block', textDecoration: 'none' },
  divider: { display: 'flex', alignItems: 'center', color: '#8B949E', margin: '20px 0' },
  dividerLine: { flex: 1, height: '1px', background: '#30363D' },
  error: { color: '#FF7B72', fontSize: '14px', marginTop: '8px', textAlign: 'center', background: 'rgba(255,123,114,0.1)', padding: '10px', borderRadius: '6px' },
  profileSection: { padding: '20px', maxWidth: '600px', margin: '20px auto' },
  profileCard: { background: '#161B22', borderRadius: '12px', padding: '20px', border: '1px solid #30363D', marginBottom: '20px' }
};

// এআই ফিল্টারড গ্লোবাল কান্ট্রি লিস্ট (Alphabetical Order)
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", 
  "Brazil", "Brunei", "Bulgaria", "Canada", "Chile", "China", "Colombia", "Costa Rica", "Croatia", "Cuba", 
  "Cyprus", "Czech Republic", "Denmark", "Egypt", "Finland", "France", "Germany", "Ghana", "Greece", "India", 
  "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Jamaica", "Japan", "Jordan", "Kuwait", "Malaysia", 
  "Maldives", "Mexico", "Morocco", "Myanmar", "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway", "Oman", 
  "Pakistan", "Palestine", "Panama", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", 
  "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria", 
  "Taiwan", "Thailand", "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Vietnam", "Yemen", "Zimbabwe"
];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // স্ক্রিন টগল স্টেট (login / signup / profileSettings)
  const [screen, setScreen] = useState('login'); 
  const [error, setError] = useState('');

  // ফর্ম ডাটা স্টেটসমূহ
  const [loginInput, setLoginInput] = useState(''); // Phone or Email
  const [loginPassword, setLoginPassword] = useState('');
  
  // সাইন আপ স্টেটসমূহ
  const [signUpData, setSignUpData] = useState({
    firstName: '', lastName: '', country: 'Bangladesh', sex: 'Male', phoneOrEmail: '', password: '', birthday: ''
  });

  // প্রোফাইল সেটিংস স্টেটসমূহ
  const [profileSettings, setProfileSettings] = useState({
    relationship: 'Single', hometown: '', currentAddress: '', permanentAddress: '', workplace: '', status: 'Student'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // লগইন হ্যান্ডলার
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginInput || !loginPassword) {
      setError('দয়া করে সব ঘর পূরণ করুন!');
      return;
    }
    try {
      // ফায়ারবেস অথ ইমেইল সাপোর্ট করে, ফোন লগইনের জন্য কাস্টম ব্যাকএন্ড বা ফায়ারবেস ফোন অথ লাগে। আপাতত ইমেইল দিয়ে লগইন হবে।
      await signInWithEmailAndPassword(auth, loginInput, loginPassword);
    } catch (err) {
      setError('লগইন ব্যর্থ হয়েছে! ইমেইল বা পাসওয়ার্ড চেক করুন।');
    }
  };

  // সাইনআপ হ্যান্ডলার
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!signUpData.firstName || !signUpData.lastName || !signUpData.phoneOrEmail || !signUpData.password || !signUpData.birthday) {
      setError('সবগুলো ঘর পূরণ করা বাধ্যতামূলক!');
      return;
    }
    if (signUpData.password.length < 10) {
      setError('নিরাপত্তার জন্য পাসওয়ার্ড অবশ্যই কমপক্ষে ১০ অক্ষরের হতে হবে!');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, signUpData.phoneOrEmail, signUpData.password);
      alert('Lexal Social অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
      setScreen('login');
    } catch (err) {
      setError(err.message.replace('Firebase:', ''));
    }
  };

  if (loading) return <div style={styles.loading}><h2>Loading Lexal Social...</h2></div>;

  return (
    <div style={styles.container}>
      <Navbar user={user} />
      
      {user ? (
        /* ---------------- ইউজার প্রোফাইল এবং সেটিংস ড্যাশবোর্ড ---------------- */
        <div style={styles.profileSection}>
          <div style={styles.profileCard}>
            <h2 style={{ marginTop: 0 }}>🎉 স্বাগতম, {user.email}!</h2>
            <p style={{ color: '#8B949E' }}>আপনার লেক্সাল প্রোফাইলটি এখন সক্রিয় রয়েছে।</p>
            <button onClick={() => setScreen(screen === 'settings' ? 'login' : 'settings')} style={{ ...styles.btnPrimary, width: 'auto', padding: '10px 20px', background: '#21262D', border: '1px solid #30363D' }}>
              {screen === 'settings' ? 'আমার টাইমলাইনে যান' : '⚙️ Profile Settings এডিট করুন'}
            </button>
          </div>

          {screen === 'settings' ? (
            /* প্রোফাইল সেটিংস ফরম */
            <div style={styles.profileCard}>
              <h3>🛠️ বিস্তারিত প্রোফাইল সেটআপ</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Relationship Status</label>
                <select style={styles.select} value={profileSettings.relationship} onChange={(e)=>setProfileSettings({...profileSettings, relationship: e.target.value})}>
                  <option>Single</option><option>In a Relationship</option><option>Married</option><option>Complicated</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Hometown</label>
                <input type="text" style={styles.input} placeholder="যেমন: Dhaka, Bangladesh" value={profileSettings.hometown} onChange={(e)=>setProfileSettings({...profileSettings, hometown: e.target.value})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Current Address</label>
                <input type="text" style={styles.input} placeholder="বর্তমান ঠিকানা" value={profileSettings.currentAddress} onChange={(e)=>setProfileSettings({...profileSettings, currentAddress: e.target.value})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Permanent Address</label>
                <input type="text" style={styles.input} placeholder="স্থায়ী ঠিকানা" value={profileSettings.permanentAddress} onChange={(e)=>setProfileSettings({...profileSettings, permanentAddress: e.target.value})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Workplace</label>
                <input type="text" style={styles.input} placeholder="কর্মক্ষেত্র বা কোম্পানির নাম" value={profileSettings.workplace} onChange={(e)=>setProfileSettings({...profileSettings, workplace: e.target.value})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Status</label>
                <select style={styles.select} value={profileSettings.status} onChange={(e)=>setProfileSettings({...profileSettings, status: e.target.value})}>
                  <option>Student</option><option>Job Holder</option><option>Business Owner</option><option>Freelancer</option>
                </select>
              </div>
              <button onClick={()=>{alert('প্রোফাইল ডেটা সফলভাবে সেভ হয়েছে!'); setScreen('login');}} style={styles.btnPrimary}>Save Profile Settings</button>
            </div>
          ) : (
            /* সাধারণ টাইমলাইন ভিউ */
            <div style={styles.profileCard}>
              <h3>🔥 Lexal Social Timeline Feed</h3>
              <p>আপনার প্রোফাইল সেটিংস:</p>
              <ul>
                <li>অবস্থা: {profileSettings.status}</li>
                <li>সম্পর্ক: {profileSettings.relationship}</li>
                <li>হোমটাউন: {profileSettings.hometown || 'সেট করা হয়নি'}</li>
              </ul>
              <button onClick={() => auth.signOut()} style={{ ...styles.btnPrimary, background: '#FF7B72', marginTop: '20px' }}>Logout (লগআউট করুন)</button>
            </div>
          )}
        </div>
      ) : (
        /* ---------------- অথেনটিকেশন গেটওয়ে স্ক্রিন ---------------- */
        <div>
          {screen === 'login' ? (
            /* ১. মেইন প্রফেশনাল লগইন ইন্টারফেস */
            <div style={styles.card}>
              <h2 style={styles.title}>Lexal Social</h2>
              <form onSubmit={handleLogin}>
                <div style={styles.inputGroup}>
                  <input type="text" style={styles.input} placeholder="Phone number or email" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                  <input type="password" style={styles.input} placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                </div>
                
                <button type="submit" style={styles.btnPrimary}>Log In</button>
                
                <span style={styles.linkText}>Forgot Password?</span>
                
                <div style={styles.divider}>
                  <div style={styles.dividerLine}></div>
                  <span style={{ padding: '0 10px' }}>Or</span>
                  <div style={styles.dividerLine}></div>
                </div>
                
                <button type="button" onClick={() => { setScreen('signup'); setError(''); }} style={styles.btnSecondary}>Create New Lexal Social Account</button>
              </form>
              {error && <div style={styles.error}>{error}</div>}
            </div>
          ) : (
            /* ২. আকর্ষণীয় সাইন আপ ইন্টারফেস (New Registration) */
            <div style={styles.card}>
              <h2 style={{ ...styles.title, marginBottom: '10px' }}>New Lexal Social Sign Up Section</h2>
              <p style={{ textAlign: 'center', color: '#8B949E', fontSize: '14px', marginBottom: '20px' }}>পেশাদার সামাজিক যোগাযোগ মাধ্যমে আপনাকে স্বাগতম</p>
              
              <form onSubmit={handleSignUp}>
                <div style={styles.row}>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>First Name</label>
                    <input type="text" style={styles.input} placeholder="First name" value={signUpData.firstName} onChange={(e)=>setSignUpData({...signUpData, firstName: e.target.value})} />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Last Name</label>
                    <input type="text" style={styles.input} placeholder="Last name" value={signUpData.lastName} onChange={(e)=>setSignUpData({...signUpData, lastName: e.target.value})} />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Country Name</label>
                  <select style={styles.select} value={signUpData.country} onChange={(e)=>setSignUpData({...signUpData, country: e.target.value})}>
                    {countries.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Sex</label>
                  <select style={styles.select} value={signUpData.sex} onChange={(e)=>setSignUpData({...signUpData, sex: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number Or Email</label>
                  <input type="text" style={styles.input} placeholder="Enter mobile number or email" value={signUpData.phoneOrEmail} onChange={(e)=>setSignUpData({...signUpData, phoneOrEmail: e.target.value})} />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password (at least 10 characters)</label>
                  <input type="password" style={styles.input} placeholder="Create strong password" value={signUpData.password} onChange={(e)=>setSignUpData({...signUpData, password: e.target.value})} />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Birthday (day/month/year)</label>
                  <input type="date" style={styles.input} value={signUpData.birthday} onChange={(e)=>setSignUpData({...signUpData, birthday: e.target.value})} />
                </div>

                <button type="submit" style={styles.btnPrimary}>Sign Up</button>
                
                <span onClick={() => { setScreen('login'); setError(''); }} style={styles.linkText}>ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন</span>
              </form>
              {error && <div style={styles.error}>{error}</div>}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default App;
                
