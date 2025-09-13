import pool from '../db.js';

// Get all available jobs
export const getAllJobs = async (req, res) => {
  try {
    const { search, location, job_type, salary_min, salary_max, experience } = req.query;
    
    let query = `
      SELECT j.*, 
             COUNT(a.application_id) as application_count,
             u.name as recruiter_name,
             r.company as recruiter_company
      FROM jobs j
      LEFT JOIN applications a ON j.job_id = a.job_id
      LEFT JOIN operates o ON j.job_id = o.job_id
      LEFT JOIN recruiters r ON o.recruiter_id = r.recruiter_id
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (j.title ILIKE $${paramCount} OR j.job_description ILIKE $${paramCount} OR j.company ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (location) {
      query += ` AND j.company ILIKE $${paramCount}`;
      queryParams.push(`%${location}%`);
      paramCount++;
    }

    if (salary_min) {
      query += ` AND j.salary >= $${paramCount}`;
      queryParams.push(salary_min);
      paramCount++;
    }

    if (salary_max) {
      query += ` AND j.salary <= $${paramCount}`;
      queryParams.push(salary_max);
      paramCount++;
    }

    if (experience) {
      query += ` AND j.min_experience <= $${paramCount}`;
      queryParams.push(experience);
      paramCount++;
    }

    query += ` GROUP BY j.job_id, u.name, r.company ORDER BY j.created_at DESC`;

    const result = await pool.query(query, queryParams);
    res.json({ success: true, jobs: result.rows });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
};

// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { job_id } = req.params;
    const user_id = req.user.id;

    // Get job seeker ID
    const seekerResult = await pool.query(
      'SELECT seeker_id FROM job_seekers WHERE user_id = $1',
      [user_id]
    );

    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }

    const seeker_id = seekerResult.rows[0].seeker_id;

    // Check if already applied
    const existingApplication = await pool.query(
      'SELECT * FROM applications WHERE seeker_id = $1 AND job_id = $2',
      [seeker_id, job_id]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Already applied for this job' });
    }

    // Create application
    const applicationResult = await pool.query(
      'INSERT INTO applications (seeker_id, job_id, status) VALUES ($1, $2, $3) RETURNING *',
      [seeker_id, job_id, 'pending']
    );

    res.status(201).json({ success: true, application: applicationResult.rows[0] });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ success: false, error: 'Failed to apply for job' });
  }
};

// Get user's applications
export const getMyApplications = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get job seeker ID
    const seekerResult = await pool.query(
      'SELECT seeker_id FROM job_seekers WHERE user_id = $1',
      [user_id]
    );

    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }

    const seeker_id = seekerResult.rows[0].seeker_id;

    // Get all applications with job details
    const applicationsResult = await pool.query(
      `SELECT a.*, j.title, j.company, j.salary, j.job_description,
              u.name as recruiter_name, r.company as recruiter_company
       FROM applications a
       JOIN jobs j ON a.job_id = j.job_id
       LEFT JOIN operates o ON j.job_id = o.job_id
       LEFT JOIN recruiters r ON o.recruiter_id = r.recruiter_id
       LEFT JOIN users u ON r.user_id = u.user_id
       WHERE a.seeker_id = $1
       ORDER BY a.applied_timestamp DESC`,
      [seeker_id]
    );

    res.json({ success: true, applications: applicationsResult.rows });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
};

// Save/unsave a job
export const toggleSaveJob = async (req, res) => {
  try {
    const { job_id } = req.params;
    const user_id = req.user.id;

    // Get job seeker ID
    const seekerResult = await pool.query(
      'SELECT seeker_id FROM job_seekers WHERE user_id = $1',
      [user_id]
    );

    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }

    const seeker_id = seekerResult.rows[0].seeker_id;

    // Check if job is already saved
    const existingApplication = await pool.query(
      'SELECT * FROM applications WHERE seeker_id = $1 AND job_id = $2',
      [seeker_id, job_id]
    );

    if (existingApplication.rows.length > 0) {
      // Toggle star status
      const newStarStatus = !existingApplication.rows[0].star;
      await pool.query(
        'UPDATE applications SET star = $1 WHERE seeker_id = $2 AND job_id = $3',
        [newStarStatus, seeker_id, job_id]
      );
      
      res.json({ success: true, saved: newStarStatus });
    } else {
      // Create new application with star = true
      await pool.query(
        'INSERT INTO applications (seeker_id, job_id, status, star) VALUES ($1, $2, $3, $4)',
        [seeker_id, job_id, 'saved', true]
      );
      
      res.json({ success: true, saved: true });
    }
  } catch (error) {
    console.error('Error toggling save job:', error);
    res.status(500).json({ success: false, error: 'Failed to save job' });
  }
};

// Get saved jobs
export const getSavedJobs = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get job seeker ID
    const seekerResult = await pool.query(
      'SELECT seeker_id FROM job_seekers WHERE user_id = $1',
      [user_id]
    );

    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }

    const seeker_id = seekerResult.rows[0].seeker_id;

    // Get saved jobs
    const savedJobsResult = await pool.query(
      `SELECT j.*, a.star, a.applied_timestamp as saved_at
       FROM jobs j
       JOIN applications a ON j.job_id = a.job_id
       WHERE a.seeker_id = $1 AND a.star = true
       ORDER BY a.applied_timestamp DESC`,
      [seeker_id]
    );

    res.json({ success: true, jobs: savedJobsResult.rows });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch saved jobs' });
  }
};

// Create or update resume
export const createResume = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { statement_profile, linkedin_url, github_url } = req.body;

    // Get job seeker ID
    const seekerResult = await pool.query(
      'SELECT seeker_id FROM job_seekers WHERE user_id = $1',
      [user_id]
    );

    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }

    const seeker_id = seekerResult.rows[0].seeker_id;

    // Check if resume already exists
    const existingResume = await pool.query(
      'SELECT * FROM resumes WHERE seeker_id = $1',
      [seeker_id]
    );

    let resume;
    if (existingResume.rows.length > 0) {
      // Update existing resume
      const updateResult = await pool.query(
        'UPDATE resumes SET statement_profile = $1, linkedin_url = $2, github_url = $3 WHERE seeker_id = $4 RETURNING *',
        [statement_profile, linkedin_url, github_url, seeker_id]
      );
      resume = updateResult.rows[0];
    } else {
      // Create new resume
      const createResult = await pool.query(
        'INSERT INTO resumes (seeker_id, statement_profile, linkedin_url, github_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [seeker_id, statement_profile, linkedin_url, github_url]
      );
      resume = createResult.rows[0];
    }

    res.json({ success: true, resume });
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({ success: false, error: 'Failed to create resume' });
  }
};

// Get resume
export const getResume = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get job seeker ID
    const seekerResult = await pool.query(
      'SELECT seeker_id FROM job_seekers WHERE user_id = $1',
      [user_id]
    );

    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }

    const seeker_id = seekerResult.rows[0].seeker_id;

    // Get resume with experiences, skills, and education
    const resumeResult = await pool.query(
      'SELECT * FROM resumes WHERE seeker_id = $1',
      [seeker_id]
    );

    if (resumeResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const resume = resumeResult.rows[0];

    // Get experiences
    const experiencesResult = await pool.query(
      'SELECT * FROM experiences WHERE resume_id = $1 ORDER BY created_at DESC',
      [resume.resume_id]
    );

    // Get skills
    const skillsResult = await pool.query(
      'SELECT * FROM skills WHERE resume_id = $1',
      [resume.resume_id]
    );

    // Get education
    const educationResult = await pool.query(
      'SELECT * FROM education WHERE resume_id = $1 ORDER BY end_date DESC',
      [resume.resume_id]
    );

    resume.experiences = experiencesResult.rows;
    resume.skills = skillsResult.rows;
    resume.education = educationResult.rows;

    res.json({ success: true, resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch resume' });
  }
};

// Add experience to resume
export const addExperience = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { company, duration, job_title, description } = req.body;

    // Get job seeker ID and resume ID
    const seekerResult = await pool.query(
      'SELECT seeker_id FROM job_seekers WHERE user_id = $1',
      [user_id]
    );

    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }

    const seeker_id = seekerResult.rows[0].seeker_id;

    const resumeResult = await pool.query(
      'SELECT resume_id FROM resumes WHERE seeker_id = $1',
      [seeker_id]
    );

    if (resumeResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const resume_id = resumeResult.rows[0].resume_id;

    // Add experience
    const experienceResult = await pool.query(
      'INSERT INTO experiences (resume_id, company, duration, job_title, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [resume_id, company, duration, job_title, description]
    );

    res.status(201).json({ success: true, experience: experienceResult.rows[0] });
  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({ success: false, error: 'Failed to add experience' });
  }
};

// Update an experience row
export const updateExperience = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { experience_id } = req.params;
    const { company, duration, job_title, description } = req.body;

    // Verify ownership: find resume for this user and ensure experience belongs to it
    const seekerResult = await pool.query(
      'SELECT seeker_id FROM job_seekers WHERE user_id = $1',
      [user_id]
    );
    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }
    const seeker_id = seekerResult.rows[0].seeker_id;

    const resumeResult = await pool.query(
      'SELECT resume_id FROM resumes WHERE seeker_id = $1',
      [seeker_id]
    );
    if (resumeResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    const resume_id = resumeResult.rows[0].resume_id;

    const expResult = await pool.query(
      'SELECT experience_id FROM experiences WHERE experience_id = $1 AND resume_id = $2',
      [experience_id, resume_id]
    );
    if (expResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Experience not found' });
    }

    await pool.query(
      'UPDATE experiences SET company = $1, duration = $2, job_title = $3, description = $4 WHERE experience_id = $5',
      [company, duration, job_title, description, experience_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ success: false, error: 'Failed to update experience' });
  }
};

// Add skills to resume
export const addSkills = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { skill_type, skills } = req.body;

    // Get job seeker ID and resume ID
    const seekerResult = await pool.query(
      'SELECT seeker_id FROM job_seekers WHERE user_id = $1',
      [user_id]
    );

    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }

    const seeker_id = seekerResult.rows[0].seeker_id;

    const resumeResult = await pool.query(
      'SELECT resume_id FROM resumes WHERE seeker_id = $1',
      [seeker_id]
    );

    if (resumeResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const resume_id = resumeResult.rows[0].resume_id;

    // Check if skills of this type already exist
    const existingSkills = await pool.query(
      'SELECT * FROM skills WHERE resume_id = $1 AND skill_type = $2',
      [resume_id, skill_type]
    );

    if (existingSkills.rows.length > 0) {
      // Update existing skills
      await pool.query(
        'UPDATE skills SET skills = $1 WHERE resume_id = $2 AND skill_type = $3',
        [skills, resume_id, skill_type]
      );
    } else {
      // Add new skills
      await pool.query(
        'INSERT INTO skills (resume_id, skill_type, skills) VALUES ($1, $2, $3)',
        [resume_id, skill_type, skills]
      );
    }

    res.json({ success: true, message: 'Skills updated successfully' });
  } catch (error) {
    console.error('Error adding skills:', error);
    res.status(500).json({ success: false, error: 'Failed to add skills' });
  }
};

// Add education to resume
export const addEducation = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { qualification, college, gpa, start_date, end_date } = req.body;

    // Get job seeker ID and resume ID
    const seekerResult = await pool.query(
      'SELECT seeker_id FROM job_seekers WHERE user_id = $1',
      [user_id]
    );

    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }

    const seeker_id = seekerResult.rows[0].seeker_id;

    const resumeResult = await pool.query(
      'SELECT resume_id FROM resumes WHERE seeker_id = $1',
      [seeker_id]
    );

    if (resumeResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const resume_id = resumeResult.rows[0].resume_id;

    // Add education
    const educationResult = await pool.query(
      'INSERT INTO education (resume_id, qualification, college, gpa, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [resume_id, qualification, college, gpa, start_date, end_date]
    );

    res.status(201).json({ success: true, education: educationResult.rows[0] });
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({ success: false, error: 'Failed to add education' });
  }
};

// Get interviews
export const getInterviews = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get job seeker ID
    const seekerResult = await pool.query(
      'SELECT seeker_id FROM job_seekers WHERE user_id = $1',
      [user_id]
    );

    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }

    const seeker_id = seekerResult.rows[0].seeker_id;

    // Get interviews
    const interviewsResult = await pool.query(
      `SELECT i.*, j.title as job_title, j.company, u.name as recruiter_name
       FROM interviews i
       JOIN jobs j ON i.job_id = j.job_id
       JOIN recruiters r ON i.recruiter_id = r.recruiter_id
       JOIN users u ON r.user_id = u.user_id
       WHERE i.seeker_id = $1
       ORDER BY i.schedule DESC`,
      [seeker_id]
    );

    res.json({ success: true, interviews: interviewsResult.rows });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch interviews' });
  }
};
