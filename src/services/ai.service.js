import { Anthropic } from '@anthropic-ai/sdk';
import User from '../models/User.js';
import DailyLog from '../models/DailyLog.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import FamilyMember from '../models/FamilyMember.js';
import Medicine from '../models/Medicine.js';
import SymptomLog from '../models/SymptomLog.js';
import StudySession from '../models/StudySession.js';

const systemPrompt = `You are LifeOS AI — a warm, helpful Indian life assistant.
Speak in simple English with occasional Hindi words like 'bilkul', 'achha', 'sahi hai', 'ek kaam karo'.
Help with personal wellbeing, family health, and studies.
Give data-driven insights. Be encouraging, never judgmental.
Keep answers under 120 words unless generating a full report.
End every reply with one actionable tip labeled 'Karo Abhi:'.`;

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || 'dummy-key-for-now', // Will fail if not set in real environment
});

export const gatherUserContext = async (userId) => {
  const user = await User.findById(userId);
  
  // Basic mock fetch for context (in real life we'd date-filter properly)
  const last7Days = await DailyLog.find({ userId }).sort({ date: -1 }).limit(7);
  const habits = await Habit.find({ userId, isActive: true });
  const members = await FamilyMember.find({ userId });
  const medicinesDueToday = await Medicine.find({ userId, isActive: true });
  const recentSymptoms = await SymptomLog.find({ userId }).sort({ date: -1 }).limit(5);
  
  return {
    user: { name: user.name, city: user.city, examPreparingFor: user.examPreparingFor },
    personal: {
      last7Days,
      habits,
      habitStreaks: { "Reading": 5 } // mock
    },
    family: {
      members,
      medicinesDueToday,
      recentSymptoms
    },
    study: {
      thisWeekHours: 32, // mock
      subjectBreakdown: { Physics: 8, Chemistry: 6 }, // mock
      studyStreak: 12, // mock
      recentMockScores: [] // mock
    }
  };
};

export const callClaudeAPI = async (context, question) => {
  const prompt = `Context:\n${JSON.stringify(context, null, 2)}\n\nUser Question: ${question}`;
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response.content[0].text;
  } catch (err) {
    console.error("Claude API Error:", err);
    return "Maaf karna, something went wrong with the AI service. Please try again later.";
  }
};
