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
      query += ` AND (j.location ILIKE $${paramCount} OR j.company ILIKE $${paramCount})`;
      queryParams.push(`%${location}%`);
      paramCount++;
    }

    if (job_type) {
      query += ` AND j.job_type = $${paramCount}`;
      queryParams.push(job_type);
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

    // Create application with star = true (since they're applying, they're interested)
    const applicationResult = await pool.query(
      'INSERT INTO applications (seeker_id, job_id, status, star) VALUES ($1, $2, $3, $4) RETURNING *',
      [seeker_id, job_id, 'applied', true]
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

    // Check if application exists
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
      // Create new application with star = true (saved but not applied)
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

    // Get saved jobs (applications with star = true)
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

// Create or update resume (back-compat: updates the primary or latest if resume_id not provided)
export const createResume = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { statement_profile, linkedin_url, github_url, title, is_primary, resume_id } = req.body;

    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }
    const seeker_id = seekerResult.rows[0].seeker_id;

    if (resume_id) {
      // Update a specific resume
      const updated = await pool.query(
        'UPDATE resumes SET statement_profile = COALESCE($1, statement_profile), linkedin_url = COALESCE($2, linkedin_url), github_url = COALESCE($3, github_url), title = COALESCE($4, title), is_primary = COALESCE($5, is_primary) WHERE resume_id = $6 AND seeker_id = $7 RETURNING *',
        [statement_profile, linkedin_url, github_url, title, is_primary, resume_id, seeker_id]
      );
      if (updated.rows.length === 0) return res.status(404).json({ success: false, error: 'Resume not found' });
      return res.json({ success: true, resume: updated.rows[0] });
    }

    // No resume_id provided: create or update (single-resume schema compatibility)
    let created;
    try {
      created = await pool.query(
        'INSERT INTO resumes (seeker_id, statement_profile, linkedin_url, github_url, title, is_primary) VALUES ($1, $2, $3, $4, COALESCE($5, $6), COALESCE($7, false)) RETURNING *',
        [seeker_id, statement_profile, linkedin_url, github_url, title, 'Untitled Resume', is_primary]
      );
    } catch (e) {
      // On unique violation of seeker_id, update existing row
      if (e?.code === '23505') {
        const up = await pool.query(
          'UPDATE resumes SET statement_profile = COALESCE($1, statement_profile), linkedin_url = COALESCE($2, linkedin_url), github_url = COALESCE($3, github_url), title = COALESCE($4, title), is_primary = COALESCE($5, is_primary) WHERE seeker_id = $6 RETURNING *',
          [statement_profile, linkedin_url, github_url, title ?? 'Untitled Resume', is_primary, seeker_id]
        );
        return res.json({ success: true, resume: up.rows[0] });
      }
      throw e;
    }

    // If set as primary, unset others
    if (created.rows[0].is_primary) {
      await pool.query('UPDATE resumes SET is_primary = false WHERE seeker_id = $1 AND resume_id <> $2', [seeker_id, created.rows[0].resume_id]);
    }

    return res.json({ success: true, resume: created.rows[0] });
  } catch (error) {
    console.error('Error creating/updating resume:', error);
    res.status(500).json({ success: false, error: 'Failed to create/update resume' });
  }
};

