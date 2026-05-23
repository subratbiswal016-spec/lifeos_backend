import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
});

const HabitLog = mongoose.model('HabitLog', habitLogSchema);
export default HabitLog;
