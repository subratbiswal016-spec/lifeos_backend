import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  emoji: { type: String },
  color: { type: String }, // hex color
  frequency: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
  customDays: [{ type: Number }], // 0=Mon to 6=Sun
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
