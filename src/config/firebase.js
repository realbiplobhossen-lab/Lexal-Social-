import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// নতুন ফিচার (ইমেজ, ভিডিও, অডিও আপলোড) সচল করার জন্য স্টোরেজ ইম্পোর্ট করা হলো
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAG4341Rk7sr1IJkLfVdbDT-oyuCB_GwjA",
  authDomain: "lexal-social.firebaseapp.com",
  projectId: "lexal-social",
  storageBucket: "lexal-social.firebasestorage.app",
  messagingSenderId: "251651994141",
  appId: "1:251651994141:web:9356eb4895de76b7b30cf4"
};

// ফায়ারবেস অ্যাপ ইনিশিয়ালাইজ করা হলো
const app = initializeApp(firebaseConfig);

// সব মডিউল এক্সপোর্ট করা হলো যেন অ্যাপের অন্যান্য সার্ভিস এগুলো ব্যবহার করতে পারে
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // এই লাইনটি আপনার আপলোড ফিচার সচল করবে

export default app;

