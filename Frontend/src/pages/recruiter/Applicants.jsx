import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../../api/client';
import {
  Search,
  Filter,
  Download,
  Eye,
  Star,
  StarOff,
  MessageSquare,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  RotateCcw,
  MoreHorizontal,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Edit
} from 'lucide-react';

const modalBackdropStyle = {
  position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalCardStyle = {
  width: '100%', maxWidth: 520, background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
};

const Applicants = () => {
const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [scheduleMeetLink, setScheduleMeetLink] = useState('');
  const [openCalendarAfter, setOpenCalendarAfter] = useState(true);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  // Profile modal state (moved above early return to keep hook order stable)
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // In-app messaging modal state (must be above any early returns)
  const [showChat, setShowChat] = useState(false);
  const [chatSeeker, setChatSeeker] = useState(null); // { seeker_id, name }
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Backend data

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    const loadJobsAndApplicants = async () => {
      setLoading(true);
      try {
        // Load jobs to populate filter
        const jobsRes = await client.get('/api/recruiter/jobs/my');
        if (jobsRes.data?.success) {
          const jobOptions = jobsRes.data.jobs.map(j => ({ id: j.job_id, title: j.title }));
          setJobs(jobOptions);
          const defaultJobId = jobOptions[0]?.id || null;
          setSelectedJobId(defaultJobId);
          if (defaultJobId) {
            const appsRes = await client.get(`/api/recruiter/jobs/${defaultJobId}/applicants`);
            if (appsRes.data?.success) {
              const mapped = appsRes.data.applicants.map(a => ({
                id: a.application_id, // use application id as primary id in UI
                application_id: a.application_id,
                seeker_id: a.seeker_id,
                name: a.name,
                email: a.email,
                phone: a.phone_no,
                location: a.address || '—',
                jobTitle: a.job_title || jobsRes.data.jobs.find(j=>j.job_id===a.job_id)?.title || '—',
                jobId: a.job_id,
                appliedDate: a.applied_timestamp,
                status: a.status || 'new',
                experience: a.experiences?.length ? `${a.experiences.length} entries` : '—',
                education: a.education?.length ? `${a.education.length} entries` : '—',
                skills: Array.isArray(a.skills) ? a.skills : [],
                rating: 0,
                starred: !!a.star,
                resumeUrl: '',
              }));
              setApplicants(mapped);
              setFilteredApplicants(mapped);
            }
          }
        }
      } catch (error) {
        toast.error('Failed to fetch applicants');
      } finally {
        setLoading(false);
      }
    };

    loadJobsAndApplicants();
  }, []);

  useEffect(() => {
    if (location.state?.openProfileApplicationId && applicants.length > 0) {
      const appId = location.state.openProfileApplicationId;
      viewProfile(appId);
      navigate('.', { replace: true, state: null });
    }
  }, [location.state, applicants]);

  useEffect(() => {
    let filtered = applicants;

    if (searchTerm) {
      filtered = filtered.filter(applicant =>
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(applicant => applicant.status === statusFilter);
    }

    if (jobFilter !== 'all') {
      filtered = filtered.filter(applicant => applicant.jobId === parseInt(jobFilter));
    }

    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(applicant => applicant.rating >= rating);
    }

    setFilteredApplicants(filtered);
  }, [searchTerm, statusFilter, jobFilter, ratingFilter, applicants]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await client.put(`/api/recruiter/applications/${applicationId}/status`, { status: newStatus });
      setApplicants(prev => prev.map(a => a.application_id === applicationId ? { ...a, status: newStatus } : a));
      setFilteredApplicants(prev => prev.map(a => a.application_id === applicationId ? { ...a, status: newStatus } : a));
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleRatingChange = (applicantId, rating) => {
    setApplicants(prevApplicants =>
      prevApplicants.map(applicant =>
        applicant.id === applicantId ? { ...applicant, rating } : applicant
      )
    );
    toast.success('Rating updated');
  };

  const handleStarToggle = (applicationId) => {
    setApplicants(prev => prev.map(a => a.application_id === applicationId ? { ...a, starred: !a.starred } : a));
  };

  const handleBulkAction = async (action) => {
    if (selectedApplicants.length === 0) {
      toast.error('Please select applicants first');
      return;
    }

    if (action === 'schedule') {
      setShowScheduleModal(true);
      return;
    }

    // status updates
    const newStatus = action === 'shortlist' ? 'shortlisted' : action === 'reject' ? 'rejected' : 'under_review';
    try {
      await Promise.all(selectedApplicants.map(id => client.put(`/api/recruiter/applications/${id}/status`, { status: newStatus })));
      setApplicants(prev => prev.map(a => selectedApplicants.includes(a.application_id) ? { ...a, status: newStatus } : a));
      setFilteredApplicants(prev => prev.map(a => selectedApplicants.includes(a.application_id) ? { ...a, status: newStatus } : a));
      setSelectedApplicants([]);
      toast.success(`${selectedApplicants.length} applicant(s) updated`);
    } catch (e) {
      toast.error('Failed to update applicants');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || colors.new;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <Clock className="w-4 h-4" />;
      case 'under_review':
        return <Eye className="w-4 h-4" />;
      case 'shortlisted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'hired':
        return <Award className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const renderStars = (rating, applicantId) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingChange(applicantId, star)}
            className={`${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RotateCcw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

const submitSchedule = async () => {
    if (!scheduleDateTime) {
      toast.error('Please pick a date & time');
      return;
    }
    const startIso = new Date(scheduleDateTime);
    const endIso = new Date(startIso.getTime() + 60 * 60 * 1000); // default 60m
    setScheduleSubmitting(true);
    try {
      for (const applicationId of selectedApplicants) {
        await client.post('/api/recruiter/interviews', {
          application_id: applicationId,
          schedule_time: startIso.toISOString(),
          meeting_link: scheduleMeetLink || undefined
        });
      }
      toast.success('Interview(s) scheduled');

      // Optionally open Google Calendar template for the first selected candidate
      if (openCalendarAfter && selectedApplicants.length > 0) {
        const first = filteredApplicants.find(a => a.application_id === selectedApplicants[0]);
        if (first) {
          const formatCal = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          const calUrl = new URL('https://calendar.google.com/calendar/render');
          calUrl.searchParams.set('action', 'TEMPLATE');
          calUrl.searchParams.set('text', `Interview: ${first.name}`);
          calUrl.searchParams.set('details', `Interview for ${first.jobTitle}${scheduleMeetLink ? `\nMeet: ${scheduleMeetLink}` : ''}`);
          calUrl.searchParams.set('dates', `${formatCal(startIso)}/${formatCal(endIso)}`);
          if (first.email) calUrl.searchParams.set('add', first.email);
          window.open(calUrl.toString(), '_blank');
        }
      }

      setShowScheduleModal(false);
      setScheduleDateTime('');
      setScheduleMeetLink('');
      setSelectedApplicants([]);
    } catch (e) {
      toast.error('Failed to schedule');
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const viewProfile = async (applicationId) => {
    try {
      const res = await client.get(`/api/recruiter/applications/${applicationId}/profile`);
      if (res.data?.success) {
        setProfileData(res.data.profile);
        setShowProfile(true);
      }
    } catch (e) {
      toast.error('Failed to load profile');
    }
  };

  const openChatWithApplicant = async (applicant) => {
    try {
      let seekerId = applicant.seeker_id;
      if (!seekerId) {
        // Fallback: fetch profile to get seeker_id
        const prof = await client.get(`/api/recruiter/applications/${applicant.application_id || applicant.id}/profile`);
        if (prof.data?.success) {
          seekerId = prof.data.profile?.user?.seeker_id;
        }
      }
      if (!seekerId) {
        toast.error('Unable to determine candidate profile');
        return;
      }
      setChatSeeker({ seeker_id: seekerId, name: applicant.name });
      setShowChat(true);
      const res = await client.get(`/api/recruiter/messages/${seekerId}`);
      if (res.data?.success) setChatMessages(res.data.messages || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to open conversation');
    }
  };

  const sendChatMessage = async () => {
    const body = chatInput.trim();
    if (!body || !chatSeeker) return;
    try {
      const res = await client.post('/api/recruiter/messages', {
        seeker_id: chatSeeker.seeker_id,
        body
      });
      if (res.data?.success) {
        setChatMessages(prev => [...prev, res.data.message]);
        setChatInput('');
      }
    } catch (e) {
      toast.error('Failed to send message');
    }
  };

  const openScheduleFor = (applicationId) => {
    setSelectedApplicants([applicationId]);
    setShowScheduleModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <p className="text-gray-600">Review and manage job applications</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <button
            onClick={async () => {
              if (!selectedJobId) return;
              setLoading(true);
              try {
                const appsRes = await client.get(`/api/recruiter/jobs/${selectedJobId}/applicants`);
                if (appsRes.data?.success) {
                    const mapped = appsRes.data.applicants.map(a => ({
                    id: a.application_id,
                    application_id: a.application_id,
                    seeker_id: a.seeker_id,
                    name: a.name,
                    email: a.email,
                    phone: a.phone_no,
                    location: a.address || '—',
                    jobTitle: a.job_title || jobs.find(j=>j.id===a.job_id)?.title || '—',
                    jobId: a.job_id,
                    appliedDate: a.applied_timestamp,
                    status: a.status || 'new',
                    experience: '—',
                    education: '—',
                    skills: [],
                    rating: 0,
                    starred: !!a.star,
                    resumeUrl: '',
                  }));
                  setApplicants(mapped);
                  setFilteredApplicants(mapped);
                }
              } catch (e) {
                toast.error('Failed to fetch applicants');
              } finally {
                setLoading(false);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Search className="w-4 h-4 inline mr-2" />
            Load Applicants
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div style={modalBackdropStyle}>
          <div style={modalCardStyle}>
            <h3 className="text-lg font-bold mb-2">Schedule Interviews</h3>
            <p className="text-sm text-gray-600 mb-4">Selected applications: {selectedApplicants.length}</p>
<label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={scheduleDateTime}
              onChange={(e) => setScheduleDateTime(e.target.value)}
              className="w-full border rounded-lg p-2 mb-2"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Meet link (optional)</label>
            <input
              type="url"
              value={scheduleMeetLink}
              onChange={(e) => setScheduleMeetLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full border rounded-lg p-2 mb-4"
            />
            <label className="inline-flex items-center gap-2 mb-4">
              <input type="checkbox" checked={openCalendarAfter} onChange={(e) => setOpenCalendarAfter(e.target.checked)} />
              <span className="text-sm text-gray-700">Open Google Calendar to finalize invite</span>
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button onClick={submitSchedule} disabled={scheduleSubmitting} className="px-4 py-2 rounded-lg text-white bg-blue-600 disabled:opacity-50">
                {scheduleSubmitting ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div style={modalBackdropStyle}>
          <div style={modalCardStyle}>
            <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
            <textarea
              className="w-full h-40 border rounded p-2"
              placeholder="Write interview notes or a review for this applicant..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <div className="mt-3 flex justify-end space-x-2">
              <button className="px-3 py-1 rounded bg-gray-100" onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={saveReview}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{applicants.length}</p>
            </div>
            <User className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-blue-600">
                {applicants.filter(a => a.status === 'new').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hired</p>
              <p className="text-2xl font-bold text-emerald-600">
                {applicants.filter(a => a.status === 'hired' || a.status === 'shortlisted').length}
              </p>
            </div>
            <Award className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-purple-600">
                {applicants.filter(a => a.status === 'under_review').length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Starred</p>
              <p className="text-2xl font-bold text-yellow-600">
                {applicants.filter(a => a.starred).length}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applicants, skills, or jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>

            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedApplicants.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedApplicants.length} applicant(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('shortlist')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  <ThumbsUp className="w-3 h-3 inline mr-1" />
                  Mark Hired
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  <ThumbsDown className="w-3 h-3 inline mr-1" />
                  Reject
                </button>
                <button
                  onClick={() => handleBulkAction('schedule')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Applicants List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="divide-y divide-gray-200">
          {filteredApplicants.map((applicant) => (
            <div key={applicant.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedApplicants.includes(applicant.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedApplicants([...selectedApplicants, applicant.id]);
                    } else {
                      setSelectedApplicants(selectedApplicants.filter(id => id !== applicant.id));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />

                <img
                  src={applicant.avatar}
                  alt={applicant.name}
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{applicant.name}</h3>
                        <button
                          onClick={() => handleStarToggle(applicant.id)}
                          className={`${applicant.starred ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                          {getStatusIcon(applicant.status)}
                          <span className="ml-1 capitalize">{applicant.status.replace('_', ' ')}</span>
                        </span>
                      </div>

                      <p className="text-sm font-medium text-blue-600">{applicant.jobTitle}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {applicant.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {applicant.phone}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {applicant.location}
                        </span>
                        <span className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {applicant.experience}
                        </span>
                        <span className="flex items-center">
                          <GraduationCap className="w-4 h-4 mr-1" />
                          {applicant.education}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {applicant.skills.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {applicant.skills.length > 4 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{applicant.skills.length - 4} more
                          </span>
                        )}
                      </div>

                      {applicant.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          <strong>Notes:</strong> {applicant.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-sm text-gray-500">
                        Applied {new Date(applicant.appliedDate).toLocaleDateString()}
                      </div>

                      <div className="flex items-center space-x-1">
                        {renderStars(applicant.rating, applicant.id)}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewProfile(applicant.application_id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Profile"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openReview(applicant.application_id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Write Review"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate('/recruiter/email', { state: { to: applicant.email, subject: `Regarding your application for ${applicant.jobTitle}`, body: `Dear ${applicant.name},\n\n` } })}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Send Message (Email)"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openScheduleFor(applicant.application_id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                          title="Schedule Interview"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>

                      <select
                        value={applicant.status}
                        onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="new">New</option>
                        <option value="under_review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredApplicants.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applicants found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || jobFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No applications have been received yet'}
            </p>
          </div>
        )}
      </div>
      {showProfile && profileData && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalCardStyle, maxWidth: 800 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Candidate Profile</h3>
              <button onClick={() => setShowProfile(false)} className="text-gray-500 hover:text-gray-800">Close</button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-auto">
              <div className="border rounded p-3">
                <h4 className="font-semibold text-gray-900">Personal</h4>
                <p className="text-sm text-gray-700">{profileData.user?.name} • {profileData.user?.email} • {profileData.user?.phone_no}</p>
                {profileData.user?.address && (
                  <p className="text-sm text-gray-600">{profileData.user.address}</p>
                )}
              </div>
              {profileData.resume && (
                <div className="border rounded p-3">
                  <h4 className="font-semibold text-gray-900">Summary</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{profileData.resume.statement_profile || '—'}</p>
                </div>
              )}
              {Array.isArray(profileData.experiences) && profileData.experiences.length > 0 && (
                <div className="border rounded p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                  <div className="space-y-2">
                    {profileData.experiences.map((e) => (
                      <div key={e.experience_id} className="text-sm">
                        <div className="font-medium text-gray-900">{e.job_title} • {e.company}</div>
                        <div className="text-gray-600">{e.duration}</div>
                        {e.description && <div className="text-gray-700">{e.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(profileData.education) && profileData.education.length > 0 && (
                <div className="border rounded p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
                  <div className="space-y-2">
                    {profileData.education.map((e) => (
                      <div key={e.education_id} className="text-sm">
                        <div className="font-medium text-gray-900">{e.qualification} • {e.college}</div>
                        <div className="text-gray-600">{e.start_date || ''}{e.start_date && e.end_date ? ' - ' : ''}{e.end_date || ''}</div>
                        {e.gpa && <div className="text-gray-700">GPA: {Number(e.gpa).toFixed(2)}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(profileData.skills) && profileData.skills.length > 0 && (
                <div className="border rounded p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.flatMap(s => Array.isArray(s.skills) ? s.skills : []).map((s, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {false && showChat && chatSeeker && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalCardStyle, maxWidth: 700 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Message {chatSeeker.name}</h3>
              <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-gray-800">Close</button>
            </div>
            <div className="border rounded p-3 h-80 overflow-auto mb-3 bg-gray-50">
              {chatMessages.length === 0 && (
                <div className="text-sm text-gray-500">No messages yet.</div>
              )}
              {chatMessages.map(m => (
                <div key={m.message_id} className={`my-1 flex ${/* align right if sender is me */ ''}`}>
                  <div className={`px-3 py-2 rounded-lg text-sm ${m.sender_user_id ? 'bg-white' : 'bg-white'}`}>
                    {m.body}
                    <div className="text-[10px] text-gray-400 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendChatMessage(); }}
              />
              <button onClick={sendChatMessage} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applicants;
