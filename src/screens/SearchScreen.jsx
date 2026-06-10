import React, { useState } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "./firebase";

export default function SearchScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (text) => {
    const searchText = text.trim();
    if (!searchText) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, "users"),
        where("name", ">=", searchText),
        where("name", "<=", searchText + "\uf8ff"),
        limit(10)
      );

      const snapshot = await getDocs(q);
      setUsers(snapshot.docs.map(d => d.data()));
    } catch (err) {
      console.error("Search error: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Search Users</h2>
      <input
        placeholder="Search User by name..."
        onChange={(e) => search(e.target.value)}
        style={{ padding: "12px", width: "100%", marginBottom: "15px", background: "#161B22", color: "#fff", border: "1px solid #30363D", borderRadius: "6px" }}
      />
      {loading && <p>Searching...</p>}
      <div className="search-results">
        {users.map(user => (
          <div key={user.uid} style={{ padding: "10px", borderBottom: "1px solid #30363D", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{user.name}</span>
            <span style={{ fontSize: "12px", color: "#8b949e" }}>{user.email}</span>
          </div>
        ))}
        {users.length === 0 && !loading && <p style={{ color: "#8b949e" }}>No users found.</p>}
      </div>
    </div>
  );
}

