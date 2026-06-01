import express from 'express';
import { addExpense, getExpenses, deleteExpense } from '../controllers/expense.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', addExpense);
router.get('/', getExpenses);
router.delete('/:id', deleteExpense);

export default router;
