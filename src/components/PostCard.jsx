import React, { useState } from 'react';
// ইম্পোর্ট করার ধরন সংশোধন করা হলো (সব ফাংশনকে একবারে postService অবজেক্ট হিসেবে আনা হলো)
import * as postService from '../services/postService';
import CommentBox from './CommentBox';
import PostCounter from './PostCounter';

function PostCard({ post, currentUser }) {
  const [showComments, setShowComments] = useState(false);
  const hasLiked = post.likes?.includes(currentUser?.uid); // ক্র্যাশ এড়াতে ঐচ্ছিক সেফটি চেক (?.) দেওয়া হলো

  return (
    <div className="post-card">
      <div className="post-header">
        <strong>{post.author}</strong>
        {post.uid === currentUser?.uid && (
          <button onClick={() => postService.deletePost(post.id)} className="delete-btn">মুছে ফেলুন</button>
        )}
      </div>
      <p className="post-body">{post.content}</p>
      
      {/* ইমেজ, ভিডিও এবং অন্যান্য ফাইল ডাইনামিক প্রিভিউ কোড */}
      {post.mediaUrl && post.mediaType === 'image' && <img src={post.mediaUrl} alt="media" className="post-media" />}
      {post.mediaUrl && post.mediaType === 'video' && <video src={post.mediaUrl} controls className="post-media" />}
      {post.mediaUrl && post.mediaType === 'audio' && <audio src={post.mediaUrl} controls className="post-media" style={{ width: "100%", marginTop: "10px" }} />}
      {post.mediaUrl && (post.mediaType === 'pdf' || post.mediaType === 'document') && (
        <a href={post.mediaUrl} target="_blank" rel="noreferrer" style={{ display: "block", color: "#58A6FF", marginTop: "10px", textDecoration: "underline" }}>
          📄 {post.mediaName || "ডকুমেন্ট ফাইলটি দেখুন"}
        </a>
      )}
      
      <PostCounter likesCount={post.likes?.length || 0} sharesCount={post.shares || 0} />

      <div className="post-actions">
        <button onClick={() => postService.toggleLike(post.id, currentUser?.uid, hasLiked)}>
          {hasLiked ? '❤️ লাইকড' : '🤍 লাইক'}
        </button>
        <button onClick={() => setShowComments(!showComments)}>💬 কমেন্ট</button>
      </div>

      {showComments && <CommentBox postId={post.id} currentUser={currentUser} />}
    </div>
  );
}

export default PostCard;
