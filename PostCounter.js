import React from 'react';

function PostCounter({ likesCount, sharesCount }) {
  return (
    <div className="post-counter" style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px', color: '#9CA3AF' }}>
      <span>👍 {likesCount} জন পছন্দ করেছেন</span>
      <span>🔄 {sharesCount} বার শেয়ার হয়েছে</span>
    </div>
  );
}
export default PostCounter;
