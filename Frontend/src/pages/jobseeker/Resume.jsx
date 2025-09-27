import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Download, Upload, Eye, Star, FileText, Palette } from 'lucide-react';
import client from '../../api/client';
import Templates from './Templates';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const Resume = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [showTemplates, setShowTemplates] = useState(false);
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: ['JavaScript', 'React', 'Node.js', 'Python']
  });
  const [newSkill, setNewSkill] = useState('');
  const previewRef = useRef(null);

  // Handle template selection
  const handleSelectTemplate = (template) => {
    setShowTemplates(false);
    toast.success(`Template "${template.name}" selected! This would apply the template styling to your resume.`);
    // Here you would apply the template data to the resume
  };

  // Download resume as PDF (capture the live preview panel)
  const downloadResume = async () => {
    try {
      if (!previewRef.current) return;
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Add extra pages if content is taller than a single page
      let heightLeft = imgHeight - pageHeight;
      let position = -pageHeight;
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
      }

      const filename = `Resume - ${resumeData.personalInfo.name || 'Your Name'}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  };

  const generateResumeHTML = () => {
    return `
      <div class="resume">
        <div class="header">
          <div class="name">${resumeData.personalInfo.name || 'Your Name'}</div>
          <div class="contact">
            ${resumeData.personalInfo.email ? `<div>${resumeData.personalInfo.email}</div>` : ''}
            ${resumeData.personalInfo.phone ? `<div>${resumeData.personalInfo.phone}</div>` : ''}
            ${resumeData.personalInfo.location ? `<div>${resumeData.personalInfo.location}</div>` : ''}
          </div>
        </div>
        
        ${resumeData.personalInfo.summary ? `
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <p>${resumeData.personalInfo.summary}</p>
          </div>
        ` : ''}
        
        ${resumeData.experience.length > 0 ? `
          <div class="section">
            <div class="section-title">Experience</div>
            ${resumeData.experience.map(exp => `
              <div class="experience-item">
                <div class="job-title">${exp.title}</div>
                <div class="company">${exp.company} - ${exp.duration}</div>
                <p>${exp.description}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${resumeData.skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills">
              ${resumeData.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  // Template functions
  const applyTemplate = (templateId) => {
    // For now, just show an alert. In a real app, this would apply the template styling
    toast.success(`Template ${templateId} applied! This would change the resume styling.`);
  };

  const previewTemplate = (templateId) => {
    // For now, just show an alert. In a real app, this would open a preview modal
    toast(`Previewing Template ${templateId}. This would show a preview of the resume with this template.`);
  };

  // Format dates like "Sep 2024"; fall back to raw if parsing fails
  const formatDateDisplay = (s) => {
    if (!s) return '';
    try {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return s;
      return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    } catch {
      return s;
    }
  };

  // Helper to ensure a resume exists before adding sections
  const ensureResume = async () => {
    try {
      const r = await client.get('/api/jobseeker/resume');
      if (r.data?.success && r.data.resume) return r.data.resume;
    } catch (e) {
      console.error('GET /api/jobseeker/resume failed:', e?.response?.status, e?.response?.data);
      // proceed to try creating a resume
    }
    try {
      const created = await client.post('/api/jobseeker/resume', {
        statement_profile: '',
        linkedin_url: '',
        github_url: '',
        title: 'Untitled Resume'
        // do NOT set is_primary here to avoid unique constraint violation if one already exists
      });
      return created.data?.resume || null;
    } catch (e) {
      console.error('POST /api/jobseeker/resume failed:', e?.response?.status, e?.response?.data);
      if (e?.response?.status === 404) {
        toast.error('Job seeker profile not found. Please log in as a job seeker to use the resume builder.');
      } else if (e?.response?.status === 401 || e?.response?.status === 403) {
        toast.error('Session expired. Please sign in again.');
      } else {
        toast.error(e?.response?.data?.error || 'Failed to create resume');
      }
      return null;
    }
  };

  // Uploaded resume functions
  const previewResume = (resume) => {
    toast(`Previewing ${resume.name}. This would open a preview modal.`);
  };

  const downloadResumeFile = (resume) => {
    // Create a download link for the resume file
    const link = document.createElement('a');
    link.href = resume.url || '#';
    link.download = resume.name;
    link.click();
  };

  const deleteResume = (resumeId) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      // In a real app, this would call the API to delete the resume
      toast.success(`Resume ${resumeId} deleted!`);
    }
  };

  // Load or create a resume on mount, then hydrate state
  useEffect(() => {
    const init = async () => {
      const r = await ensureResume();
      if (!r) return; // Either not authenticated or not a job seeker
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
        education: (r.education || []).map(e => ({
          id: e.education_id,
          qualification: e.qualification || '',
          college: e.college || '',
          gpa: e.gpa ?? null,
          start_date: e.start_date || null,
          end_date: e.end_date || null
        })),
        skills: (r.skills || []).flatMap(s => Array.isArray(s.skills) ? s.skills : [])
      }));
    };
    init();
  }, []);

  const [uploadedResumes, setUploadedResumes] = useState([
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
      // In a real app, this would upload the file to the server
      const newResume = {
        id: Date.now(),
        name: file.name,
        uploadDate: new Date().toLocaleDateString(),
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        status: 'Processing',
        score: Math.floor(Math.random() * 30) + 70,
        url: URL.createObjectURL(file)
      };
      
      setUploadedResumes((prev) => [newResume, ...prev]);
      toast.success(`File "${file.name}" uploaded successfully!`);
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
                      <button 
                        onClick={async () => {
                          const updated = resumeData.skills.filter((_, i) => i !== index);
                          setResumeData({ ...resumeData, skills: updated });
                          try {
                        await client.post('/api/jobseeker/resume/skills', {
                          skill_type: 'tech',
                          skills: updated
                        });
                      } catch (e) {
                        if (e?.response?.status === 404) {
                          await ensureResume();
                          try {
                            await client.post('/api/jobseeker/resume/skills', {
                              skill_type: 'tech',
                              skills: updated
                            });
                          } catch {}
                        } else {
                          console.error('Error updating skills:', e);
                        }
                      }
                        }}
                        className="ml-2 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full p-1 transition-all duration-200"
                      >
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
                      } catch (e) {
                        if (e?.response?.status === 404) {
                          await ensureResume();
                          try {
                            await client.post('/api/jobseeker/resume/skills', {
                              skill_type: 'tech',
                              skills: updated
                            });
                          } catch {}
                        }
                      }
                    }}
                  >
                    Add Skill
                  </button>
                  <button
                    className="btn-secondary hover-glow"
                    onClick={async () => {
                      try {
                        const resume = await ensureResume();
                        if (!resume) {
                          toast.error('Cannot add education: no resume available. Please log in as a job seeker.');
                          return;
                        }
                        await client.post('/api/jobseeker/resume/education', {
                          qualification: '',
                          college: '',
                          gpa: null,
                          start_date: null,
                          end_date: null,
                          resume_id: resume.resume_id
                        });
                        // Refresh listing
                        const res = await client.get('/api/jobseeker/resume');
                        if (res.data?.success) {
                          const r = res.data.resume;
                          setResumeData((prev) => ({
                            ...prev,
                            education: (r.education || []).map(e => ({
                              id: e.education_id,
                              qualification: e.qualification || '',
                              college: e.college || '',
                              gpa: e.gpa ?? null,
                              start_date: e.start_date || null,
                              end_date: e.end_date || null
                            }))
                          }));
                        }
                        toast.success('Blank education added');
                      } catch (e) {
                        console.error('Failed to add blank education:', e);
                        toast.error(e?.response?.data?.error || 'Failed to add education');
                      }
                    }}
                  >
                    + Add another Education
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {resumeData.education && resumeData.education.length > 0 && (
                    resumeData.education.map((edu, index) => (
                      <motion.div 
                        key={edu.id || index}
                        className="glass-secondary p-4 rounded-xl border border-gray-200"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">🎓 Education {index + 1}</h4>
                          <button
                            onClick={async () => {
                              // Optimistically update UI
                              setResumeData(prev => ({
                                ...prev,
                                education: prev.education.filter(x => x.id !== edu.id)
                              }));
                              try {
                                await client.delete(`/api/jobseeker/resume/education/${edu.id}`);
                                toast.success('Education removed');
                              } catch (e) {
                                toast.error(e?.response?.data?.error || 'Failed to remove education');
                              }
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                            <input
                              type="text"
                              value={edu.qualification}
                              onChange={async (e) => {
                                const newVal = e.target.value;
                                setResumeData(prev => ({
                                  ...prev,
                                  education: prev.education.map(x => x.id === edu.id ? { ...x, qualification: newVal } : x)
                                }));
                                try {
                                  await client.put(`/api/jobseeker/resume/education/${edu.id}`, {
                                    qualification: newVal,
                                    college: edu.college,
                                    gpa: edu.gpa,
                                    start_date: edu.start_date,
                                    end_date: edu.end_date
                                  });
                                } catch {}
                              }}
                              className="input-glass w-full"
                              placeholder="e.g. B.Tech"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">College/University</label>
                            <input
                              type="text"
                              value={edu.college}
                              onChange={async (e) => {
                                const newVal = e.target.value;
                                setResumeData(prev => ({
                                  ...prev,
                                  education: prev.education.map(x => x.id === edu.id ? { ...x, college: newVal } : x)
                                }));
                                try {
                                  await client.put(`/api/jobseeker/resume/education/${edu.id}`, {
                                    qualification: edu.qualification,
                                    college: newVal,
                                    gpa: edu.gpa,
                                    start_date: edu.start_date,
                                    end_date: edu.end_date
                                  });
                                } catch {}
                              }}
                              className="input-glass w-full"
                              placeholder="e.g. Stanford University"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
                            <input
                              type="number"
                              step="0.01"
                              value={edu.gpa ?? ''}
                              onChange={async (e) => {
                                const raw = e.target.value;
                                const newVal = raw === '' ? null : Number(raw);
                                setResumeData(prev => ({
                                  ...prev,
                                  education: prev.education.map(x => x.id === edu.id ? { ...x, gpa: newVal } : x)
                                }));
                                try {
                                  await client.put(`/api/jobseeker/resume/education/${edu.id}`, {
                                    qualification: edu.qualification,
                                    college: edu.college,
                                    gpa: newVal,
                                    start_date: edu.start_date,
                                    end_date: edu.end_date
                                  });
                                } catch {}
                              }}
                              className="input-glass w-full"
                              placeholder="e.g. 3.80"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                              type="date"
                              value={(() => {
                                if (!edu.start_date) return '';
                                try {
                                  const d = new Date(edu.start_date);
                                  if (Number.isNaN(d.getTime())) return String(edu.start_date).slice(0,10);
                                  const yyyy = d.getFullYear();
                                  const mm = String(d.getMonth()+1).padStart(2,'0');
                                  const dd = String(d.getDate()).padStart(2,'0');
                                  return `${yyyy}-${mm}-${dd}`;
                                } catch { return ''; }
                              })()}
                              onChange={async (e) => {
                                const val = e.target.value;
                                const newVal = val ? val : null;
                                setResumeData(prev => ({
                                  ...prev,
                                  education: prev.education.map(x => x.id === edu.id ? { ...x, start_date: newVal } : x)
                                }));
                                try {
                                  await client.put(`/api/jobseeker/resume/education/${edu.id}`, {
                                    qualification: edu.qualification,
                                    college: edu.college,
                                    gpa: edu.gpa,
                                    start_date: newVal,
                                    end_date: edu.end_date
                                  });
                                } catch {}
                              }}
                              className="input-glass w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                              type="date"
                              value={(() => {
                                if (!edu.end_date) return '';
                                try {
                                  const d = new Date(edu.end_date);
                                  if (Number.isNaN(d.getTime())) return String(edu.end_date).slice(0,10);
                                  const yyyy = d.getFullYear();
                                  const mm = String(d.getMonth()+1).padStart(2,'0');
                                  const dd = String(d.getDate()).padStart(2,'0');
                                  return `${yyyy}-${mm}-${dd}`;
                                } catch { return ''; }
                              })()}
                              onChange={async (e) => {
                                const val = e.target.value;
                                const newVal = val ? val : null;
                                setResumeData(prev => ({
                                  ...prev,
                                  education: prev.education.map(x => x.id === edu.id ? { ...x, end_date: newVal } : x)
                                }));
                                try {
                                  await client.put(`/api/jobseeker/resume/education/${edu.id}`, {
                                    qualification: edu.qualification,
                                    college: edu.college,
                                    gpa: edu.gpa,
                                    start_date: edu.start_date,
                                    end_date: newVal
                                  });
                                } catch {}
                              }}
                              className="input-glass w-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
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
                <div className="mt-4 flex gap-3 flex-wrap">
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      const qualification = document.getElementById('edu-qualification')?.value || '';
                      const college = document.getElementById('edu-college')?.value || '';
                      const gpaRaw = document.getElementById('edu-gpa')?.value || '';
                      const startVal = document.getElementById('edu-start')?.value || '';
                      const endVal = document.getElementById('edu-end')?.value || '';
                      const start_date = startVal ? startVal : null;
                      const end_date = endVal ? endVal : null;
                      const gpa = gpaRaw ? Number(gpaRaw) : null;
                      try {
                        // Ensure there is a resume and get its ID before posting education
                        const resume = await ensureResume();
                        if (!resume) {
                          toast.error('Cannot add education: no resume available. Please make sure you are logged in as a job seeker.');
                          return;
                        }
                        await client.post('/api/jobseeker/resume/education', {
                          qualification, college, gpa, start_date, end_date, resume_id: resume.resume_id
                        });
                        toast.success('Education added');
                        // Refresh education from backend so it appears in preview
                        try {
                          const res = await client.get('/api/jobseeker/resume');
                          if (res.data?.success) {
                            const r = res.data.resume;
                            setResumeData((prev) => ({
                              ...prev,
                              education: (r.education || []).map(e => ({
                                id: e.education_id,
                                qualification: e.qualification || '',
                                college: e.college || '',
                                gpa: e.gpa ?? null,
                                start_date: e.start_date || null,
                                end_date: e.end_date || null
                              }))
                            }));
                          }
                        } catch {}
                        // Clear inputs after save
                        ['edu-qualification','edu-college','edu-gpa','edu-start','edu-end'].forEach(id => {
                          const el = document.getElementById(id);
                          if (el) el.value = '';
                        });
                      } catch (e) {
                        console.error('Failed to add education:', e);
                        if (e?.response?.status === 404) {
                          toast.error('Resume not found. Please reload and try again.');
                        } else {
                          toast.error(e?.response?.data?.error || 'Failed to add education');
                        }
                      }
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
                    <button 
                      onClick={downloadResume}
                      className="btn-secondary hover-glow"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                  </div>
                  
                  <div ref={previewRef} className="glass-secondary p-6 rounded-xl min-h-[800px] border border-gray-200">
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

                    {resumeData.education && resumeData.education.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                          Education
                        </h3>
                        <div className="space-y-4">
                          {resumeData.education.map((edu, index) => (
                            <div key={edu.id || index}>
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-gray-900">{edu.qualification}</h4>
                                <span className="text-sm text-gray-600">
                                  {formatDateDisplay(edu.start_date)}{edu.start_date && edu.end_date ? ' - ' : ''}{formatDateDisplay(edu.end_date)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-700 mb-1">{edu.college}</p>
                              {edu.gpa !== null && edu.gpa !== undefined && (
                                <p className="text-sm text-gray-600">GPA: {Number(edu.gpa).toFixed(2)}</p>
                              )}
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
                  <button 
                    onClick={() => setShowTemplates(true)}
                    className="btn-secondary hover-glow"
                  >
                    <Palette className="w-4 h-4 mr-2" />
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
                  📁 My Resumes
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
                          <button 
                            onClick={() => previewResume(resume)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                            title="Preview Resume"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => downloadResumeFile(resume)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                            title="Download Resume"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteResume(resume.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Resume"
                          >
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
                      <button 
                        onClick={() => applyTemplate(template)}
                        className="btn-primary flex-1 hover-glow group-hover:scale-105 transition-transform duration-200"
                      >
                        Use Template
                      </button>
                      <button 
                        onClick={() => previewTemplate(template)}
                        className="btn-secondary px-4 hover-glow"
                      >
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

      {/* Templates Modal */}
      {showTemplates && (
        <Templates 
          onBack={() => setShowTemplates(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      )}
    </motion.div>
  );
};

export default Resume;
