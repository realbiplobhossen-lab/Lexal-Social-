import { db } from '../config/firebase';
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';

export const storyService = {
  uploadStory: async (userId, userName, mediaUrl) => {
    await addDoc(collection(db, "stories"), {
      uid: userId,
      author: userName,
      mediaUrl: mediaUrl,
      createdAt: Date.now()
    });
  },
  listenActiveStories: (callback) => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const q = query(collection(db, "stories"), where("createdAt", ">", oneDayAgo));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => d.data()));
    });
  }
};

