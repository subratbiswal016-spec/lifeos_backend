import FamilyMember from '../models/FamilyMember.js';
import Habit from '../models/Habit.js';
import User from '../models/User.js';
import { errorResponse } from '../utils/response.js';

export const checkPremium = (req, res, next) => {
  if (req.user && req.user.isPremium) {
    next();
  } else {
    return errorResponse(res, 403, 'Premium feature. Upgrade your plan to access this feature.');
  }
};

export const checkFamilyMemberLimit = async (req, res, next) => {
  if (req.user.isPremium) return next();

  const count = await FamilyMember.countDocuments({ userId: req.user._id });
  if (count >= 3) {
    return errorResponse(res, 403, 'Free tier limit reached. Max 3 family members allowed.');
  }
  next();
};

export const checkHabitLimit = async (req, res, next) => {
  if (req.user.isPremium) return next();

  const count = await Habit.countDocuments({ userId: req.user._id, isActive: true });
  if (count >= 5) {
    return errorResponse(res, 403, 'Free tier limit reached. Max 5 active habits allowed.');
  }
  next();
};

export const checkAILimit = async (req, res, next) => {
  if (req.user.isPremium) return next();

  if (req.user.aiMessagesUsedThisWeek >= 5) {
    return errorResponse(res, 403, 'Free tier limit reached. Max 5 AI messages per week.');
  }

  // Increment usage
  await User.findByIdAndUpdate(req.user._id, { $inc: { aiMessagesUsedThisWeek: 1 } });
  next();
};

export const checkPDFLimit = (req, res, next) => {
  if (req.user.isPremium) return next();
  return errorResponse(res, 403, 'PDF generation is a premium feature.');
};
