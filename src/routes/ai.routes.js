import express from 'express';
import { 
  chat, generateDailyTip, generateWeeklyReport, studyInsight, healthInsight
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.post('/chat', chat);
router.post('/daily-tip', generateDailyTip);
router.post('/weekly-report', generateWeeklyReport);
router.post('/study-insight', studyInsight);
router.post('/health-insight', healthInsight);

export default router;
