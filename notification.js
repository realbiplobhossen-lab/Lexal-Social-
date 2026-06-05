const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.newMessageNotification = functions.firestore
  .document("messages/{messageId}")
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    if (!data) return null;

    const payload = {
      notification: {
        title: "New Message",
        body: data.text || "You received a new message"
      }
    };

    // নির্দিষ্ট চ্যাট আইডির টপিকে নোটিফিকেশন পাঠানো হচ্ছে
    return admin.messaging().sendToTopic(data.chatId, payload);
  });
