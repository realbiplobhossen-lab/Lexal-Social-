import React, { useState } from "react";
import { db } from '../config/firebase';
import { addComment } from "./commentService";

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
    <div className="comment-box" style={{ display: "flex", marginTop: "10px" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        style={{ flex: 1, padding: "8px", borderRadius: "4px 0 0 4px", border: "1px solid #444", background: "#161B22", color: "#fff" }}
      />
      <button onClick={submit} style={{ padding: "8px 15px", background: "#21262D", color: "#58A6FF", border: "1px solid #444", borderRadius: "0 4px 4px 0" }}>
        Send
      </button>
    </div>
  );
}
