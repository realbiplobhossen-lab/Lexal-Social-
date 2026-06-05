import React, { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { auth } from "../config/firebase";
import { sendMessage, getMessagesQuery } from "../services/chatService";

export default function ChatScreen({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!chatId) return;

    // getMessagesQuery আপনার চ্যাট সার্ভিস থেকে কুয়েরি অবজেক্ট নিয়ে আসবে
    const unsubscribe = onSnapshot(
      getMessagesQuery(chatId),
      (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error("Chat error:", error)
    );

    return () => unsubscribe();
  }, [chatId]);

  const submit = async () => {
    if (!text.trim()) return;
    if (!auth.currentUser) return alert("Not Authenticated");

    try {
      await sendMessage(chatId, auth.currentUser.uid, text.trim());
      setText("");
    } catch (err) {
      alert("Failed to send: " + err.message);
    }
  };

  return (
    <div className="chat-screen" style={{ padding: "20px" }}>
      <div className="messages-list" style={{ height: "70vh", overflowY: "auto", marginBottom: "20px" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ margin: "5px 0", textAlign: msg.senderId === auth.currentUser?.uid ? "right" : "left" }}>
            <span style={{ fontSize: "12px", color: "#666" }}>{msg.senderName || msg.senderId}</span>
            <p style={{ background: "#f1f1f1", padding: "8px", borderRadius: "8px", display: "inline-block", margin: "2px 0" }}>
              {msg.text}
            </p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "10px" }}
        />
        <button onClick={submit} style={{ padding: "10px 20px" }}>Send</button>
      </div>
    </div>
  );
}
