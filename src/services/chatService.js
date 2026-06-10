import { collection, addDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase"; // পাথ ফিক্স করা হয়েছে সরাসরি রুটের জন্য

export async function sendMessage(chatId, senderId, text) {
  if (!text.trim()) return;
  await addDoc(collection(db, "messages"), {
    chatId,
    senderId,
    text,
    type: "text",
    status: "sent",
    createdAt: serverTimestamp()
  });
}

// এই ফাংশনটির নাম ChatScreen.js ফাইলের রিকোয়েস্ট অনুযায়ী ফিক্স করা হলো
export function getMessagesQuery(chatId) {
  return query(
    collection(db, "messages"),
    where("chatId", "==", chatId),
    orderBy("createdAt", "asc")
  );
}
