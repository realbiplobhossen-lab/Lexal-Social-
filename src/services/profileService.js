import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const profileService = {
  getProfile: async (userId) => {
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? snap.data() : null;
  },
  updateBio: async (userId, newBio) => {
    await updateDoc(doc(db, "users", userId), { bio: newBio });
  }
};
