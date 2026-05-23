import mongoose from 'mongoose';

const symptomLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', required: true },
  date: { type: String, required: true },
  temperature: { type: Number }, // °C
  bpSystolic: { type: Number },
  bpDiastolic: { type: Number },
  bloodSugar: { type: Number }, // mg/dL
  weight: { type: Number }, // kg
  notes: { type: String }
}, {
  timestamps: true
});

const SymptomLog = mongoose.model('SymptomLog', symptomLogSchema);
export default SymptomLog;
