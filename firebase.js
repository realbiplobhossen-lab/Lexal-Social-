import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// আপনার আসল Firebase কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyAG4341Rk7sr1IJkLfVdbDT-oyuCB_GwjA",
  authDomain: "lexal-social.firebaseapp.com",
  projectId: "lexal-social",
  storageBucket: "lexal-social.firebasestorage.app",
  messagingSenderId: "251651994141",
  appId: "1:251651994141:web:9356eb4895de76b7b30cf4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// auth-কে এক্সপোর্ট করা হলো যা App.jsx সরাসরি রুট থেকে রিড করছে
export const auth = getAuth(app);
export default app;
