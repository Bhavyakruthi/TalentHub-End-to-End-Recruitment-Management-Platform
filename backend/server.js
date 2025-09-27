import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import recruiterRoutes from './routes/recruiterRoutes.js';
import jobseekerRoutes from './routes/jobseekerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import viewsRoutes from './routes/viewsRoutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';

dotenv.config(); 

const app = express();

// Ensure DB schema compatibility (lightweight migrations)

app.use(cors());
app.use(express.json());

// Route imports
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/jobseeker', jobseekerRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/views', viewsRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running');
});




// GET RECRUITER PROFILE
app.get('/api/recruiter/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM recruiters WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Recruiter profile not found' });
    }
    
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Get recruiter profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

// UPDATE RECRUITER PROFILE
app.put('/api/recruiter/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { company, position, bio } = req.body;
    
    const result = await pool.query(
      'UPDATE recruiters SET company = COALESCE($1, company), designation = COALESCE($2, designation) WHERE user_id = $3 RETURNING *',
      [company, position, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Recruiter profile not found' });
    }
    
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Update recruiter profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// TRACK PROFILE VIEW
app.post('/api/profile/view', authenticateToken, async (req, res) => {
  try {
    const viewerId = req.user.id;
    const { profileUserId } = req.body;
    
    if (viewerId === profileUserId) {
      // Don't count self-views
      return res.json({ success: true, counted: false });
    }
    
    // In a real app, you'd store this in a profile_views table
    // For now, we'll track it in memory or could add to database
    await pool.query(
      `INSERT INTO profile_views (viewer_id, viewed_user_id, viewed_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (viewer_id, viewed_user_id) 
       DO UPDATE SET viewed_at = NOW()`,
      [viewerId, profileUserId]
    ).catch(err => {
      // If table doesn't exist, create it
      if (err.code === '42P01') {
        return pool.query(`
          CREATE TABLE IF NOT EXISTS profile_views (
            viewer_id INTEGER REFERENCES users(user_id),
            viewed_user_id INTEGER REFERENCES users(user_id),
            viewed_at TIMESTAMP DEFAULT NOW(),
            PRIMARY KEY (viewer_id, viewed_user_id)
          )
        `).then(() => {
          return pool.query(
            `INSERT INTO profile_views (viewer_id, viewed_user_id, viewed_at) 
             VALUES ($1, $2, NOW())`,
            [viewerId, profileUserId]
          );
        });
      }
      throw err;
    });
    
    res.json({ success: true, counted: true });
  } catch (error) {
    console.error('Error tracking profile view:', error);
    res.status(500).json({ success: false, error: 'Failed to track view' });
  }
});

// GET PROFILE VIEW COUNT
app.get('/api/profile/views/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if table exists and get count
    const result = await pool.query(
      `SELECT COUNT(DISTINCT viewer_id) as view_count 
       FROM profile_views 
       WHERE viewed_user_id = $1`,
      [userId]
    ).catch(err => {
      if (err.code === '42P01') {
        // Table doesn't exist yet
        return { rows: [{ view_count: 0 }] };
      }
      throw err;
    });
    
    res.json({ 
      success: true, 
      viewCount: parseInt(result.rows[0]?.view_count || 0) 
    });
  } catch (error) {
    console.error('Error getting profile views:', error);
    res.status(500).json({ success: false, error: 'Failed to get view count' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
