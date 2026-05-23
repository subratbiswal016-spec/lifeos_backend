import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  relation: { type: String, required: true }, // Papa/Maa/Dadi/Nana/Child/Self
  age: { type: Number },
  bloodGroup: { type: String },
  allergies: [{ type: String }],
  doctorName: { type: String },
  doctorPhone: { type: String },
  photoUrl: { type: String }
}, {
  timestamps: true
});

const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);
export default FamilyMember;
