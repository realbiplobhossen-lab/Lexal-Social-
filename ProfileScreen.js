import React, { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';

function ProfileScreen({ targetUid }) {
  const [prof, setProf] = useState(null);

  useEffect(() => {
    profileService.getProfile(targetUid).then(setProf);
  }, [targetUid]);

  return (
    <div className="profile-container" style={{ textAlign: 'center', padding: '20px', background: '#111827', borderRadius: '16px' }}>
      <div className="large-avatar">{prof?.fullName?.[0].toUpperCase()}</div>
      <h2>{prof?.fullName}</h2>
      <p style={{ color: '#9CA3AF' }}>{prof?.bio}</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', borderTop: '1px solid #1E293B', paddingTop: '15px' }}>
        <div><h3>{prof?.friends?.length || 0}</h3><span>বন্ধুরা</span></div>
      </div>
    </div>
  );
}
export default ProfileScreen;