// Get resume
export const getResume = async (req, res) => {
  try {
    const user_id = req.user.id;

    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) {
      return res.status(200).json({ success: true, resume: null });
    }
    const seeker_id = seekerResult.rows[0].seeker_id;

    // Prefer primary resume; fallback to most recent
    const resumeResult = await pool.query(
      `SELECT * FROM resumes WHERE seeker_id = $1 ORDER BY is_primary DESC, resume_id DESC LIMIT 1`,
      [seeker_id]
    );

    if (resumeResult.rows.length === 0) {
      return res.status(200).json({ success: true, resume: null });
    }

    const resume = resumeResult.rows[0];

    // Get experiences
    const experiencesResult = await pool.query(
      'SELECT * FROM experiences WHERE resume_id = $1 ORDER BY experience_id DESC',
      [resume.resume_id]
    );

    // Get skills
    const skillsResult = await pool.query(
      'SELECT * FROM skills WHERE resume_id = $1',
      [resume.resume_id]
    );

    // Get education
    const educationResult = await pool.query(
      'SELECT * FROM education WHERE resume_id = $1 ORDER BY end_date DESC NULLS LAST',
      [resume.resume_id]
    );

    resume.experiences = experiencesResult.rows;
    resume.skills = skillsResult.rows;
    resume.education = educationResult.rows;

    res.json({ success: true, resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    // Return soft-success with no resume to avoid breaking dashboards on schema drift
    res.status(200).json({ success: true, resume: null });
  }
};

// Add experience to resume
export const addExperience = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { company, duration, job_title, description, resume_id: providedResumeId } = req.body;

    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }
    const seeker_id = seekerResult.rows[0].seeker_id;

    let resume_id = providedResumeId;
    if (!resume_id) {
      const resumeResult = await pool.query(
        'SELECT resume_id FROM resumes WHERE seeker_id = $1 ORDER BY is_primary DESC, resume_id DESC LIMIT 1',
        [seeker_id]
      );
      if (resumeResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Resume not found' });
      }
      resume_id = resumeResult.rows[0].resume_id;
    }

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
    const { skill_type, skills, resume_id: providedResumeId } = req.body;

    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }
    const seeker_id = seekerResult.rows[0].seeker_id;

    let resume_id = providedResumeId;
    if (!resume_id) {
      const resumeResult = await pool.query(
        'SELECT resume_id FROM resumes WHERE seeker_id = $1 ORDER BY is_primary DESC, resume_id DESC LIMIT 1',
        [seeker_id]
      );
      if (resumeResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Resume not found' });
      }
      resume_id = resumeResult.rows[0].resume_id;
    }

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
    const { qualification, college, gpa, start_date, end_date, resume_id: providedResumeId } = req.body;

    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }
    const seeker_id = seekerResult.rows[0].seeker_id;

    let resume_id = providedResumeId;
    if (!resume_id) {
      const resumeResult = await pool.query(
        'SELECT resume_id FROM resumes WHERE seeker_id = $1 ORDER BY is_primary DESC, resume_id DESC LIMIT 1',
        [seeker_id]
      );
      if (resumeResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Resume not found' });
      }
      resume_id = resumeResult.rows[0].resume_id;
    }

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

// Update an education row
export const updateEducation = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { education_id } = req.params;
    const { qualification, college, gpa, start_date, end_date } = req.body;

    // Verify ownership via seeker_id
    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }
    const seeker_id = seekerResult.rows[0].seeker_id;

    // Ensure the education belongs to a resume owned by this seeker
    const eduResult = await pool.query(
      `SELECT e.education_id FROM education e
       JOIN resumes r ON e.resume_id = r.resume_id
       WHERE e.education_id = $1 AND r.seeker_id = $2`,
      [education_id, seeker_id]
    );
    if (eduResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Education not found' });
    }

    await pool.query(
      `UPDATE education
       SET qualification = COALESCE($1, qualification),
           college = COALESCE($2, college),
           gpa = $3,
           start_date = $4,
           end_date = $5
       WHERE education_id = $6`,
      [qualification, college, gpa, start_date, end_date, education_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({ success: false, error: 'Failed to update education' });
  }
};

