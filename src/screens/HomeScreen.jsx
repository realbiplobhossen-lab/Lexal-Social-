import React from "react";

export default function HomeScreen({ user, userData, setActiveScreen }) {
  return (
    <div className="home-screen" style={{ textAlign: "center", padding: "20px" }}>
      <h2>স্বাগতম, {userData?.name || user?.email || "ব্যবহারকারী"}!</h2>
      <p>আপনার সোশ্যাল ড্যাশবোর্ড এখন সম্পূর্ণ ডাইনামিক।</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "30px" }}>
        {/* এই বাটনে ক্লিক করলেই এখন সরাসরি চ্যাট ওপেন হবে */}
        <button 
          onClick={() => setActiveScreen("chat")} 
          style={styles.actionBtn}
        >
          💬 বন্ধুদের সাথে চ্যাট করুন
        </button>

        <button 
          onClick={() => setActiveScreen("profile")} 
          style={{ ...styles.actionBtn, backgroundColor: "#6c757d" }}
        >
          👤 প্রোফাইল আপডেট করুন
        </button>
      </div>
    </div>
  );
}

const styles = {
  actionBtn: { padding: "15px", fontSize: "16px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }
};
