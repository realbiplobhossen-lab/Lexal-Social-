import React from "react";
import Feed from "./Feed";

export default function HomeScreen() {
  return (
    <div style={{ paddingBottom: "20px" }}>
      <h2 style={{ color: "#58A6FF" }}>Recent Feed</h2>
      <Feed />
    </div>
  );
}
