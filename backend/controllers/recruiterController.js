import pool from '../db.js';

// Live recruiter stats
export const getRecruiterStats = async (req, res) => {
  try {
    const recruiter_user_id = req.user.id;
    const rec = await pool.query('SELECT recruiter_id FROM recruiters WHERE user_id = $1', [recruiter_user_id]);
    if (rec.rows.length === 0) return res.status(404).json({ success: false, error: 'Recruiter profile not found' });
    const recruiter_id = rec.rows[0].recruiter_id;

    // Jobs managed by recruiter (schema-tolerant)
    let jobs = [];
    try {
      const jobsRes = await pool.query(
        `SELECT j.job_id, j.status, COALESCE(j.views,0) as views,
                (SELECT COUNT(*) FROM applications a WHERE a.job_id=j.job_id) as application_count
         FROM jobs j
         JOIN operates o ON j.job_id = o.job_id
         WHERE o.recruiter_id = $1`,
        [recruiter_id]
      );
      jobs = jobsRes.rows;
    } catch (err) {
      // Handle missing columns like status/views (42703)
      if (err?.code === '42703') {
        const fallback = await pool.query(
          `SELECT j.job_id,
                  (SELECT COUNT(*) FROM applications a WHERE a.job_id=j.job_id) as application_count
           FROM jobs j
           JOIN operates o ON j.job_id = o.job_id
           WHERE o.recruiter_id = $1`,
          [recruiter_id]
        );
        jobs = fallback.rows.map(r => ({
          job_id: r.job_id,
          status: 'active', // assume active if no status column
          views: 0,
          application_count: Number(r.application_count || 0)
        }));
      } else {
        throw err;
      }
    }

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const totalApplications = jobs.reduce((sum, j) => sum + Number(j.application_count || 0), 0);
    const totalViews = jobs.reduce((sum, j) => sum + Number(j.views || 0), 0);

    // New applications in last 7 days (schema-tolerant)
    let newApplications = 0;
    try {
      const newAppsRes = await pool.query(
        `SELECT COUNT(*)::int AS cnt
         FROM applications a
         JOIN jobs j ON a.job_id = j.job_id
         JOIN operates o ON j.job_id = o.job_id
         WHERE o.recruiter_id = $1 AND a.applied_timestamp >= NOW() - INTERVAL '7 days'`,
        [recruiter_id]
      );
      newApplications = newAppsRes.rows[0]?.cnt || 0;
    } catch (err) {
      // If applied_timestamp missing, fall back to total applications for this recruiter
      if (err?.code === '42703') {
        const allApps = await pool.query(
          `SELECT COUNT(*)::int AS cnt
           FROM applications a
           JOIN jobs j ON a.job_id = j.job_id
           JOIN operates o ON j.job_id = o.job_id
           WHERE o.recruiter_id = $1`,
          [recruiter_id]
        );
        newApplications = allApps.rows[0]?.cnt || 0;
      } else {
        throw err;
      }
    }

    // Upcoming interviews (schema-tolerant)
    let scheduledInterviews = 0;
    try {
      const upcomingInterviewsRes = await pool.query(
        `SELECT COUNT(*)::int AS cnt FROM interviews i
         WHERE i.recruiter_id = $1 AND i.schedule >= NOW() AND i.status IN ('scheduled','confirmed')`,
        [recruiter_id]
      );
      scheduledInterviews = upcomingInterviewsRes.rows[0]?.cnt || 0;
    } catch (err) {
      // Table or columns may be missing
      if (err?.code === '42P01' || err?.code === '42703') {
        scheduledInterviews = 0;
      } else {
        throw err;
      }
    }

    // Hired candidates (schema-tolerant)
    let hiredCandidates = 0;
    try {
      const hiredRes = await pool.query(
        `SELECT COUNT(*)::int AS cnt FROM applications a
         JOIN jobs j ON a.job_id = j.job_id
         JOIN operates o ON j.job_id = o.job_id
         WHERE o.recruiter_id = $1 AND a.status IN ('hired','accepted') AND a.applied_timestamp >= NOW() - INTERVAL '30 days'`,
        [recruiter_id]
      );
      hiredCandidates = hiredRes.rows[0]?.cnt || 0;
    } catch (err) {
      if (err?.code === '42703') {
        // Missing status or applied_timestamp column; fallback to 0
        hiredCandidates = 0;
      } else {
        throw err;
      }
    }

    res.json({ success: true, stats: {
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews,
      newApplications,
      scheduledInterviews,
      hiredCandidates
    }});
  } catch (error) {
    console.error('Error computing recruiter stats:', error);
    res.status(500).json({ success: false, error: 'Failed to load stats' });
  }
};

