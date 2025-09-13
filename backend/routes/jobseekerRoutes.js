import express from 'express';
import { 
  getAllJobs, 
  applyForJob, 
  getMyApplications, 
  toggleSaveJob, 
  getSavedJobs,
  createResume,
  getResume,
  addExperience,
  updateExperience,
  addSkills,
  addEducation,
  getInterviews
} from '../controllers/jobseekerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Job search and application routes
router.get('/jobs', getAllJobs);
router.post('/jobs/:job_id/apply', authenticateToken, applyForJob);
router.get('/applications', authenticateToken, getMyApplications);
router.post('/jobs/:job_id/save', authenticateToken, toggleSaveJob);
router.get('/jobs/saved', authenticateToken, getSavedJobs);

// Resume management routes
router.post('/resume', authenticateToken, createResume);
router.get('/resume', authenticateToken, getResume);
router.post('/resume/experience', authenticateToken, addExperience);
router.put('/resume/experience/:experience_id', authenticateToken, updateExperience);
router.post('/resume/skills', authenticateToken, addSkills);
router.post('/resume/education', authenticateToken, addEducation);

// Interview routes
router.get('/interviews', authenticateToken, getInterviews);

export default router;
