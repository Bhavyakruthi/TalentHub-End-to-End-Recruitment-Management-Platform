import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js'; // make sure the path matches
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running');
});

app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Received registration data:', req.body);

    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      console.log('Validation failed: missing fields');
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    if (password.length < 6) {
      console.log('Validation failed: password too short');
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const userExists = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (userExists.rows.length > 0) {
      console.log('Duplicate email found');
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    const newUser = await pool.query(
      'INSERT INTO users(name, email, password, role, phone) VALUES($1, $2, $3, $4, $5) RETURNING id, name, email, role, phone',
      [name, email, hashedPassword, role, phone]
    );

    console.log('User inserted:', newUser.rows[0]);

    res.status(201).json({ success: true, user: newUser.rows[0] });
  } catch (error) {
    console.error('Registration error caught:', error);  // <--- THIS WILL SHOW REAL ERROR!
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
});

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
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

