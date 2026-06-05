import { collection, addDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

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

// ChatScreen এ রিয়েল-টাইম লিসেন করার জন্য কুয়েরি ফাংশন
export function getMessages(chatId) {
  return query(
    collection(db, "messages"),
    where("chatId", "==", chatId),
    orderBy("createdAt", "asc")
  );
}
