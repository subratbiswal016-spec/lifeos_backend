import express from 'express';
import { createDailyLog, getTodayLog, getWeekLogs, getMonthLogs, updateDailyLogByDate } from '../controllers/dailylog.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createDailyLog);
router.get('/today', getTodayLog);
router.get('/week', getWeekLogs);
router.get('/month', getMonthLogs);
router.put('/:date', updateDailyLogByDate);

export default router;
