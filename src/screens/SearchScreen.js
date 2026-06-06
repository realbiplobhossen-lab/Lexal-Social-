import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { followService } from '../services/followService';

function SearchScreen({ user, userData }) {
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    const q = query(collection(db, "users"), where("fullName", "==", queryText));
    const snap = await getDocs(q);
    setResults(snap.docs.map(d => d.data()).filter(u => u.uid !== user.uid));
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="search-form">
        <input type="text" value={queryText} onChange={e=>setQueryText(e.target.value)} placeholder="বন্ধুদের সঠিক নাম লিখে খুঁজুন..." />
        <button type="submit">খুঁজুন</button>
      </form>
      <div className="search-results" style={{ marginTop: '20px' }}>
        {results.map(u => (
          <div key={u.uid} className="search-row" style={{ display:'flex', justifyContent:'space-between', padding:'10px', background:'#111827', marginBottom:'8px', borderRadius:'8px' }}>
            <span>{u.fullName}</span>
            <button onClick={() => followService.sendRequest(user.uid, userData.fullName, u.uid)} style={{ background:'#2563EB', color:'#fff', border:'none', padding:'4px 10px', borderRadius:'4px' }}>+ ফ্রেন্ড করুন</button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default SearchScreen;
          
