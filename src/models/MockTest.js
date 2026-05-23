import mongoose from 'mongoose';

const mockTestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  scoredMarks: { type: Number, required: true },
  percentage: { type: Number }, // auto calculated
  notes: { type: String }
}, {
  timestamps: true
});

mockTestSchema.pre('save', function (next) {
  if (this.totalMarks > 0) {
    this.percentage = (this.scoredMarks / this.totalMarks) * 100;
  }
  next();
});

const MockTest = mongoose.model('MockTest', mockTestSchema);
export default MockTest;
