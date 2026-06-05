import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export async function addComment(postId, uid, text) {
  if (!text.trim()) return;
  await addDoc(collection(db, "comments"), {
    postId,
    uid,
    text,
    createdAt: serverTimestamp() // প্রোডাকশন রিয়েল-টাইম সোর্টিং এর জন্য serverTimestamp ব্যবহার শ্রেয়
  });
}
