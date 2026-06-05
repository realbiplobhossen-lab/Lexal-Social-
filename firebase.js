import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 👈 ফায়ারস্টোর ইমপোর্ট করা হলো

const firebaseConfig = {
  apiKey: "AIzaSyAG4341Rk7sr1IJkLfVdbDT-oyuCB_GwjA",
  authDomain: "lexal-social.firebaseapp.com",
  projectId: "lexal-social",
  storageBucket: "lexal-social.firebasestorage.app",
  messagingSenderId: "251651994141",
  appId: "1:251651994141:web:9356eb4895de76b7b30cf4"
};

// ফায়ারবেস অ্যাপ ইনিশিয়ালাইজ করা হলো
const app = initializeApp(firebaseConfig);

// অথেনটিকেশন এবং ফায়ারস্টোর ডাটাবেজ অবজেক্ট তৈরি ও এক্সপোর্ট
export const auth = getAuth(app);
export const db = getFirestore(app); // 👈 এই লাইনটিই গিটহাব খুঁজছে এবং এর ফিক্স

export default app;
