import express from 'express';
import { getHabits, createHabit, updateHabit, deleteHabit, completeHabitForToday, getHabitStreaks, getTodayHabits } from '../controllers/habit.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getHabits);
router.post('/', createHabit);
router.get('/today', getTodayHabits);
router.get('/streaks', getHabitStreaks);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/complete', completeHabitForToday);

export default router;
