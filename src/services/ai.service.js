import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User.js';
import DailyLog from '../models/DailyLog.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import FamilyMember from '../models/FamilyMember.js';
import Medicine from '../models/Medicine.js';
import SymptomLog from '../models/SymptomLog.js';
import StudySession from '../models/StudySession.js';
import Subject from '../models/Subject.js';

const systemPrompt = `You are LifeOS AI — a warm, helpful life assistant.
Speak strictly in simple, natural English. Do NOT use Hindi words.
Help with personal wellbeing, family health, and studies.
Give data-driven insights. Be encouraging, never judgmental.
CRITICAL RULES:
1. ONLY answer the specific question asked. Do NOT dump all the user's context, study details, or family details unless they explicitly ask for it.
2. If asked about spending, just give the spending details. Compare it with their monthly budget if one is set. If asked about studies, just give study details.
3. BE BRUTALLY CONCISE. Give direct, 1 to 2 sentence answers MAXIMUM. Do not write paragraphs. Cut all introductory filler.
4. End every reply with one short actionable tip.`;

let genAI = null;

export const getGenAIInstance = () => {
  if (!genAI) {
    const geminiApiKey = process.env.GEMINI_API_KEY || '';
    console.log(`[AI Service] Gemini API Key loaded: ${geminiApiKey ? geminiApiKey.substring(0, 10) + '...' : 'NOT SET'}`);
    genAI = new GoogleGenerativeAI(geminiApiKey);
  }
  return genAI;
};

export const gatherUserContext = async (userId) => {
  const user = await User.findById(userId);
  
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const last30DaysLogs = await DailyLog.find({ 
    userId, 
    date: { $gte: thirtyDaysAgo.toISOString().split('T')[0] } 
  }).sort({ date: -1 });

  const last7Days = last30DaysLogs.slice(0, 7);

  // Calculate Spend
  const todayString = today.toISOString().split('T')[0];
  const spendToday = last30DaysLogs.find(log => log.date === todayString)?.moneySpent || 0;
  const spendLast7Days = last7Days.reduce((acc, log) => acc + (log.moneySpent || 0), 0);
  const spendLast30Days = last30DaysLogs.reduce((acc, log) => acc + (log.moneySpent || 0), 0);

  const habits = await Habit.find({ userId, isActive: true });
  const members = await FamilyMember.find({ userId });
  const medicinesDueToday = await Medicine.find({ userId, isActive: true });
  const recentSymptoms = await SymptomLog.find({ userId }).sort({ date: -1 }).limit(5);
  
  const subjects = await Subject.find({ userId, isActive: true });
  const todaySessions = await StudySession.find({ userId, date: todayString });
  
  return {
    user: { name: user.name, city: user.city, examPreparingFor: user.examPreparingFor, monthlyBudget: user.monthlyBudget },
    personal: {
      last7Days,
      spending: {
        spendToday,
        spendLast7Days,
        spendLast30Days
      },
      habits,
      habitStreaks: { "Reading": 5 } // mock
    },
    family: {
      members,
      medicinesDueToday,
      recentSymptoms
    },
    study: {
      subjects,
      todaySessions,
      studyInsight: "Compare dailyTargetHours in subjects with durationMinutes in todaySessions to see if they met their goal."
    }
  };
};

export const callClaudeAPI = async (context, question) => {
  const prompt = `${systemPrompt}\n\nContext:\n${JSON.stringify(context, null, 2)}\n\nUser Question: ${question}`;
  
  try {
    const aiInstance = getGenAIInstance();
    const model = aiInstance.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    if (err.message && err.message.includes('429')) {
      return "Oops! It seems I'm receiving too many requests right now and my daily limit has been reached. Please try again a bit later!";
    }
    return "Maaf karna, something went wrong with my AI systems. Let's try again in a moment.";
  }
};
