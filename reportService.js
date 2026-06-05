import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export async function reportUser(reporter, target, reason) {
  await addDoc(collection(db, "reports"), {
    reporter,
    target,
    reason,
    status: "pending",
    createdAt: serverTimestamp()
  });
}