// Delete an education row
export const deleteEducation = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { education_id } = req.params;

    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    }
    const seeker_id = seekerResult.rows[0].seeker_id;

    const eduResult = await pool.query(
      `SELECT e.education_id FROM education e
       JOIN resumes r ON e.resume_id = r.resume_id
       WHERE e.education_id = $1 AND r.seeker_id = $2`,
      [education_id, seeker_id]
    );
    if (eduResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Education not found' });
    }

    await pool.query('DELETE FROM education WHERE education_id = $1', [education_id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({ success: false, error: 'Failed to delete education' });
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

    // Get interviews with enhanced data
    const interviewsResult = await pool.query(
      `SELECT i.*, j.title as job_title, j.company, u.name as recruiter_name, u.email as recruiter_email
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

// Update interview status (for job seeker to confirm/cancel)
export const updateInterviewStatus = async (req, res) => {
  try {
    const { interview_id } = req.params;
    const { status, notes } = req.body;
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

    // Verify interview belongs to this job seeker
    const interviewResult = await pool.query(
      'SELECT * FROM interviews WHERE interview_id = $1 AND seeker_id = $2',
      [interview_id, seeker_id]
    );

    if (interviewResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }

    // Update interview status
    await pool.query(
      'UPDATE interviews SET status = $1, notes = COALESCE($2, notes) WHERE interview_id = $3',
      [status, notes, interview_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating interview status:', error);
    res.status(500).json({ success: false, error: 'Failed to update interview status' });
  }
};

// Get resume templates
export const getResumeTemplates = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM resume_templates';
    let params = [];
    
    if (category && category !== 'all') {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const templatesResult = await pool.query(query, params);
    res.json({ success: true, templates: templatesResult.rows });
  } catch (error) {
    console.error('Error fetching resume templates:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch resume templates' });
  }
};


// Messaging (jobseeker <-> recruiter)
export const sendMessageToRecruiter = async (req, res) => {
  try {
    const sender_user_id = req.user.id;
    const { recruiter_id, body, application_id } = req.body;
    if (!recruiter_id || !body) return res.status(400).json({ success: false, error: 'Missing recruiter_id or body' });

    const recUser = await pool.query('SELECT user_id FROM recruiters WHERE recruiter_id = $1', [recruiter_id]);
    if (recUser.rows.length === 0) return res.status(404).json({ success: false, error: 'Recruiter not found' });
    const receiver_user_id = recUser.rows[0].user_id;

    const inserted = await pool.query(
      'INSERT INTO messages (sender_user_id, receiver_user_id, application_id, body) VALUES ($1, $2, $3, $4) RETURNING *',
      [sender_user_id, receiver_user_id, application_id ?? null, body]
    );
    res.status(201).json({ success: true, message: inserted.rows[0] });
  } catch (error) {
    console.error('Error sending message (jobseeker):', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};

export const getConversationWithRecruiter = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { recruiter_id } = req.params;
    const rid = Number(recruiter_id);
    if (!rid) return res.status(400).json({ success: false, error: 'Invalid recruiter_id' });

    const recUser = await pool.query('SELECT user_id FROM recruiters WHERE recruiter_id = $1', [rid]);
    if (recUser.rows.length === 0) return res.status(404).json({ success: false, error: 'Recruiter not found' });
    const other_user_id = recUser.rows[0].user_id;

    const conv = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_user_id = $1 AND receiver_user_id = $2)
          OR (sender_user_id = $2 AND receiver_user_id = $1)
       ORDER BY created_at ASC`,
      [user_id, other_user_id]
    );

    res.json({ success: true, messages: conv.rows });
  } catch (error) {
    console.error('Error fetching conversation (jobseeker):', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
  }
};

// Live jobseeker stats
export const getJobseekerStats = async (req, res) => {
  try {
    const user_id = req.user.id;

    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    const seeker_id = seekerResult.rows[0].seeker_id;

    // Applications count (schema-tolerant)
    let appliedJobs = 0;
    try {
      const appsRes = await pool.query('SELECT COUNT(*)::int AS cnt FROM applications WHERE seeker_id = $1', [seeker_id]);
      appliedJobs = appsRes.rows[0]?.cnt || 0;
    } catch (err) {
      if (err?.code === '42P01') {
        appliedJobs = 0;
      } else { throw err; }
    }

    // Interviews count (schema-tolerant)
    let interviewsScheduled = 0;
    try {
      const interviewsRes = await pool.query(
        `SELECT COUNT(*)::int AS cnt FROM interviews
         WHERE seeker_id = $1 AND schedule >= NOW() AND status IN ('scheduled','confirmed')`,
        [seeker_id]
      );
      interviewsScheduled = interviewsRes.rows[0]?.cnt || 0;
    } catch (err) {
      if (err?.code === '42P01' || err?.code === '42703') {
        interviewsScheduled = 0;
      } else { throw err; }
    }

    // Optional: profile views table may not exist. Try, else 0.
    let profileViews = 0;
    try {
      const viewsRes = await pool.query('SELECT COUNT(*)::int AS cnt FROM profile_views WHERE viewed_user_id = $1', [user_id]);
      profileViews = viewsRes.rows[0]?.cnt || 0;
    } catch {}

    res.json({ success: true, stats: {
      appliedJobs,
      interviewsScheduled,
      profileViews
    }});
  } catch (error) {
    console.error('Error computing jobseeker stats:', error);
    res.status(500).json({ success: false, error: 'Failed to load stats' });
  }
};

// Increment job view counter (simple counter)
export const incrementJobView = async (req, res) => {
  try {
    const { job_id } = req.params;
    await pool.query('UPDATE jobs SET views = COALESCE(views,0) + 1 WHERE job_id = $1', [job_id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error incrementing job view:', error);
    res.status(500).json({ success: false, error: 'Failed to record view' });
  }
};

// Get specific resume template
// New multi-resume endpoints
export const listResumes = async (req, res) => {
  try {
    const user_id = req.user.id;
    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    const seeker_id = seekerResult.rows[0].seeker_id;

    const result = await pool.query('SELECT * FROM resumes WHERE seeker_id = $1 ORDER BY is_primary DESC, resume_id DESC', [seeker_id]);
    res.json({ success: true, resumes: result.rows });
  } catch (error) {
    console.error('Error listing resumes:', error);
    res.status(500).json({ success: false, error: 'Failed to list resumes' });
  }
};

export const createResumeV2 = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { statement_profile, linkedin_url, github_url, title, is_primary } = req.body;
    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    const seeker_id = seekerResult.rows[0].seeker_id;

    const created = await pool.query(
      'INSERT INTO resumes (seeker_id, statement_profile, linkedin_url, github_url, title, is_primary) VALUES ($1, $2, $3, $4, COALESCE($5,$6), COALESCE($7,false)) RETURNING *',
      [seeker_id, statement_profile, linkedin_url, github_url, title, 'Untitled Resume', is_primary]
    );

    if (created.rows[0].is_primary) {
      await pool.query('UPDATE resumes SET is_primary = false WHERE seeker_id = $1 AND resume_id <> $2', [seeker_id, created.rows[0].resume_id]);
    }

    res.status(201).json({ success: true, resume: created.rows[0] });
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({ success: false, error: 'Failed to create resume' });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { resume_id } = req.params;
    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    const seeker_id = seekerResult.rows[0].seeker_id;

    const resumeResult = await pool.query('SELECT * FROM resumes WHERE resume_id = $1 AND seeker_id = $2', [resume_id, seeker_id]);
    if (resumeResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Resume not found' });
    const resume = resumeResult.rows[0];

    const experiences = await pool.query('SELECT * FROM experiences WHERE resume_id = $1 ORDER BY experience_id DESC', [resume.resume_id]);
    const skills = await pool.query('SELECT * FROM skills WHERE resume_id = $1', [resume.resume_id]);
    const education = await pool.query('SELECT * FROM education WHERE resume_id = $1 ORDER BY end_date DESC', [resume.resume_id]);

    resume.experiences = experiences.rows;
    resume.skills = skills.rows;
    resume.education = education.rows;

    res.json({ success: true, resume });
  } catch (error) {
    console.error('Error getting resume:', error);
    res.status(500).json({ success: false, error: 'Failed to get resume' });
  }
};

export const updateResume = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { resume_id } = req.params;
    const { statement_profile, linkedin_url, github_url, title, is_primary } = req.body;

    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    const seeker_id = seekerResult.rows[0].seeker_id;

    const updated = await pool.query(
      'UPDATE resumes SET statement_profile = COALESCE($1, statement_profile), linkedin_url = COALESCE($2, linkedin_url), github_url = COALESCE($3, github_url), title = COALESCE($4, title), is_primary = COALESCE($5, is_primary) WHERE resume_id = $6 AND seeker_id = $7 RETURNING *',
      [statement_profile, linkedin_url, github_url, title, is_primary, resume_id, seeker_id]
    );
    if (updated.rows.length === 0) return res.status(404).json({ success: false, error: 'Resume not found' });

    if (updated.rows[0].is_primary) {
      await pool.query('UPDATE resumes SET is_primary = false WHERE seeker_id = $1 AND resume_id <> $2', [seeker_id, resume_id]);
    }

    res.json({ success: true, resume: updated.rows[0] });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ success: false, error: 'Failed to update resume' });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { resume_id } = req.params;
    const seekerResult = await pool.query('SELECT seeker_id FROM job_seekers WHERE user_id = $1', [user_id]);
    if (seekerResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Job seeker profile not found' });
    const seeker_id = seekerResult.rows[0].seeker_id;

    const existing = await pool.query('SELECT is_primary FROM resumes WHERE resume_id = $1 AND seeker_id = $2', [resume_id, seeker_id]);
    if (existing.rows.length === 0) return res.status(404).json({ success: false, error: 'Resume not found' });

    await pool.query('DELETE FROM resumes WHERE resume_id = $1 AND seeker_id = $2', [resume_id, seeker_id]);

    // If the deleted resume was primary, set another as primary
    if (existing.rows[0].is_primary) {
      await pool.query(
        'WITH cand AS (SELECT resume_id FROM resumes WHERE seeker_id = $1 ORDER BY created_at DESC LIMIT 1) UPDATE resumes SET is_primary = true FROM cand WHERE resumes.resume_id = cand.resume_id',
        [seeker_id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ success: false, error: 'Failed to delete resume' });
  }
};

export const getResumeTemplate = async (req, res) => {
  try {
    const { template_id } = req.params;
    
    const templateResult = await pool.query(
      'SELECT * FROM resume_templates WHERE template_id = $1',
      [template_id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.json({ success: true, template: templateResult.rows[0] });
  } catch (error) {
    console.error('Error fetching resume template:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch resume template' });
  }
};
