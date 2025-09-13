import express from 'express';
import { 
  createJob, 
  getMyJobs, 
  getApplicants, 
  updateJobStatus, 
  deleteJob, 
  updateApplicationStatus, 
  scheduleInterview 
} from '../controllers/recruiterController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Job management routes
router.post('/jobs', authenticateToken, createJob);
router.get('/jobs/my', authenticateToken, getMyJobs);
router.put('/jobs/:id/status', authenticateToken, updateJobStatus);
router.delete('/jobs/:id', authenticateToken, deleteJob);

// Application management routes
router.get('/jobs/:id/applicants', authenticateToken, getApplicants);
router.put('/applications/:application_id/status', authenticateToken, updateApplicationStatus);
router.post('/interviews', authenticateToken, scheduleInterview);

export default router;
