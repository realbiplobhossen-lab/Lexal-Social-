import React from 'react';
import PostCard from './PostCard';

function Feed({ posts, currentUser }) {
  return (
    <div className="lexal-feed">
      {posts.map(p => (
        <PostCard key={p.id} post={p} currentUser={currentUser} />
      ))}
    </div>
  );
}
export default Feed;
