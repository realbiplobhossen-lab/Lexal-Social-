import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from '../config/firebase';
import { sendMessage, getMessagesQuery } from "./services/chatService";

export default function ChatScreen({ chatId, setActiveChatId, currentUser }) {
  const [activeTabChatId, setActiveTabChatId] = useState(chatId);
  const [myChats, setMyChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // ইউজারের অ্যাক্টিভ চ্যাট লিস্ট লোড করা
  useEffect(() => {
    const q = query(collection(db, "chats"), where("users", "arrayContains", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMyChats(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [currentUser]);

  // মেসেজ রিয়েল-টাইম লোড করা
  useEffect(() => {
    if (!activeTabChatId) return;
    const unsubscribe = onSnapshot(getMessagesQuery(activeTabChatId), (snapshot) => {
      const msgList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgList);
    });
    return () => unsubscribe();
  }, [activeTabChatId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(activeTabChatId, currentUser.uid, text.trim());
    setText("");
  };

  const startCall = (type) => {
    alert(`${type === 'video' ? '📹 ভিডিও' : '📞 অডিও'} কল ফিচারটি সচল হচ্ছে... চ্যানেল আইডি: ${activeTabChatId}`);
    // এখানে Agora RTC ক্লায়েন্ট ট্রিগার হবে
  };

  if (!activeTabChatId) {
    return (
      <div>
        <h3>My Inbox</h3>
        {myChats.length === 0 ? <p>No active chats. Add friends to start chatting!</p> : 
          myChats.map(c => (
            <div key={c.id} onClick={() => { setActiveTabChatId(c.id); setActiveChatId(c.id); }} style={{ padding: "15px", background: "#161B22", border: "1px solid #30363D", borderRadius: "8px", marginBottom: "10px", cursor: "pointer" }}>
              <strong>💬 Chat Room: {c.id.replace(currentUser.uid, "").replace("_", "")}</strong>
              <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#8b949e" }}>{c.lastMessage}</p>
            </div>
          ))
        }
      </div>
    );
  }

  return (
    <div style={{ background: "#090D13", height: "75vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", background: "#161B22", padding: "10px", borderBottom: "1px solid #30363D" }}>
        <button onClick={() => { setActiveTabChatId(null); setActiveChatId(null); }} style={{ background: "none", color: "#58A6FF", border: "none" }}>← Back</button>
        <div>
          <button onClick={() => startCall('audio')} style={{ background: "none", fontSize: "20px", marginRight: "15px", border: "none", cursor: "pointer" }}>📞</button>
          <button onClick={() => startCall('video')} style={{ background: "none", fontSize: "20px", border: "none", cursor: "pointer" }}>📹</button>
        </div>
      </div>

      {/* মেসেজ লিস্ট */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ textAlign: msg.senderId === currentUser.uid ? "right" : "left", margin: "8px 0" }}>
            <p style={{ background: msg.senderId === currentUser.uid ? "#1f6feb" : "#21262D", display: "inline-block", padding: "10px", borderRadius: "10px", margin: 0 }}>
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      {/* মেসেজ ইনপুট বার */}
      <div style={{ display: "flex", padding: "10px", background: "#161B22" }}>
        <input 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Write a message..." 
          style={{ flex: 1, padding: "10px", background: "#090D13", color: "#fff", border: "1px solid #30363D", borderRadius: "4px" }}
        />
        <button onClick={handleSend} style={{ background: "#238636", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "4px", marginLeft: "5px" }}>Send</button>
      </div>
    </div>
  );
}
