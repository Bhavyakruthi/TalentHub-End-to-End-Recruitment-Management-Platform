import React, { useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Download,
  MapPin,
  DollarSign,
  Building
} from 'lucide-react';

// Glassmorphism utility classes
const glass = "bg-white/30 backdrop-blur-md border border-white/20 shadow-lg";

const Applications = () => {
  const [applications, setApplications] = useState([
    {
      id: 1,
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120,000 - $150,000',
      appliedDate: '2024-01-20',
      status: 'interview',
      stage: 'Technical Interview',
      nextAction: 'Interview scheduled for Jan 25, 2024 at 2:00 PM',
      recruiterName: 'Sarah Johnson',
      notes: 'Great conversation about React experience',
      logo: '/api/placeholder/40/40',
    },
    {
      id: 2,
      jobTitle: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '$90,000 - $120,000',
      appliedDate: '2024-01-18',
      status: 'under_review',
      stage: 'Application Review',
      nextAction: 'Waiting for initial screening',
      recruiterName: 'Mike Chen',
      notes: 'Application submitted with portfolio',
      logo: '/api/placeholder/40/40',
    },
    {
      id: 3,
      jobTitle: 'React Developer',
      company: 'Digital Solutions',
      location: 'New York, NY',
      salary: '$75,000 - $95,000',
      appliedDate: '2024-01-15',
      status: 'rejected',
      stage: 'Application Review',
      nextAction: 'Application not selected',
      recruiterName: 'Lisa Wang',
      notes: 'Thank you for your interest. We went with another candidate.',
      logo: '/api/placeholder/40/40',
    },
    {
      id: 4,
      jobTitle: 'UI/UX Developer',
      company: 'Design Studio',
      location: 'Los Angeles, CA',
      salary: '$85,000 - $105,000',
      appliedDate: '2024-01-12',
      status: 'offer',
      stage: 'Offer Extended',
      nextAction: 'Respond to offer by Jan 30, 2024',
      recruiterName: 'Alex Thompson',
      notes: 'Offer includes stock options and flexible work arrangements',
      logo: '/api/placeholder/40/40',
    },
  ]);

  const [filters, setFilters] = useState({
    status: '',
    company: '',
    dateRange: '',
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Unique, elegant status colors (not blue)
  const getStatusConfig = (status) => {
    switch (status) {
      case 'applied':
        return {
          color: 'bg-gradient-to-r from-fuchsia-100 to-pink-100 text-fuchsia-700',
          icon: <Clock className="w-4 h-4" />,
          text: 'Applied'
        };
      case 'under_review':
        return {
          color: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700',
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Under Review'
        };
      case 'interview':
        return {
          color: 'bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-700',
          icon: <Calendar className="w-4 h-4" />,
          text: 'Interview'
        };
      case 'offer':
        return {
          color: 'bg-gradient-to-r from-lime-100 to-emerald-100 text-emerald-700',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Offer Received'
        };
      case 'rejected':
        return {
          color: 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-700',
          icon: <XCircle className="w-4 h-4" />,
          text: 'Not Selected'
        };
      default:
        return {
          color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700',
          icon: <Clock className="w-4 h-4" />,
          text: 'Unknown'
        };
    }
  };

  const getStatusCounts = () => {
    return {
      total: applications.length,
      applied: applications.filter(app => app.status === 'applied').length,
      under_review: applications.filter(app => app.status === 'under_review').length,
      interview: applications.filter(app => app.status === 'interview').length,
      offer: applications.filter(app => app.status === 'offer').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === '' || app.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  // Animated gradient background for the whole page
  return (
    <div className="min-h-screen py-10 px-2 md:px-8" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg">My Applications</h1>
          <p className="text-gray-700 font-medium">Track and manage your job applications</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            className={`${glass} px-5 py-2.5 text-gray-900 font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/50`}
          >
            <Download className="w-5 h-5" />
            Export Applications
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total', value: statusCounts.total, color: 'from-gray-100 to-gray-200 text-gray-900' },
          { label: 'Applied', value: statusCounts.applied, color: 'from-fuchsia-100 to-pink-100 text-fuchsia-700' },
          { label: 'Review', value: statusCounts.under_review, color: 'from-amber-100 to-orange-100 text-amber-700' },
          { label: 'Interview', value: statusCounts.interview, color: 'from-cyan-100 to-teal-100 text-cyan-700' },
          { label: 'Offers', value: statusCounts.offer, color: 'from-lime-100 to-emerald-100 text-emerald-700' },
          { label: 'Rejected', value: statusCounts.rejected, color: 'from-rose-100 to-red-100 text-rose-700' },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            className={`rounded-xl p-4 border border-white/30 shadow-lg ${glass} bg-gradient-to-br ${stat.color} transition-all duration-300 hover:scale-105`}
            style={{ animation: `fadeInUp 0.5s ${idx * 0.08 + 0.1}s both` }}
          >
            <div className="text-center">
              <p className="text-2xl font-extrabold">{stat.value}</p>
              <p className="text-sm font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${glass} p-6 rounded-xl mb-8 border border-white/30 shadow-lg`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 w-full p-3 border-none rounded-lg bg-white/60 focus:ring-2 focus:ring-fuchsia-400 focus:bg-white/80 transition"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="p-3 border-none rounded-lg bg-white/60 focus:ring-2 focus:ring-fuchsia-400 focus:bg-white/80 transition"
          >
            <option value="">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="under_review">Under Review</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer Received</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="p-3 border-none rounded-lg bg-white/60 focus:ring-2 focus:ring-fuchsia-400 focus:bg-white/80 transition"
          >
            <option value="">All Time</option>
            <option value="last_week">Last Week</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
          </select>
          <button className={`${glass} px-4 py-3 text-gray-900 rounded-lg font-semibold flex items-center gap-2 hover:bg-white/50 transition`}>
            <Filter className="w-5 h-5" />
            More Filters
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {filteredApplications.map((application, idx) => {
          const statusConfig = getStatusConfig(application.status);

          return (
            <div
              key={application.id}
              className={`${glass} rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl transition-shadow duration-300 group relative overflow-hidden`}
              style={{
                animation: `fadeInUp 0.6s ${idx * 0.08 + 0.2}s both`
              }}
            >
              {/* Subtle animated gradient overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(120deg, rgba(255,255,255,0.15) 0%, rgba(236,72,153,0.08) 100%)'
                }}
              />
              <div className="p-6 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={application.logo}
                      alt={`${application.company} logo`}
                      className="w-14 h-14 rounded-xl border border-white/40 bg-white/40 shadow"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{application.jobTitle}</h3>
                          <p className="text-gray-700 font-medium">{application.company}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow ${statusConfig.color} bg-opacity-80`}>
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.text}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {application.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {application.salary}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Applied {application.appliedDate}
                        </span>
                      </div>

                      <div className="mt-4 p-4 rounded-xl bg-white/40 border border-white/20 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Current Stage</p>
                          <p className="text-sm text-gray-700">{application.stage}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Next Action</p>
                          <p className="text-sm text-gray-700">{application.nextAction}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Recruiter</p>
                          <p className="text-sm text-gray-700">{application.recruiterName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Notes</p>
                          <p className="text-sm text-gray-700">{application.notes}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button className="text-fuchsia-700 hover:text-fuchsia-900 font-semibold text-sm transition-transform hover:scale-105">
                            <Eye className="w-4 h-4 inline mr-1" />
                            View Details
                          </button>
                          <button className="text-cyan-700 hover:text-cyan-900 font-semibold text-sm transition-transform hover:scale-105">
                            <MessageSquare className="w-4 h-4 inline mr-1" />
                            Message Recruiter
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          {application.status === 'offer' && (
                            <>
                              <button className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-lime-400 text-white rounded-lg font-semibold text-sm shadow hover:scale-105 transition-transform">
                                Accept Offer
                              </button>
                              <button className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-100 text-gray-900 rounded-lg font-semibold text-sm shadow hover:scale-105 transition-transform">
                                Negotiate
                              </button>
                            </>
                          )}
                          {application.status === 'interview' && (
                            <button className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-teal-400 text-white rounded-lg font-semibold text-sm shadow hover:scale-105 transition-transform">
                              Prepare Interview
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredApplications.length === 0 && (
        <div className={`${glass} text-center py-16 rounded-2xl border border-white/30 shadow-xl mt-10`}>
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-700 mb-6">
            {searchTerm || filters.status 
              ? 'Try adjusting your search criteria or filters'
              : 'Start applying to jobs to see your applications here'
            }
          </p>
          <button className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-400 to-pink-400 text-white rounded-xl font-semibold shadow hover:scale-105 transition-transform">
            Browse Jobs
          </button>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px);}
          to { opacity: 1; transform: none;}
        }
      `}</style>
    </div>
  );
};

export default Applications;