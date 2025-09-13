CREATE DATABASE jobportal;

-- USERS table for Job Seekers and Recruiters only
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_no VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('recruiter', 'job_seeker')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADMIN table (independent)
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RECRUITER table references USERS
CREATE TABLE recruiters (
    recruiter_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    company VARCHAR(100) NOT NULL,
    ratings DECIMAL(2,1),
    designation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- JOB SEEKER table references USERS
CREATE TABLE job_seekers (
    seeker_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    dob DATE NOT NULL,
    nationality VARCHAR(100),
    address TEXT,
    age INT GENERATED ALWAYS AS (DATE_PART('year', CURRENT_DATE) - DATE_PART('year', dob)) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SYSTEM LOGS; admin can view all
CREATE TABLE system_logs (
    log_id SERIAL PRIMARY KEY,
    actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('admin', 'recruiter', 'job_seeker')),
    actor_id INT NOT NULL,
    action_desc TEXT,
    login_time TIMESTAMP,
    logout_time TIMESTAMP,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- JOBS table
CREATE TABLE jobs (
    job_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    job_description TEXT,
    salary NUMERIC(12,2),
    company VARCHAR(100),
    min_experience INT,
    skills_required TEXT[], -- array of strings like 'Python', 'Communication'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Operates: Recruiter operates Jobs
CREATE TABLE operates (
    id SERIAL PRIMARY KEY,
    recruiter_id INT REFERENCES recruiters(recruiter_id) ON DELETE CASCADE,
    job_id INT REFERENCES jobs(job_id) ON DELETE CASCADE,
    action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications: Job Seeker applies to Jobs
CREATE TABLE applications (
    application_id SERIAL PRIMARY KEY,
    seeker_id INT REFERENCES job_seekers(seeker_id) ON DELETE CASCADE,
    job_id INT REFERENCES jobs(job_id) ON DELETE CASCADE,
    status VARCHAR(50),
    star BOOLEAN DEFAULT FALSE, -- favourite/saved application
    applied_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resume table, one per job seeker
CREATE TABLE resumes (
    resume_id SERIAL PRIMARY KEY,
    seeker_id INT UNIQUE REFERENCES job_seekers(seeker_id) ON DELETE CASCADE,
    statement_profile TEXT,
    scores DECIMAL(4,2),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Experience entries for a resume (multi-valued)
CREATE TABLE experiences (
    experience_id SERIAL PRIMARY KEY,
    resume_id INT REFERENCES resumes(resume_id) ON DELETE CASCADE,
    company VARCHAR(100),
    duration VARCHAR(50),
    job_title VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills stored as an array of formatted strings in resume
CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    resume_id INT REFERENCES resumes(resume_id) ON DELETE CASCADE,
    skill_type VARCHAR(16) CHECK (skill_type IN ('tech', 'soft')),
    skills TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Education for resumes (multi-valued)
CREATE TABLE education (
    education_id SERIAL PRIMARY KEY,
    resume_id INT REFERENCES resumes(resume_id) ON DELETE CASCADE,
    qualification VARCHAR(100),
    college VARCHAR(100),
    gpa DECIMAL(4,2),
    start_date DATE,
    end_date DATE,
    duration INTERVAL GENERATED ALWAYS AS (end_date - start_date) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INTERVIEW schedule
CREATE TABLE interviews (
    interview_id SERIAL PRIMARY KEY,
    seeker_id INT REFERENCES job_seekers(seeker_id),
    recruiter_id INT REFERENCES recruiters(recruiter_id),
    job_id INT REFERENCES jobs(job_id),
    result VARCHAR(50),
    schedule TIMESTAMP,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);