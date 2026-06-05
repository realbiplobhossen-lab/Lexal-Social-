import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import CreatePostScreen from "./screens/CreatePostScreen";
import ProfileScreen from "./screens/ProfileScreen";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import "./styles/global.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [authView, setAuthView] = useState("login"); // 'login' বা 'register' ট্র্যাকিং এর জন্য

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "white" }}>Loading Lexal Social...</div>;
  }

  // ইউজার অথেন্টিকেটেড না থাকলে লগইন অথবা রেজিস্টার স্ক্রিন দেখাবে
  if (!user) {
    return authView === "login" ? (
      <div>
        <LoginScreen setPage={setPage} />
        <p style={{ textAlign: "center", color: "#3b82f6", cursor: "pointer" }} onClick={() => setAuthView("register")}>
          Don't have an account? Register here.
        </p>
      </div>
    ) : (
      <div>
        <RegisterScreen setPage={setPage} />
        <p style={{ textAlign: "center", color: "#3b82f6", cursor: "pointer" }} onClick={() => setAuthView("login")}>
          Already have an account? Login here.
        </p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page">
        {page === "home" && <HomeScreen />}
        {page === "create" && <CreatePostScreen setPage={setPage} />}
        {page === "profile" && <ProfileScreen />}
      </div>
      <BottomNav setPage={setPage} currentPage={page} />
    </>
  );
}
