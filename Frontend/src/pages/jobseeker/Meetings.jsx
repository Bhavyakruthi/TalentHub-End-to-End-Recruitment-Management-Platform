import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Users,
  Phone,
  Mail,
  Plus,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  ExternalLink
} from 'lucide-react';

// Glassmorphism utility classes
const glass = "backdrop-blur-md bg-white/30 border border-white/30 shadow-xl";

// Unique color palette (teal, violet, amber, emerald, gray)
const statusColors = {
  scheduled: 'bg-teal-100 text-teal-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
  unknown: 'bg-gray-100 text-gray-800'
};

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load meetings from backend
  useEffect(() => {
    const loadMeetings = async () => {
      setLoading(true);
      try {
        const res = await client.get('/api/jobseeker/interviews');
        if (res.data?.success) {
          const mapped = res.data.interviews.map(i => ({
            id: i.interview_id,
            title: i.job_title || 'Interview',
            company: i.company || 'Unknown Company',
            interviewer: i.recruiter_name || 'TBD',
            interviewerRole: 'Recruiter',
            date: i.schedule ? new Date(i.schedule).toLocaleDateString() : 'TBD',
            time: i.schedule ? new Date(i.schedule).toLocaleTimeString() : 'TBD',
            duration: '60 minutes', // Default duration
            type: 'video', // Default to video
            status: i.result || 'scheduled',
            meetingLink: i.meeting_link || '',
            location: i.location || '',
            notes: i.notes || '',
            agenda: ['Introduction', 'Technical Questions', 'Q&A'],
            companyLogo: '/api/placeholder/40/40',
          }));
          setMeetings(mapped);
        }
      } catch (e) {
        console.error('Error loading meetings:', e);
      } finally {
        setLoading(false);
      }
    };
    loadMeetings();
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'scheduled':
        return {
          color: statusColors.scheduled,
          icon: <Calendar className="w-4 h-4" />,
          text: 'Scheduled'
        };
      case 'completed':
        return {
          color: statusColors.completed,
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Completed'
        };
      case 'cancelled':
        return {
          color: statusColors.cancelled,
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Cancelled'
        };
      default:
        return {
          color: statusColors.unknown,
          icon: <Clock className="w-4 h-4" />,
          text: 'Unknown'
        };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-violet-500 animate-pulse" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-amber-500 animate-bounce" />;
      case 'in-person':
        return <MapPin className="w-5 h-5 text-emerald-500 animate-pulse" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesFilter = filter === 'all' || meeting.status === filter;
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.interviewer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const upcomingMeetings = meetings.filter(meeting => meeting.status === 'scheduled');
  const completedMeetings = meetings.filter(meeting => meeting.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-2 md:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg">
            <span className="bg-gradient-to-r from-teal-500 via-violet-500 to-amber-500 bg-clip-text text-transparent">
              Interviews & Meetings
            </span>
          </h1>
          <p className="text-gray-700 mt-1 font-medium">Manage your interview schedule and meeting notes</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button className="px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-violet-500 to-teal-400 text-white hover:scale-105 hover:from-teal-400 hover:to-violet-500 focus:ring-2 focus:ring-violet-300">
            <Plus className="w-4 h-4 inline mr-2" />
            Add Meeting
          </button>
          <button className="px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-amber-400 to-emerald-400 text-gray-900 hover:scale-105 hover:from-emerald-400 hover:to-amber-400 focus:ring-2 focus:ring-amber-200">
            <Download className="w-4 h-4 inline mr-2" />
            Export Calendar
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`${glass} p-6 rounded-2xl transition-all duration-300 hover:scale-105`}>
          <div className="flex items-center">
            <div className="p-3 bg-teal-200/60 rounded-xl shadow-inner">
              <Calendar className="w-7 h-7 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-teal-700">Upcoming</p>
              <p className="text-3xl font-extrabold text-gray-900">{upcomingMeetings.length}</p>
            </div>
          </div>
        </div>
        <div className={`${glass} p-6 rounded-2xl transition-all duration-300 hover:scale-105`}>
          <div className="flex items-center">
            <div className="p-3 bg-emerald-200/60 rounded-xl shadow-inner">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-emerald-700">Completed</p>
              <p className="text-3xl font-extrabold text-gray-900">{completedMeetings.length}</p>
            </div>
          </div>
        </div>
        <div className={`${glass} p-6 rounded-2xl transition-all duration-300 hover:scale-105`}>
          <div className="flex items-center">
            <div className="p-3 bg-violet-200/60 rounded-xl shadow-inner">
              <Users className="w-7 h-7 text-violet-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-violet-700">Companies</p>
              <p className="text-3xl font-extrabold text-gray-900">
                {new Set(meetings.map(m => m.company)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${glass} p-6 rounded-2xl`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 w-full p-3 border-none rounded-xl bg-white/60 focus:ring-2 focus:ring-violet-400 font-medium shadow-inner transition"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-3 border-none rounded-xl bg-white/60 focus:ring-2 focus:ring-teal-400 font-medium shadow-inner transition"
          >
            <option value="all">All Meetings</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-200/60 to-teal-200/60 text-violet-900 hover:from-teal-200/80 hover:to-violet-200/80 shadow-inner transition">
            <Filter className="w-4 h-4 inline mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Next Meeting Alert */}
      {upcomingMeetings.length > 0 && (
        <div className={`${glass} border-l-8 border-teal-400 rounded-2xl p-5 animate-fade-in`}>
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-teal-500 animate-pulse" />
            <div className="ml-4">
              <h3 className="text-base font-bold text-teal-900">
                Next Interview: {upcomingMeetings[0].title}
              </h3>
              <p className="text-sm text-teal-700">
                {upcomingMeetings[0].date} at {upcomingMeetings[0].time} with {upcomingMeetings[0].company}
              </p>
            </div>
            <div className="ml-auto">
              <button className="px-4 py-2 bg-gradient-to-r from-teal-400 to-violet-400 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition">
                Prepare Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meetings List */}
      <div className="space-y-6">
        {filteredMeetings.map((meeting) => {
          const statusConfig = getStatusConfig(meeting.status);

          return (
            <div
              key={meeting.id}
              className={`${glass} rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border-l-4 border-violet-300 hover:border-teal-400 animate-fade-in`}
            >
              <div className="p-7">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-5">
                    <img
                      src={meeting.companyLogo}
                      alt={`${meeting.company} logo`}
                      className="w-14 h-14 rounded-xl border bg-gray-100 shadow"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {meeting.title}
                          </h3>
                          <p className="text-violet-700 font-semibold">{meeting.company}</p>
                          <p className="text-sm text-gray-600">
                            with {meeting.interviewer} • {meeting.interviewerRole}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow ${statusConfig.color} animate-fade-in`}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.text}</span>
                          </span>
                          {getTypeIcon(meeting.type)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-700">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {meeting.date}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {meeting.time} ({meeting.duration})
                        </span>
                        {meeting.type === 'video' && meeting.meetingLink && (
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-violet-600 hover:text-violet-900 font-semibold transition"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Join Meeting
                          </a>
                        )}
                        {meeting.type === 'in-person' && meeting.location && (
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {meeting.location.substring(0, 30)}...
                          </span>
                        )}
                      </div>

                      {meeting.notes && (
                        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-white/60 to-teal-100/40 shadow-inner">
                          <p className="text-sm text-gray-800">{meeting.notes}</p>
                        </div>
                      )}

                      {meeting.agenda && meeting.agenda.length > 0 && (
                        <div className="mt-5">
                          <h4 className="text-sm font-bold text-gray-900 mb-2">Agenda</h4>
                          <div className="flex flex-wrap gap-2">
                            {meeting.agenda.map((item, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 shadow"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex space-x-2">
                          {meeting.status === 'scheduled' && (
                            <>
                              <button className="text-violet-700 hover:text-violet-900 font-semibold text-sm transition">
                                <Edit className="w-4 h-4 inline mr-1" />
                                Edit
                              </button>
                              <button className="text-emerald-700 hover:text-emerald-900 font-semibold text-sm transition">
                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                Mark Complete
                              </button>
                            </>
                          )}
                          {meeting.status === 'completed' && (
                            <button className="text-violet-700 hover:text-violet-900 font-semibold text-sm transition">
                              <Edit className="w-4 h-4 inline mr-1" />
                              Add Notes
                            </button>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {meeting.meetingLink && meeting.status === 'scheduled' && (
                            <a
                              href={meeting.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gradient-to-r from-violet-400 to-teal-400 text-white rounded-xl font-semibold shadow hover:scale-105 transition"
                            >
                              <Video className="w-4 h-4 inline mr-2" />
                              Join Now
                            </a>
                          )}
                          <button className="text-rose-600 hover:text-rose-800 font-semibold text-sm transition">
                            <Trash2 className="w-4 h-4 inline mr-1" />
                            Delete
                          </button>
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

      {filteredMeetings.length === 0 && (
        <div className={`${glass} text-center py-14 rounded-2xl shadow-xl animate-fade-in`}>
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-bounce" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No meetings found</h3>
          <p className="text-gray-700 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search criteria or filters'
              : 'Your interview schedule will appear here'
            }
          </p>
          <button className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-teal-400 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition">
            <Plus className="w-4 h-4 inline mr-2" />
            Schedule Interview
          </button>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </div>
  );
};

export default Meetings;
