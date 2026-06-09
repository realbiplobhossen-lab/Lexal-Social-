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
      <header className="top-nav">
        <button onClick={() => setActiveScreen("home")}>
          🏠 হোম
        </button>

        <button onClick={() => setActiveScreen("chat")}>
          💬 মেসেজ
        </button>

        <button onClick={() => setActiveScreen("profile")}>
          👤 প্রোফাইল
        </button>

        <button onClick={() => authService.logout()}>
          🚪 লগআউট
        </button>
      </header>

      {activeScreen === "home" && (
        <HomeScreen
          user={user}
          userData={userData}
        />
      )}

      {activeScreen === "chat" && (
        <ChatScreen
          user={user}
          userData={userData}
        />
      )}

      {activeScreen === "profile" && (
        <ProfileScreen
          user={user}
          userData={userData}
        />
      )}
    </div>
  );
}
