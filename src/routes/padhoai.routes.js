import express from 'express';
import { 
  getSubjects, addSubject, updateSubject, deleteSubject,
  startSession, stopSession, getTodaySessions, getWeekSessions, getStudyStats,
  logMockTest, getMockTests
} from '../controllers/padhoai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

// Notice: In `server.js` we can mount this router twice or we can mount it at `/api` to handle both `/subjects` and `/study` paths
// Or we can mount it at `/api` and define full routes here.
// API ENDPOINTS: /api/subjects, /api/study/...

// Subjects
router.get('/subjects', getSubjects);
router.post('/subjects', addSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// Study Sessions
router.post('/study/session/start', startSession);
router.put('/study/session/:id/stop', stopSession);
router.get('/study/sessions/today', getTodaySessions);
router.get('/study/sessions/week', getWeekSessions);
router.get('/study/stats', getStudyStats);

// Mock Tests
router.post('/study/mocktest', logMockTest);
router.get('/study/mocktest/:subjectId', getMockTests);

export default router;
