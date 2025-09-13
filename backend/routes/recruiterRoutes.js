import express from 'express';
import { createJob, getMyJobs, getApplicants } from '../controllers/recruiterController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/jobs', authenticateToken, createJob);
router.get('/jobs/my', authenticateToken, getMyJobs);
router.get('/jobs/:id/applicants', authenticateToken, getApplicants);

export default router;
