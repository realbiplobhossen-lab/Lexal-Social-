import React, { useState } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../config/firebase";

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
      // পারফরম্যান্স ও কস্ট বাঁচানোর জন্য সরাসরি ফায়ারস্টোর কুয়েরি ও লিমিট ব্যবহার করা হয়েছে
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
        style={{ padding: "10px", width: "100%", marginBottom: "15px" }}
      />
      {loading && <p>Searching...</p>}
      <div className="search-results">
        {users.map(user => (
          <div key={user.uid} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
            <strong>{user.name}</strong>
          </div>
        ))}
        {!loading && users.length === 0 && <p>No users found</p>}
      </div>
    </div>
  );
}
