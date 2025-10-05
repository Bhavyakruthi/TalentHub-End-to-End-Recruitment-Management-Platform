import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  Camera,
  Github,
  Linkedin,
  Globe,
  Award,
  GraduationCap,
  FileText,
  Upload,
  DollarSign,
  Clock,
  ExternalLink,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  MapPin as LocationIcon,
  Briefcase as BriefcaseIcon,
  Award as AwardIcon,
  GraduationCap as GraduationCapIcon,
  LinkIcon as LinkIconAlt
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const JobSeekerProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    professional: true,
    preferences: false,
    social: false
  });

  // Comprehensive profile data structure for Job Seekers
  const [profileData, setProfileData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    dob: '',
    nationality: '',
    address: '',
    currentLocation: '',
    preferredLocation: '',
    profilePhoto: null,
    bio: '',

    // Professional Details
    resume: null,
    currentJobTitle: '',
    totalExperience: '',
    skills: [],
    education: [],
    certifications: [],
    workExperience: [],
    portfolio: '',

    // Preferences
    jobTypePreference: [],
    expectedSalary: '',
    preferredIndustry: [],
    noticePeriod: '',
    workAuthorization: '',
    willingToRelocate: false,

    // Social Links
    linkedin: '',
    github: '',
    website: ''
  });

  const [editData, setEditData] = useState({ ...profileData });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Load user basic info
      if (user) {
        const baseProfile = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          dob: '',
          nationality: '',
          address: '',
          currentLocation: '',
          preferredLocation: '',
          profilePhoto: null,
          bio: '',

          // Professional Details
          resume: null,
          currentJobTitle: '',
          totalExperience: '',
          skills: [],
          education: [],
          certifications: [],
          workExperience: [],
          portfolio: '',

          // Preferences
          jobTypePreference: [],
          expectedSalary: '',
          preferredIndustry: [],
          noticePeriod: '',
          workAuthorization: '',
          willingToRelocate: false,

          // Social Links
          linkedin: '',
          github: '',
          website: ''
        };

        // Auto-fill from registration data if available
        if (user.dob) baseProfile.dob = user.dob;
        if (user.nationality) baseProfile.nationality = user.nationality;
        if (user.address) baseProfile.address = user.address;

        setProfileData(baseProfile);
        setEditData(baseProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // For now, just update local state
      // TODO: Add API call when backend endpoint is ready
      setProfileData(editData);
      setIsEditing(false);
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...profileData });
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',').map(item => item.trim()).filter(item => item) : value
    }));
  };

  const handleFileUpload = (field, file) => {
    setEditData(prev => ({ ...prev, [field]: file }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold">
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-purple-300 focus:border-purple-500 outline-none mb-2 w-full"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                )}

                {isEditing ? (
                  <input
                    type="text"
                    value={editData.currentJobTitle}
                    onChange={(e) => handleInputChange('currentJobTitle', e.target.value)}
                    className="text-lg text-gray-600 bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none w-full"
                    placeholder="Current job title"
                  />
                ) : (
                  <p className="text-lg text-gray-600">{profileData.currentJobTitle || 'No current position'}</p>
                )}

                <p className="text-sm text-purple-600 mt-1">Job Seeker</p>
              </div>
            </div>

            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Bio/About Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 outline-none resize-none"
                rows="3"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-600">{profileData.bio || 'No bio added yet'}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{profileData.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none"
                    placeholder="Your phone number"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.phone || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Current Location</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.currentLocation}
                    onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                    className="text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none"
                    placeholder="Your current location"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.currentLocation || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Personal Information Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            <button
              onClick={() => toggleSection('personal')}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.personal ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedSections.personal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.dob ? new Date(profileData.dob).toLocaleDateString() : 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    placeholder="Your nationality"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.nationality || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    placeholder="Your address"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.address || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.preferredLocation}
                    onChange={(e) => handleInputChange('preferredLocation', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    placeholder="Preferred work location"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.preferredLocation || 'Not specified'}</p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Professional Details Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Professional Details</h2>
            <button
              onClick={() => toggleSection('professional')}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.professional ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedSections.professional && (
            <div className="space-y-6">
              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume / CV
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {isEditing ? (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to upload or drag and drop</p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleFileUpload('resume', e.target.files[0])}
                      />
                      <button className="mt-2 text-purple-600 hover:text-purple-700 text-sm">
                        Choose File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        {profileData.resume ? 'Resume uploaded' : 'No resume uploaded'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Experience
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.totalExperience}
                      onChange={(e) => handleInputChange('totalExperience', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                      placeholder="e.g., 3 years 6 months"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.totalExperience || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Authorization
                  </label>
                  {isEditing ? (
                    <select
                      value={editData.workAuthorization}
                      onChange={(e) => handleInputChange('workAuthorization', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    >
                      <option value="">Select work authorization</option>
                      <option value="Citizen">Citizen</option>
                      <option value="Permanent Resident">Permanent Resident</option>
                      <option value="Work Visa">Work Visa</option>
                      <option value="Student Visa">Student Visa</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profileData.workAuthorization || 'Not specified'}</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.skills.join(', ')}
                    onChange={(e) => handleArrayFieldChange('skills', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    placeholder="Enter skills separated by commas"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.length > 0 ? (
                      profileData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills added</p>
                    )}
                  </div>
                )}
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.education.join('\n')}
                    onChange={(e) => handleArrayFieldChange('education', e.target.value.split('\n').filter(item => item.trim()))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    rows="3"
                    placeholder="Enter education details (one per line)"
                  />
                ) : (
                  <div className="space-y-2">
                    {profileData.education.length > 0 ? (
                      profileData.education.map((edu, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <GraduationCapIcon className="w-4 h-4 text-purple-500" />
                          <span className="text-gray-900">{edu}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No education added</p>
                    )}
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.certifications.join('\n')}
                    onChange={(e) => handleArrayFieldChange('certifications', e.target.value.split('\n').filter(item => item.trim()))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    rows="3"
                    placeholder="Enter certifications (one per line)"
                  />
                ) : (
                  <div className="space-y-2">
                    {profileData.certifications.length > 0 ? (
                      profileData.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <AwardIcon className="w-4 h-4 text-purple-500" />
                          <span className="text-gray-900">{cert}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No certifications added</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Job Preferences Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Job Preferences</h2>
            <button
              onClick={() => toggleSection('preferences')}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.preferences ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedSections.preferences && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type Preference
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.jobTypePreference.join(', ')}
                    onChange={(e) => handleArrayFieldChange('jobTypePreference', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    placeholder="e.g., Full-time, Remote, Hybrid"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.jobTypePreference.join(', ') || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Salary
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.expectedSalary}
                    onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    placeholder="e.g., $80,000 - $100,000"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.expectedSalary || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Industry
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.preferredIndustry.join(', ')}
                    onChange={(e) => handleArrayFieldChange('preferredIndustry', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    placeholder="e.g., Technology, Finance, Healthcare"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.preferredIndustry.join(', ') || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Period
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.noticePeriod}
                    onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    placeholder="e.g., 2 weeks, 1 month"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.noticePeriod || 'Not specified'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editData.willingToRelocate}
                      onChange={(e) => handleInputChange('willingToRelocate', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  ) : (
                    <CheckCircle className={`w-4 h-4 ${profileData.willingToRelocate ? 'text-green-500' : 'text-gray-400'}`} />
                  )}
                  <span className="text-sm font-medium text-gray-700">Willing to relocate</span>
                </label>
              </div>
            </div>
          )}
        </motion.div>

        {/* Social Links Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Social Links & Portfolio</h2>
            <button
              onClick={() => toggleSection('social')}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.social ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedSections.social && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    {profileData.linkedin ? (
                      <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profileData.linkedin}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    placeholder="https://github.com/yourusername"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Github className="w-4 h-4 text-gray-800" />
                    {profileData.github ? (
                      <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">
                        {profileData.github}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    placeholder="https://yourwebsite.com"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    {profileData.website ? (
                      <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                        {profileData.website}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editData.portfolio}
                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-purple-500 outline-none"
                    placeholder="https://yourportfolio.com"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <LinkIconAlt className="w-4 h-4 text-purple-600" />
                    {profileData.portfolio ? (
                      <a href={profileData.portfolio} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                        {profileData.portfolio}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Activity Stats */}
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Overview</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600">Applications</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-600">Interviews</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600">Offers</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">0</p>
              <p className="text-sm text-gray-600">Profile Views</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default JobSeekerProfile;
