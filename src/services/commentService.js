import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../config/firebase';

export async function addComment(postId, uid, text) {
  if (!text.trim()) return;
  await addDoc(collection(db, "comments"), {
    postId,
    uid,
    text,
    createdAt: serverTimestamp()
  });
}
