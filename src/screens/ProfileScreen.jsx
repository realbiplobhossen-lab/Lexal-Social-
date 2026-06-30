import React, { useState } from "react";
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from "firebase/firestore";
import { uploadImage } from "./services/uploadService";

export default function ProfileScreen({ userData }) {
  const [bio, setBio] = useState(userData?.bio || "");
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadImage(file);
      await updateDoc(doc(db, "users", auth.currentUser.uid), { photoURL: url });
      alert("Profile picture updated successfully!");
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const saveSettings = async () => {
    await updateDoc(doc(db, "users", auth.currentUser.uid), { bio });
    alert("Profile info saved!");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", background: "#161B22", borderRadius: "8px", border: "1px solid #30363D" }}>
      <h2>My Profile</h2>
      <div style={{ position: "relative", display: "inline-block", margin: "15px" }}>
        <img 
          src={userData?.photoURL || "https://via.placeholder.com/150"} 
          alt="Avatar" 
          style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "3px solid #58A6FF" }} 
        />
        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ marginTop: "10px", display: "block" }} />
        {uploading && <p style={{ color: "#58A6FF" }}>Uploading photo...</p>}
      </div>

      <div style={{ marginTop: "20px", textAlign: "left" }}>
        <label style={{ color: "#8b949e" }}>Full Name:</label>
        <p style={{ fontSize: "18px", fontWeight: "bold", margin: "5px 0 15px 0" }}>{userData?.name}</p>

        <label style={{ color: "#8b949e" }}>Email Address:</label>
        <p style={{ fontSize: "16px", margin: "5px 0 15px 0" }}>{userData?.email}</p>

        <label style={{ color: "#8b949e" }}>Account Status:</label>
        <p style={{ color: "#56d364", margin: "5px 0 15px 0" }}>✓ Secure & Active</p>

        <label style={{ color: "#8b949e" }}>Edit Bio:</label>
        <textarea 
          value={bio} 
          onChange={e => setBio(e.target.value)} 
          style={{ width: "100%", height: "60px", background: "#090D13", color: "#fff", border: "1px solid #30363D", padding: "8px", borderRadius: "6px", marginTop: "5px" }}
        />
        <button onClick={saveSettings} style={{ background: "#21262D", color: "#58A6FF", border: "1px solid #30363D", padding: "10px 20px", borderRadius: "6px", marginTop: "10px", width: "100%", cursor: "pointer" }}>
          Save Account Settings
        </button>
      </div>
    </div>
  );
                                }
