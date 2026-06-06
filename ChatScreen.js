import React, { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { videoService } from '../services/videoService';

function ChatScreen({ user, userData }) {
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!activeFriend) return;
    const unsub = chatService.listenToChat(user.uid, activeFriend.uid, setMessages);
    return () => unsub();
  }, [activeFriend, user.uid]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    chatService.sendLiveMessage(user.uid, activeFriend.uid, text);
    setText('');
  };

  if (!activeFriend) {
    return (
      <div className="chat-screen">
        <h3>💬 মেসেঞ্জার ইনবক্স</h3>
        {userData?.friends?.length === 0 ? <p style={{ color: '#6B7280' }}>কোনো সক্রিয় বন্ধু পাওয়া যায়নি। সার্চ বার থেকে ফলো করুন।</p> :
          userData?.friends?.map(fUid => (
            <div key={fUid} onClick={() => setActiveFriend({ uid: fUid, fullName: "অনলাইন ব্যবহারকারী" })} className="friend-chat-row">
              <strong>👤 ইউজার ({fUid.substring(0,5)})</strong>
              <span className="online-tag">🟢 অনলাইন</span>
            </div>
          ))
        }
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <strong>{activeFriend.fullName}</strong>
        <div className="call-actions">
          <span onClick={() => videoService.initializeLiveCall(activeFriend.uid)}>📞</span>
          <button onClick={() => setActiveFriend(null)}>Back</button>
        </div>
      </div>
      <div className="chat-messages-area">
        {messages.map((m, i) => (
          <div key={i} className={`msg-bubble ${m.senderUid === user.uid ? 'right' : 'left'}`}>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="chat-input-form">
        <input type="text" value={text} onChange={e=>setText(e.target.value)} placeholder="মেসেজ লিখুন..." />
        <button type="submit">পাঠান</button>
      </form>
    </div>
  );
}
export default ChatScreen;
