import DailyLog from '../models/DailyLog.js';
import { successResponse, errorResponse } from '../utils/response.js';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const createDailyLog = async (req, res) => {
  try {
    const date = req.body.date || getTodayDateString();
    let log = await DailyLog.findOne({ userId: req.user._id, date });
    
    if (log) {
      // Update if exists
      log = await DailyLog.findOneAndUpdate(
        { userId: req.user._id, date },
        { ...req.body },
        { new: true }
      );
    } else {
      log = await DailyLog.create({
        userId: req.user._id,
        date,
        ...req.body
      });
    }
    
    return successResponse(res, 201, 'Daily log saved successfully', log);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getTodayLog = async (req, res) => {
  try {
    const date = getTodayDateString();
    const log = await DailyLog.findOne({ userId: req.user._id, date });
    return successResponse(res, 200, 'Today log fetched', log || {});
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getWeekLogs = async (req, res) => {
  try {
    // Basic implementation for week, we can use exact dates later
    const logs = await DailyLog.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(7);
    return successResponse(res, 200, 'Last 7 days logs', logs);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getMonthLogs = async (req, res) => {
  try {
    const logs = await DailyLog.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(30);
    return successResponse(res, 200, 'Last 30 days logs', logs);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const updateDailyLogByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const log = await DailyLog.findOneAndUpdate(
      { userId: req.user._id, date },
      { ...req.body },
      { new: true }
    );
    if (!log) return errorResponse(res, 404, 'Log not found for this date');
    return successResponse(res, 200, 'Log updated', log);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};
