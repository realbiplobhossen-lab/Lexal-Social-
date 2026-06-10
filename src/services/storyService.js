import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function createStory(uid, media) {
  await addDoc(collection(db, "stories"), {
    uid,
    media,
    createdAt: serverTimestamp(),
    expiresAt: Date.now() + 86400000
  });
}
