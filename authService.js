import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export const authService = {
  login: async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  },
  register: async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userProfile = {
      uid: cred.user.uid,
      fullName: name,
      email: email,
      avatar: "",
      bio: "Lexal Network-এ স্বাগতম!",
      friends: [],
      sentRequests: [],
      receivedRequests: [],
      createdAt: Date.now()
    };
    await setDoc(doc(db, "users", cred.user.uid), userProfile);
    return cred;
  },
  logout: async () => {
    return await signOut(auth);
  },
  listenToAuth: (callback) => {
    return auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
          callback(currentUser, snap.data());
        });
      } else {
        callback(null, null);
      }
    });
  }
};

