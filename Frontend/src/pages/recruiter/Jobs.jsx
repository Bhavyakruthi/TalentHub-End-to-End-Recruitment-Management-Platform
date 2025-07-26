import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  PauseCircle,
  RotateCcw,
  Download,
  Share2
} from 'lucide-react';

const Jobs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);

  // Mock job data
  const mockJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'full-time',
      salary: { min: 90000, max: 130000 },
      status: 'active',
      applications: 42,
      views: 156,
      postedDate: '2024-01-15',
      deadline: '2024-02-15',
      description: 'We are looking for a skilled Frontend Developer...'
    },
    {
      id: 2,
      title: 'DevOps Engineer',
      company: 'CloudTech Solutions',
      location: 'Remote',
      type: 'full-time',
      salary: { min: 85000, max: 120000 },
      status: 'paused',
      applications: 28,
      views: 89,
      postedDate: '2024-01-20',
      deadline: '2024-02-20',
      description: 'Join our DevOps team to build scalable infrastructure...'
    },
    {
      id: 3,
      title: 'UX Designer',
      company: 'Design Studio',
      location: 'New York, NY',
      type: 'contract',
      salary: { min: 70000, max: 95000 },
      status: 'expired',
      applications: 67,
      views: 234,
      postedDate: '2023-12-10',
      deadline: '2024-01-10',
      description: 'Create amazing user experiences for our products...'
    },
    {
      id: 4,
      title: 'Data Scientist',
      company: 'AI Innovations',
      location: 'Boston, MA',
      type: 'full-time',
      salary: { min: 100000, max: 150000 },
      status: 'draft',
      applications: 0,
      views: 0,
      postedDate: '2024-01-25',
      deadline: '2024-03-01',
      description: 'Analyze complex data sets to drive business decisions...'
    },
    {
      id: 5,
      title: 'Product Manager',
      company: 'StartupCo',
      location: 'Austin, TX',
      type: 'full-time',
      salary: { min: 95000, max: 140000 },
      status: 'active',
      applications: 53,
      views: 198,
      postedDate: '2024-01-18',
      deadline: '2024-02-28',
      description: 'Lead product development from conception to launch...'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchJobs = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setJobs(mockJobs);
        setFilteredJobs(mockJobs);
      } catch (error) {
        toast.error('Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, statusFilter, typeFilter, jobs]);

  const handleStatusChange = (jobId, newStatus) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
    toast.success(`Job ${newStatus === 'active' ? 'activated' : newStatus}`);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      toast.success('Job deleted successfully');
    }
  };

  const handleBulkAction = (action) => {
    if (selectedJobs.length === 0) {
      toast.error('Please select jobs first');
      return;
    }

    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedJobs.length} job(s)?`)) {
          setJobs(prevJobs => prevJobs.filter(job => !selectedJobs.includes(job.id)));
          setSelectedJobs([]);
          toast.success(`${selectedJobs.length} job(s) deleted`);
        }
        break;
      case 'activate':
        setJobs(prevJobs =>
          prevJobs.map(job =>
            selectedJobs.includes(job.id) ? { ...job, status: 'active' } : job
          )
        );
        setSelectedJobs([]);
        toast.success(`${selectedJobs.length} job(s) activated`);
        break;
      case 'pause':
        setJobs(prevJobs =>
          prevJobs.map(job =>
            selectedJobs.includes(job.id) ? { ...job, status: 'paused' } : job
          )
        );
        setSelectedJobs([]);
        toast.success(`${selectedJobs.length} job(s) paused`);
        break;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'paused':
        return <PauseCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      case 'draft':
        return <Edit className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
          <p className="text-gray-600">Manage all your job postings</p>
        </div>
        <button
          onClick={() => navigate('/recruiter/post-job')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Post New Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-green-600">
                {jobs.filter(job => job.status === 'active').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-blue-600">
                {jobs.reduce((sum, job) => sum + job.applications, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-purple-600">
                {jobs.reduce((sum, job) => sum + job.views, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-purple-600" />
            </div>
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
                placeholder="Search jobs, companies, or locations..."
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
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedJobs.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedJobs.length} job(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('pause')}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  Pause
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedJobs(filteredJobs.map(job => job.id));
                      } else {
                        setSelectedJobs([]);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className={`hover:bg-gray-50 ${selectedJobs.includes(job.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJobs([...selectedJobs, job.id]);
                        } else {
                          setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      <div className="text-sm text-gray-500">{job.company}</div>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {job.location}
                        <Clock className="w-3 h-3 ml-2 mr-1" />
                        {job.type}
                        <DollarSign className="w-3 h-3 ml-2 mr-1" />
                        ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      <span className="ml-1 capitalize">{job.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{job.applications}</div>
                    <div className="text-xs text-gray-500">applications</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{job.views}</div>
                    <div className="text-xs text-gray-500">views</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(job.postedDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/recruiter/jobs/${job.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(job.id, job.status === 'active' ? 'paused' : 'active')}
                        className="text-yellow-600 hover:text-yellow-900"
                        title={job.status === 'active' ? 'Pause' : 'Activate'}
                      >
                        {job.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Get started by posting your first job'}
            </p>
            {(!searchTerm && statusFilter === 'all' && typeFilter === 'all') && (
              <div className="mt-6">
                <button
                  onClick={() => navigate('/recruiter/post-job')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
