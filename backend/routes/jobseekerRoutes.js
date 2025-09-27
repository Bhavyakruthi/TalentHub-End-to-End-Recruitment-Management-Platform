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
  updateEducation,
  deleteEducation,
  getInterviews,
  updateInterviewStatus,
  getResumeTemplates,
  getResumeTemplate,
  listResumes,
  createResumeV2,
  getResumeById,
  updateResume,
  deleteResume,
  getJobseekerStats,
  incrementJobView
} from '../controllers/jobseekerController.js';
import { analyzeResume, getATSTips } from '../controllers/atsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Job search and application routes
router.get('/jobs', getAllJobs);
router.post('/jobs/:job_id/view', authenticateToken, incrementJobView);
router.post('/jobs/:job_id/apply', authenticateToken, applyForJob);
router.get('/applications', authenticateToken, getMyApplications);
router.post('/jobs/:job_id/save', authenticateToken, toggleSaveJob);
router.get('/jobs/saved', authenticateToken, getSavedJobs);

// Resume management routes (back-compat single resume)
router.post('/resume', authenticateToken, createResume);
router.get('/resume', authenticateToken, getResume);
router.post('/resume/experience', authenticateToken, addExperience);
router.put('/resume/experience/:experience_id', authenticateToken, updateExperience);
router.post('/resume/skills', authenticateToken, addSkills);
router.post('/resume/education', authenticateToken, addEducation);
router.put('/resume/education/:education_id', authenticateToken, updateEducation);
router.delete('/resume/education/:education_id', authenticateToken, deleteEducation);

// Multi-resume routes
router.get('/resumes', authenticateToken, listResumes);
router.post('/resumes', authenticateToken, createResumeV2);
router.get('/resumes/:resume_id', authenticateToken, getResumeById);
router.put('/resumes/:resume_id', authenticateToken, updateResume);
router.delete('/resumes/:resume_id', authenticateToken, deleteResume);

// Interview routes
router.get('/interviews', authenticateToken, getInterviews);
router.put('/interviews/:interview_id/status', authenticateToken, updateInterviewStatus);

// Resume template routes
router.get('/resume/templates', getResumeTemplates);
router.get('/resume/templates/:template_id', getResumeTemplate);

// ATS routes
router.post('/ats/analyze', authenticateToken, analyzeResume);
router.get('/ats/tips', getATSTips);

// Live stats
router.get('/stats', authenticateToken, getJobseekerStats);

// Messaging (jobseeker -> recruiter)
import { sendMessageToRecruiter, getConversationWithRecruiter } from '../controllers/jobseekerController.js';
router.post('/messages', authenticateToken, sendMessageToRecruiter);
router.get('/messages/:recruiter_id', authenticateToken, getConversationWithRecruiter);

export default router;
