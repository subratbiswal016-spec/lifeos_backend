import { messaging } from '../config/firebase.js';

export const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!messaging || !fcmToken) {
    console.log('FCM not initialized or no token provided. Skipping push notification.');
    return;
  }

  try {
    const message = {
      notification: { title, body },
      data,
      token: fcmToken
    };
    
    const response = await messaging.send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};
