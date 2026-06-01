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
    const todayString = new Date().toISOString().split('T')[0];
    let dailyLog = await DailyLog.findOne({ userId: req.user._id, date: todayString });
    
    // Cache hit: return the already generated tip for today
    if (dailyLog && dailyLog.aiDailyTip) {
      return successResponse(res, 200, 'Daily tip', { tip: dailyLog.aiDailyTip });
    }

    const context = await gatherUserContext(req.user._id);
    let reply = await callClaudeAPI(context, "Generate a short, encouraging daily tip based on my recent activity.");
    
    // Fallback if AI service hits a quota limit or fails
    if (reply.includes("Maaf karna") || reply.includes("AI Error:") || reply.includes("Oops!")) {
       const fallbacks = [
         "Drink 2 liters of water today!",
         "Take a 5-minute walk outside and stretch.",
         "Read 10 pages of a good book today.",
         "Focus on progress, not perfection."
       ];
       reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    } else {
       // Save to cache on successful generation
       if (dailyLog) {
         dailyLog.aiDailyTip = reply;
         await dailyLog.save();
       } else {
         await DailyLog.create({
           userId: req.user._id,
           date: todayString,
           energyLevel: 50, // default
           aiDailyTip: reply
         });
       }
    }

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
