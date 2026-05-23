import express from 'express';
import { 
  getMedicines, addMedicine, updateMedicine, deleteMedicine,
  logMedicine, getDueToday, getLowStock 
} from '../controllers/medicine.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/due-today', getDueToday);
router.get('/low-stock', getLowStock);

router.get('/:memberId', getMedicines);
router.post('/', addMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);
router.post('/:id/log', logMedicine);

export default router;
