import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', required: true },
  name: { type: String, required: true },
  dose: { type: String }, // "500mg"
  timesPerDay: { type: Number },
  reminderTimes: [{ type: String }], // ["08:00", "20:00"]
  startDate: { type: String }, // "YYYY-MM-DD"
  endDate: { type: String },
  totalQuantity: { type: Number },
  remainingQuantity: { type: Number },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
