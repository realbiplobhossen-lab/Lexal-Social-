import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function createPost(uid, text, imageUrl) {
  await addDoc(collection(db, "posts"), {
    uid,
    text,
    imageUrl,
    likes: 0,
    comments: 0,
    hidden: false,
    moderated: false,
    createdAt: serverTimestamp()
  });
}
