import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  ThumbsDown
} from 'lucide-react';

const Applicants = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock applicants data
  const mockApplicants = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      jobTitle: 'Senior Frontend Developer',
      jobId: 1,
      appliedDate: '2024-01-18',
      status: 'under_review',
      experience: '5 years',
      education: 'BS Computer Science',
      skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
      rating: 4,
      resumeUrl: '/resumes/sarah-johnson.pdf',
      coverLetter: 'I am excited to apply for the Senior Frontend Developer position...',
      previousCompany: 'TechStartup Inc.',
      salary: '$120,000',
      availability: 'Immediate',
      starred: true,
      notes: 'Strong React experience, good cultural fit'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 234-5678',
      location: 'Seattle, WA',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      jobTitle: 'DevOps Engineer',
      jobId: 2,
      appliedDate: '2024-01-20',
      status: 'shortlisted',
      experience: '7 years',
      education: 'MS Computer Science',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Python'],
      rating: 5,
      resumeUrl: '/resumes/michael-chen.pdf',
      coverLetter: 'With my extensive DevOps experience...',
      previousCompany: 'CloudTech Solutions',
      salary: '$130,000',
      availability: '2 weeks notice',
      starred: false,
      notes: 'Excellent technical skills, AWS certified'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      jobTitle: 'UX Designer',
      jobId: 3,
      appliedDate: '2024-01-15',
      status: 'interviewed',
      experience: '4 years',
      education: 'BA Design',
      skills: ['Figma', 'Sketch', 'Prototyping', 'User Research'],
      rating: 4,
      resumeUrl: '/resumes/emily-rodriguez.pdf',
      coverLetter: 'I believe design should solve real problems...',
      previousCompany: 'Design Agency',
      salary: '$85,000',
      availability: 'Immediate',
      starred: true,
      notes: 'Great portfolio, creative approach'
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '+1 (555) 456-7890',
      location: 'New York, NY',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      jobTitle: 'Data Scientist',
      jobId: 4,
      appliedDate: '2024-01-22',
      status: 'rejected',
      experience: '3 years',
      education: 'PhD Statistics',
      skills: ['Python', 'R', 'Machine Learning', 'SQL'],
      rating: 3,
      resumeUrl: '/resumes/david-kim.pdf',
      coverLetter: 'My passion for data analysis drives me...',
      previousCompany: 'Analytics Corp',
      salary: '$110,000',
      availability: '1 month notice',
      starred: false,
      notes: 'Good technical skills but lacks domain experience'
    },
    {
      id: 5,
      name: 'Jessica Taylor',
      email: 'jessica.taylor@email.com',
      phone: '+1 (555) 567-8901',
      location: 'Boston, MA',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150',
      jobTitle: 'Product Manager',
      jobId: 5,
      appliedDate: '2024-01-19',
      status: 'new',
      experience: '6 years',
      education: 'MBA',
      skills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
      rating: 0,
      resumeUrl: '/resumes/jessica-taylor.pdf',
      coverLetter: 'Leading cross-functional teams to deliver...',
      previousCompany: 'Product Co',
      salary: '$140,000',
      availability: 'Flexible',
      starred: false,
      notes: ''
    }
  ];

  const jobs = [
    { id: 1, title: 'Senior Frontend Developer' },
    { id: 2, title: 'DevOps Engineer' },
    { id: 3, title: 'UX Designer' },
    { id: 4, title: 'Data Scientist' },
    { id: 5, title: 'Product Manager' }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchApplicants = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setApplicants(mockApplicants);
        setFilteredApplicants(mockApplicants);
      } catch (error) {
        toast.error('Failed to fetch applicants');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

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

  const handleStatusChange = (applicantId, newStatus) => {
    setApplicants(prevApplicants =>
      prevApplicants.map(applicant =>
        applicant.id === applicantId ? { ...applicant, status: newStatus } : applicant
      )
    );
    toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleRatingChange = (applicantId, rating) => {
    setApplicants(prevApplicants =>
      prevApplicants.map(applicant =>
        applicant.id === applicantId ? { ...applicant, rating } : applicant
      )
    );
    toast.success('Rating updated');
  };

  const handleStarToggle = (applicantId) => {
    setApplicants(prevApplicants =>
      prevApplicants.map(applicant =>
        applicant.id === applicantId ? { ...applicant, starred: !applicant.starred } : applicant
      )
    );
  };

  const handleBulkAction = (action) => {
    if (selectedApplicants.length === 0) {
      toast.error('Please select applicants first');
      return;
    }

    switch (action) {
      case 'shortlist':
        setApplicants(prevApplicants =>
          prevApplicants.map(applicant =>
            selectedApplicants.includes(applicant.id) ? { ...applicant, status: 'shortlisted' } : applicant
          )
        );
        setSelectedApplicants([]);
        toast.success(`${selectedApplicants.length} applicant(s) shortlisted`);
        break;
      case 'reject':
        setApplicants(prevApplicants =>
          prevApplicants.map(applicant =>
            selectedApplicants.includes(applicant.id) ? { ...applicant, status: 'rejected' } : applicant
          )
        );
        setSelectedApplicants([]);
        toast.success(`${selectedApplicants.length} applicant(s) rejected`);
        break;
      case 'schedule':
        toast.info('Interview scheduling feature coming soon');
        setSelectedApplicants([]);
        break;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-green-100 text-green-800',
      interviewed: 'bg-purple-100 text-purple-800',
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
      case 'interviewed':
        return <MessageSquare className="w-4 h-4" />;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <p className="text-gray-600">Review and manage job applications</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
            <Download className="w-4 h-4 inline mr-2" />
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <Calendar className="w-4 h-4 inline mr-2" />
            Schedule Interviews
          </button>
        </div>
      </div>

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
              <p className="text-sm font-medium text-gray-600">Shortlisted</p>
              <p className="text-2xl font-bold text-green-600">
                {applicants.filter(a => a.status === 'shortlisted').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Interviewed</p>
              <p className="text-2xl font-bold text-purple-600">
                {applicants.filter(a => a.status === 'interviewed').length}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-400" />
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
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewed">Interviewed</option>
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
                  Shortlist
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
                          onClick={() => window.open(applicant.resumeUrl, '_blank')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Resume"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/recruiter/applicants/${applicant.id}`)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Send Message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
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
                        <option value="interviewed">Interviewed</option>
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
    </div>
  );
};

export default Applicants;
