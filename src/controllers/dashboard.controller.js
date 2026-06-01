import Habit from '../models/Habit.js';
import Medicine from '../models/Medicine.js';
import DailyLog from '../models/DailyLog.js';
import StudySession from '../models/StudySession.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const userName = req.user.name || 'User';

    // 1. Get habits
    const habits = await Habit.find({ userId });
    
    // 2. Get upcoming medicines (simplified)
    const medicines = await Medicine.find({ userId, isActive: true }).populate('memberId').limit(3);
    
    // 3. Get Family Members count
    const importFamilyMember = await import('../models/FamilyMember.js');
    const FamilyMember = importFamilyMember.default;
    const familyMemberCount = await FamilyMember.countDocuments({ userId });
    
    // 4. Get study stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const studySessions = await StudySession.find({ 
      userId,
      startTime: { $gte: today }
    });

    const totalStudyMinutes = studySessions.reduce((acc, curr) => {
      if (curr.durationMinutes) return acc + curr.durationMinutes;
      return acc;
    }, 0);
    
    const uniqueSubjects = new Set(studySessions.map(s => s.subjectId?.toString()).filter(Boolean)).size;
    
    // 5. Get Daily Log for Mood and Spend
    // We must use a fresh Date() here because 'today' was modified to local midnight above, 
    // which shifts its UTC string to the previous day in some timezones like IST!
    const todayString = new Date().toISOString().split('T')[0]; 
    const dailyLog = await DailyLog.findOne({ userId, date: todayString });
    
    const moodEmoji = dailyLog?.mood === 5 ? '🤩' : 
                      dailyLog?.mood === 4 ? '😊' : 
                      dailyLog?.mood === 3 ? '😐' : 
                      dailyLog?.mood === 2 ? '😔' : 
                      dailyLog?.mood === 1 ? '😢' : 'N/A';
                      
    const spend = dailyLog?.moneySpent || 0;

    // Prepare reminders list
    const reminders = [];
    medicines.forEach(m => {
      reminders.push({
        id: m._id.toString(),
        title: m.name,
        memberName: m.memberId ? m.memberId.name : 'Self',
        dose: m.dose || '',
        time: m.reminderTimes && m.reminderTimes.length > 0 ? m.reminderTimes[0] : 'Upcoming',
        reminderTimes: m.reminderTimes || [],
        type: 'medicine'
      });
    });
    
    // Daily Tip
    const tips = [
      "Drink 2 liters of water today!",
      "Take a 5-minute walk outside.",
      "Read 10 pages of a good book.",
      "Call a family member just to say hi.",
      "Focus on progress, not perfection."
    ];
    const dailyTip = tips[Math.floor(Math.random() * tips.length)];

    res.status(200).json({
      success: true,
      data: {
        name: userName,
        dailyTip: dailyTip,
        quickStats: {
          mood: moodEmoji,
          sleep: dailyLog?.sleepHours || 0,
          energy: dailyLog?.energyLevel || 0,
          spend: spend,
          medsDue: medicines.length,
          familyMembers: familyMemberCount,
          studyTime: totalStudyMinutes,
          subjectsStudied: uniqueSubjects,
          studyStreak: studySessions.length > 0 ? 1 : 0 // Basic streak logic
        },
        reminders,
        monthlyBudget: req.user.monthlyBudget,
        phone: req.user.phone,
        city: req.user.city,
        profilePhotoUrl: req.user.profilePhotoUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message
    });
  }
};
