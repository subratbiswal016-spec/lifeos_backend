import Subject from '../models/Subject.js';
import StudySession from '../models/StudySession.js';
import MockTest from '../models/MockTest.js';
import { successResponse, errorResponse } from '../utils/response.js';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- SUBJECTS ---
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id, isActive: true });
    return successResponse(res, 200, 'Subjects fetched', subjects);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const addSubject = async (req, res) => {
  try {
    const subject = await Subject.create({ userId: req.user._id, ...req.body });
    return successResponse(res, 201, 'Subject added', subject);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true }
    );
    if (!subject) return errorResponse(res, 404, 'Subject not found');
    return successResponse(res, 200, 'Subject updated', subject);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!subject) return errorResponse(res, 404, 'Subject not found');
    return successResponse(res, 200, 'Subject deleted (deactivated)');
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

// --- STUDY SESSIONS ---
export const startSession = async (req, res) => {
  try {
    const session = await StudySession.create({
      userId: req.user._id,
      subjectId: req.body.subjectId,
      date: getTodayDateString(),
      startTime: new Date(),
      isPomodoroMode: req.body.isPomodoroMode || false
    });
    return successResponse(res, 201, 'Study session started', session);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const stopSession = async (req, res) => {
  try {
    const { mood, energyLevel, note, durationMinutes } = req.body;
    const session = await StudySession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return errorResponse(res, 404, 'Session not found');

    session.endTime = new Date();
    // If client passes exact duration use it, else calculate from dates
    if (durationMinutes) {
      session.durationMinutes = durationMinutes;
    } else {
      const diffMs = session.endTime - session.startTime;
      session.durationMinutes = Math.floor(diffMs / 60000);
    }
    
    session.mood = mood;
    session.energyLevel = energyLevel;
    session.note = note;
    await session.save();

    return successResponse(res, 200, 'Study session stopped', session);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getTodaySessions = async (req, res) => {
  try {
    const date = getTodayDateString();
    const sessions = await StudySession.find({ userId: req.user._id, date }).populate('subjectId', 'name color emoji');
    return successResponse(res, 200, 'Today sessions fetched', sessions);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getWeekSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id })
      .sort({ startTime: -1 })
      .limit(20)
      .populate('subjectId', 'name color emoji');
    return successResponse(res, 200, 'Week sessions fetched', sessions);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getStudyStats = async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id }).populate('subjectId', 'name');
    
    let totalMinutes = 0;
    let thisWeekMinutes = 0;
    const subjectBreakdown = {};
    const datesStudied = new Set();
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Initialize last 7 days for the chart
    const dailyBreakdown = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000).toISOString().split('T')[0];
      dailyBreakdown[d] = 0;
    }
    
    sessions.forEach(session => {
      const duration = session.durationMinutes || 0;
      totalMinutes += duration;
      
      if (session.startTime >= oneWeekAgo) {
        thisWeekMinutes += duration;
      }
      
      if (session.subjectId) {
        const subjectName = session.subjectId.name;
        if (!subjectBreakdown[subjectName]) {
          subjectBreakdown[subjectName] = 0;
        }
        subjectBreakdown[subjectName] += duration;
      }
      
      if (dailyBreakdown[session.date] !== undefined) {
        dailyBreakdown[session.date] += duration;
      }
      
      datesStudied.add(session.date);
    });
    
    // Calculate streak
    let studyStreak = 0;
    const sortedDates = Array.from(datesStudied).sort().reverse(); // Latest date first
    const todayStr = getTodayDateString();
    
    let currentDate = new Date(todayStr);
    let checkDateStr = todayStr;
    
    if (sortedDates.length > 0) {
      if (sortedDates[0] === todayStr || sortedDates[0] === new Date(currentDate.getTime() - 86400000).toISOString().split('T')[0]) {
        // Streak is alive
        for (let i = 0; i < sortedDates.length; i++) {
          if (sortedDates[i] === checkDateStr) {
            studyStreak++;
            currentDate = new Date(currentDate.getTime() - 86400000);
            checkDateStr = currentDate.toISOString().split('T')[0];
          } else {
             // Handle case where they didn't study today but studied yesterday (streak still active)
             if (i === 0 && sortedDates[0] !== todayStr) {
                 checkDateStr = sortedDates[0];
                 i--; // Re-check this index against yesterday
                 continue;
             }
             break;
          }
        }
      }
    }
    
    // Convert minutes to hours for frontend (or keep as minutes? Let's send hours with 1 decimal)
    const stats = {
      totalHours: (totalMinutes / 60).toFixed(1),
      thisWeekHours: (thisWeekMinutes / 60).toFixed(1),
      studyStreak,
      subjectBreakdown: Object.keys(subjectBreakdown).reduce((acc, key) => {
        acc[key] = parseFloat((subjectBreakdown[key] / 60).toFixed(1));
        return acc;
      }, {}),
      dailyBreakdown: Object.keys(dailyBreakdown).map(date => ({
        date,
        hours: parseFloat((dailyBreakdown[date] / 60).toFixed(1))
      }))
    };
    return successResponse(res, 200, 'Study stats fetched', stats);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

// --- MOCK TESTS ---
export const logMockTest = async (req, res) => {
  try {
    const test = await MockTest.create({ userId: req.user._id, ...req.body });
    return successResponse(res, 201, 'Mock test logged', test);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getMockTests = async (req, res) => {
  try {
    const tests = await MockTest.find({ userId: req.user._id, subjectId: req.params.subjectId })
      .sort({ date: -1 });
    return successResponse(res, 200, 'Mock tests fetched', tests);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};
