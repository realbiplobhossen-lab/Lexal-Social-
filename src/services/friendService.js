import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const friendService = {
  // ফ্রেন্ড রিকোয়েস্ট পাঠানো
  sendFriendRequest: async (senderId, receiverId) => {
    if (senderId === receiverId) return;
    const ref = doc(db, "users", receiverId);
    await updateDoc(ref, {
      friendRequests: arrayUnion(senderId)
    });
  },

  // ফ্রেন্ড রিকোয়েস্ট এক্সেপ্ট করা
  acceptFriendRequest: async (userId, targetId) => {
    const userRef = doc(db, "users", userId);
    const targetRef = doc(db, "users", targetId);

    // রিকোয়েস্ট লিস্ট থেকে রিমুভ এবং ফ্রেন্ড লিস্টে অ্যাড
    await updateDoc(userRef, {
      friendRequests: arrayRemove(targetId),
      friends: arrayUnion(targetId)
    });
    await updateDoc(targetRef, {
      friends: arrayUnion(userId)
    });

    // চ্যাট রুমের জন্য আইডি জেনারেট করা
    const chatId = [userId, targetId].sort().join("_");
    await setDoc(doc(db, "chats", chatId), {
      users: [userId, targetId],
      createdAt: Date.now(),
      lastMessage: "You are now friends! Say hi."
    }, { merge: true });
  }
};
