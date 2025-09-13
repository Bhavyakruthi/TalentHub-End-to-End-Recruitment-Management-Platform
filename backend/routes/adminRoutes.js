import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUserStatus, 
  deleteUser,
  getAllJobs,
  getAllApplications,
  getSystemLogs,
  getDashboardStats,
  deleteJob,
  getDuplicateUsers
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// User management routes
router.get('/users', authenticateToken, getAllUsers);
router.get('/users/:id', authenticateToken, getUserById);
router.put('/users/:id/status', authenticateToken, updateUserStatus);
router.delete('/users/:id', authenticateToken, deleteUser);
router.get('/users/duplicates', authenticateToken, getDuplicateUsers);

// Job management routes
router.get('/jobs', authenticateToken, getAllJobs);
router.delete('/jobs/:id', authenticateToken, deleteJob);

// Application management routes
router.get('/applications', authenticateToken, getAllApplications);

// System management routes
router.get('/logs', authenticateToken, getSystemLogs);
router.get('/dashboard/stats', authenticateToken, getDashboardStats);

export default router;
