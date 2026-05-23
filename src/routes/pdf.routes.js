import express from 'express';
import { getFamilyReport, getStudyReport } from '../controllers/pdf.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/family/:memberId', getFamilyReport);
router.get('/study-report', getStudyReport);

export default router;
