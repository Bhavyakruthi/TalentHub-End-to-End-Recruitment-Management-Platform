import React, { useState } from 'react';
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Filter,
  Bookmark,
  BookmarkCheck,
  Star,
} from 'lucide-react';

const glass = "bg-white/30 backdrop-blur-lg border border-white/20 shadow-xl";
const accent = "from-purple-400 via-teal-300 to-gray-100";
const accentText = "text-purple-900";
const accentBtn = "bg-gradient-to-r from-purple-500 via-teal-400 to-gray-200 text-white";
const accentBtnHover = "hover:from-purple-600 hover:via-teal-500 hover:to-gray-300";
const transition = "transition-all duration-300 ease-in-out";

const Jobs = () => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120,000 - $150,000',
      type: 'Full-time',
      posted: '2 days ago',
      description: 'We are looking for a Senior Frontend Developer to join our dynamic team...',
      requirements: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      benefits: ['Health Insurance', 'Remote Work', '401k', 'Stock Options'],
      saved: false,
      applied: false,
      match: 95,
      logo: '/api/placeholder/40/40',
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '$90,000 - $120,000',
      type: 'Full-time',
      posted: '1 week ago',
      description: 'Join our fast-growing startup as a Full Stack Engineer...',
      requirements: ['JavaScript', 'Python', 'AWS', 'Docker'],
      benefits: ['Flexible Hours', 'Learning Budget', 'Remote Work'],
      saved: true,
      applied: false,
      match: 88,
      logo: '/api/placeholder/40/40',
    },
    {
      id: 3,
      title: 'React Developer',
      company: 'Digital Solutions',
      location: 'New York, NY',
      salary: '$75,000 - $95,000',
      type: 'Contract',
      posted: '3 days ago',
      description: 'We need a skilled React Developer for a 6-month contract...',
      requirements: ['React', 'Redux', 'CSS3', 'REST APIs'],
      benefits: ['Competitive Rate', 'Flexible Schedule'],
      saved: false,
      applied: true,
      match: 82,
      logo: '/api/placeholder/40/40',
    },
  ]);

  const [filters, setFilters] = useState({
    searchTerm: '',
    location: '',
    jobType: '',
    salaryRange: '',
    experience: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic
    console.log('Searching with filters:', filters);
  };

  const toggleSaveJob = (jobId) => {
    setJobs(jobs.map(job =>
      job.id === jobId ? { ...job, saved: !job.saved } : job
    ));
  };

  const applyToJob = (jobId) => {
    setJobs(jobs.map(job =>
      job.id === jobId ? { ...job, applied: true } : job
    ));
  };

  const filteredJobs = savedOnly ? jobs.filter(job => job.saved) : jobs;

  return (
    <div
      className={`min-h-screen py-10 px-2 md:px-0 bg-gradient-to-tr ${accent} animate-gradient-move`}
      style={{
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
      }}
    >
      <style>
        {`
          .animate-gradient-move {
            background-size: 200% 200%;
            animation: gradientMove 8s ease-in-out infinite;
          }
          @keyframes gradientMove {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }
        `}
      </style>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-3xl font-extrabold ${accentText} drop-shadow-lg`}>Find Jobs</h1>
            <p className="text-gray-700 font-medium">Discover opportunities that match your skills</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              onClick={() => setSavedOnly(!savedOnly)}
              className={`px-4 py-2 rounded-lg font-medium shadow-md ${glass} ${transition} ${
                savedOnly
                  ? 'ring-2 ring-purple-400 text-purple-900'
                  : 'hover:ring-2 hover:ring-teal-300 text-gray-700'
              }`}
            >
              <Bookmark className="w-4 h-4 inline mr-2" />
              Saved Jobs
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium shadow-md ${glass} hover:ring-2 hover:ring-purple-300 ${transition}`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`p-6 rounded-2xl ${glass} shadow-2xl border-0`}>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                <input
                  type="text"
                  placeholder="Job title, skills, or company"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-10 w-full p-3 rounded-xl border-0 bg-white/60 focus:ring-2 focus:ring-purple-400 focus:bg-white/80 shadow-inner"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-teal-400" />
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="pl-10 w-full p-3 rounded-xl border-0 bg-white/60 focus:ring-2 focus:ring-teal-400 focus:bg-white/80 shadow-inner"
                />
              </div>
              <button
                type="submit"
                className={`rounded-xl py-3 font-semibold shadow-lg ${accentBtn} ${accentBtnHover} ${transition}`}
              >
                Search Jobs
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200/40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                    className="p-3 rounded-xl border-0 bg-white/60 focus:ring-2 focus:ring-purple-400 focus:bg-white/80 shadow-inner"
                  >
                    <option value="">Job Type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                  <select
                    value={filters.salaryRange}
                    onChange={(e) => setFilters({ ...filters, salaryRange: e.target.value })}
                    className="p-3 rounded-xl border-0 bg-white/60 focus:ring-2 focus:ring-teal-400 focus:bg-white/80 shadow-inner"
                  >
                    <option value="">Salary Range</option>
                    <option value="0-50k">$0 - $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="100k-150k">$100,000 - $150,000</option>
                    <option value="150k+">$150,000+</option>
                  </select>
                  <select
                    value={filters.experience}
                    onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                    className="p-3 rounded-xl border-0 bg-white/60 focus:ring-2 focus:ring-purple-400 focus:bg-white/80 shadow-inner"
                  >
                    <option value="">Experience Level</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Job Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 font-medium">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
            </p>
            <select className="p-2 rounded-xl border-0 bg-white/60 focus:ring-2 focus:ring-purple-400 shadow-inner">
              <option>Sort by Relevance</option>
              <option>Sort by Date</option>
              <option>Sort by Salary</option>
            </select>
          </div>

          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`rounded-2xl ${glass} shadow-2xl border-0 hover:scale-[1.015] hover:shadow-3xl ${transition} group`}
              style={{
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={job.logo}
                      alt={`${job.company} logo`}
                      className="w-14 h-14 rounded-xl border bg-gray-100 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`text-xl font-bold ${accentText} group-hover:text-purple-700 cursor-pointer transition-colors`}>
                            {job.title}
                          </h3>
                          <p className="text-gray-700 font-medium">{job.company}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-200 via-teal-100 to-white text-purple-900 shadow">
                            <Star className="w-3 h-3 mr-1 text-purple-500" />
                            {job.match}% match
                          </span>
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className="p-2 hover:bg-white/40 rounded-lg transition"
                            title={job.saved ? "Unsave" : "Save"}
                          >
                            {job.saved ? (
                              <BookmarkCheck className="w-5 h-5 text-purple-600" />
                            ) : (
                              <Bookmark className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-teal-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-purple-400" />
                          {job.salary}
                        </span>
                        <span className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1 text-teal-400" />
                          {job.type}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-purple-400" />
                          {job.posted}
                        </span>
                      </div>

                      <p className="mt-3 text-gray-800 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.slice(0, 4).map((req, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 via-teal-50 to-white text-purple-800 shadow"
                            >
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 4 && (
                            <span className="text-xs text-gray-500">
                              +{job.requirements.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button className="text-purple-700 hover:text-teal-600 font-medium text-sm transition-colors">
                            View Details
                          </button>
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className="text-gray-500 hover:text-purple-600 font-medium text-sm transition-colors"
                          >
                            {job.saved ? "Unsave" : "Save for Later"}
                          </button>
                        </div>
                        <button
                          onClick={() => applyToJob(job.id)}
                          disabled={job.applied}
                          className={`px-4 py-2 rounded-xl font-medium text-sm shadow-md ${transition} ${
                            job.applied
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : `${accentBtn} ${accentBtnHover} hover:scale-105`
                          }`}
                        >
                          {job.applied ? 'Applied' : 'Apply Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <button
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg ${accentBtn} ${accentBtnHover} hover:scale-105 ${transition}`}
          >
            Load More Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Jobs;