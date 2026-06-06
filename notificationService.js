import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';

export const notificationService = {
  listenNotifications: (userId, callback) => {
    const q = query(collection(db, `users/${userId}/notifications`), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },
  markAsRead: async (userId, notifId) => {
    await updateDoc(doc(db, `users/${userId}/notifications`, notifId), { status: "read" });
  }
};
