import { gatherUserContext, callClaudeAPI } from '../services/ai.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

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
    const context = await gatherUserContext(req.user._id);
    const reply = await callClaudeAPI(context, "Generate a short, encouraging daily tip based on my recent activity.");
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
