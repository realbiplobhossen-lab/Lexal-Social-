import { db } from '../config/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export const postService = {
  createPost: async (userId, userName, text, mediaUrl = null, mediaType = 'text') => {
    return await addDoc(collection(db, "posts"), {
      uid: userId,
      author: userName,
      content: text,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      createdAt: Date.now(),
      likes: [],
      shares: 0
    });
  },
  getLiveFeed: (callback) => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },
  deletePost: async (postId) => {
    await deleteDoc(doc(db, "posts", postId));
  },
  toggleLike: async (postId, userId, hasLiked) => {
    const ref = doc(db, "posts", postId);
    await updateDoc(ref, { likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId) });
  }
};

