import React, { useState } from "react";
import { registerUser } from "../services/authService";

export default function RegisterScreen({ setPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return alert("Fill all fields");
    try {
      setLoading(true);
      await registerUser(name, email, password);
      alert("Registration Success");
      if (setPage) setPage("home");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Account</h2>
      <input placeholder="Name" onChange={(e) => setName(e.target.value)} style={{ display: "block", margin: "10px 0", padding: "8px" }} />
      <input placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)} style={{ display: "block", margin: "10px 0", padding: "8px" }} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={{ display: "block", margin: "10px 0", padding: "8px" }} />
      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}
