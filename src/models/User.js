import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  city: { type: String },
  examPreparingFor: { type: String }, // JEE/NEET/UPSC/Board/Other
  monthlyBudget: { type: Number }, // ₹
  wakeTime: { type: String }, // "06:00"
  sleepTime: { type: String }, // "22:00"
  fcmToken: { type: String }, // for push notifications
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date },
  planType: { type: String }, // "monthly"/"lifetime"
  aiMessagesUsedThisWeek: { type: Number, default: 0 },
  aiMessagesResetAt: { type: Date },
  profilePhotoUrl: { type: String },
  lastActiveAt: { type: Date }
}, {
  timestamps: true // This will automatically manage `createdAt` and `updatedAt`
});

const User = mongoose.model('User', userSchema);
export default User;
