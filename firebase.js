import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// আপনার নিজস্ব Firebase Configuration কনফিগারেশন (গিটহাবে যা দেওয়া আছে)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};

// ইনিশিয়ালাইজেশন
const app = initializeApp(firebaseConfig);

// auth-কে এক্সপোর্ট করা হলো যা App.jsx সরাসরি রুট থেকে রিড করবে
export const auth = getAuth(app);
export default app;
