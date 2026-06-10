import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function setUserOnline(uid) {
  if (!uid) return;
  await setDoc(doc(db, "presence", uid), {
    online: true,
    lastSeen: serverTimestamp()
  }, { merge: true });
}

export async function setUserOffline(uid) {
  if (!uid) return;
  await setDoc(doc(db, "presence", uid), {
    online: false,
    lastSeen: serverTimestamp()
  }, { merge: true });
}
