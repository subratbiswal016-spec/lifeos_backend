import mongoose from 'mongoose';

const udharSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  personName: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 1
  },
  type: { 
    type: String, 
    enum: ['gave', 'took'], 
    required: true 
  },
  description: { 
    type: String 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  isSettled: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

const Udhar = mongoose.model('Udhar', udharSchema);
export default Udhar;
