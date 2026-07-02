import React, { useState } from 'react';
import * as authService from '../services/authService';

// Banned words to prevent fake/offensive accounts
const BANNED_WORDS = ['admin', 'fakeuser', 'anonymous', 'null', 'undefined', 'moderator', 'system', 'root'];

// Alphabetical List of Countries (Comprehensive Sample)
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Brazil", "Brunei",
  "Canada", "Chile", "China", "Colombia", "Cuba", "Cyprus", "Denmark", "Egypt", "Finland", "France", "Germany", "India", 
  "Indonesia", "Iran", "Iraq", "Italy", "Japan", "Malaysia", "Maldives", "Mexico", "Oman", "Pakistan", "Qatar", 
  "Saudi Arabia", "Singapore", "South Africa", "Spain", "Turkey", "United Arab Emirates", "United Kingdom", "United States"
];

// Mock Global Database for Autocomplete Suggestions based on typing
const GLOBAL_PLACES = [
  "Dhaka, Bangladesh", "Chittagong, Bangladesh", "Sylhet, Bangladesh", "Comilla, Bangladesh", "Khulna, Bangladesh",
  "New York, United States", "Los Angeles, United States", "London, United Kingdom", "Manchester, United Kingdom",
  "Mumbai, India", "Delhi, India", "Kolkata, India", "Riyadh, Saudi Arabia", "Jeddah, Saudi Arabia", "Dubai, UAE",
  "Kuala Lumpur, Malaysia", "Singapore City, Singapore", "Tokyo, Japan", "Toronto, Canada", "Sydney, Australia"
];

