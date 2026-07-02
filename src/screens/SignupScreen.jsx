import React, { useState, useEffect } from 'react';
import * as authService from '../services/authService';

// নিষিদ্ধ বা অবাস্তব নামের আংশিক তালিকা (স্প্যাম প্রতিরোধের জন্য)
const BANNED_WORDS = ['admin', 'fakeuser', 'badword1', 'badword2', 'anonymous', 'null', 'undefined'];

// পৃথিবীর প্রধান দেশসমূহের তালিকা (সংক্ষিপ্ত নমুনা - আপনি চাইলে আরও বড় করতে পারেন)
const COUNTRIES = [
  "Bangladesh", "United States", "United Kingdom", "India", "Pakistan", 
  "Saudi Arabia", "United Arab Emirates", "Canada", "Australia", "Malaysia"
];

// বাংলাদেশের জেলাসমূহের নমুনা ডাটা (Hometown/City সাজেশনের জন্য)
const BD_PLACES = [
  "Dhaka, Sadar", "Dhaka, Mirpur", "Dhaka, Uttara", "Dhaka, Gulshan", "Dhaka, Savar", "Dhaka, Dhamrai",
  "Chittagong, Sadar", "Chittagong, Hathazari", "Comilla, Sadar", "Comilla, Laksam", "Sylhet, Sadar",
  "Rajshahi, Sadar", "Khulna, Sadar", "Barisal, Sadar", "Rangpur, Sadar", "Mymensingh, Sadar"
];

