import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  mood: { type: Number, min: 1, max: 5 }, // 1–5
  sleepHours: { type: Number },
  energyLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }, // 1–5
  moneySpent: { type: Number, default: 0 }, // ₹
  spendCategory: { type: String }, // Food/Travel/Shopping/Other
  note: { type: String },
  weather: { type: String }, // sunny/rainy/cold/cloudy
  aiDailyTip: { type: String } // Caches the daily tip from Gemini
}, {
  timestamps: true
});

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);
export default DailyLog;
