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

export const sendMulticastNotification = async (fcmTokens, title, body, data = {}) => {
  if (!messaging || !fcmTokens || fcmTokens.length === 0) {
    console.log('FCM not initialized or no tokens provided. Skipping push notification.');
    return;
  }

  try {
    const message = {
      notification: { title, body },
      data,
      tokens: fcmTokens
    };
    
    const response = await messaging.sendEachForMulticast(message);
    console.log('Successfully sent multicast message:', response.successCount, 'successes,', response.failureCount, 'failures');
    return response;
  } catch (error) {
    console.error('Error sending multicast push notification:', error);
  }
};
