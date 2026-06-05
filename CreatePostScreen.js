import React, { useState } from "react";
import { auth } from "../config/firebase";
import { uploadImage } from "../services/uploadService";
import { createPost } from "../services/postService";

export default function CreatePostScreen({ setPage }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() && !image) {
      alert("Please write something or select an image!");
      return;
    }

    try {
      setLoading(true);
      let imageUrl = "";

      if (image) {
        imageUrl = await uploadImage(image);
      }

      await createPost(auth.currentUser.uid, text, imageUrl);

      setText("");
      setImage(null);
      alert("Post Created Successfully!");
      if (setPage) setPage("home"); // পোস্ট তৈরির পর হোমে রিডাইরেক্ট করবে
    } catch (err) {
      alert("Error creating post: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ padding: "20px" }}>
      <h2>Create Post</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        style={{ width: "100%", height: "100px", padding: "10px", margin: "10px 0" }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        style={{ margin: "10px 0" }}
      />
      <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 20px", display: "block" }}>
        {loading ? "Uploading..." : "Post"}
      </button>
    </div>
  );
}