// Create a new job posting
export const createJob = async (req, res) => {
  try {
    const { title, job_description, salary, company, min_experience, skills_required, location, job_type } = req.body;
    const recruiter_id = req.user.id;

    if (!title || !company || !job_description) {
      return res.status(400).json({ success: false, error: 'Missing required fields: title, company, job_description' });
    }

    // First, get the recruiter_id from the recruiters table
    const recruiterResult = await pool.query(
      'SELECT recruiter_id FROM recruiters WHERE user_id = $1',
      [recruiter_id]
    );

    if (recruiterResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Recruiter profile not found' });
    }

    const actualRecruiterId = recruiterResult.rows[0].recruiter_id;

    // Normalize inputs
    const skillsArray = Array.isArray(skills_required) ? skills_required : [];
    const numericSalary = salary !== undefined && salary !== null && salary !== '' ? Number(salary) : null;
    const jobType = job_type || 'full-time';

    // Insert the job (compatible with older schemas without location/job_type)
    const jobResult = await pool.query(
      'INSERT INTO jobs (title, job_description, salary, company, min_experience, skills_required) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, job_description, numericSalary, company, min_experience ?? null, skillsArray]
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
    res.status(500).json({ success: false, error: `Failed to create job: ${error.message}` });
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

    if (!['active','paused','closed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

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

    try {
      await pool.query('UPDATE jobs SET status = $1 WHERE job_id = $2', [status, job_id]);
      return res.json({ success: true, message: 'Job status updated' });
    } catch (err) {
      // If the status column doesn't exist (older schema), return success (no-op) for backward compatibility
      if (err?.code === '42703') {
        console.warn('jobs.status column missing; returning no-op success for updateJobStatus');
        return res.json({ success: true, message: 'Job status updated (not persisted on this schema)' });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ success: false, error: 'Failed to update job status' });
  }
};

// Send email to candidate via SMTP
import nodemailer from 'nodemailer';

export const sendEmailToCandidate = async (req, res) => {
  // Logging-only: We open Gmail on the client; server stores a record for Email Management
  try {
    const sender_user_id = req.user.id;
    const { to, subject, body, application_id } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ success: false, error: 'Missing to, subject, or body' });
    }

    const preview = String(body).slice(0, 1000);

    try {
      await pool.query(
        `INSERT INTO email_logs (sender_user_id, to_email, subject, body_preview, application_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [sender_user_id, to, subject, preview, application_id ?? null]
      );
    } catch (err) {
      if (err.code === '42P01') {
        // Table missing; create minimal structure and retry once
        await pool.query(`
          CREATE TABLE IF NOT EXISTS email_logs (
            id SERIAL PRIMARY KEY,
            sender_user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
            to_email VARCHAR(255) NOT NULL,
            subject TEXT,
            body_preview TEXT,
            application_id INT REFERENCES applications(application_id) ON DELETE SET NULL,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await pool.query(
          `INSERT INTO email_logs (sender_user_id, to_email, subject, body_preview, application_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [sender_user_id, to, subject, preview, application_id ?? null]
        );
      } else {
        throw err;
      }
    }

    return res.json({ success: true, logged: true });
  } catch (error) {
    console.error('Error logging email:', error);
    res.status(500).json({ success: false, error: 'Failed to log email' });
  }
};

// Get applicant profile (resume + details) for a specific application
export const getApplicantProfile = async (req, res) => {
  try {
    const { application_id } = req.params;
    const recruiter_user_id = req.user.id;

    // Verify this application belongs to a job managed by this recruiter
    const appCheck = await pool.query(
      `SELECT a.seeker_id, a.job_id
       FROM applications a
       JOIN jobs j ON a.job_id = j.job_id
       JOIN operates o ON j.job_id = o.job_id
       JOIN recruiters r ON o.recruiter_id = r.recruiter_id
       WHERE a.application_id = $1 AND r.user_id = $2`,
      [application_id, recruiter_user_id]
    );
    if (appCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found or access denied' });
    }
    const seeker_id = appCheck.rows[0].seeker_id;

    // Get candidate basic info
    const userRes = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.phone_no, js.seeker_id, js.address
       FROM job_seekers js JOIN users u ON js.user_id = u.user_id
       WHERE js.seeker_id = $1`,
      [seeker_id]
    );
    const user = userRes.rows[0];

    // Pick primary or most recent resume
    const resumeRes = await pool.query(
      `SELECT * FROM resumes WHERE seeker_id = $1 ORDER BY is_primary DESC, resume_id DESC LIMIT 1`,
      [seeker_id]
    );
    const resume = resumeRes.rows[0] || null;

    let experiences = [];
    let skills = [];
    let education = [];
    if (resume) {
      const exp = await pool.query('SELECT * FROM experiences WHERE resume_id = $1 ORDER BY experience_id DESC', [resume.resume_id]);
      const skl = await pool.query('SELECT * FROM skills WHERE resume_id = $1', [resume.resume_id]);
      const edu = await pool.query('SELECT * FROM education WHERE resume_id = $1 ORDER BY end_date DESC NULLS LAST', [resume.resume_id]);
      experiences = exp.rows;
      skills = skl.rows;
      education = edu.rows;
    }

    res.json({ success: true, profile: { user, resume, experiences, skills, education } });
  } catch (error) {
    console.error('Error fetching applicant profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch applicant profile' });
  }
};

// List sent emails for this recruiter (Email Management)
export const getSentEmails = async (req, res) => {
  try {
    const user_id = req.user.id;
    const result = await pool.query(
      `SELECT id, to_email, subject, body_preview, sent_at, application_id
       FROM email_logs WHERE sender_user_id = $1 ORDER BY sent_at DESC LIMIT 500`,
      [user_id]
    );
    res.json({ success: true, emails: result.rows });
  } catch (error) {
    console.error('Error fetching sent emails:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sent emails' });
  }
};

// List interviews for this recruiter
export const getMyInterviews = async (req, res) => {
  try {
    const recruiter_user_id = req.user.id;

    // Get recruiter_id
    const rec = await pool.query('SELECT recruiter_id FROM recruiters WHERE user_id = $1', [recruiter_user_id]);
    if (rec.rows.length === 0) return res.status(404).json({ success: false, error: 'Recruiter profile not found' });
    const recruiter_id = rec.rows[0].recruiter_id;

    const result = await pool.query(
      `SELECT i.*, j.title as job_title, j.company,
              u.name as seeker_name, u.email as seeker_email
       FROM interviews i
       JOIN jobs j ON i.job_id = j.job_id
       JOIN job_seekers js ON i.seeker_id = js.seeker_id
       JOIN users u ON js.user_id = u.user_id
       WHERE i.recruiter_id = $1
       ORDER BY i.schedule DESC NULLS LAST, i.created_at DESC`,
      [recruiter_id]
    );

    res.json({ success: true, interviews: result.rows });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch interviews' });
  }
};

// Schedule interview (also marks application status)
export const scheduleInterview = async (req, res) => {
  try {
    const { application_id, schedule_time, meeting_link, type, location, notes, duration } = req.body;
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
      `INSERT INTO interviews (seeker_id, recruiter_id, job_id, schedule, meeting_link, type, location, notes, duration)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'video'), $7, $8, COALESCE($9, 60)) RETURNING *`,
      [application.seeker_id, actualRecruiterId, application.job_id, schedule_time, meeting_link || null, type || null, location || null, notes || null, duration || null]
    );

    // Update application status to interview_scheduled (non-final)
    await pool.query('UPDATE applications SET status = $1 WHERE application_id = $2', ['under_review', application_id]);

    res.status(201).json({ success: true, interview: interviewResult.rows[0] });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ success: false, error: 'Failed to schedule interview' });
  }
};

