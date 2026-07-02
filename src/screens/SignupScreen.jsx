import React, { useState } from 'react';
import * as authService from '../services/authService';

// পৃথিবীর প্রায় সব দেশের সম্পূর্ণ Alphabetical লিস্ট
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe"
];

// গ্লোবাল প্লেস ডাটাবেজ (টাইপিং সাজেশনের জন্য ব্যাপক বিস্তৃতি)
const GLOBAL_PLACES = [
  "Dhaka, Bangladesh", "Chittagong, Bangladesh", "Sylhet, Bangladesh", "Comilla, Bangladesh", "Khulna, Bangladesh", "Rajshahi, Bangladesh", "Barisal, Bangladesh", "Rangpur, Bangladesh", "Mymensingh, Bangladesh", "Savar, Dhaka", "Uttara, Dhaka", "Mirpur, Dhaka", "Gulshan, Dhaka",
  "New York, United States", "Los Angeles, United States", "Chicago, United States", "Houston, United States", "London, United Kingdom", "Manchester, United Kingdom", "Birmingham, United Kingdom",
  "Mumbai, India", "Delhi, India", "Kolkata, India", "Bangalore, India", "Chennai, India", "Riyadh, Saudi Arabia", "Jeddah, Saudi Arabia", "Mecca, Saudi Arabia", "Medina, Saudi Arabia", "Dubai, UAE", "Abu Dhabi, UAE",
  "Kuala Lumpur, Malaysia", "Penang, Malaysia", "Singapore City, Singapore", "Tokyo, Japan", "Osaka, Japan", "Toronto, Canada", "Vancouver, Canada", "Sydney, Australia", "Melbourne, Australia", "Karachi, Pakistan", "Lahore, Pakistan"
];

