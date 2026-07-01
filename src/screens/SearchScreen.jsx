import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { db } from '../config/firebase';

export default function SearchScreen({ currentUser, userData }) {
  const [queryText, setQueryText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);

  // 👥 ১. আগত ফ্রেন্ড রিকোয়েস্ট রিয়েল-টাইমে শোনা (Real-time Listener)
  useEffect(() => {
    if (!userData?.friendRequests || userData.friendRequests.length === 0) {
      setIncomingRequests([]);
      return;
    }

    // যারা রিকোয়েস্ট পাঠিয়েছে, ডাটাবেজ থেকে তাদের রিয়েল-টাইম প্রোফাইল নিয়ে আসা
    const q = query(collection(db, "users"), where("uid", "in", userData.friendRequests));
    const unsubscribe = onSnapshot(q, (snap) => {
      setIncomingRequests(snap.docs.map(d => d.data()));
    }, (error) => {
      console.error("রিকোয়েস্ট লোড এরর:", error);
    });

    return () => unsubscribe();
  }, [userData]);

  // 🔍 ২. ইউজার সার্চ করার ফাংশন (আপনার আগের ইনপুট অন-চেঞ্জ লজিক ফিক্সড)
  const handleSearch = async (text) => {
    setQueryText(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    const q = query(
      collection(db, "users"),
      where("name", ">=", text),
      where("name", "<=", text + "\uf8ff")
    );

    try {
      const snap = await getDocs(q);
      // সার্চ রেজাল্ট থেকে নিজের আইডি বাদ দিয়ে ফিল্টার করা
      const filtered = snap.docs
        .map(d => d.data())
        .filter(u => u.uid !== currentUser.uid);
      setSearchResults(filtered);
    } catch (err) {
      console.error("সার্চ এরর:", err);
    }
  };

  // ➕ ৩. রিয়েল-টাইম ফ্রেন্ড রিকোয়েস্ট পাঠানোর লজিক
  const handleSendRequest = async (targetUid) => {
    try {
      const targetUserRef = doc(db, "users", targetUid);
      // সামনের ইউজারের friendRequests অ্যারেলিস্টে আমার UID পুশ হবে
      await updateDoc(targetUserRef, {
        friendRequests: arrayUnion(currentUser.uid)
      });
      alert("ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে!");
      handleSearch(queryText); // লিস্ট রিফ্রেশ
    } catch (error) {
      alert("অনুরোধ ব্যর্থ হয়েছে: " + error.message);
    }
  };

  // ✅ ৪. রিকোয়েস্ট এক্সেপ্ট করার লজিক (উভয় প্রোফাইলে ফ্রেন্ডলিস্ট কানেক্ট হবে)
  const handleAcceptRequest = async (senderUid) => {
    try {
      const myUserRef = doc(db, "users", currentUser.uid);
      const senderUserRef = doc(db, "users", senderUid);

      // ক) আমার অ্যাকাউন্ট থেকে রিকোয়েস্ট রিমুভ হবে এবং ফ্রেন্ড লিস্টে অ্যাড হবে
      await updateDoc(myUserRef, {
        friendRequests: arrayRemove(senderUid),
        friends: arrayUnion(senderUid)
      });

      // খ) অপর প্রান্তের ইউজারের ফ্রেন্ড লিস্টেও আমার UID অ্যাড হবে
      await updateDoc(senderUserRef, {
        friends: arrayUnion(currentUser.uid)
      });

      alert("আপনারা এখন বন্ধু!");
    } catch (error) {
      alert("এক্সেপ্ট করা যায়নি: " + error.message);
    }
  };

  return (
    <div style={{ padding: "10px", fontFamily: "sans-serif" }}>
      
      {/* 📥 ফ্রেন্ড রিকোয়েস্ট রিসিভ উইন্ডো */}
      {incomingRequests.length > 0 && (
        <div style={{ background: "#161B22", padding: "15px", borderRadius: "8px", marginBottom: "15px", border: "1px solid #30363D" }}>
          <h3 style={{ color: "#58A6FF", marginTop: 0, fontSize: "16px" }}>Friend Requests</h3>
          {incomingRequests.map(user => (
            <div key={user.uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #21262D" }}>
              <span style={{ color: "#E6EDF3", fontSize: "14px" }}>👤 {user.name}</span>
              <button 
                onClick={() => handleAcceptRequest(user.uid)}
                style={{ background: "#238636", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🔍 সার্চ বার এরিয়া */}
      <h2 style={{ color: "#E6EDF3", fontSize: "20px", marginBottom: "15px" }}>Find People</h2>
      <input
        placeholder="Type a friend's name..."
        value={queryText}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ padding: "12px", width: "100%", background: "#161B22", color: "#fff", border: "1px solid #30363D", borderRadius: "6px", marginBottom: "15px", boxSizing: "border-box" }}
      />

      {/* 📋 সার্চ রেজাল্ট ভিউ */}
      <div className="results">
        {searchResults.map(user => {
          const isFriend = userData?.friends?.includes(user.uid);
          const isRequested = user.friendRequests?.includes(currentUser.uid);

          return (
            <div key={user.uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderBottom: "1px solid #30363D", background: "#090D13" }}>
              <div>
                <strong style={{ display: "block", color: "#E6EDF3" }}>{user.name}</strong>
                <span style={{ fontSize: "12px", color: "#8b949e" }}>{user.bio || "No bio available"}</span>
              </div>
              
              {isFriend ? (
                <span style={{ color: "#58A6FF", fontSize: "14px" }}>✓ Friend</span>
              ) : (
                <button
                  disabled={isRequested}
                  onClick={() => handleSendRequest(user.uid)}
                  style={{ 
                    background: "#21262D", 
                    color: isRequested ? "#8b949e" : "#58A6FF", 
                    border: "1px solid #30363D", 
                    padding: "6px 12px", 
                    borderRadius: "4px",
                    cursor: isRequested ? "default" : "pointer" 
                  }}
                >
                  {isRequested ? "Requested" : "Add Friend"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
                      }
      
