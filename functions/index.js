import functions from 'firebase-functions';
import admin from 'firebase-admin';
import { checkContent } from './moderation.js';

admin.initializeApp();

// টাইমলাইনে পোস্ট ক্রিয়েট হলে সার্ভার সাইড অটো-মডারেশন ট্রিগার
export const onPostModeration = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const cleanText = checkContent(data.content);
    
    if (cleanText !== data.content) {
      await snap.ref.update({ content: cleanText });
    }
  });
