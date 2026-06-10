import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function reportUser(reporter, target, reason) {
  await addDoc(collection(db, "reports"), {
    reporter,
    target,
    reason,
    status: "pending",\n    createdAt: serverTimestamp()
  });
}
