import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export async function createStory(uid, media) {
  await addDoc(collection(db, "stories"), {
    uid,
    media,
    createdAt: serverTimestamp(),
    expiresAt: Date.now() + 86400000 // ২৪ ঘণ্টা পর এক্সপায়ার হবে
  });
}
