import React from "react";
// পাথ সংশোধন করে components ফোল্ডারের সাথে লিংক করা হলো
import Feed from "../components/Feed"; 

export default function HomeScreen() {
  return (
    <div style={{ paddingBottom: "20px" }}>
      <h2 style={{ color: "#58A6FF" }}>Recent Feed</h2>
      <Feed />
    </div>
  );
}
