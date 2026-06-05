import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export async function createPost(uid, text, imageUrl) {
  await addDoc(collection(db, "posts"), {
    uid,
    text,
    imageUrl, // ১ম ধাপের Feed ও PostCard এর সাথে মিল রেখে 'imageUrl' করা হলো
    likes: 0,
    comments: 0,
    hidden: false, // ক্লাউড ফাংশন মডারেশনের জন্য ডিফল্ট ভ্যালু আবশ্যক
    moderated: false,
    createdAt: serverTimestamp()
  });
}
