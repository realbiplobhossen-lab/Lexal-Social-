import React, { useState } from "react";
import { loginUser } from "../services/authService";

export default function LoginScreen({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return alert("Fill all fields");
    try {
      setLoading(true);
      await loginUser(email, password);
      alert("Login Success");
      if (setPage) setPage("home"); // হোম পেজে নেভিগেট করবে
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login to Lexal Social</h2>
      <input placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)} style={{ display: "block", margin: "10px 0", padding: "8px" }} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={{ display: "block", margin: "10px 0", padding: "8px" }} />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
