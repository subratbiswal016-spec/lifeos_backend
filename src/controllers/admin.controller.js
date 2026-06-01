import User from '../models/User.js';
import { sendMulticastNotification } from '../services/fcm.service.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export const sendGlobalNotification = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return errorResponse(res, 400, 'Title and body are required');
    }

    // Fetch all users with FCM tokens
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
    const tokens = users.map(u => u.fcmToken);

    if (tokens.length === 0) {
      return successResponse(res, 200, 'No users found with FCM tokens');
    }

    const response = await sendMulticastNotification(tokens, title, body);
    
    return successResponse(res, 200, 'Global notification sent successfully', {
      successCount: response?.successCount || 0,
      failureCount: response?.failureCount || 0,
    });
  } catch (error) {
    console.error('Error sending global notification:', error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};
