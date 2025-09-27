import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit2,
  Save,
  Camera,
  Github,
  Linkedin,
  Globe,
  Award,
  Star,
  Building,
  GraduationCap,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    title: '',
    company: '',
    experience: '',
    education: '',
    skills: [],
    linkedin: '',
    github: '',
    website: '',
    avatar: null
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
        const profile = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone_no || '',
          location: '',
          bio: '',
          title: '',
          company: '',
          experience: '',
          education: '',
          skills: [],
          linkedin: '',
          github: '',
          website: '',
          avatar: null
        };

        // Load additional data based on role
        if (user.role === 'job_seeker') {
          try {
            const res = await client.get('/api/jobseeker/resume');
            if (res.data?.success && res.data.resume) {
              const resume = res.data.resume;
              profile.bio = resume.statement_profile || '';
              profile.linkedin = resume.linkedin_url || '';
              profile.github = resume.github_url || '';
              
              // Get skills
              if (resume.skills && Array.isArray(resume.skills)) {
                profile.skills = resume.skills.flatMap(s => s.skills || []);
              }
              
              // Get experience
              if (resume.experiences && resume.experiences.length > 0) {
                profile.title = resume.experiences[0].job_title || '';
                profile.company = resume.experiences[0].company || '';
                profile.experience = `${resume.experiences.length} positions`;
              }
              
              // Get education
              if (resume.education && resume.education.length > 0) {
                profile.education = resume.education[0].qualification || '';
              }
            }
          } catch (e) {
            console.error('Error loading job seeker profile:', e);
          }
        } else if (user.role === 'recruiter') {
          try {
            const res = await client.get('/api/recruiter/profile');
            if (res.data?.success) {
              const recruiterData = res.data.profile;
              profile.company = recruiterData.company || '';
              profile.title = recruiterData.position || 'Recruiter';
              profile.bio = recruiterData.bio || '';
            }
          } catch (e) {
            console.error('Error loading recruiter profile:', e);
          }
        }

        setProfileData(profile);
        setEditData(profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = async () => {
    try {
      // Update user basic info
      const updateData = {
        name: editData.name,
        phone_no: editData.phone
      };

      const res = await client.put('/api/auth/profile', updateData);
      if (res.data?.success) {
        // Update additional data based on role
        if (user.role === 'job_seeker') {
          await client.put('/api/jobseeker/resume', {
            statement_profile: editData.bio,
            linkedin_url: editData.linkedin,
            github_url: editData.github
          });
        } else if (user.role === 'recruiter') {
          await client.put('/api/recruiter/profile', {
            company: editData.company,
            position: editData.title,
            bio: editData.bio
          });
        }

        setProfileData(editData);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...profileData });
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillAdd = (skill) => {
    if (skill && !editData.skills.includes(skill)) {
      setEditData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const handleSkillRemove = (skill) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
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
      <div className="max-w-4xl mx-auto">
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
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-purple-300 focus:border-purple-500 outline-none mb-2"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                )}
                
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="text-lg text-gray-600 bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none"
                    placeholder="Your title/position"
                  />
                ) : (
                  <p className="text-lg text-gray-600">{profileData.title || 'No title set'}</p>
                )}
                
                <p className="text-sm text-purple-600 mt-1">
                  {user?.role === 'job_seeker' ? 'Job Seeker' : user?.role === 'recruiter' ? 'Recruiter' : 'User'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
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

          {/* Bio Section */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-sm text-gray-500">Location</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none"
                    placeholder="Your location"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.location || 'Not specified'}</p>
                )}
              </div>
            </div>
            
            {profileData.company && (
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none"
                      placeholder="Company name"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.company}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Professional Details */}
        <motion.div 
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Professional Information</h2>
          
          {user?.role === 'job_seeker' && (
            <>
              {/* Experience */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Briefcase className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-700">Experience</h3>
                </div>
                <p className="text-gray-600">{profileData.experience || 'No experience added'}</p>
              </div>
              
              {/* Education */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-700">Education</h3>
                </div>
                <p className="text-gray-600">{profileData.education || 'No education added'}</p>
              </div>
              
              {/* Skills */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Award className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-700">Skills</h3>
                </div>
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
              </div>
            </>
          )}

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Social Links</h3>
            <div className="space-y-3">
              {profileData.linkedin && (
                <div className="flex items-center space-x-3">
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  {isEditing ? (
                    <input
                      type="url"
                      value={editData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      className="flex-1 text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none"
                      placeholder="LinkedIn URL"
                    />
                  ) : (
                    <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profileData.linkedin}
                    </a>
                  )}
                </div>
              )}
              
              {profileData.github && (
                <div className="flex items-center space-x-3">
                  <Github className="w-5 h-5 text-gray-800" />
                  {isEditing ? (
                    <input
                      type="url"
                      value={editData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      className="flex-1 text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none"
                      placeholder="GitHub URL"
                    />
                  ) : (
                    <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">
                      {profileData.github}
                    </a>
                  )}
                </div>
              )}
              
              {profileData.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-purple-600" />
                  {isEditing ? (
                    <input
                      type="url"
                      value={editData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="flex-1 text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none"
                      placeholder="Website URL"
                    />
                  ) : (
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                      {profileData.website}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Activity Stats */}
        <motion.div 
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user?.role === 'job_seeker' ? (
              <>
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
              </>
            ) : (
              <>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-gray-600">Jobs Posted</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-gray-600">Applications</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-sm text-gray-600">Interviews</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">0</p>
                  <p className="text-sm text-gray-600">Hired</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;