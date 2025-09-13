import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Download, Upload, Eye, Star, FileText } from 'lucide-react';
import client from '../../api/client';

const Resume = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    },
    experience: [],
    skills: ['JavaScript', 'React', 'Node.js', 'Python']
  });
  const [newSkill, setNewSkill] = useState('');

  // Load existing resume if available
  useEffect(() => {
    const loadResume = async () => {
      try {
        const res = await client.get('/api/jobseeker/resume');
        if (res.data?.success) {
          const r = res.data.resume;
          setResumeData((prev) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              summary: r.statement_profile || prev.personalInfo.summary,
            },
            experience: (r.experiences || []).map(e => ({
              id: e.experience_id,
              title: e.job_title || '',
              company: e.company || '',
              duration: e.duration || '',
              description: e.description || ''
            })),
            skills: (r.skills || []).flatMap(s => Array.isArray(s.skills) ? s.skills : [])
          }));
        }
      } catch {}
    };
    loadResume();
  }, []);

  const [uploadedResumes] = useState([
    {
      id: 1,
      name: 'Software_Engineer_Resume.pdf',
      uploadDate: '2024-01-15',
      size: '2.1 MB',
      status: 'Active',
      score: 94
    },
    {
      id: 2,
      name: 'Frontend_Developer_CV.docx',
      uploadDate: '2024-01-10',
      size: '1.8 MB',
      status: 'Draft',
      score: 87
    }
  ]);

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      title: '',
      company: '',
      duration: '',
      description: ''
    };
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, newExp]
    });
    // Persist an empty experience row to backend (user can update later)
    (async () => {
      try {
        await client.post('/api/jobseeker/resume/experience', {
          company: '',
          duration: '',
          job_title: '',
          description: ''
        });
        const res = await client.get('/api/jobseeker/resume');
        if (res.data?.success) {
          const r = res.data.resume;
          setResumeData((prev) => ({
            ...prev,
            experience: (r.experiences || []).map(e => ({
              id: e.experience_id,
              title: e.job_title || '',
              company: e.company || '',
              duration: e.duration || '',
              description: e.description || ''
            }))
          }));
        }
      } catch {}
    })();
  };

  const deleteExperience = (id) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.id !== id)
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File uploaded:', file.name);
    }
  };

  const tabs = [
    { id: 'builder', label: '🎨 Builder', description: 'Create your resume' },
    { id: 'upload', label: '📤 Upload', description: 'Upload existing resume' },
    { id: 'templates', label: '📋 Templates', description: 'Choose template' }
  ];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          ✨ Resume Builder
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create professional resumes that get you hired. Build, customize, and download your perfect resume in minutes.
        </p>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        className="flex flex-wrap justify-center gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`card-glass px-6 py-4 rounded-xl text-center transition-all duration-300 min-w-[140px] group ${
              activeTab === tab.id 
                ? 'ring-2 ring-purple-400 bg-gradient-to-r from-purple-50 to-pink-50' 
                : 'hover:shadow-lg hover:scale-105'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-lg font-semibold text-gray-900 mb-1">{tab.label}</div>
            <div className="text-sm text-gray-600">{tab.description}</div>
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'builder' && (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Resume Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <motion.div 
                className="card-glass animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  👤 Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.name}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, name: e.target.value }
                      })}
                      className="input-glass w-full"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                      })}
                      className="input-glass w-full"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                      })}
                      className="input-glass w-full"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.location}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, location: e.target.value }
                      })}
                      className="input-glass w-full"
                      placeholder="City, State"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                  <textarea
                    rows={4}
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, summary: e.target.value }
                    })}
                    className="input-glass w-full resize-none"
                    placeholder="Write a compelling professional summary that highlights your key achievements and career goals..."
                  />
                  <div className="mt-3">
                    <button
                      onClick={async () => {
                        try {
                          await client.post('/api/jobseeker/resume', {
                            statement_profile: resumeData.personalInfo.summary,
                            linkedin_url: '',
                            github_url: ''
                          });
                        } catch {}
                      }}
                      className="btn-primary"
                    >
                      Save Summary
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Experience */}
              <motion.div 
                className="card-glass animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    💼 Work Experience
                  </h3>
                  <button
                    onClick={addExperience}
                    className="btn-primary hover-glow flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Experience
                  </button>
                </div>
                <div className="space-y-6">
                  {resumeData.experience.map((exp, index) => (
                    <motion.div 
                      key={exp.id} 
                      className="glass-secondary p-4 rounded-xl border border-gray-200"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          ✨ Experience {index + 1}
                        </h4>
                        <button
                          onClick={() => deleteExperience(exp.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={async (e) => {
                              const newVal = e.target.value;
                              setResumeData((prev) => ({
                                ...prev,
                                experience: prev.experience.map((x) => x.id === exp.id ? { ...x, title: newVal } : x)
                              }));
                              try {
                                await client.put(`/api/jobseeker/resume/experience/${exp.id}` , {
                                  company: exp.company,
                                  duration: exp.duration,
                                  job_title: newVal,
                                  description: exp.description
                                });
                              } catch {}
                            }}
                            className="input-glass w-full"
                            placeholder="e.g. Senior Developer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={async (e) => {
                              const newVal = e.target.value;
                              setResumeData((prev) => ({
                                ...prev,
                                experience: prev.experience.map((x) => x.id === exp.id ? { ...x, company: newVal } : x)
                              }));
                              try {
                                await client.put(`/api/jobseeker/resume/experience/${exp.id}` , {
                                  company: newVal,
                                  duration: exp.duration,
                                  job_title: exp.title,
                                  description: exp.description
                                });
                              } catch {}
                            }}
                            className="input-glass w-full"
                            placeholder="e.g. TechCorp Inc."
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={async (e) => {
                            const newVal = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((x) => x.id === exp.id ? { ...x, duration: newVal } : x)
                            }));
                            try {
                              await client.put(`/api/jobseeker/resume/experience/${exp.id}` , {
                                company: exp.company,
                                duration: newVal,
                                job_title: exp.title,
                                description: exp.description
                              });
                            } catch {}
                          }}
                          className="input-glass w-full"
                          placeholder="e.g. Jan 2022 - Present"
                        />
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          rows={3}
                          value={exp.description}
                          onChange={async (e) => {
                            const newVal = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((x) => x.id === exp.id ? { ...x, description: newVal } : x)
                            }));
                            try {
                              await client.put(`/api/jobseeker/resume/experience/${exp.id}` , {
                                company: exp.company,
                                duration: exp.duration,
                                job_title: exp.title,
                                description: newVal
                              });
                            } catch {}
                          }}
                          className="input-glass w-full resize-none"
                          placeholder="Describe your role, responsibilities, and key achievements..."
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Skills */}
              <motion.div 
                className="card-glass animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  🚀 Skills
                </h3>
                <div className="flex flex-wrap gap-3 mb-6">
                  {resumeData.skills.map((skill, index) => (
                    <motion.span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 hover:shadow-lg transition-all duration-200"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {skill}
                      <button className="ml-2 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full p-1 transition-all duration-200">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Add a new skill..."
                    className="input-glass flex-1"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  />
                  <button
                    className="btn-primary hover-glow"
                    onClick={async () => {
                      if (!newSkill.trim()) return;
                      const updated = [...resumeData.skills, newSkill.trim()];
                      setResumeData({ ...resumeData, skills: updated });
                      setNewSkill('');
                      try {
                        await client.post('/api/jobseeker/resume/skills', {
                          skill_type: 'tech',
                          skills: updated
                        });
                      } catch {}
                    }}
                  >
                    Add Skill
                  </button>
                </div>
              </motion.div>

              {/* Education */}
              <motion.div 
                className="card-glass animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  🎓 Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input id="edu-qualification" className="input-glass" placeholder="Qualification (e.g., B.Tech)" />
                  <input id="edu-college" className="input-glass" placeholder="College/University" />
                  <input id="edu-gpa" type="number" step="0.01" className="input-glass" placeholder="GPA (e.g., 3.8)" />
                  <input id="edu-start" type="date" className="input-glass" />
                  <input id="edu-end" type="date" className="input-glass" />
                </div>
                <div className="mt-4">
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      const qualification = document.getElementById('edu-qualification')?.value || '';
                      const college = document.getElementById('edu-college')?.value || '';
                      const gpaRaw = document.getElementById('edu-gpa')?.value || '';
                      const start_date = document.getElementById('edu-start')?.value || '';
                      const end_date = document.getElementById('edu-end')?.value || '';
                      const gpa = gpaRaw ? Number(gpaRaw) : null;
                      try {
                        await client.post('/api/jobseeker/resume/education', {
                          qualification, college, gpa, start_date, end_date
                        });
                        // Clear inputs after save
                        ['edu-qualification','edu-college','edu-gpa','edu-start','edu-end'].forEach(id => {
                          const el = document.getElementById(id);
                          if (el) el.value = '';
                        });
                      } catch {}
                    }}
                  >
                    Add Education
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Resume Preview */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="sticky top-6">
                <div className="card-glass">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      📄 Live Preview
                    </h3>
                    <button className="btn-secondary hover-glow">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                  </div>
                  
                  <div className="glass-secondary p-6 rounded-xl min-h-[800px] border border-gray-200">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {resumeData.personalInfo.name || 'Your Name'}
                      </h2>
                      <div className="flex justify-center space-x-4 text-sm text-gray-600 mb-4">
                        {resumeData.personalInfo.email && (
                          <span>{resumeData.personalInfo.email}</span>
                        )}
                        {resumeData.personalInfo.phone && (
                          <span>{resumeData.personalInfo.phone}</span>
                        )}
                        {resumeData.personalInfo.location && (
                          <span>{resumeData.personalInfo.location}</span>
                        )}
                      </div>
                      {resumeData.personalInfo.summary && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {resumeData.personalInfo.summary}
                        </p>
                      )}
                    </div>

                    {resumeData.experience.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                          Work Experience
                        </h3>
                        <div className="space-y-4">
                          {resumeData.experience.map((exp, index) => (
                            <div key={exp.id}>
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-gray-900">{exp.title}</h4>
                                <span className="text-sm text-gray-600">{exp.duration}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-700 mb-1">{exp.company}</p>
                              <p className="text-sm text-gray-600">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {resumeData.skills.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                          Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'upload' && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Upload Area */}
            <motion.div 
              className="card-glass"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center hover:border-purple-400 transition-colors duration-300">
                <motion.div
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Upload className="w-10 h-10 text-purple-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Your Resume</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Drag and drop your resume file or click to browse. We'll analyze it and provide optimization suggestions.
                </p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                />
                <div className="flex justify-center space-x-4">
                  <label
                    htmlFor="resume-upload"
                    className="btn-primary hover-glow cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                  <button className="btn-secondary hover-glow">
                    Browse Templates
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-4">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
              </div>
            </motion.div>

            {/* Uploaded Resumes */}
            <motion.div 
              className="card-glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  📁 Your Resumes
                </h3>
                <span className="text-sm text-gray-500">
                  {uploadedResumes.length} resume{uploadedResumes.length !== 1 ? 's' : ''} uploaded
                </span>
              </div>
              <div className="space-y-4">
                {uploadedResumes.map((resume, index) => (
                  <motion.div 
                    key={resume.id} 
                    className="glass-secondary p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{resume.name}</h4>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>📅 {resume.uploadDate}</span>
                            <span>📊 {resume.size}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              resume.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {resume.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center justify-end mb-1">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-semibold text-gray-900">{resume.score}%</span>
                          </div>
                          <p className="text-xs text-gray-500">ATS Score</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'templates' && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                ✨ Choose Your Template
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Select from our collection of professional resume templates designed to help you stand out from the crowd.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((template, index) => (
                <motion.div 
                  key={template}
                  className="card-glass hover:shadow-xl cursor-pointer group overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <FileText className="w-16 h-16 text-gray-400 relative z-10" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Professional Template {template}</h4>
                    <p className="text-sm text-gray-600">Clean and modern design perfect for tech professionals and creative roles.</p>
                    <div className="flex space-x-2">
                      <button className="btn-primary flex-1 hover-glow group-hover:scale-105 transition-transform duration-200">
                        Use Template
                      </button>
                      <button className="btn-secondary px-4 hover-glow">
                        Preview
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Resume;
