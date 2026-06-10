import React, { useEffect, useState } from "react";

import HomeScreen from "./screens/HomeScreen";
import ChatScreen from "./screens/ChatScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

import { authService } from "./services/authService";
import { auth, db } from "./config/firebase";

export { auth, db };

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const [authView, setAuthView] = useState("login");
  const [activeScreen, setActiveScreen] = useState("home");

  useEffect(() => {
    const unsub = authService.listenToAuth((firebaseUser, profile) => {
      setUser(firebaseUser);
      setUserData(profile);
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  if (!user) {
    return authView === "login" ? (
      <LoginScreen setAuthView={setAuthView} />
    ) : (
      <RegisterScreen setAuthView={setAuthView} />
    );
  }

  return (
    <div className="app-container">
      {/* টপ ন্যাভিগেশন বার */}
      <header className="top-nav" style={styles.topNav}>
        <button 
          onClick={() => setActiveScreen("home")} 
          style={{...styles.navBtn, fontWeight: activeScreen === "home" ? "bold" : "normal"}}
        >
          🏠 হোম
        </button>

        <button 
          onClick={() => setActiveScreen("chat")} 
          style={{...styles.navBtn, fontWeight: activeScreen === "chat" ? "bold" : "normal"}}
        >
          💬 মেসেজ
        </button>

        <button 
          onClick={() => setActiveScreen("profile")} 
          style={{...styles.navBtn, fontWeight: activeScreen === "profile" ? "bold" : "normal"}}
        >
          👤 প্রোফাইল
        </button>

        <button onClick={() => authService.logout()} style={styles.logoutBtn}>
          🚪 লগআউট
        </button>
      </header>

      {/* স্ক্রিনগুলো লোড করা এবং নেভিগেশন কন্ট্রোল পাঠানো */}
      <main className="main-content" style={styles.mainContent}>
        {activeScreen === "home" && (
          <HomeScreen
            user={user}
            userData={userData}
            setActiveScreen={setActiveScreen} // হোম স্ক্রিন থেকে অন্য স্ক্রিনে যাওয়ার জন্য
          />
        )}

        {activeScreen === "chat" && (
          <ChatScreen
            user={user}
            userData={userData}
            setActiveScreen={setActiveScreen}
          />
        )}

        {activeScreen === "profile" && (
          <ProfileScreen
            user={user}
            userData={userData}
            setActiveScreen={setActiveScreen}
          />
        )}
      </main>
    </div>
  );
}

// সাধারণ মোবাইল ফ্রেন্ডলি ইনলাইন স্টাইল (আপনার অ্যাপের UI সুন্দর রাখার জন্য)
const styles = {
  topNav: { display: "flex", justifyContent: "space-around", padding: "12px", backgroundColor: "#fff", borderBottom: "1px solid #ddd", position: "sticky", top: 0, zIndex: 100 },
  navBtn: { border: "none", backgroundColor: "transparent", fontSize: "16px", cursor: "pointer" },
  logoutBtn: { border: "none", backgroundColor: "transparent", fontSize: "16px", color: "#ff4d4d", cursor: "pointer" },
  mainContent: { padding: "15px", minHeight: "calc(100vh - 60px)" }
};
