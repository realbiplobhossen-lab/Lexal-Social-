import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAG4341Rk7sr1IJkLfVdbDT-oyuCB_GwjA",
  authDomain: "lexal-social.firebaseapp.com",
  projectId: "lexal-social",
  storageBucket: "lexal-social.firebasestorage.app",
  messagingSenderId: "251651994141",
  appId: "1:251651994141:web:9356eb4895de76b7b30cf4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
