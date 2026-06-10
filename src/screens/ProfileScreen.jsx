import React from "react";
import { auth } from "./firebase";

export default function ProfileScreen() {
  const user = auth.currentUser;

  return (
    <div className="page" style={{ padding: "20px", background: "#161B22", borderRadius: "8px" }}>
      <h2>My Profile</h2>
      <div style={{ margin: "15px 0" }}>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>User ID:</strong> {user?.uid}</p>
      </div>
    </div>
  );
}

