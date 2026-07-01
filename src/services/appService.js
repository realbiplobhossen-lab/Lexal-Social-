import { db, storage } from "../config/firebase";
import { 
  collection, addDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, 
  serverTimestamp, query, orderBy, onSnapshot, setDoc, getDoc 
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// ১. প্রোগ্রেস বারসহ ইউনিভার্সাল ফাইল আপলোডার (ইমেজ, ভিডিও, অডিও, পিডিএফ)
export function uploadFileWithProgress(file, onProgress, onSuccess, onError) {
  if (!file) return;
  const fileExtension = file.name.split('.').pop();
  const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
  const storageRef = ref(storage, `lexal_media/${uniqueName}`);
  
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(Math.round(progress));
    }, 
    (error) => { onError(error); }, 
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      onSuccess(downloadURL);
    }
  );
}

// ২. রিয়েল-টাইম পোস্ট তৈরি
export async function createPost(uid, username, userDoc, text, mediaUrl, mediaType, mediaName) {
  await addDoc(collection(db, "posts"), {
    uid,
    author: username,
    authorAvatar: userDoc?.avatar || "",
    content: text,
    mediaUrl: mediaUrl || "",
    mediaType: mediaType || "",
    mediaName: mediaName || "",
    likes: [],
    shares: 0,
    createdAt: serverTimestamp()
  });
}

// ৩. রিয়েল-টাইম লাইক টগল
export async function toggleLike(postId, uid, hasLiked) {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    likes: hasLiked ? arrayRemove(uid) : arrayUnion(uid)
  });
}

// ৪. ফ্রেন্ড রিকোয়েস্ট সিস্টেম
export async function sendFriendRequest(fromUid, toUid) {
  await setDoc(doc(db, "friendships", `${fromUid}_${toUid}`), {
    from: fromUid,
    to: toUid,
    status: "pending",
    timestamp: serverTimestamp()
  });
}

export async function acceptFriendRequest(requestId) {
  const requestRef = doc(db, "friendships", requestId);
  await updateDoc(requestRef, { status: "accepted" });
}

// ৫. রিয়েল-টাইম মেসেজিং (চ্যাট)
export async function sendMessage(chatId, senderUid, text) {
  await addDoc(collection(db, `chats/${chatId}/messages`), {
    senderUid,
    text,
    timestamp: serverTimestamp()
  });
                   }
