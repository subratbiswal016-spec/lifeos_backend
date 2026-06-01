import Expense from '../models/Expense.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const addExpense = async (req, res) => {
  try {
    const { amount, type, category, note, date } = req.body;
    if (!amount || !category) {
      return errorResponse(res, 400, 'Amount and category are required');
    }

    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      type: type || 'expense',
      category,
      note,
      date: date || new Date()
    });

    // Check budget limit if it's an expense
    let limitMessage = null;
    if (expense.type === 'expense') {
      const user = await User.findById(req.user._id);
      const budget = user.monthlyBudget || 0;
      
      if (budget > 0) {
        // Calculate total spent this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const expensesThisMonth = await Expense.aggregate([
          { 
            $match: { 
              userId: req.user._id, 
              type: 'expense',
              date: { $gte: startOfMonth }
            } 
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalSpent = expensesThisMonth.length > 0 ? expensesThisMonth[0].total : 0;
        const remaining = budget - totalSpent;
        
        if (remaining < 0) {
          limitMessage = `You have exceeded your monthly budget of ₹${budget}!`;
        } else {
          limitMessage = `You have ₹${remaining} limit left for this month.`;
        }
      }
    }

    return successResponse(res, 201, 'Expense added successfully', { 
      expense,
      limitMessage
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Default to current month if not provided
    const d = new Date();
    const targetMonth = month ? parseInt(month) : d.getMonth();
    const targetYear = year ? parseInt(year) : d.getFullYear();
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 1);

    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startDate, $lt: endDate }
    }).sort({ date: -1 });

    const user = await User.findById(req.user._id);

    return successResponse(res, 200, 'Expenses fetched', { 
      expenses,
      monthlyBudget: user.monthlyBudget || 0
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!expense) {
      return errorResponse(res, 404, 'Expense not found');
    }
    return successResponse(res, 200, 'Expense deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};
