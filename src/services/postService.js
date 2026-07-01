import { collection, addDoc, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase"; 

// ১. পোস্ট তৈরি করার ফাংশন
export async function createPost(uid, text, imageUrl, fileType = "image", fileName = "") {
  await addDoc(collection(db, "posts"), {
    uid,
    text,
    imageUrl, 
    mediaType: fileType, 
    mediaName: fileName, 
    likes: [], // এখানে সংখ্যা ০ এর বদলে অ্যারে [] ব্যবহার করা হলো যাতে ইউজার আইডি ট্র্যাক করা যায়
    comments: 0,
    hidden: false,
    moderated: false,
    createdAt: serverTimestamp()
  });
}

// ২. পোস্ট মুছে ফেলার ফাংশন (যা PostCard-এ কল করা হয়েছে)
export async function deletePost(postId) {
  try {
    await deleteDoc(doc(db, "posts", postId));
    alert("পোস্টটি সফলভাবে মুছে ফেলা হয়েছে!");
    window.location.reload(); // স্ক্রিন রিফ্রেশ করে পোস্টটি সরিয়ে দেওয়ার জন্য
  } catch (error) {
    console.error("Error deleting post:", error);
  }
}

// ৩. লাইক দেওয়া বা তুলে নেওয়ার ফাংশn (যা PostCard-এ কল করা হয়েছে)
export async function toggleLike(postId, uid, hasLiked) {
  const postRef = doc(db, "posts", postId);
  try {
    await updateDoc(postRef, {
      likes: hasLiked ? arrayRemove(uid) : arrayUnion(uid)
    });
  } catch (error) {
    console.error("Error toggling like:", error);
  }
}

