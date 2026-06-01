import express from 'express';
import { sendGlobalNotification } from '../controllers/admin.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Currently using standard protect middleware. 
// Ideally we would add an admin check middleware here as well.
router.post('/notify-all', protect, sendGlobalNotification);

export default router;
