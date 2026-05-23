import express from 'express';
import { updateFcmToken, getProfile, updateProfile, deleteAccount } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/fcm-token', updateFcmToken);
router.delete('/account', deleteAccount);

export default router;
