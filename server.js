
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './src/config/db.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import dailyLogRoutes from './src/routes/dailylog.routes.js';
import habitRoutes from './src/routes/habit.routes.js';
import gharlogRoutes from './src/routes/gharlog.routes.js';
import medicineRoutes from './src/routes/medicine.routes.js';
import padhoaiRoutes from './src/routes/padhoai.routes.js';
import aiRoutes from './src/routes/ai.routes.js';
import pdfRoutes from './src/routes/pdf.routes.js';
import udharRoutes from './src/routes/udhar.routes.js';
import expenseRoutes from './src/routes/expense.routes.js';
// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LifeOS India API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dailylog', dailyLogRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/gharlog', gharlogRoutes); 
app.use('/api/medicine', medicineRoutes);
app.use('/api', gharlogRoutes); // /visits, /symptoms
app.use('/api', padhoaiRoutes); // /subjects, /study
app.use('/api/ai', aiRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/udhar', udharRoutes);
app.use('/api/expenses', expenseRoutes);

import { startCronJobs } from './src/services/scheduler.service.js';

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
connectDB().then(() => {
  startCronJobs();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Accessible at http://0.0.0.0:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to connect to database. Server not started.', error);
  process.exit(1);
});
