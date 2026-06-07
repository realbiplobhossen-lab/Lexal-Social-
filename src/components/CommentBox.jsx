import React, { useState, useEffect } from 'react';
import { commentService } from '../services/commentService';

function CommentBox({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const unsub = commentService.listenComments(postId, setComments);
    return () => unsub();
  }, [postId]);

  const submitComment = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    commentService.addComment(postId, currentUser.uid, currentUser.displayName || "ব্যবহারকারী", text);
    setText('');
  };

  return (
    <div className="comment-box">
      <div className="comment-list">
        {comments.map((c, i) => (
          <div key={i} className="comment-item">
            <strong>{c.author}:</strong> <span>{c.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={submitComment} className="comment-form">
        <input type="text" value={text} onChange={e=>setText(e.target.value)} placeholder="একটি মন্তব্য লিখুন..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
export default CommentBox;
