import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  emoji: { type: String },
  color: { type: String },
  weeklyTargetHours: { type: Number },
  dailyTargetHours: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