export default function SignupScreen({ setAuthView, onSignupSuccess }) {
  // Input States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [hometown, setHometown] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [gender, setGender] = useState('');
  const [contactInput, setContactInput] = useState('');
  const [pass, setPass] = useState('');
  const [rePass, setRePass] = useState('');

  // DOB States
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  // Validation States
  const [homeSuggestions, setHomeSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [captchaQuestion, setCaptchaQuestion] = useState({ q: '5 + 7', a: 12 });
  const [isCaptchaChecked, setIsCaptchaChecked] = useState(false);
  const [isRobotVerified, setIsRobotVerified] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic Place Suggestions based on typing
  const handlePlaceTyping = (text, type) => {
    if (type === 'home') setHometown(text);
    if (type === 'city') setCurrentCity(text);

    if (!text.trim()) {
      type === 'home' ? setHomeSuggestions([]) : setCitySuggestions([]);
      return;
    }

    // Filter global places based on user typing text
    const filtered = GLOBAL_PLACES.filter(place => 
      place.toLowerCase().includes(text.toLowerCase())
    );
    
    // Fallback dynamic suggestion if exact match not found
    if (filtered.length === 0) {
      filtered.push(`${text}, Area Center`);
    }

    type === 'home' ? setHomeSuggestions(filtered) : setCitySuggestions(filtered);
  };

  // Generate International Captcha
  const triggerCaptchaChallenge = () => {
    if (isRobotVerified) return;
    const num1 = Math.floor(Math.random() * 12) + 1;
    const num2 = Math.floor(Math.random() * 12) + 1;
    const ans = num1 + num2;
    
    const userAns = prompt(`Security Check: What is ${num1} + ${num2}?`);
    if (parseInt(userAns) === ans) {
      setIsRobotVerified(true);
      setIsCaptchaChecked(true);
    } else {
      alert("Verification Failed! Please try again.");
      setIsCaptchaChecked(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    // Name Validation
    const combinedName = `${firstName.trim()} ${lastName.trim()}`;
    const containsBannedWord = BANNED_WORDS.some(word => 
      firstName.toLowerCase().includes(word) || lastName.toLowerCase().includes(word)
    );

    if (containsBannedWord || firstName.length < 2 || lastName.length < 2) {
      alert("Please enter a valid, real professional name!");
      return;
    }

    // Password Checks
    if (pass.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    if (pass !== rePass) {
      alert("Passwords do not match!");
      return;
    }

    if (!isRobotVerified) {
      alert("Please complete the bot verification!");
      return;
    }
    if (!agreeTerms) {
      alert("You must agree to the terms and conditions!");
      return;
    }

    setLoading(true);
    try {
      const userProfileData = {
        name: combinedName,
        country,
        hometown,
        currentCity,
        dob: `${birthYear}-${birthMonth}-${birthDay}`,
        gender
      };

      await authService.register(contactInput, pass, combinedName, userProfileData);
      alert("Account created successfully!");
      if (onSignupSuccess) onSignupSuccess();
    } catch (error) {
      alert("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 70 }, (_, i) => new Date().getFullYear() - 14 - i); // Min age 14

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0D1117', padding: '20px', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '30px 24px', width: '100%', maxWidth: '480px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
        
        <h2 style={{ color: '#58A6FF', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0, textAlign: 'center' }}>LexalSpace</h2>
        <p style={{ color: '#8B949E', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>Welcome to The Lexal Social World! 🌎<br/>CREATE YOUR NEW ACCOUNT</p>

        <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* First & Last Name */}
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

          {/* Country Selection */}
          <div style={{ textAlign: 'left' }}>
            <label style={styles.label}>Country Name</label>
            <select value={country} onChange={e => setCountry(e.target.value)} style={styles.input}>
              {COUNTRIES.map(c => <option key={c} value={c} style={{background: '#161B22'}}>{c}</option>)}
            </select>
          </div>

          {/* Hometown Auto-suggestion */}
          <div style={{ textAlign: 'left', position: 'relative' }}>
            <label style={styles.label}>Hometown</label>
            <input type="text" placeholder="Start typing hometown..." value={hometown} onChange={e => handlePlaceTyping(e.target.value, 'home')} required style={styles.input} />
            {homeSuggestions.length > 0 && (
              <div style={styles.suggestionBox}>
                {homeSuggestions.map(p => <div key={p} style={styles.suggestionItem} onClick={() => { setHometown(p); setHomeSuggestions([]); }}>{p}</div>)}
              </div>
            )}
          </div>

          {/* Current City Auto-suggestion */}
          <div style={{ textAlign: 'left', position: 'relative' }}>
            <label style={styles.label}>Current City</label>
            <input type="text" placeholder="Start typing current city..." value={currentCity} onChange={e => handlePlaceTyping(e.target.value, 'city')} required style={styles.input} />
            {citySuggestions.length > 0 && (
              <div style={styles.suggestionBox}>
                {citySuggestions.map(p => <div key={p} style={styles.suggestionItem} onClick={() => { setCurrentCity(p); setCitySuggestions([]); }}>{p}</div>)}
              </div>
            )}
          </div>

          {/* Date of Birth Scroll Pickers */}
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

          {/* Gender */}
          <div style={{ textAlign: 'left' }}>
            <label style={styles.label}>Gender</label>
            <div style={{ display: 'flex', gap: '20px', padding: '6px 0' }}>
              <label style={styles.radioLabel}><input type="radio" name="gender" value="Male" onChange={e => setGender(e.target.value)} required /> Male</label>
              <label style={styles.radioLabel}><input type="radio" name="gender" value="Female" onChange={e => setGender(e.target.value)} required /> Female</label>
              <label style={styles.radioLabel}><input type="radio" name="gender" value="Other" onChange={e => setGender(e.target.value)} required /> Other</label>
            </div>
          </div>

          {/* Mobile or Email */}
          <div style={{ textAlign: 'left' }}>
            <label style={styles.label}>Mobile Number or Email</label>
            <input type="text" placeholder="Enter valid phone number or email" value={contactInput} onChange={e => setContactInput(e.target.value)} required style={styles.input} />
          </div>

          {/* Password & Confirm */}
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

          {/* Professional Captcha Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#0D1117', padding: '12px', borderRadius: '8px', border: '1px solid #30363D', marginTop: '4px' }}>
            <input type="checkbox" checked={isCaptchaChecked} onChange={triggerCaptchaChallenge} style={{ width: '18px', height: '18px', marginRight: '12px', cursor: 'pointer' }} />
            <span style={{ color: '#C9D1D9', fontSize: '14px' }}>{isRobotVerified ? "✅ Verified Human" : "I am not a robot"}</span>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div style={{ textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} style={{ marginTop: '3px' }} />
            <span style={{ color: '#C9D1D9', fontSize: '13px', lineHeight: '1.4' }}>
              I agree with the <span onClick={() => setShowTermsModal(true)} style={{ color: '#58A6FF', cursor: 'pointer', textDecoration: 'underline' }}>Terms and Conditions</span>.
            </span>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} style={{ background: loading ? '#1f6feb' : '#238636', color: '#FFF', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
            {loading ? 'PROCESSING REGISTRATION...' : 'NOW CREATE NEW ACCOUNT'}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid #30363D', paddingTop: '16px', textAlign: 'center' }}>
          <span onClick={() => setAuthView('login')} style={{ color: '#58A6FF', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Already have an account? SIGN IN</span>
        </div>
      </div>

      {/* Premium Extended Terms & Conditions Modal */}
      {showTermsModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#58A6FF', marginTop: 0, fontSize: '18px' }}>LexalSpace - User Agreement</h3>
            <div style={{ maxHeight: '280px', overflowY: 'auto', textAlign: 'left', fontSize: '13px', color: '#C9D1D9', lineHeight: '1.6', paddingRight: '8px' }}>
              <p><strong>1. Authentic Profiling:</strong> To ensure safety, all users must register using real identities (First and Last Name). Fake names, placeholders, or profanity are immediately blacklisted.</p>
              <p><strong>2. Account & Data Security:</strong> You are fully responsible for safeguarding your login credentials. Automation, scraping, or bot actions on LexalSpace will trigger immediate hardware-level bans.</p>
              <p><strong>3. Content & Community Guidelines:</strong> Hate speech, harassment, copyright infringement, or illegal media sharing are strictly prohibited. LexalSpace reserves the right to terminate accounts instantly for violations.</p>
              <p><strong>4. Verification & Recovery:</strong> Valid contact points (Email/Mobile) are crucial for ownership confirmation. Account recovery protocols rely explicitly on active OTP triggers.</p>
            </div>
            <button onClick={() => setShowTermsModal(false)} style={styles.modalCloseBtn}>AGREE & CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  label: { color: '#C9D1D9', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' },
  input: { width: '100%', padding: '12px', background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px', color: '#FFF', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  radioLabel: { color: '#FFF', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  suggestionBox: { position: 'absolute', left: 0, right: 0, background: '#161B22', border: '1px solid #30363D', borderRadius: '8px', zIndex: '999', maxHeight: '140px', overflowY: 'auto' },
  suggestionItem: { padding: '10px 12px', color: '#FFF', cursor: 'pointer', borderBottom: '1px solid #21262D', fontSize: '13px', textAlign: 'left' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: '#161B22', border: '1px solid #30363D', padding: '24px', borderRadius: '12px', maxWidth: '420px', width: '90%', textAlign: 'center' },
  modalCloseBtn: { background: '#238636', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '16px', fontWeight: 'bold', fontSize: '13px' }
};
                  
