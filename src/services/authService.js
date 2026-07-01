import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// ১. লগইন ফাংশন (যা LoginScreen-এ "login" নামে খোঁজা হচ্ছে)
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

// ২. রেজিস্ট্রেশন ফাংশন (যা RegisterScreen-এ ব্যবহার করা হবে)
export async function register(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firestore-এ ইউজারের ডাটাবেজ প্রোফাইল তৈরি
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      username: username,
      email: email,
      createdAt: new Date().toISOString()
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
