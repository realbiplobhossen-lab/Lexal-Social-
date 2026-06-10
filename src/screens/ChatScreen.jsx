import React, { useState, useEffect, useRef } from "react";
import { db } from "../config/firebase"; 
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

export default function ChatScreen({ user, userData }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messageEndRef = useRef(null);

  // ফায়ারস্টোর থেকে লাইভ (রিয়েল-টাইম) মেসেজ রিড করা
  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = [];
      snapshot.forEach((doc) => {
        msgList.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgList);
      // নতুন মেসেজ এলে অটো-স্ক্রল ডাউন
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe();
  }, []);

  // ফায়ারস্টোরে ডাইনামিক মেসেজ পাঠানো
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
      setText(""); 
    } catch (error) {
      console.error("মেসেজ পাঠানো যায়নি: ", error);
    }
  };

  return (
    <div className="chat-container">
      {/* মেসেজ এরিয়া */}
      <div className="message-area">
        {messages.map((msg) => {
          const isMe = msg.senderId === user.uid;
          return (
            <div 
              key={msg.id} 
              className={`bubble-wrapper ${isMe ? "me" : "others"}`}
            >
              <div className="msg-bubble">
                <small className="sender-name">{msg.senderName}</small>
                <span className="msg-text">{msg.text}</span>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {/* মেসেজ পাঠানোর ইনপুট ফর্ম */}
      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="মেসেজ লিখুন..."
          className="chat-input-field"
        />
        <button type="submit" className="chat-send-btn">পাঠান</button>
      </form>
    </div>
  );
}