// Send a message from recruiter to a seeker
export const sendMessageToSeeker = async (req, res) => {
  try {
    const sender_user_id = req.user.id;
    const { seeker_id, body, application_id } = req.body;
    if (!seeker_id || !body) return res.status(400).json({ success: false, error: 'Missing seeker_id or body' });

    const seekerUser = await pool.query('SELECT user_id FROM job_seekers WHERE seeker_id = $1', [seeker_id]);
    if (seekerUser.rows.length === 0) return res.status(404).json({ success: false, error: 'Seeker not found' });
    const receiver_user_id = seekerUser.rows[0].user_id;

    const inserted = await pool.query(
      'INSERT INTO messages (sender_user_id, receiver_user_id, application_id, body) VALUES ($1, $2, $3, $4) RETURNING *',
      [sender_user_id, receiver_user_id, application_id ?? null, body]
    );

    res.status(201).json({ success: true, message: inserted.rows[0] });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};

// Get conversation between recruiter (current user) and a seeker
export const getConversationWithSeeker = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { seeker_id } = req.params;

    const sid = Number(seeker_id);
    if (!sid) return res.status(400).json({ success: false, error: 'Invalid seeker_id' });

    const seekerUser = await pool.query('SELECT user_id FROM job_seekers WHERE seeker_id = $1', [sid]);
    if (seekerUser.rows.length === 0) return res.status(404).json({ success: false, error: 'Seeker not found' });
    const other_user_id = seekerUser.rows[0].user_id;

    const conv = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_user_id = $1 AND receiver_user_id = $2)
          OR (sender_user_id = $2 AND receiver_user_id = $1)
       ORDER BY created_at ASC`,
      [user_id, other_user_id]
    );

    res.json({ success: true, messages: conv.rows });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
  }
};

// Update interview (status, schedule, link, etc.)
export const updateInterview = async (req, res) => {
  try {
    const { interview_id } = req.params;
    const recruiter_user_id = req.user.id;
    const { status, schedule_time, type, meeting_link, location, notes, duration, outcome } = req.body;

    // Verify ownership and fetch seeker/job for outcome
    const own = await pool.query(
      `SELECT i.interview_id, i.seeker_id, i.job_id FROM interviews i
       JOIN recruiters r ON i.recruiter_id = r.recruiter_id
       WHERE i.interview_id = $1 AND r.user_id = $2`,
      [interview_id, recruiter_user_id]
    );
    if (own.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Interview not found or access denied' });
    }

    const irow = own.rows[0];

    await pool.query(
      `UPDATE interviews
       SET status = COALESCE($1, status),
           schedule = COALESCE($2, schedule),
           type = COALESCE($3, type),
           meeting_link = COALESCE($4, meeting_link),
           location = COALESCE($5, location),
           notes = COALESCE($6, notes),
           duration = COALESCE($7, duration)
       WHERE interview_id = $8`,
      [status, schedule_time, type, meeting_link, location, notes, duration, interview_id]
    );

    // Optional: update application status outcome
    const allowed = new Set(['under_review','shortlisted','rejected','hired']);
    if (outcome && allowed.has(String(outcome))) {
      try {
        const app = await pool.query(
          `SELECT application_id FROM applications WHERE seeker_id = $1 AND job_id = $2 ORDER BY applied_timestamp DESC LIMIT 1`,
          [irow.seeker_id, irow.job_id]
        );
        const appId = app.rows[0]?.application_id;
        if (appId) {
          await pool.query('UPDATE applications SET status = $1 WHERE application_id = $2', [outcome, appId]);
        }
      } catch (e) {
        console.warn('Failed to set application outcome for interview', interview_id, e.message);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ success: false, error: 'Failed to update interview' });
  }
};

// Delete interview
export const deleteInterview = async (req, res) => {
  try {
    const { interview_id } = req.params;
    const recruiter_user_id = req.user.id;

    // Verify ownership
    const own = await pool.query(
      `SELECT i.interview_id FROM interviews i
       JOIN recruiters r ON i.recruiter_id = r.recruiter_id
       WHERE i.interview_id = $1 AND r.user_id = $2`,
      [interview_id, recruiter_user_id]
    );
    if (own.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Interview not found or access denied' });
    }

    await pool.query('DELETE FROM interviews WHERE interview_id = $1', [interview_id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ success: false, error: 'Failed to delete interview' });
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

