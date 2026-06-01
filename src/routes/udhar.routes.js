import express from 'express';
import { getUdhars, addUdhar, updateUdhar, deleteUdhar } from '../controllers/udhar.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUdhars)
  .post(addUdhar);

router.route('/:id')
  .put(updateUdhar)
  .delete(deleteUdhar);

export default router;
