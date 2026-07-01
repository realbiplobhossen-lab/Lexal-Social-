import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// পাথ পরিবর্তন করে সঠিক config ফোল্ডারের সাথে লিংক করা হলো
import { db } from "../config/firebase"; 

export async function createPost(uid, text, imageUrl, fileType = "image", fileName = "") {
  await addDoc(collection(db, "posts"), {
    uid,
    text,
    imageUrl, // সব ধরনের ফাইলের লিঙ্ক এই ফিল্ডেই সেভ হবে
    mediaType: fileType, // এটি 'image', 'video', 'audio', নাকি 'pdf' তা ট্র্যাক করবে
    mediaName: fileName, // ফাইলের নাম (যেমন: assignment.pdf) সেভ রাখবে
    likes: 0,
    comments: 0,
    hidden: false,
    moderated: false,
    createdAt: serverTimestamp()
  });
}

