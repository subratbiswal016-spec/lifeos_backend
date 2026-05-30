import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import { successResponse, errorResponse } from '../utils/response.js';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    return successResponse(res, 200, 'Habits fetched', habits);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const createHabit = async (req, res) => {
  try {
    const habit = await Habit.create({ userId: req.user._id, ...req.body });
    return successResponse(res, 201, 'Habit created', habit);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true }
    );
    if (!habit) return errorResponse(res, 404, 'Habit not found');
    return successResponse(res, 200, 'Habit updated', habit);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!habit) return errorResponse(res, 404, 'Habit not found');
    return successResponse(res, 200, 'Habit deleted (deactivated)');
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const completeHabitForToday = async (req, res) => {
  try {
    const date = getTodayDateString();
    const habitId = req.params.id;
    
    let log = await HabitLog.findOne({ userId: req.user._id, habitId, date });
    let isCompletedToday = true;

    if (log) {
      log.completed = !log.completed; // Toggle it
      log.completedAt = log.completed ? new Date() : null;
      await log.save();
      isCompletedToday = log.completed;
    } else {
      log = await HabitLog.create({
        userId: req.user._id,
        habitId,
        date,
        completed: true,
        completedAt: new Date()
      });
      isCompletedToday = true;
    }

    const habit = await Habit.findById(habitId);
    
    return successResponse(res, 200, 'Habit completion toggled', {
      ...habit.toObject(),
      isCompletedToday
    });
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getHabitStreaks = async (req, res) => {
  try {
    // Mock implementation for streaks
    return successResponse(res, 200, 'Streaks fetched (mock)', { "Reading": 5, "Workout": 2 });
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getTodayHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    const date = getTodayDateString();
    const logs = await HabitLog.find({ userId: req.user._id, date });
    
    const todayHabits = habits.map(habit => {
      const log = logs.find(l => l.habitId.toString() === habit._id.toString());
      return {
        ...habit.toObject(),
        isCompletedToday: log ? log.completed : false
      };
    });
    
    return successResponse(res, 200, 'Today habits fetched', todayHabits);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};
