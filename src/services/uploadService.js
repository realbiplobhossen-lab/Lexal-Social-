import { auth, db } from "../config/firebase";
// ফায়ারবেস স্টোরেজ মডিউল ইম্পোর্ট করা হলো (যদি আপনার প্রোজেক্টে স্টোরেজ সেটআপ থাকে)
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

/**
 * যেকোনো ফাইল (Image, Video, Audio, PDF, etc.) Firebase Storage-এ আপলোড করার ইউনিভার্সাল ফাংশন
 * @param {File} file - জাভাস্ক্রিপ্ট ফাইল অবজেক্ট
 * @returns {Promise<string>} - ফাইলের ডাউনলোড ইউআরএল (URL)
 */
export async function uploadImage(file) {
  if (!file) return "";

  try {
    // ফাইল আপলোডের জন্য একটি ইউনিক নাম তৈরি করা হচ্ছে (টাইমস্ট্যাম্প সহ)
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
    
    // ফায়ারবেস স্টোরেজে 'uploads' ফোল্ডারের ভেতর ফাইলটির পাথ সেট করা হলো
    const storageRef = ref(storage, `uploads/${uniqueFileName}`);

    // ফাইলটি আপলোড করা হচ্ছে
    const snapshot = await uploadBytes(storageRef, file);

    // আপলোড হওয়া ফাইলের লাইভ ডাউনলোড লিংক (URL) নেওয়া হচ্ছে
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return downloadUrl;
  } catch (error) {
    console.error("ফাইল আপলোড করতে সমস্যা হয়েছে:", error);
    throw new Error("ফাইল আপলোড ব্যর্থ হয়েছে: " + error.message);
  }
}
