import admin from 'firebase-admin';

export const sendPushNotification = async (token, title, body) => {
  const message = {
    notification: { title, body },
    token: token
  };
  try {
    await admin.messaging().send(message);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
