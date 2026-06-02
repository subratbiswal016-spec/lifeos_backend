import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import DailyLog from '../models/DailyLog.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import FamilyMember from '../models/FamilyMember.js';
import Medicine from '../models/Medicine.js';
import MedicineLog from '../models/MedicineLog.js';
import StudySession from '../models/StudySession.js';
import Subject from '../models/Subject.js';
import Expense from '../models/Expense.js';
import Udhar from '../models/Udhar.js';
import DoctorVisit from '../models/DoctorVisit.js';
import SymptomLog from '../models/SymptomLog.js';
import MockTest from '../models/MockTest.js';
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

export const exportData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all user data in parallel for speed
    const [
      profile,
      dailyLogs,
      habits,
      habitLogs,
      familyMembers,
      medicines,
      medicineLogs,
      studySessions,
      subjects,
      expenses,
      udhars,
      doctorVisits,
      symptomLogs,
      mockTests,
    ] = await Promise.all([
      User.findById(userId).select('-passwordHash -fcmToken').lean(),
      DailyLog.find({ userId }).lean(),
      Habit.find({ userId }).lean(),
      HabitLog.find({ userId }).lean(),
      FamilyMember.find({ userId }).lean(),
      Medicine.find({ userId }).lean(),
      MedicineLog.find({ userId }).lean(),
      StudySession.find({ userId }).lean(),
      Subject.find({ userId }).lean(),
      Expense.find({ userId }).lean(),
      Udhar.find({ userId }).lean(),
      DoctorVisit.find({ userId }).lean(),
      SymptomLog.find({ userId }).lean(),
      MockTest.find({ userId }).lean(),
    ]);

    const exportedData = {
      exportedAt: new Date().toISOString(),
      profile,
      dailyLogs,
      habits,
      habitLogs,
      familyMembers,
      medicines,
      medicineLogs,
      studySessions,
      subjects,
      expenses,
      udhars,
      doctorVisits,
      symptomLogs,
      mockTests,
    };

    return successResponse(res, 200, 'Data exported successfully', exportedData);
  } catch (err) {
    return errorResponse(res, 500, 'Failed to export data', err.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return errorResponse(res, 400, 'Old password and new password are required');
    }

    // Query passwordHash since req.user does not have it (excluded by protect middleware)
    const user = await User.findById(req.user._id).select('passwordHash');
    if (!user) return errorResponse(res, 404, 'User not found');

    // Verify current password
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) return errorResponse(res, 400, 'Incorrect current password');

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    await user.save();

    return successResponse(res, 200, 'Password changed successfully');
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};
