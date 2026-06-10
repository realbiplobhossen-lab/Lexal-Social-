import React from "react";

export default function HomeScreen({ user, userData, setActiveScreen }) {
  return (
    <div className="home-screen">
      <h2>স্বাগতম, {userData?.name || user?.email || "ব্যবহারকারী"}!</h2>
      <p>আপনার সোশ্যাল ড্যাশবোর্ড এখন সম্পূর্ণ ডাইনামিক।</p>

      <div className="button-group">
        {/* এই বাটনে ক্লিক করলে ডিজাইন ঠিক রেখে সরাসরি চ্যাট স্ক্রিন ওপেন হবে */}
        <button 
          onClick={() => setActiveScreen("chat")} 
          className="action-btn chat-btn"
        >
          💬 বন্ধুদের সাথে চ্যাট করুন
        </button>

        {/* এই বাটনে ক্লিক করলে প্রোফাইল স্ক্রিন ওপেন হবে */}
        <button 
          onClick={() => setActiveScreen("profile")} 
          className="action-btn profile-btn"
        >
          👤 প্রোফাইল আপডেট করুন
        </button>
      </div>
    </div>
  );
}
