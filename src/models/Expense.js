import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['expense', 'income'], 
    default: 'expense' 
  },
  category: { 
    type: String, 
    required: true 
  },
  note: { 
    type: String 
  },
  date: { 
    type: Date, 
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
