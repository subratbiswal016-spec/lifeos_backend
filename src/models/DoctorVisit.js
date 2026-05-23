import mongoose from 'mongoose';

const doctorVisitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', required: true },
  date: { type: String, required: true },
  doctorName: { type: String },
  hospital: { type: String },
  reason: { type: String },
  notes: { type: String },
  prescriptionImageUrl: { type: String },
  nextAppointment: { type: String }
}, {
  timestamps: true
});

const DoctorVisit = mongoose.model('DoctorVisit', doctorVisitSchema);
export default DoctorVisit;
