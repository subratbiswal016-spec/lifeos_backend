import express from 'express';
import { updateFcmToken, getProfile, updateProfile, deleteAccount, exportData, changePassword } from '../controllers/user.controller.js';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/fcm-token', updateFcmToken);
router.delete('/account', deleteAccount);
router.get('/export-data', exportData);
router.post('/change-password', changePassword);

export default router;
