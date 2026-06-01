import cron from 'node-cron';
import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import Habit from '../models/Habit.js';
import DailyLog from '../models/DailyLog.js';
import { sendPushNotification } from './fcm.service.js';
import { gatherUserContext, callClaudeAPI } from './ai.service.js';

export const startCronJobs = () => {
  // 1. Every minute — check medicine reminder times, send FCM push to user
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentHourMinute = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      const medicines = await Medicine.find({
        isActive: true,
        reminderTimes: currentHourMinute
      }).populate('userId', 'fcmToken');

      for (const med of medicines) {
        if (med.userId && med.userId.fcmToken) {
          await sendPushNotification(
            med.userId.fcmToken,
            'Medicine Reminder',
            `It's time to take ${med.name} (${med.dose})`,
            { medicineId: med._id.toString() }
          );
        }
      }
    } catch (err) {
      console.error('Error in medicine reminder cron:', err);
    }
  });

  // 2. Every night 9 PM — send daily summary notification if no log exists
  cron.schedule('0 21 * * *', async () => {
    try {
      const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const user of users) {
        const logExists = await DailyLog.exists({ userId: user._id, date: today });
        if (!logExists) {
          await sendPushNotification(
            user.fcmToken,
            'Daily Check-in Missed',
            'Kaisa raha aaj ka din? You haven\'t checked in yet. Log your mood and expenses!',
            { type: 'daily_checkin' }
          );
        }
      }
    } catch (err) {
      console.error('Error in nightly summary cron:', err);
    }
  });

  // 2b. Every hour — remind to set monthly budget if missing
  cron.schedule('0 * * * *', async () => {
    try {
      const users = await User.find({ 
        fcmToken: { $exists: true, $ne: null },
        $or: [
          { monthlyBudget: { $exists: false } },
          { monthlyBudget: null },
          { monthlyBudget: 0 }
        ]
      });

      for (const user of users) {
        await sendPushNotification(
          user.fcmToken,
          'Set Your Monthly Budget',
          'Aapne abhi tak budget set nahi kiya! Tap here to complete your profile and track expenses better.',
          { type: 'budget_reminder' }
        );
      }
    } catch (err) {
      console.error('Error in hourly budget reminder cron:', err);
    }
  });

  // 3. Every Sunday 8 AM — trigger weekly AI report generation
  cron.schedule('0 8 * * 0', async () => {
    try {
      const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
      for (const user of users) {
        // You could generate and store the report, or just send a push notification to view it
        await sendPushNotification(
          user.fcmToken,
          'Weekly Report Ready!',
          'Your LifeOS AI weekly insights are ready to view. Dekho pichla hafta kaisa tha.',
          { type: 'weekly_report' }
        );
      }
    } catch (err) {
      console.error('Error in weekly AI report cron:', err);
    }
  });

  // 4. Every day midnight — reset daily habit completions
  // In our model we use HabitLog which is date specific, so we don't need to "reset" a boolean on Habit itself,
  // but if we had a daily completion boolean to clear, we would do it here. We'll leave it as a log.
  cron.schedule('0 0 * * *', () => {
    console.log('Midnight task: Habit completions reset for the new day (managed via HabitLogs).');
  });

  // 5. Every Monday — reset weekly AI message count
  cron.schedule('0 0 * * 1', async () => {
    try {
      await User.updateMany({}, { $set: { aiMessagesUsedThisWeek: 0, aiMessagesResetAt: new Date() } });
      console.log('Reset AI weekly message counts for all users.');
    } catch (err) {
      console.error('Error resetting AI weekly limits:', err);
    }
  });
  
  console.log('Cron jobs scheduled successfully.');
};
