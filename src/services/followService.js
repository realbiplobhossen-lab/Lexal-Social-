import { db } from '../config/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, addDoc, collection } from 'firebase/firestore';

export const followService = {
  sendRequest: async (myUid, myName, targetUid) => {
    await updateDoc(doc(db, "users", myUid), { sentRequests: arrayUnion(targetUid) });
    await updateDoc(doc(db, "users", targetUid), { receivedRequests: arrayUnion(myUid) });
    
    await addDoc(collection(db, `users/${targetUid}/notifications`), {
      senderUid: myUid,
      senderName: myName,
      type: "friend_request",
      message: `${myName} আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছেন।`,
      createdAt: Date.now(),
      status: "unread"
    });
  },
  acceptRequest: async (myUid, targetUid) => {
    await updateDoc(doc(db, "users", myUid), { friends: arrayUnion(targetUid), receivedRequests: arrayRemove(targetUid) });
    await updateDoc(doc(db, "users", targetUid), { friends: arrayUnion(myUid), sentRequests: arrayRemove(myUid) });
  }
};

