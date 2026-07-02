import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// ইমেইল নাকি ফোন নাম্বার তা নিখুঁতভাবে যাচাই ও রূপান্তর করার হেল্পার ফাংশন
function formatContactInput(input) {
  const cleanInput = input.trim();
  // যদি ইনপুটটিতে শুধু সংখ্যা থাকে অথবা প্লাস (+) চিহ্ন ও সংখ্যা থাকে (যেমন মোবাইল নাম্বার)
  const isPhoneNumber = /^[\+]?[(]?[0-9]{3}[)]?[-s\.]?[0-9]{3}[-s\.]?[0-9]{4,6}$/im.test(cleanInput) || /^\d+$/.test(cleanInput);
  
  if (isPhoneNumber) {
    // ফায়ারবেস অথেনটিকেশনকে শান্ত রাখার জন্য একটি ভার্চুয়াল ইমেইল ফরম্যাট তৈরি
    return `${cleanInput.replace('+', '')}@lexalspace.com`;
  }
  return cleanInput; // যদি ইমেইল হয় তবে সরাসরি ইমেইলই রিটার্ন করবে
}

// ১. লগইন ফাংশন (মোবাইল বা ইমেইল উভয়ই পারফেক্টলি ডিটেক্ট করবে)
export async function login(contactInput, password) {
  try {
    const formattedEmail = formatContactInput(contactInput);
    const userCredential = await signInWithEmailAndPassword(auth, formattedEmail, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

// ২. প্রিমিয়াম রেজিস্ট্রেশন ফাংশন (invalid-email এরর ফিক্সড)
export async function register(contactInput, password, fullName, additionalProfileData = {}) {
  try {
    // 🛠️ এখানে ফিক্স করা হয়েছে: ইনপুটটিকে ফায়ারবেস ফ্রেন্ডলি ইমেইল ফরম্যাটে কনভার্ট করা হলো
    const formattedEmail = formatContactInput(contactInput);
    
    // এখন ফায়ারবেস এটিকে একটি বৈধ ইমেইল মনে করে অ্যাকাউন্ট তৈরি করতে দেবে, কোনো এরর আসবে না
    const userCredential = await createUserWithEmailAndPassword(auth, formattedEmail, password);
    const user = userCredential.user;

    // ইউজার আসলে ফোন নাম্বার দিয়েছে নাকি ইমেইল দিয়েছে তা আলাদা করে ডাটাবেজে রাখার লজিক
    const isPhoneNumber = /^\d+$/.test(contactInput.trim()) || contactInput.trim().startsWith('+');

    // Firestore-এ ইউজারের ডাটাবেজ প্রোফাইল তৈরি
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      username: fullName,
      email: isPhoneNumber ? "" : contactInput.trim(),
      phoneNumber: isPhoneNumber ? contactInput.trim() : "",
      country: additionalProfileData.country || "Bangladesh",
      hometown: additionalProfileData.hometown || "",
      currentCity: additionalProfileData.currentCity || "",
      dob: additionalProfileData.dob || "",
      gender: additionalProfileData.gender || "",
      createdAt: new Date().toISOString(),
      avatarUrl: "", 
      bio: "Welcome to my LexalSpace profile! 🌎"
    });

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

// ৩. লগআউট ফাংশন
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
}
