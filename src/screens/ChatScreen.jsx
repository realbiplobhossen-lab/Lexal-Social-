import React, { useState, useEffect, useRef } from "react";
import { db } from "../config/firebase"; // ফায়ারবেস কানেকশন
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

export default function ChatScreen({ user, userData }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messageEndRef = useRef(null);

  // ১. ফায়ারস্টোর থেকে রিয়েল-টাইমে লাইভ মেসেজ রিড করা
  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = [];
      snapshot.forEach((doc) => {
        msgList.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgList);
      // নতুন মেসেজ আসলে স্বয়ংক্রিয়ভাবে স্ক্রল নিচে নেমে যাবে
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe();
  }, []);

  // ২. ফায়ারস্টোরে ডাইনামিকালি মেসেজ পাঠানো
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, "chats"), {
        text: text,
        senderId: user.uid,
        senderName: userData?.name || user.email,
        timestamp: serverTimestamp()
      });
      setText(""); // ইনপুট বক্স রিফ্রেশ করা
    } catch (error) {
      console.error("মেসেজ পাঠানো যায়নি: ", error);
    }
  };

  return (
    <div className="chat-screen" style={styles.chatContainer}>
      {/* মেসেজ প্রদর্শনের জায়গা */}
      <div style={styles.messageArea}>
        {messages.map((msg) => {
          const isMe = msg.senderId === user.uid;
          return (
            <div 
              key={msg.id} 
              style={{
                ...styles.bubbleContainer,
                justifyContent: isMe ? "flex-end" : "flex-start"
              }}
            >
              <div style={{
                ...styles.msgBubble,
                backgroundColor: isMe ? "#007bff" : "#e4e6eb",
                color: isMe ? "#fff" : "#000",
              }}>
                <small style={{ fontSize: "10px", display: "block", opacity: 0.8 }}>
                  {msg.senderName}
                </small>
                <span>{msg.text}</span>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {/* মেসেজ ইনপুট ফর্ম */}
      <form onSubmit={handleSend} style={styles.inputForm}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="মেসেজ লিখুন..."
          style={styles.inputBox}
        />
        <button type="submit" style={styles.sendButton}>পাঠান</button>
      </form>
    </div>
  );
}

const styles = {
  chatContainer: { display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" },
  messageArea: { flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "10px" },
  bubbleContainer: { display: "flex", width: "100%" },
  msgBubble: { padding: "10px 14px", borderRadius: "15px", maxWidth: "75%", wordBreak: "break-word" },
  inputForm: { display: "flex", padding: "10px", borderTop: "1px solid #ddd", backgroundColor: "#fff" },
  inputBox: { flex: 1, padding: "12px", borderRadius: "20px", border: "1px solid #ccc", marginRight: "8px", fontSize: "16px" },
  sendButton: { padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer" }
};
        
