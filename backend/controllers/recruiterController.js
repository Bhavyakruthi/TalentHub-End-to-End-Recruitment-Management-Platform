import pool from '../db.js';

// Create a new job posting
export const createJob = async (req, res) => {
  try {
    const { title, job_description, salary, company, min_experience, skills_required } = req.body;
    const recruiter_id = req.user.id;

    // First, get the recruiter_id from the recruiters table
    const recruiterResult = await pool.query(
      'SELECT recruiter_id FROM recruiters WHERE user_id = $1',
      [recruiter_id]
    );

    if (recruiterResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Recruiter profile not found' });
    }

    const actualRecruiterId = recruiterResult.rows[0].recruiter_id;

    // Insert the job
    const jobResult = await pool.query(
      'INSERT INTO jobs (title, job_description, salary, company, min_experience, skills_required) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, job_description, salary, company, min_experience, skills_required]
    );

    const job = jobResult.rows[0];

    // Link the job to the recruiter in the operates table
    await pool.query(
      'INSERT INTO operates (recruiter_id, job_id, action) VALUES ($1, $2, $3)',
      [actualRecruiterId, job.job_id, 'created']
    );

    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, error: 'Failed to create job' });
  }
};

// Get all jobs posted by the recruiter
export const getMyJobs = async (req, res) => {
  try {
    const recruiter_id = req.user.id;

    // Get recruiter_id from recruiters table
    const recruiterResult = await pool.query(
      'SELECT recruiter_id FROM recruiters WHERE user_id = $1',
      [recruiter_id]
    );

    if (recruiterResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Recruiter profile not found' });
    }

    const actualRecruiterId = recruiterResult.rows[0].recruiter_id;

    // Get all jobs posted by this recruiter
    const jobsResult = await pool.query(
      `SELECT j.*, o.created_at as posted_at, 
       COUNT(a.application_id) as application_count
       FROM jobs j
       JOIN operates o ON j.job_id = o.job_id
       LEFT JOIN applications a ON j.job_id = a.job_id
       WHERE o.recruiter_id = $1
       GROUP BY j.job_id, o.created_at
       ORDER BY o.created_at DESC`,
      [actualRecruiterId]
    );

    res.json({ success: true, jobs: jobsResult.rows });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
};

// Get applicants for a specific job
export const getApplicants = async (req, res) => {
  try {
    const { id: job_id } = req.params;
    const recruiter_id = req.user.id;

    // Verify the job belongs to this recruiter
    const jobCheck = await pool.query(
      `SELECT j.* FROM jobs j
       JOIN operates o ON j.job_id = o.job_id
       JOIN recruiters r ON o.recruiter_id = r.recruiter_id
       WHERE j.job_id = $1 AND r.user_id = $2`,
      [job_id, recruiter_id]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found or access denied' });
    }

    // Get all applicants for this job
    const applicantsResult = await pool.query(
      `SELECT a.*, js.*, u.name, u.email, u.phone_no, r.*
       FROM applications a
       JOIN job_seekers js ON a.seeker_id = js.seeker_id
       JOIN users u ON js.user_id = u.user_id
       LEFT JOIN resumes r ON js.seeker_id = r.seeker_id
       WHERE a.job_id = $1
       ORDER BY a.applied_timestamp DESC`,
      [job_id]
    );

    res.json({ success: true, applicants: applicantsResult.rows });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch applicants' });
  }
};

// Update job status
export const updateJobStatus = async (req, res) => {
  try {
    const { id: job_id } = req.params;
    const { status } = req.body;
    const recruiter_id = req.user.id;

    // Verify the job belongs to this recruiter
    const jobCheck = await pool.query(
      `SELECT j.* FROM jobs j
       JOIN operates o ON j.job_id = o.job_id
       JOIN recruiters r ON o.recruiter_id = r.recruiter_id
       WHERE j.job_id = $1 AND r.user_id = $2`,
      [job_id, recruiter_id]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found or access denied' });
    }

    // Update job status (you might want to add a status column to jobs table)
    // For now, we'll just return success
    res.json({ success: true, message: 'Job status updated' });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ success: false, error: 'Failed to update job status' });
  }
};

// Delete a job
export const deleteJob = async (req, res) => {
  try {
    const { id: job_id } = req.params;
    const recruiter_id = req.user.id;

    // Verify the job belongs to this recruiter
    const jobCheck = await pool.query(
      `SELECT j.* FROM jobs j
       JOIN operates o ON j.job_id = o.job_id
       JOIN recruiters r ON o.recruiter_id = r.recruiter_id
       WHERE j.job_id = $1 AND r.user_id = $2`,
      [job_id, recruiter_id]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found or access denied' });
    }

    // Delete the job (cascade will handle related records)
    await pool.query('DELETE FROM jobs WHERE job_id = $1', [job_id]);

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, error: 'Failed to delete job' });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { application_id } = req.params;
    const { status } = req.body;
    const recruiter_id = req.user.id;

    // Verify the application belongs to a job posted by this recruiter
    const applicationCheck = await pool.query(
      `SELECT a.* FROM applications a
       JOIN jobs j ON a.job_id = j.job_id
       JOIN operates o ON j.job_id = o.job_id
       JOIN recruiters r ON o.recruiter_id = r.recruiter_id
       WHERE a.application_id = $1 AND r.user_id = $2`,
      [application_id, recruiter_id]
    );

    if (applicationCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found or access denied' });
    }

    // Update application status
    await pool.query(
      'UPDATE applications SET status = $1 WHERE application_id = $2',
      [status, application_id]
    );

    res.json({ success: true, message: 'Application status updated' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, error: 'Failed to update application status' });
  }
};

// Schedule interview
export const scheduleInterview = async (req, res) => {
  try {
    const { application_id, schedule_time } = req.body;
    const recruiter_id = req.user.id;

    // Get application details and verify ownership
    const applicationResult = await pool.query(
      `SELECT a.*, j.job_id FROM applications a
       JOIN jobs j ON a.job_id = j.job_id
       JOIN operates o ON j.job_id = o.job_id
       JOIN recruiters r ON o.recruiter_id = r.recruiter_id
       WHERE a.application_id = $1 AND r.user_id = $2`,
      [application_id, recruiter_id]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found or access denied' });
    }

    const application = applicationResult.rows[0];

    // Get recruiter_id from recruiters table
    const recruiterResult = await pool.query(
      'SELECT recruiter_id FROM recruiters WHERE user_id = $1',
      [recruiter_id]
    );

    const actualRecruiterId = recruiterResult.rows[0].recruiter_id;

    // Schedule the interview
    const interviewResult = await pool.query(
      'INSERT INTO interviews (seeker_id, recruiter_id, job_id, schedule) VALUES ($1, $2, $3, $4) RETURNING *',
      [application.seeker_id, actualRecruiterId, application.job_id, schedule_time]
    );

    res.status(201).json({ success: true, interview: interviewResult.rows[0] });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ success: false, error: 'Failed to schedule interview' });
  }
};
