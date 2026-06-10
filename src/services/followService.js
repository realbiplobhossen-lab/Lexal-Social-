import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function followUser(currentUser, targetUser) {
  if (currentUser === targetUser) throw new Error("You cannot follow yourself");
  await addDoc(collection(db, "followers"), {
    follower: currentUser,
    following: targetUser,
    createdAt: serverTimestamp()
  });
}
