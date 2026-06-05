import React from "react";
import CommentBox from "./CommentBox";

export default function PostCard({ post }) {
  return (
    <div className="post-card" style={{ border: "1px solid #ccc", padding: "15px", margin: "10px 0", borderRadius: "8px" }}>
      <p style={{ fontWeight: "500" }}>{post.text}</p>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post attachment"
          width="100%"
          style={{ borderRadius: "8px", marginTop: "10px", maxHeight: "400px", objectFit: "cover" }}
        />
      )}
      <hr style={{ borderTop: "1px solid #eee", margin: "10px 0" }} />
      <CommentBox postId={post.id} />
    </div>
  );
}
