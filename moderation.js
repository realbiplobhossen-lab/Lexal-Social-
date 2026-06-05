const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.postModeration = functions.firestore
  .document("posts/{postId}")
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    if (!data || !data.text) return null;

    const bannedWords = ["spam", "fake", "scam"];
    const found = bannedWords.some(word =>
      data.text.toLowerCase().includes(word)
    );

    if (found) {
      return snapshot.ref.update({
        hidden: true,
        moderated: true
      });
    }
    return null;
  });
