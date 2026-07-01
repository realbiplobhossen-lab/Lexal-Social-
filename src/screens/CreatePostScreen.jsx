import React, { useState } from "react";
import { auth } from "../config/firebase";
import { uploadImage } from "../services/uploadService"; // এই সার্ভিসটিই সব ফাইল আপলোড হ্যান্ডেল করবে
import { createPost } from "../services/postService";

export default function CreatePostScreen({ setPage }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null); // যেকোনো ফাইল রাখার জন্য
  const [fileType, setFileType] = useState(""); // ফাইলের ক্যাটাগরি (image, video, audio, pdf, etc.)
  const [fileName, setFileName] = useState(""); // ফাইলের নাম প্রিভিউ করার জন্য
  const [loading, setLoading] = useState(false);

  // ফাইল সিলেক্ট হলে তার টাইপ এবং নাম ডিটেক্ট করার ফাংশন
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);

      const mimeType = selectedFile.type;
      if (mimeType.startsWith("image/")) {
        setFileType("image");
      } else if (mimeType.startsWith("video/")) {
        setFileType("video");
      } else if (mimeType.startsWith("audio/")) {
        setFileType("audio");
      } else if (mimeType === "application/pdf") {
        setFileType("pdf");
      } else {
        setFileType("document"); // জিপ, ডক বা অন্যান্য ফাইলের জন্য
      }
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file) {
      alert("দয়া করে কিছু লিখুন অথবা একটি ফাইল সিলেক্ট করুন!");
      return;
    }

    try {
      setLoading(true);
      let fileUrl = "";

      if (file) {
        // uploadService-এর মাধ্যমে Firebase Storage-এ ফাইল আপলোড হবে
        fileUrl = await uploadImage(file);
      }

      // postService-এর মাধ্যমে Firestore ডাটাবেজে ডাটা সেভ হবে
      await createPost(auth.currentUser.uid, text, fileUrl, fileType, fileName);

      setText("");
      setFile(null);
      setFileType("");
      setFileName("");
      alert("সফলভাবে আপলোড হয়েছে!");
      if (setPage) setPage("home");
    } catch (err) {
      alert("আপলোড করতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Create New Post / Upload</h2>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="কিছু লিখুন এখানে..."
        style={{ width: "100%", height: "100px", padding: "10px", margin: "10px 0", background: "#161B22", color: "#fff", border: "1px solid #30363D", borderRadius: "6px", resize: "none" }}
      />
      
      {/* ফাইল ইনপুট - এখানে যেকোনো ফাইল (.*) সিলেক্ট করা যাবে */}
      <input
        type="file"
        accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"
        onChange={handleFileChange}
        style={{ margin: "10px 0", display: "block", color: "#8b949e" }}
      />

      {/* 📂 ফাইল সিলেকশনের পর ডাইনামিক প্রিভিউ সিস্টেম */}
      {file && (
        <div style={{ background: "#161B22", padding: "10px", borderRadius: "6px", border: "1px solid #30363D", marginBottom: "15px" }}>
          <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#58A6FF" }}>📎 সিলেক্টেড ফাইল: {fileName}</p>
          
          {fileType === "image" && (
            <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "4px" }} />
          )}
          
          {fileType === "video" && (
            <video src={URL.createObjectURL(file)} controls style={{ width: "100%", maxHeight: "200px", borderRadius: "4px" }} />
          )}
          
          {fileType === "audio" && (
            <audio src={URL.createObjectURL(file)} controls style={{ width: "100%" }} />
          )}

          {(fileType === "pdf" || fileType === "document") && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: "#21262D", borderRadius: "4px" }}>
              <span style={{ fontSize: "24px" }}>📄</span>
              <span style={{ color: "#c9d1d9", fontSize: "14px" }}>{fileType.toUpperCase()} ফাইল আপলোডের জন্য প্রস্তুত</span>
            </div>
          )}
        </div>
      )}

      <button 
        onClick={handleSubmit} 
        disabled={loading} 
        style={{ padding: "10px 20px", background: "#238636", color: "#fff", border: "none", borderRadius: "6px", cursor: loading ? "not-allowed" : "pointer", width: "100%", fontWeight: "bold" }}
      >
        {loading ? "আপলোড হচ্ছে..." : "পাবলিশ করুন"}
      </button>
    </div>
  );
                                                                    }

