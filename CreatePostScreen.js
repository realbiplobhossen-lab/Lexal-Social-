import React, { useState } from 'react';
import { postService } from '../services/postService';
import { uploadService } from '../services/uploadService';

function CreatePostScreen({ user, userData, setActiveScreen }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setLoading(true);
    
    const media = await uploadService.uploadMedia(file);
    await postService.createPost(user.uid, userData.fullName, text, media.url, media.type);
    
    setLoading(false);
    setActiveScreen('home');
  };

  return (
    <div className="create-post-card">
      <h3>নতুন ডাইনামিক লাইভ পোস্ট</h3>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="আজকে আপনার মনে কী চলছে?" />
      <input type="file" onChange={e=>setFile(e.target.files[0])} accept="image/*,video/*" style={{ margin: '10px 0' }} />
      <button onClick={handlePublish} disabled={loading} className="publish-btn">
        {loading ? 'সার্ভারে আপলোড হচ্ছে...' : 'টাইমলাইনে শেয়ার করুন'}
      </button>
    </div>
  );
}
export default CreatePostScreen;
