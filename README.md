# 🌟 Job Portal Platform

## **Full-Stack Job Marketplace with Role-Based Workflows, ATS Resume Scoring, and Admin Analytics**

[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Highlights](#highlights)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Installation](#installation)
6. [Run the App](#run-the-app)
7. [Project Structure](#project-structure)
8. [Database Schema](#database-schema)
9. [Why This Project](#why-this-project)
10. [Future Enhancements](#future-enhancements)
11. [Resume / GitHub Showcase](#resume--github-showcase)

---

## 🎯 Overview

This repository contains a polished, full-stack Job Portal platform built for cloud computing and developer showcase. It combines:

- **Job seeker experience** with search, applications, saved jobs, and resume builder
- **Recruiter portal** for job posting, applicant management, and interviews
- **Admin analytics** for user monitoring, logs, and duplicate detection
- **ATS-style resume analysis** to improve candidate matching
- **Secure authentication** and role-based access control

---

## ✨ Highlights

- **Multi-role support**: Job Seeker, Recruiter, Admin
- **Complete resume builder** with experiences, skills, and education
- **ATS insights** and optimization recommendations
- **Job search + filters + saved jobs**
- **Interview scheduling** and application workflow
- **Admin dashboard** with reports and analytics
- **Modular React frontend** with modern styling
- **Secure Express API** with authorization middleware

---

## 🏗 Architecture

```text
Frontend (React + Vite)
      │
      ▼
Backend API (Node.js + Express)
      │
      ▼
PostgreSQL Database
      │
      ├─ users
      ├─ job_seekers
      ├─ recruiters
      ├─ jobs
      ├─ applications
      ├─ resumes
      ├─ experiences
      ├─ skills
      ├─ education
      ├─ interviews
      └─ system_logs
```

---

## 🧰 Tech Stack

| Layer | Tool | Purpose |
|------|------|---------|
| Frontend | React, Vite, Tailwind CSS | UI, routing, styling |
| Backend | Node.js, Express | API server, business logic |
| Database | PostgreSQL | relational storage |
| Auth | JWT, bcrypt | secure user auth |
| HTTP | Axios | API communication |

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/SEMESTER-5-TEAM/CloudComputing.git
cd CloudComputing
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobportal
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 3. Initialize the database

```bash
psql -U postgres -d jobportal -f schema.sql
```

### 4. Frontend setup

```bash
cd ../Frontend
npm install
```

---

## ▶️ Run the App

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd ../Frontend
npm run dev
```

Open the app at: `http://localhost:3000`

---

## 📁 Project Structure

- `backend/` — Express API server, controllers, routes, middleware, database integration
- `Frontend/` — React application, pages, components, API client, auth context
- `Resume-Matcher/` — ATS and resume ranking integration
- `schema.sql` — PostgreSQL core schema definition
- `TESTING_GUIDE.md` — manual testing and demo guide
- `WARP.md` — quick local setup commands

---

## 🗄 Database Schema

Core tables included:

- `users` — base authentication and roles
- `job_seekers` — candidate profile data
- `recruiters` — employer profile data
- `jobs` — job listings and metadata
- `applications` — application tracking and status
- `resumes` — candidate resumes and file storage
- `experiences` — resume work history entries
- `skills` — resume skill entries
- `education` — resume education records
- `interviews` — scheduled interview records
- `system_logs` — event and audit logs

---

## 💡 Why This Project

This project is perfect for resume and GitHub showcase because it demonstrates:

- **Full-stack application development** with modern frontend and backend technologies
- **Secure role-based auth** for multiple user types
- **Real-world workflows** like job applications, interviews, and resume optimization
- **Data modeling experience** with PostgreSQL and normalized tables
- **Production-style project structure** ready for extension

---

## 🚧 Future Enhancements

Potential improvements:

- Add **email notifications** for applications and interviews
- Implement **real-time updates** with WebSockets
- Add **automated testing** for backend and frontend
- Build a dedicated **job seeker profile page** and settings area
- Deepen **Resume-Matcher integration** with API-driven scoring

---

## 📝 Resume / GitHub Showcase

Highlight this project as:

- A **professional job portal application** built end-to-end
- A **role-based platform** with recruiter and admin features
- A **secure web app** using JWT, bcrypt, and express middleware
- A project that includes **resume builder, ATS insights, and analytics**
- A strong example of **full-stack engineering and architecture

---

## 📩 Contact
For questions, suggestions, or collaboration, open an issue on the repository or connect via GitHub.
