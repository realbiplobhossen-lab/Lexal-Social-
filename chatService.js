import { db } from '../config/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

export const chatService = {
  getRoomId: (uid1, uid2) => (uid1 > uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`),
  
  sendLiveMessage: async (senderId, receiverId, text) => {
    const roomId = chatService.getRoomId(senderId, receiverId);
    await addDoc(collection(db, `chats/${roomId}/messages`), {
      senderUid: senderId,
      text: text,
      createdAt: Date.now()
    });
  },
  listenToChat: (senderId, receiverId, callback) => {
    const roomId = chatService.getRoomId(senderId, receiverId);
    const q = query(collection(db, `chats/${roomId}/messages`), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => d.data()));
    });
  }
};
