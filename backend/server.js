import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import recruiterRoutes from './routes/recruiterRoutes.js';
import jobseekerRoutes from './routes/jobseekerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config(); 

const app = express();

app.use(cors());
app.use(express.json());

// Route imports
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/jobseeker', jobseekerRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running');
});

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('Received registration data:', req.body);
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Normalize role coming from frontend: 'jobseeker' -> 'job_seeker'
    const roleInput = String(role).toLowerCase();
    let dbRole;
    if (roleInput === 'jobseeker' || roleInput === 'job_seeker') dbRole = 'job_seeker';
    else if (roleInput === 'recruiter') dbRole = 'recruiter';
    else return res.status(400).json({ success: false, error: 'Invalid role' });

    const userExists = await client.query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query('BEGIN');
    const newUser = await client.query(
      'INSERT INTO users(name, email, password, role, phone_no) VALUES($1, $2, $3, $4, $5) RETURNING user_id, name, email, role, phone_no',
      [name, email, hashedPassword, dbRole, phone]
    );

    const createdUser = newUser.rows[0];

    // Create profile rows based on role to satisfy FK/flows
    if (dbRole === 'job_seeker') {
      // schema requires dob NOT NULL; set a placeholder date; user can update later
      await client.query(
        "INSERT INTO job_seekers (user_id, dob, nationality, address) VALUES ($1, CURRENT_DATE, NULL, NULL)",
        [createdUser.user_id]
      );
    } else if (dbRole === 'recruiter') {
      // schema requires company NOT NULL; set placeholder
      await client.query(
        "INSERT INTO recruiters (user_id, company, ratings, designation) VALUES ($1, 'Unknown', NULL, NULL)",
        [createdUser.user_id]
      );
    }

    await client.query('COMMIT');

    // Normalize role back for frontend expectations: 'job_seeker' -> 'jobseeker'
    const clientRole = createdUser.role === 'job_seeker' ? 'jobseeker' : createdUser.role;

    res.status(201).json({ 
      success: true, 
      user: { id: createdUser.user_id, name: createdUser.name, email: createdUser.email, role: clientRole, phone: createdUser.phone_no }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error caught:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  } finally {
    client.release();
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const userResult = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  if (userResult.rows.length === 0) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const user = userResult.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Normalize role to match frontend routing logic
  const clientRole = user.role === 'job_seeker' ? 'jobseeker' : user.role;

  res.json({
    success: true,
    user: { id: user.user_id, name: user.name, email: user.email, role: clientRole },
    token
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