export default function SignupScreen({ setAuthView }) {
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

  // UI & Verification States
  const [homeSuggestions, setHomeSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isRobotVerified, setIsRobotVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ডাইনামিক প্লেস সাজেশন ফিল্টারিং লজিক
  const handlePlaceTyping = (text, type) => {
    if (type === 'home') setHometown(text);
    if (type === 'city') setCurrentCity(text);

    if (!text.trim()) {
      type === 'home' ? setHomeSuggestions([]) : setCitySuggestions([]);
      return;
    }

    // ইউজার যা টাইপ করছে তার সাথে মিল রেখে সাজেশন ফিল্টার
    let filtered = GLOBAL_PLACES.filter(place => 
      place.toLowerCase().includes(text.toLowerCase())
    );

    // যদি ফিক্সড লিস্টে না মেলে, ডাইনামিক্যালি ইউজারের টেক্সটকে সাজেশন বানাবে
    if (filtered.length === 0) {
      filtered = [`${text}, ${country}`];
    }

    if (type === 'home') setHomeSuggestions(filtered);
    if (type === 'city') setCitySuggestions(filtered);
  };

  // 'I am not a robot' ডাইনামিক টিক চিহ্ন ওয়ান-ক্লিক মেকানিজম
  const handleCaptchaClick = () => {
    if (isRobotVerified) return;
    setCaptchaLoading(true);
    // ১ সেকেন্ডের একটি রিয়েল-লাইক সিকিউরিটি চেকিং অ্যানিমেশন এফেক্ট
    setTimeout(() => {
      setCaptchaLoading(false);
      setIsRobotVerified(true);
    }, 1200);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    // প্রফেশনাল নাম ভ্যালিডেশন
    const badWords = ['admin', 'fake', 'anonymous', 'null', 'undefined', 'badword', 'স্প্যাম'];
    const combinedName = `${firstName.trim()} ${lastName.trim()}`;
    
    if (badWords.some(w => firstName.toLowerCase().includes(w) || lastName.toLowerCase().includes(w)) || firstName.length < 2 || lastName.length < 2) {
      alert("Please use a valid, real, and professional name!");
      return;
    }

    // পাসওয়ার্ড ভ্যালিডেশন
    if (pass.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    if (pass !== rePass) {
      alert("Passwords do not match! Please retype correctly.");
      return;
    }

    if (!isRobotVerified) {
      alert("Please verify that you are not a robot!");
      return;
    }

    if (!agreeTerms) {
      alert("You must agree to the LexalSpace Terms and Conditions to proceed.");
      return;
    }

    setLoading(true);
    try {
      const additionalProfileData = {
        country,
        hometown,
        currentCity,
        dob: `${birthYear}-${birthMonth}-${birthDay}`,
        gender
      };

      // মেইন ব্যাকএন্ড মেথড কল (মোবাইল এবং ইমেইল দুটোই হ্যান্ডেল করবে)
      await authService.register(contactInput, pass, combinedName, additionalProfileData);
      alert("Account created successfully! Welcome to LexalSpace!");
      
      // সফল হলে সরাসরি হোম স্ক্রিনে যাওয়ার জন্য রিলোড বা স্টেট চেঞ্জ হ্যান্ডেল হবে
      window.location.reload(); 
    } catch (error) {
      alert("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 70 }, (_, i) => new Date().getFullYear() - 13 - i); // Minimum age 13

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0D1117', padding: '40px 20px', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '30px 24px', width: '100%', maxWidth: '460px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
        
        <h2 style={{ color: '#58A6FF', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0, textAlign: 'center', letterSpacing: '1px' }}>LexalSpace</h2>
        <p style={{ color: '#8B949E', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>Welcome to The Lexal Social World! 🌎<br/>CREATE YOUR NEW ACCOUNT</p>

        <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* First Name & Last Name */}
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

          {/* Hometown Selection with Auto-suggestion */}
          <div style={{ textAlign: 'left', position: 'relative' }}>
            <label style={styles.label}>Hometown</label>
            <input type="text" placeholder="Type your hometown..." value={hometown} onChange={e => handlePlaceTyping(e.target.value, 'home')} required style={styles.input} />
            {homeSuggestions.length > 0 && (
              <div style={styles.suggestionBox}>
                {homeSuggestions.map(p => <div key={p} style={styles.suggestionItem} onClick={() => { setHometown(p); setHomeSuggestions([]); }}>{p}</div>)}
              </div>
            )}
          </div>

          {/* Current City Selection with Auto-suggestion */}
          <div style={{ textAlign: 'left', position: 'relative' }}>
            <label style={styles.label}>Current City</label>
            <input type="text" placeholder="Type your current city..." value={currentCity} onChange={e => handlePlaceTyping(e.target.value, 'city')} required style={styles.input} />
            {citySuggestions.length > 0 && (
              <div style={styles.suggestionBox}>
                {citySuggestions.map(p => <div key={p} style={styles.suggestionItem} onClick={() => { setCurrentCity(p); setCitySuggestions([]); }}>{p}</div>)}
              </div>
            )}
          </div>

          {/* Date of Birth Picker */}
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
            <div style={{ display: 'flex', gap: '24px', padding: '4px 0' }}>
              <label style={styles.radioLabel}><input type="radio" name="gender" value="Male" onChange={e => setGender(e.target.value)} required /> Male</label>
              <label style={styles.radioLabel}><input type="radio" name="gender" value="Female" onChange={e => setGender(e.target.value)} required /> Female</label>
              <label style={styles.radioLabel}><input type="radio" name="gender" value="Other" onChange={e => setGender(e.target.value)} required /> Other</label>
            </div>
          </div>

          {/* Mobile or Email */}
          <div style={{ textAlign: 'left' }}>
            <label style={styles.label}>Mobile Number or Email</label>
            <input type="text" placeholder="e.g., +88017xxxxxxxx or name@mail.com" value={contactInput} onChange={e => setContactInput(e.target.value)} required style={styles.input} />
          </div>

          {/* Password & Confirm Password */}
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

          {/* 🤖 'I am not a robot' Checkbox (Clean & Dynamic Only) */}
          <div onClick={handleCaptchaClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0D1117', padding: '12px 16px', borderRadius: '8px', border: '1px solid #30363D', marginTop: '4px', cursor: isRobotVerified ? 'default' : 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '22px',
                height: '22px',
                border: isRobotVerified ? '2px solid #238636' : '2px solid #30363D',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: isRobotVerified ? '#238636' : 'transparent',
                transition: 'all 0.2s'
              }}>
                {captchaLoading && <div style={styles.miniSpinner}></div>}
                {isRobotVerified && <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
              </div>
              <span style={{ color: '#C9D1D9', fontSize: '14px', fontWeight: '500' }}>I am not a robot</span>
            </div>
            <div style={{ textAlign: 'right', opacity: 0.5 }}>
              <span style={{ fontSize: '10px', color: '#8B949E', display: 'block' }}>reCAPTCHA</span>
              <span style={{ fontSize: '8px', color: '#8B949E' }}>Privacy - Terms</span>
            </div>
          </div>

          {/* Terms and Conditions Acceptance Checkbox */}
          <div style={{ textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
            <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} style={{ marginTop: '3px', cursor: 'pointer' }} />
            <span style={{ color: '#C9D1D9', fontSize: '13px', lineHeight: '1.4' }}>
              I agree with the <span onClick={() => setShowTermsModal(true)} style={{ color: '#58A6FF', cursor: 'pointer', textDecoration: 'underline' }}>Terms and Conditions</span> of LexalSpace ecosystem.
            </span>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} style={{ background: loading ? '#1f6feb' : '#238636', color: '#FFF', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', transition: 'background 0.2s' }}>
            {loading ? 'PROCESSING REGISTRATION...' : 'NOW CREATE NEW ACCOUNT'}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid #30363D', paddingTop: '16px', textAlign: 'center' }}>
          <span onClick={() => setAuthView('login')} style={{ color: '#58A6FF', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Already have an account? SIGN IN</span>
        </div>
      </div>

      {/* 📄 Facebook Standard Extended Terms & Conditions Popup Modal */}
      {showTermsModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#58A6FF', marginTop: 0, fontSize: '18px', borderBottom: '1px solid #30363D', paddingBottom: '10px' }}>LexalSpace Terms of Service</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', textAlign: 'left', fontSize: '13px', color: '#C9D1D9', lineHeight: '1.6', paddingRight: '8px' }}>
              <p><strong>Welcome to LexalSpace!</strong> These Terms govern your use of LexalSpace and the products, features, apps, and services we offer.</p>
              
              <p><strong>1. The Services We Provide:</strong> Our mission is to empower people to build community and bring the world closer together. To advance this, we provide personalized feeds, connections, and secure communication channels while maintaining metadata integrity.</p>
              
              <p><strong>2. Your Commitments to LexalSpace:</strong> In exchange for our services, you must provide accurate info, use your authentic identity (First & Last Name), and keep your account secure. You may not use placeholders, offensive words, or aliases.</p>
              
              <p><strong>3. Permissions You Give Us:</strong> We need certain permissions from you to provide our services. This includes permission to use content you create and share. You own the intellectual property rights, but you grant LexalSpace a non-exclusive, transferable, sub-licensable, royalty-free, global license to host, use, or distribute your content.</p>
              
              <p><strong>4. Safety and Security Rules:</strong> You may not upload viruses, malicious code, or engage in scraping, hacking, or automated bot deployment. Account validation and ownership recovery rely explicitly on valid OTP tokens issued to your verified contact points.</p>
              
              <p><strong>5. Limitation of Liability:</strong> We work hard to provide the best products, but our services are provided "as is," and we make no guarantees that they will always be safe, secure, or error-free.</p>
            </div>
            <button onClick={() => setShowTermsModal(false)} style={styles.modalCloseBtn}>I AGREE & CLOSE</button>
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
  suggestionBox: { position: 'absolute', left: 0, right: 0, background: '#161B22', border: '1px solid #30363D', borderRadius: '8px', zIndex: '999', maxHeight: '140px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' },
  suggestionItem: { padding: '10px 12px', color: '#FFF', cursor: 'pointer', borderBottom: '1px solid #21262D', fontSize: '13px', textAlign: 'left' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: '#161B22', border: '1px solid #30363D', padding: '24px', borderRadius: '12px', maxWidth: '440px', width: '95%', textAlign: 'center' },
  modalCloseBtn: { background: '#238636', color: '#FFF', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold', fontSize: '14px', width: '100%' },
  miniSpinner: { width: '12px', height: '12px', border: '2px solid #30363D', borderTop: '2px solid #58A6FF', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }
};
