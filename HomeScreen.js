import React, { useState, useEffect } from 'react';
import { postService } from '../services/postService';
import { storyService } from '../services/storyService';
import Feed from '../components/Feed';

function HomeScreen({ user }) {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const unsubFeed = postService.getLiveFeed(setPosts);
    const unsubStories = storyService.listenActiveStories(setStories);
    return () => { unsubFeed(); unsubStories(); };
  }, []);

  return (
    <div>
      {/* স্টোরি ট্রে */}
      <div className="story-tray" style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '15px', paddingBottom: '10px' }}>
        <div className="story-card add-story">➕<br/>স্টোরি</div>
        {stories.map((s, idx) => (
          <div key={idx} className="story-card" style={{ backgroundImage: `url(${s.mediaUrl})` }}>
            <span>{s.author}</span>
          </div>
        ))}
      </div>
      <Feed posts={posts} currentUser={user} />
    </div>
  );
}
export default HomeScreen;
