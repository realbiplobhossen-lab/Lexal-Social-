import { getMessaging, getToken } from "firebase/messaging";

export async function registerFCM() {
  try {
    const messaging = getMessaging();
    // টোকেন জেনারেট করার সুরক্ষিত প্রমিজ হ্যান্ডলিং
    const token = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY" // আপনার ফায়ারবেস ক্লাউড মেসেজিং এর অরিজিনাল কী এখানে বসাবেন
    });
    return token;
  } catch (error) {
    console.error("FCM Token Registration Failed:", error);
    return null;
  }
}
