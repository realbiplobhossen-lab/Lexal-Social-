import { db } from '../config/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

export const commentService = {
  addComment: async (postId, userId, userName, text) => {
    await addDoc(collection(db, `posts/${postId}/comments`), {
      uid: userId,
      author: userName,
      text: text,
      createdAt: Date.now()
    });
  },
  listenComments: (postId, callback) => {
    const q = query(collection(db, `posts/${postId}/comments`), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => d.data()));
    });
  }
};