export default function SignupScreen({ setAuthView, onSignupSuccess }) {
  // ইনপুট স্টেটস
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [hometown, setHometown] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [gender, setGender] = useState('');
  const [contactInput, setContactInput] = useState(''); // ইমেইল বা ফোন নম্বর
  const [pass, setPass] = useState('');
  const [rePass, setRePass] = useState('');

  // জন্মতারিখ স্টেটস
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  // সাজেশন ও ভেরিফিকেশন স্টেটস
  const [homeSuggestions, setHomeSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isCaptchaChecked, setIsCaptchaChecked] = useState(false);
  const [isRobotVerified, setIsRobotVerified] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ১. ডাইনামিক প্লেস সাজেশন (Hometown & Current City)
  const handlePlaceTyping = (text, type) => {
    if (type === 'home') setHometown(text);
    if (type === 'city') setCurrentCity(text);

    if (!text.trim()) {
      type === 'home' ? setHomeSuggestions([]) : setCitySuggestions([]);
      return;
    }

    if (country === 'Bangladesh') {
      const filtered = BD_PLACES.filter(place => 
        place.toLowerCase().includes(text.toLowerCase())
      );
      type === 'home' ? setHomeSuggestions(filtered) : setCitySuggestions(filtered);
    } else {
      // অন্যান্য দেশের জন্য ডাইনামিক মক সাজেশন (বাস্তব ক্ষেত্রে এখানে API কল হবে)
      const internationalMock = [`${text}, Central Area`, `${text}, Downtown`, `${text}, Sector 1`];
      type === 'home' ? setHomeSuggestions(internationalMock) : setCitySuggestions(internationalMock);
    }
  };

  // ২. ডাই导航 ডাইনামিক ক্যাপচা চ্যালেঞ্জ (Bot Protection)
  const triggerCaptchaChallenge = () => {
    if (isRobotVerified) return;
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const ans = num1 + num2;
    
    const userAns = prompt(`বট ভেরিফিকেশন: বলুন তো ${num1} + ${num2} কত হয়?`);
    if (parseInt(userAns) === ans) {
      setIsRobotVerified(true);
      setIsCaptchaChecked(true);
    } else {
      alert("ভুল উত্তর! আপনি সম্ভবত একজন রোবট।");
      setIsCaptchaChecked(false);
    }
  };

  // ৩. ফর্ম সাবমিট হ্যান্ডলার
  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    // ক) নাম ভ্যালিডেশন
    const combinedName = `${firstName.trim()} ${lastName.trim()}`;
    const containsBannedWord = BANNED_WORDS.some(word => 
      firstName.toLowerCase().includes(word) || lastName.toLowerCase().includes(word)
    );

    if (containsBannedWord || firstName.length < 2 || lastName.length < 2) {
      alert("অনুগ্রহ করে একটি বাস্তব এবং সঠিক নাম ব্যবহার করুন!");
      return;
    }

    // খ) পাসওয়ার্ড ম্যাচিং
    if (pass.length < 8) {
      alert("পাসওয়ার্ড অবশ্যই কমপক্ষে ৮ অক্ষরের হতে হবে!");
      return;
    }
    if (pass !== rePass) {
      alert("উভয় পাসওয়ার্ড মেলেনি!");
      return;
    }

    // গ) সেফটি চেক
    if (!isRobotVerified) {
      alert("দয়া করে প্রমাণ করুন যে আপনি রোবট নন!");
      return;
    }
    if (!agreeTerms) {
      alert("আপনাকে অবশ্যই Terms and Conditions মেনে নিতে হবে!");
      return;
    }

    setLoading(true);
    try {
      // ডাটাবেজে সেভ করার জন্য অবজেক্ট রেডি করা
      const userProfileData = {
        name: combinedName,
        country,
        hometown,
        currentCity,
        dob: `${birthYear}-${birthMonth}-${birthDay}`,
        gender,
        contact: contactInput
      };

      // এখানে আপনার authService কল হবে
      await authService.register(contactInput, pass, combinedName, userProfileData);
      
      alert("Account created successfully!");
      if (onSignupSuccess) onSignupSuccess(); // সরাসরি হোমে নিয়ে যাওয়ার ট্রিগার
    } catch (error) {
      alert("রেজিস্ট্রেশন ব্যর্থ হয়েছে: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // জেনারেট অপশনস (দিন ও বছর)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0D1117', padding: '20px', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '30px 24px', width: '100%', maxWidth: '480px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
        
        <h2 style={{ color: '#58A6FF', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0, textAlign: 'center' }}>LexalSpace</h2>
        <p style={{ color: '#8B949E', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>Welcome to The Lexal Social World! 🌎<br/>CREATE YOUR NEW ACCOUNT</p>

        <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* ১. নাম এরিয়া (First & Last Name) */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={styles.label}>First Name</label>
              <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required style={styles.input} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={styles.label}>Last Name</label>
              <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required style={styles.input} />
            </div>
          </div>

          {/* ২. দেশের নাম (Country Selection) */}
          <div style={{ textAlign: 'left' }}>
            <label style={styles.label}>Country Name</label>
            <select value={country} onChange={e => setCountry(e.target.value)} style={styles.input}>
              {COUNTRIES.map(c => <option key={c} value={c} style={{background: '#161B22'}}>{c}</option>)}
            </select>
          </div>

          {/* ৩. Hometown ও সাজেশন */}
          <div style={{ textAlign: 'left', position: 'relative' }}>
            <label style={styles.label}>Hometown</label>
            <input type="text" placeholder="Type your hometown..." value={hometown} onChange={e => handlePlaceTyping(e.target.value, 'home')} required style={styles.input} />
            {homeSuggestions.length > 0 && (
              <div style={styles.suggestionBox}>
                {homeSuggestions.map(p => <div key={p} style={styles.suggestionItem} onClick={() => { setHometown(p); setHomeSuggestions([]); }}>{p}</div>)}
              </div>
            )}
          </div>

          {/* ৪. Current City ও সাজেশন */}
          <div style={{ textAlign: 'left', position: 'relative' }}>
            <label style={styles.label}>Current City</label>
            <input type="text" placeholder="Type your current city..." value={currentCity} onChange={e => handlePlaceTyping(e.target.value, 'city')} required style={styles.input} />
            {citySuggestions.length > 0 && (
              <div style={styles.suggestionBox}>
                {citySuggestions.map(p => <div key={p} style={styles.suggestionItem} onClick={() => { setCurrentCity(p); setCitySuggestions([]); }}>{p}</div>)}
              </div>
            )}
          </div>

          {/* ৫. জন্মতারিখ (Date of Birth Scroll/Dropdown) */}
          <div style={{ textAlign: 'left' }}>
            <label style={styles.label}>Date of Birth</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select value={birthDay} onChange={e => setBirthDay(e.target.value)} required style={styles.input}>
                <option value="">Day</option>
                {days.map(d => <option key={d} value={d} style={{background: '#161B22'}}>{d}</option>)}
              </select>
              <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)} required style={styles.input}>
                <option value="">Month</option>
                {months.map((m, idx) => <option key={m} value={idx+1} style={{background: '#161B22'}}>{m}</option>)}
              </select>
              <select value={birthYear} onChange={e => setBirthYear(e.target.value)} required style={styles.input}>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y} style={{background: '#161B22'}}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* 💻 ৬. জেন্ডার (Gender Selection) */}
          <div style={{ textAlign: 'left' }}>
            <label style={styles.label}>Gender</label>
            <div style={{ display: 'flex', gap: '20px', padding: '10px 0' }}>
              <label style={{ color: '#FFF', fontSize: '14px', cursor: 'pointer' }}><input type="radio" name="gender" value="Male" onChange={e => setGender(e.target.value)} required style={{marginRight: '6px'}} /> Male</label>
              <label style={{ color: '#FFF', fontSize: '14px', cursor: 'pointer' }}><input type="radio" name="gender" value="Female" onChange={e => setGender(e.target.value)} required style={{marginRight: '6px'}} /> Female</label>
              <label style={{ color: '#FFF', fontSize: '14px', cursor: 'pointer' }}><input type="radio" name="gender" value="Other" onChange={e => setGender(e.target.value)} required style={{marginRight: '6px'}} /> Other</label>
            </div>
          </div>

          {/* 📞 ৭. মোবাইল অথবা ইমেইল */}
          <div style={{ textAlign: 'left' }}>
            <label style={styles.label}>Mobile Number or Email</label>
            <input type="text" placeholder="Enter valid phone number or email" value={contactInput} onChange={e => setContactInput(e.target.value)} required style={styles.input} />
          </div>

          {/* 🔑 ৮. পাসওয়ার্ড এরিয়া */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={styles.label}>Password</label>
              <input type="password" placeholder="Min 8 chars" value={pass} onChange={e => setPass(e.target.value)} required style={styles.input} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={styles.label}>Retype Password</label>
              <input type="password" placeholder="Confirm" value={rePass} onChange={e => setRePass(e.target.value)} required style={styles.input} />
            </div>
          </div>

          {/* 🤖 ৯. আই এম নট রোবট (Dynamic Verification) */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#0D1117', padding: '12px', borderRadius: '8px', border: '1px solid #30363D', marginTop: '5px' }}>
            <input type="checkbox" checked={isCaptchaChecked} onChange={triggerCaptchaChallenge} style={{ width: '20px', height: '20px', marginRight: '12px', cursor: 'pointer' }} />
            <span style={{ color: '#C9D1D9', fontSize: '14px' }}>{isRobotVerified ? "✅ Verified Human" : "I am not a robot"}</span>
          </div>

          {/* 📄 ১০. টার্মস অ্যান্ড কন্ডিশনস */}
          <div style={{ textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '5px' }}>
            <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} style={{ marginTop: '3px' }} />
            <span style={{ color: '#C9D1D9', fontSize: '13px', lineHeight: '1.4' }}>
              I agree with the <span onClick={() => setShowTermsModal(true)} style={{ color: '#58A6FF', cursor: 'pointer', textDecoration: 'underline' }}>Terms and Conditions</span>.
            </span>
          </div>

          {/* সাবমিট বাটন */}
          <button type="submit" disabled={loading} style={{ background: loading ? '#1f6feb' : '#238636', color: '#FFF', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
            {loading ? 'Processing Registration...' : 'NOW CREATE NEW ACCOUNT'}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid #30363D', paddingTop: '16px', textAlign: 'center' }}>
          <span onClick={() => setAuthView('login')} style={{ color: '#58A6FF', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Already have an account? SIGN IN</span>
        </div>
      </div>

      {/* 📄 টার্মস অ্যান্ড কন্ডিশনস পপআপ মডাল */}
      {showTermsModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#58A6FF', marginTop: 0 }}>LexalSpace - Terms and Conditions</h3>
            <div style={{ maxHeight: '250px', overflowY: 'auto', textAlign: 'left', fontSize: '13px', color: '#C9D1D9', lineHeight: '1.5', paddingRight: '10px' }}>
              <p>১. <strong>বাস্তব নাম ব্যবহার:</strong> প্ল্যাটফর্মে সুস্থ পরিবেশ বজায় রাখতে প্রত্যেক ইউজারকে অবশ্যই তাদের বৈধ ফার্স্ট নেম এবং লাস্ট নেম ব্যবহার করতে হবে। কোনো প্রকার স্প্যাম, ফেক বা আপত্তিকর শব্দ সংবলিত নাম গ্রহণযোগ্য নয়।</p>
              <p>২. <strong>নিরাপত্তা ও গোপনীয়তা:</strong> আপনার পাসওয়ার্ড এবং অ্যাকাউন্টের সম্পূর্ণ নিরাপত্তা বজায় রাখার দায়িত্ব আপনার। কোনো রোবোটিক বা স্ক্রিপ্টেড কার্যক্রম পরিচালনা করা সম্পূর্ণ নিষিদ্ধ।</p>
              <p>৩. <strong>কনটেন্ট পলিসি:</strong> LexalSpace-এ কোনো প্রকার হিংসাত্মক, বেআইনি, কপিরাইট লঙ্ঘিত বা সমাজ-বিধ্বংসী পোস্ট বা মেসেজ আদান-প্রদান করা যাবে না। অমান্য করলে অ্যাকাউন্ট চিরতরে ব্যান করা হবে।</p>
            </div>
            <button onClick={() => setShowTermsModal(false)} style={styles.modalCloseBtn}>আই এগ্রি / বন্ধ করুন</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ইনলাইন সিএসএস স্টাইলস
const styles = {
  label: { color: '#C9D1D9', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' },
  input: { width: '100%', padding: '12px', background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px', color: '#FFF', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  suggestionBox: { position: 'absolute', left: 0, right: 0, background: '#161B22', border: '1px solid #30363D', borderRadius: '8px', zIndex: '999', maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' },
  suggestionItem: { padding: '10px 12px', color: '#FFF', cursor: 'pointer', borderBottom: '1px solid #21262D', fontSize: '13px', textAlign: 'left' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: '#161B22', border: '1px solid #30363D', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', textAlign: 'center' },
  modalCloseBtn: { background: '#21262D', color: '#58A6FF', border: '1px solid #30363D', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '16px', fontWeight: 'bold' }
};
    
