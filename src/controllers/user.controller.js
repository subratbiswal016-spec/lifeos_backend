import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return errorResponse(res, 400, 'FCM token is required');

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fcmToken },
      { new: true }
    );
    
    return successResponse(res, 200, 'FCM token updated', { fcmToken: user.fcmToken });
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    return successResponse(res, 200, 'Profile fetched', user);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...req.body },
      { new: true }
    ).select('-passwordHash');
    
    return successResponse(res, 200, 'Profile updated', user);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    return successResponse(res, 200, 'Account deleted');
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};
