import React, { useState } from 'react';
import { postService } from '../services/postService';
import CommentBox from './CommentBox';
import PostCounter from './PostCounter';

function PostCard({ post, currentUser }) {
  const [showComments, setShowComments] = useState(false);
  const hasLiked = post.likes?.includes(currentUser.uid);

  return (
    <div className="post-card">
      <div className="post-header">
        <strong>{post.author}</strong>
        {post.uid === currentUser.uid && (
          <button onClick={() => postService.deletePost(post.id)} className="delete-btn">মুছে ফেলুন</button>
        )}
      </div>
      <p className="post-body">{post.content}</p>
      
      {post.mediaUrl && post.mediaType === 'image' && <img src={post.mediaUrl} alt="media" className="post-media" />}
      {post.mediaUrl && post.mediaType === 'video' && <video src={post.mediaUrl} controls className="post-media" />}
      
      <PostCounter likesCount={post.likes?.length || 0} sharesCount={post.shares || 0} />

      <div className="post-actions">
        <button onClick={() => postService.toggleLike(post.id, currentUser.uid, hasLiked)}>
          {hasLiked ? '❤️ লাইকড' : '🤍 লাইক'}
        </button>
        <button onClick={() => setShowComments(!showComments)}>💬 কমেন্ট</button>
      </div>

      {showComments && <CommentBox postId={post.id} currentUser={currentUser} />}
    </div>
  );
}
export default PostCard;

