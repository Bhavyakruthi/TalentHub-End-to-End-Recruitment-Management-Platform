import React, { useState } from 'react';
import {
  Upload,
  Download,
  Eye,
  Edit,
  FileText,
  Plus,
  Trash2,
  Star,
  Award,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github
} from 'lucide-react';

const Resume = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      website: 'www.johndoe.com',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      summary: 'Experienced software developer with 5+ years in full-stack development...'
    },
    experience: [
      {
        id: 1,
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        duration: 'Jan 2022 - Present',
        description: 'Led development of user-facing features using React and TypeScript...',
        achievements: ['Improved page load speed by 40%', 'Led team of 3 developers']
      }
    ],
    education: [
      {
        id: 1,
        degree: 'Bachelor of Computer Science',
        institution: 'University of California',
        duration: '2015 - 2019',
        gpa: '3.8/4.0'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
    certifications: [
      {
        id: 1,
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2023'
      }
    ]
  });

  const [uploadedResumes, setUploadedResumes] = useState([
    {
      id: 1,
      name: 'Frontend_Developer_Resume.pdf',
      uploadDate: '2024-01-15',
      size: '245 KB',
      status: 'Active',
      score: 85
    },
    {
      id: 2,
      name: 'Software_Engineer_Resume.pdf',
      uploadDate: '2024-01-10',
      size: '198 KB',
      status: 'Draft',
      score: 78
    }
  ]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload logic
      console.log('Uploading file:', file.name);
    }
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      title: '',
      company: '',
      duration: '',
      description: '',
      achievements: []
    };
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, newExp]
    });
  };

  const deleteExperience = (id) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
          <p className="text-gray-600">Create and manage your professional resume</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <Download className="w-4 h-4 inline mr-2" />
            Download PDF
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
            <Eye className="w-4 h-4 inline mr-2" />
            Preview
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('builder')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'builder'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resume Builder
          </button>
          <button
            onClick={() => setActiveTab('uploads')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'uploads'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Uploaded Resumes
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.name}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, name: e.target.value }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, location: e.target.value }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                <textarea
                  rows={4}
                  value={resumeData.personalInfo.summary}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, summary: e.target.value }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write a brief professional summary..."
                />
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
                <button
                  onClick={addExperience}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Experience
                </button>
              </div>
              <div className="space-y-6">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
                      <button
                        onClick={() => deleteExperience(exp.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.title}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g. Senior Developer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g. TechCorp Inc."
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Jan 2022 - Present"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={exp.description}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe your role and responsibilities..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {resumeData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button className="ml-2 text-blue-600 hover:text-blue-800">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Resume Preview */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resume Preview</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-96">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">{resumeData.personalInfo.name}</h2>
                <div className="text-sm text-gray-600 space-y-1 mt-2">
                  <div className="flex items-center justify-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {resumeData.personalInfo.email}
                  </div>
                  <div className="flex items-center justify-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {resumeData.personalInfo.phone}
                  </div>
                  <div className="flex items-center justify-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {resumeData.personalInfo.location}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Professional Summary</h3>
                <p className="text-sm text-gray-700">{resumeData.personalInfo.summary}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="mb-3">
                    <h4 className="font-medium text-gray-900">{exp.title}</h4>
                    <p className="text-sm text-gray-600">{exp.company} • {exp.duration}</p>
                    <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {resumeData.skills.map((skill, index) => (
                    <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'uploads' && (
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Resume</h3>
              <p className="text-gray-600 mb-4">Drag and drop your resume file or click to browse</p>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
              />
              <label
                htmlFor="resume-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium"
              >
                Choose File
              </label>
              <p className="text-sm text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
            </div>
          </div>

          {/* Uploaded Resumes */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Resumes</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {uploadedResumes.map((resume) => (
                <div key={resume.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{resume.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">Uploaded: {resume.uploadDate}</span>
                        <span className="text-sm text-gray-500">Size: {resume.size}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          resume.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {resume.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">Score: {resume.score}%</span>
                      </div>
                      <p className="text-xs text-gray-500">ATS Optimized</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((template) => (
            <div key={template} className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">Professional Template {template}</h3>
                <p className="text-sm text-gray-600 mt-1">Clean and modern design perfect for tech roles</p>
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    Use Template
                  </button>
                  <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resume;
