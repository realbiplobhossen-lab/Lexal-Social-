import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, onSnapshot } from "firebase/firestore";
import { auth, db } from '../config/firebase';
import { friendService } from "./services/friendService";

export default function SearchScreen({ currentUser, userData }) {
  const [queryText, setQueryText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);

  // ফ্রেন্ড রিকোয়েস্ট লিসেনার
  useEffect(() => {
    if (!userData?.friendRequests || userData.friendRequests.length === 0) {
      setIncomingRequests([]);
      return;
    }
    const q = query(collection(db, "users"), where("uid", "in", userData.friendRequests));
    getDocs(q).then(snap => {
      setIncomingRequests(snap.docs.map(d => d.data()));
    });
  }, [userData]);

  const handleSearch = async (text) => {
    setQueryText(text);
    if (!text.trim()) return setSearchResults([]);

    const q = query(
      collection(db, "users"),
      where("name", ">=", text),
      where("name", "<=", text + "\uf8ff")
    );
    const snap = await getDocs(q);
    setSearchResults(snap.docs.map(d => d.data()).filter(u => u.uid !== currentUser.uid));
  };

  return (
    <div style={{ padding: "10px" }}>
      {/* আগত ফ্রেন্ড রিকোয়েস্ট */}
      {incomingRequests.length > 0 && (
        <div style={{ background: "#161B22", padding: "15px", borderRadius: "8px", marginBottom: "15px", border: "1px solid #30363D" }}>
          <h3 style={{ color: "#58A6FF", marginTop: 0 }}>Friend Requests</h3>
          {incomingRequests.map(user => (
            <div key={user.uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <span>👤 {user.name}</span>
              <button 
                onClick={() => friendService.acceptFriendRequest(currentUser.uid, user.uid)}
                style={{ background: "#238636", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* সার্চ বার */}
      <h2>Find People</h2>
      <input
        placeholder="Type a friend's name..."
        value={queryText}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ padding: "12px", width: "100%", background: "#161B22", color: "#fff", border: "1px solid #30363D", borderRadius: "6px", marginBottom: "15px" }}
      />

      <div className="results">
        {searchResults.map(user => {
          const isFriend = userData?.friends?.includes(user.uid);
          const isRequested = user.friendRequests?.includes(currentUser.uid);

          return (
            <div key={user.uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderBottom: "1px solid #30363D" }}>
              <div>
                <strong style={{ display: "block" }}>{user.name}</strong>
                <span style={{ fontSize: "12px", color: "#8b949e" }}>{user.bio}</span>
              </div>
              {isFriend ? (
                <span style={{ color: "#58A6FF" }}>✓ Friend</span>
              ) : (
                <button
                  disabled={isRequested}
                  onClick={() => friendService.sendFriendRequest(currentUser.uid, user.uid)}
                  style={{ background: isRequested ? "#21262D" : "#21262D", color: "#58A6FF", border: "1px solid #30363D", padding: "6px 12px", borderRadius: "4px" }}
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

