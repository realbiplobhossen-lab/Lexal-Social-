import React, { useState } from 'react';
import * as authService from '../services/authService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

function SignupScreen({ setAuthView }) {
  // ফর্ম স্টেটসমূহ
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [hometown, setHometown] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  // চেকবক্স স্টেটসমূহ
  const [isNotRobot, setIsNotRobot] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    // ভ্যালিডেশন চেক
    if (pass.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    if (pass !== confirmPass) {
      alert("Passwords do not match! Please retype correctly.");
      return;
    }
    if (!isNotRobot) {
      alert("Please confirm that you are not a robot!");
      return;
    }
    if (!agreeTerms) {
      alert("You must agree with the terms and conditions to proceed.");
      return;
    }

    setLoading(true);
    try {
      // ১. ফায়ারবেস অথ-এ ইউজার রেজিস্টার করা
      const fullCustomName = `${firstName} ${lastName}`.trim();
      const userCredential = await authService.register(emailOrPhone, pass, fullCustomName);
      
      // ২. রেজিস্ট্রেশন সফল হলে অতিরিক্ত তথ্যগুলো Firestore-এ সেভ করা
      if (userCredential && userCredential.user) {
        const uid = userCredential.user.uid;
        await setDoc(doc(db, "users", uid), {
          uid: uid,
          name: fullCustomName,
          firstName: firstName,
          lastName: lastName,
          country: country,
          hometown: hometown,
          currentCity: currentCity,
          dob: dob,
          gender: gender,
          mobileOrEmail: emailOrPhone,
          createdAt: new Date().toISOString(),
          friends: [],
          friendRequests: []
        });
      }

      alert("Account created successfully! Welcome to Lexal Social World.");
      // নোট: App.jsx-এ onAuthStateChanged লিসেনার থাকার কারণে এটি অটোমেটিক হোম স্ক্রিনে রিডাইরেক্ট হবে।
    } catch (error) {
      alert("Failed to create account: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#0D1117',
      padding: '40px 20px',
      boxSizing: 'border-box',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#161B22',
        border: '1px solid #30363D',
        borderRadius: '12px',
        padding: '30px 24px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        {/* অ্যাপ লোগো/হেডার */}
        <h2 style={{ color: '#58A6FF', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0, letterSpacing: '1px' }}>
          LexalSpace
        </h2>
        
        <p style={{ color: '#8B949E', fontSize: '14px', marginBottom: '24px' }}>
          Welcome to The Lexal Social World! 🌎<br />
          CREATE YOUR NEW ACCOUNT
        </p>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* নাম পার্ট (First & Last Name পাশাপাশি) */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={styles.label}>First Name</label>
              <input type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} required style={styles.input} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={styles.label}>Last Name</label>
              <input type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} required style={styles.input} />
            </div>
          </div>

          {/* দেশ */}
          <div style={{ textAlign: 'left' }}>
            <label style={styles.label}>Country Name</label>
            <input type="text" placeholder="e.g. Bangladesh" value={country} onChange={e => setCountry(e.target.value)} required style={styles.input} />
          </div>

          {/* হোমটাউন এবং বর্তমান শহর পাশাপাশি */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={styles.label}>Hometown</label>
              <input type="text" placeholder="Home town" value={hometown} onChange={e => setHometown(e.target.value)} required style={styles.input} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={styles.label}>Current City</label>
              <input type="text" placeholder="Current city" value={currentCity} onChange={e => setCurrentCity(e.target.value)} required style={styles.input} />
            </div>
          </div>

          {/* জন্মতারিখ এবং জেন্ডার পাশাপাশি */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={styles.label}>Date of Birth</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} required style={{ ...styles.input, color: dob ? '#FFF' : '#8B949E' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={styles.label}>Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} required style={{ ...styles.input, color: gender ? '#FFF' : '#8B949E' }}>
                <option value="" disabled hidden>Select Gender</option>
                <option value="Male" style={{background: '#161B22'}}>Male</option>
                <option value="Female" style={{background: '#161B22'}}>Female</option>
                <option value="Other" style={{background: '#161B22'}}>Other</option>
              </select>
            </div>
          </div>

          {/* মোবাইল বা ইমেইল */}
          <div style={{ textAlign: 'left' }}>
            <label style={styles.label}>Mobile Number Or Email</label>
            <input type="text" placeholder="example@mail.com or number" value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)} required style={styles.input} />
          </div>

          {/* পাসওয়ার্ড */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ color: '#C9D1D9', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' }}>Password (at least 8 Characters)</label>
            <input type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} required style={styles.input} />
          </div>

          {/* রিটাইপ পাসওয়ার্ড */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ color: '#C9D1D9', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' }}>Retype Password</label>
            <input type="password" placeholder="••••••••" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required style={styles.input} />
          </div>

          {/* 🤖 আই অ্যাম নট রোবট নিরাপত্তা ব্যবস্থা */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#0D1117',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #30363D',
            marginTop: '5px',
            justifyContent: 'space-between'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E6EDF3', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={isNotRobot} onChange={e => setIsNotRobot(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              I'm not a robot
            </label>
            <div style={{ textAlign: 'right', opacity: 0.8 }}>
              <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="recaptcha" style={{ width: '24px', height: '24px', verticalAlign: 'middle' }} />
            </div>
          </div>

          {/* 📜 টার্মস অ্যান্ড কন্ডিশনস */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#8B949E', fontSize: '13px', textAlign: 'left', cursor: 'pointer', marginTop: '5px' }}>
            <input type="checkbox" checked={agreeTerms} onChange={e => agreeTerms ? setAgreeTerms(false) : setAgreeTerms(true)} style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }} />
            <span>I agree with the terms and conditions and privacy policy of Lexal Space.</span>
          </label>

          {/* নাউ ক্রিয়েট নিউ অ্যাকাউন্ট বাটন */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: loading ? '#1f6feb' : '#238636',
              color: '#FFF',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              transition: 'background 0.2s',
              boxShadow: '0 4px 12px rgba(35, 134, 54, 0.2)'
            }}
          >
            {loading ? 'Creating your account in Lexal Social World...' : 'NOW CREATE NEW ACCOUNT'}
          </button>
        </form>

        {/* লগইন লিংকে ফিরে যাওয়ার পার্ট */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #30363D', paddingTop: '16px' }}>
          <span 
            onClick={() => setAuthView('login')} 
            style={{ color: '#58A6FF', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            Already have an account? SIGN IN
          </span>
        </div>
      </div>
    </div>
  );
}

// গ্লোবাল ডার্ক ইনলাইন স্টাইল অবজেক্ট
const styles = {
  label: {
    color: '#C9D1D9',
    fontSize: '13px',
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '12px',
    background: '#0D1117',
    border: '1px solid #30363D',
    borderRadius: '8px',
    color: '#FFF',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  }
};

export default SignupScreen;
      
