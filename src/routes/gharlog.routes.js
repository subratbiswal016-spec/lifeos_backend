import express from 'express';
import { 
  getMembers, addMember, updateMember, deleteMember,
  getAllVisits, getVisits, logVisit, updateVisit, deleteVisit, uploadPrescription,
  getSymptoms, logSymptom, getLatestSymptom
} from '../controllers/gharlog.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

// Family Members (/api/gharlog/members)
router.get('/members', getMembers);
router.post('/members', addMember);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);

// Doctor Visits (we'll mount the whole router at /api so we define full path here for these)
router.get('/visits', getAllVisits);
router.get('/visits/:memberId', getVisits);
router.post('/visits', logVisit);
router.put('/visits/:id', updateVisit);
router.delete('/visits/:id', deleteVisit);
router.post('/visits/:id/prescription', uploadPrescription);

// Symptoms
router.get('/symptoms/:memberId', getSymptoms);
router.post('/symptoms', logSymptom);
router.get('/symptoms/:memberId/latest', getLatestSymptom);

export default router;
