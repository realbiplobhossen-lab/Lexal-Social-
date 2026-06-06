import { db } from '../config/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export const presenceService = {
  setOnline: async (userId) => {
    await setDoc(doc(db, "presence", userId), { status: "online", lastChanged: Date.now() }, { merge: true });
  },
  listenStatus: (userId, callback) => {
    return onSnapshot(doc(db, "presence", userId), (snap) => {
      callback(snap.exists() ? snap.data().status : "offline");
    });
  }
};
