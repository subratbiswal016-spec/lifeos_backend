import mongoose from 'mongoose';

const medicineLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', required: true },
  date: { type: String, required: true },
  scheduledTime: { type: String }, // "08:00"
  status: { type: String, enum: ['taken', 'skipped', 'pending'], default: 'pending' },
  takenAt: { type: Date }
});

const MedicineLog = mongoose.model('MedicineLog', medicineLogSchema);
export default MedicineLog;
