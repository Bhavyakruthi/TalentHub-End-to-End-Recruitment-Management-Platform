import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Briefcase,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  MapPin,
  DollarSign,
  Bell,
  BookOpen
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    appliedJobs: 12,
    interviewsScheduled: 3,
    profileViews: 45,
    resumeScore: 85,
  });

  const [recentApplications, setRecentApplications] = useState([
    {
      id: 1,
      jobTitle: 'Frontend Developer',
      company: 'TechCorp Inc.',
      status: 'interview',
      appliedDate: '2025-01-20',
      salary: '$80,000',
      location: 'Remote',
    },
    {
      id: 2,
      jobTitle: 'Full Stack Engineer',
      company: 'StartupXYZ',
      status: 'applied',
      appliedDate: '2025-01-18',
      salary: '$95,000',
      location: 'San Francisco, CA',
    },
    {
      id: 3,
      jobTitle: 'React Developer',
      company: 'Digital Solutions',
      status: 'rejected',
      appliedDate: '2025-01-15',
      salary: '$75,000',
      location: 'New York, NY',
    },
  ]);

  const [upcomingInterviews, setUpcomingInterviews] = useState([
    {
      id: 1,
      jobTitle: 'Frontend Developer',
      company: 'TechCorp Inc.',
      date: '2025-01-25',
      time: '2:00 PM',
      type: 'Video Call',
    },
    {
      id: 2,
      jobTitle: 'UI/UX Designer',
      company: 'Design Studio',
      date: '2025-01-27',
      time: '10:30 AM',
      type: 'In-Person',
    },
  ]);

  const [recommendedJobs, setRecommendedJobs] = useState([
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'Tech Giants',
      salary: '$120,000 - $150,000',
      location: 'Remote',
      match: 95,
    },
    {
      id: 2,
      title: 'Frontend Engineer',
      company: 'Innovation Labs',
      salary: '$90,000 - $110,000',
      location: 'Austin, TX',
      match: 88,
    },
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'interview':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'applied':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'interview':
        return 'Interview Scheduled';
      case 'applied':
        return 'Application Submitted';
      case 'accepted':
        return 'Offer Received';
      case 'rejected':
        return 'Not Selected';
      default:
        return 'Unknown';
    }
  };

  return (
     /*Theme Check*/
   

    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white overflow-hidden animate-gradient-shift shadow-2xl backdrop-blur-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-white/5 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-white/10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="relative flex items-center justify-between">
          <div className="animate-slideInLeft">
            <h1 className="text-3xl font-bold mb-2 animate-fadeIn">Welcome back, {user?.name}! 🚀</h1>
            <p className="text-purple-100 mt-2 text-lg">
              Ready to find your next opportunity? Let's make today count!
            </p>
          </div>
          <div className="hidden md:block animate-slideInRight">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
              <BookOpen className="relative w-20 h-20 text-white/80 animate-float" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slideInUp">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jobs Applied</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.appliedJobs}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-pulseGlow" style={{width: '75%'}}></div>
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slideInUp" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Interviews</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.interviewsScheduled}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full animate-pulseGlow" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slideInUp" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Profile Views</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{stats.profileViews}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full animate-pulseGlow" style={{width: '90%'}}></div>
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slideInUp" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resume Score</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{stats.resumeScore}%</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full animate-pulseGlow" style={{width: `${stats.resumeScore}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(application.status)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{application.jobTitle}</h4>
                      <p className="text-sm text-gray-500">{application.company}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center text-xs text-gray-500">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {application.salary}
                        </span>
                        <span className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {application.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {getStatusText(application.status)}
                    </p>
                    <p className="text-xs text-gray-500">{application.appliedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Interviews</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900">{interview.jobTitle}</h4>
                  <p className="text-sm text-gray-500">{interview.company}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {interview.date} at {interview.time}
                    </p>
                    <p className="text-xs text-gray-600">{interview.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recommended Jobs</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.map((job) => (
              <div key={job.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-500">{job.company}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600">
                        <DollarSign className="w-3 h-3 inline mr-1" />
                        {job.salary}
                      </p>
                      <p className="text-xs text-gray-600">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {job.location}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {job.match}% match
                    </span>
                  </div>
                </div>
                <button className="mt-3 w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
