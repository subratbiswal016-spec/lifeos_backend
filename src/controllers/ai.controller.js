import { gatherUserContext, callClaudeAPI } from '../services/ai.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import DailyLog from '../models/DailyLog.js';

export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return errorResponse(res, 400, 'Message is required');

    const context = await gatherUserContext(req.user._id);
    const reply = await callClaudeAPI(context, message);

    return successResponse(res, 200, 'AI response', { reply });
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const generateDailyTip = async (req, res) => {
  try {
    const tips = [
      "Drink 2-3 liters of water today to stay energetic and focused!",
      "Take a 5-minute screen break every hour to protect your eyes.",
      "Spend 10 minutes planning your day to boost productivity.",
      "Remember to take deep breaths during stressful study sessions.",
      "Consistency is the key to mastering any skill. Keep showing up daily!",
      "A healthy mind lives in a healthy body. Try to get 7-8 hours of sleep tonight.",
      "Review your expenses from yesterday to stay on top of your budget.",
      "Spend a few quality minutes talking with a family member today.",
      "Small milestones lead to big success. Celebrate your progress today!",
      "Limit sugary snacks today; opt for fresh fruits or nuts instead."
    ];
    
    // Rotate tip every 1 hour based on time since epoch
    const hourIndex = Math.floor(Date.now() / (3600 * 1000)) % tips.length;
    const reply = tips[hourIndex];

    return successResponse(res, 200, 'Daily tip', { tip: reply });
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const generateWeeklyReport = async (req, res) => {
  try {
    const context = await gatherUserContext(req.user._id);
    const reply = await callClaudeAPI(context, "Generate a weekly life report. You can exceed the 120 word limit for this. Summarize my habits, study hours, and family health.");
    return successResponse(res, 200, 'Weekly report', { report: reply });
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const studyInsight = async (req, res) => {
  try {
    const context = await gatherUserContext(req.user._id);
    const reply = await callClaudeAPI(context, "Give me a study specific insight based on my recent study sessions and target hours.");
    return successResponse(res, 200, 'Study insight', { insight: reply });
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const healthInsight = async (req, res) => {
  try {
    const context = await gatherUserContext(req.user._id);
    const reply = await callClaudeAPI(context, "Give me a family health insight based on recent symptoms and medicine logs.");
    return successResponse(res, 200, 'Health insight', { insight: reply });
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};
