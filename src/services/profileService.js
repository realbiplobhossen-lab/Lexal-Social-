import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function updateProfilePhoto(uid, url) {
  if (!uid || !url) return;
  await updateDoc(doc(db, "users", uid), {
    photoURL: url
  });
}
