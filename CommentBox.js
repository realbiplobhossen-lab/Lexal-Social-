import React, { useState } from "react";
import { auth } from "../config/firebase";
import { addComment } from "../services/commentService";

export default function CommentBox({ postId }) {
  const [text, setText] = useState("");

  const submit = async () => {
    if (!text.trim()) return;
    if (!auth.currentUser) {
      alert("Please login to comment");
      return;
    }

    try {
      await addComment(postId, auth.currentUser.uid, text);
      setText("");
    } catch (error) {
      alert("Comment failed: " + error.message);
    }
  };

  return (
    <div className="comment-box">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
      />
      <button onClick={submit}>Send</button>
    </div>
  );
}
