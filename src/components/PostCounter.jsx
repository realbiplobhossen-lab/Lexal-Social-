import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./firebase";

export default function PostCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "posts"), where("hidden", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  return <h3 style={{ padding: "10px", background: "#161B22", borderRadius: "6px" }}>Total Active Posts: {count}</h3>;
}
