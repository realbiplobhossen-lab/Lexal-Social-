import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const reportService = {
  reportContent: async (reporterId, contentType, contentId, reason) => {
    await addDoc(collection(db, "reports"), {
      reporterId,
      contentType, // 'post', 'comment', 'user'
      contentId,
      reason,
      createdAt: Date.now()
    });
    alert("রিপোর্ট জমা নেওয়া হয়েছে। মডারেশন টিম এটি খতিয়ে দেখবে।");
  }
};
