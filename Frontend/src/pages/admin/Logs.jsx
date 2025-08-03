import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Activity,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  RotateCcw,
  FileText,
  Settings,
  Database,
  Globe,
  Lock
} from 'lucide-react';

const AdminLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // Mock log data
  const mockLogs = [
    {
      id: 1,
      timestamp: '2024-01-26T10:30:45Z',
      level: 'info',
      type: 'user_action',
      action: 'user_login',
      userId: 101,
      userName: 'Sarah Johnson',
      userEmail: 'sarah.johnson@email.com',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      message: 'User successfully logged in',
      details: {
        loginMethod: 'email',
        sessionId: 'sess_123456789',
        location: 'San Francisco, CA'
      }
    },
    {
      id: 2,
      timestamp: '2024-01-26T10:25:12Z',
      level: 'warning',
      type: 'security',
      action: 'failed_login_attempt',
      userId: null,
      userName: null,
      userEmail: 'unknown@email.com',
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      message: 'Failed login attempt - invalid credentials',
      details: {
        attemptCount: 3,
        blockedFor: '15 minutes',
        location: 'Unknown'
      }
    },
    {
      id: 3,
      timestamp: '2024-01-26T10:20:33Z',
      level: 'info',
      type: 'admin_action',
      action: 'user_created',
      userId: 1,
      userName: 'Admin User',
      userEmail: 'admin@jobportal.com',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      message: 'New user account created',
      details: {
        createdUserId: 102,
        createdUserEmail: 'newuser@email.com',
        role: 'job_seeker'
      }
    },
    {
      id: 4,
      timestamp: '2024-01-26T10:15:22Z',
      level: 'error',
      type: 'system',
      action: 'database_error',
      userId: null,
      userName: 'System',
      userEmail: null,
      ipAddress: 'localhost',
      userAgent: 'JobPortal Backend v1.0',
      message: 'Database connection timeout',
      details: {
        errorCode: 'DB_TIMEOUT_001',
        query: 'SELECT * FROM users WHERE status = ?',
        duration: '30000ms',
        retryCount: 3
      }
    },
    {
      id: 5,
      timestamp: '2024-01-26T10:10:15Z',
      level: 'info',
      type: 'job_action',
      action: 'job_posted',
      userId: 201,
      userName: 'John Smith',
      userEmail: 'john.smith@techcorp.com',
      ipAddress: '192.168.1.150',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      message: 'New job posting created',
      details: {
        jobId: 'job_456789',
        jobTitle: 'Senior React Developer',
        company: 'TechCorp Inc.',
        location: 'Remote'
      }
    },
    {
      id: 6,
      timestamp: '2024-01-26T10:05:45Z',
      level: 'warning',
      type: 'performance',
      action: 'slow_query',
      userId: null,
      userName: 'System',
      userEmail: null,
      ipAddress: 'localhost',
      userAgent: 'JobPortal Backend v1.0',
      message: 'Slow database query detected',
      details: {
        query: 'SELECT jobs.* FROM jobs LEFT JOIN applications ON jobs.id = applications.job_id',
        duration: '2500ms',
        threshold: '2000ms',
        affectedRows: 1250
      }
    },
    {
      id: 7,
      timestamp: '2024-01-26T09:55:30Z',
      level: 'success',
      type: 'system',
      action: 'backup_completed',
      userId: null,
      userName: 'System',
      userEmail: null,
      ipAddress: 'localhost',
      userAgent: 'JobPortal Backup Service v1.0',
      message: 'Daily database backup completed successfully',
      details: {
        backupSize: '2.4 GB',
        duration: '15 minutes',
        location: 's3://jobportal-backups/daily/',
        files: ['users.sql', 'jobs.sql', 'applications.sql']
      }
    },
    {
      id: 8,
      timestamp: '2024-01-26T09:45:12Z',
      level: 'error',
      type: 'api',
      action: 'api_rate_limit_exceeded',
      userId: 150,
      userName: 'API Client',
      userEmail: 'api@client.com',
      ipAddress: '203.0.113.1',
      userAgent: 'JobPortal-API-Client/1.2',
      message: 'API rate limit exceeded',
      details: {
        endpoint: '/api/v1/jobs/search',
        requestCount: 1000,
        timeWindow: '1 hour',
        limit: 500
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchLogs = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLogs(mockLogs);
        setFilteredLogs(mockLogs);
      } catch (error) {
        toast.error('Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm)
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.type === typeFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      let filtered = new Date();
      
      switch (dateFilter) {
        case 'today':
          filtered.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filtered.setDate(now.getDate() - 7);
          break;
        case 'month':
          filtered.setMonth(now.getMonth() - 1);
          break;
        default:
          filtered = null;
      }

      if (filtered) {
        filtered = filtered.filter(log => new Date(log.timestamp) >= filtered);
      }
    }

    setFilteredLogs(filtered);
  }, [searchTerm, levelFilter, typeFilter, dateFilter, logs]);

  const getLevelIcon = (level) => {
    const icons = {
      info: <Info className="w-4 h-4 text-blue-500" />,
      success: <CheckCircle className="w-4 h-4 text-green-500" />,
      warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
      error: <XCircle className="w-4 h-4 text-red-500" />
    };
    return icons[level] || icons.info;
  };

  const getLevelColor = (level) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors.info;
  };

  const getTypeIcon = (type) => {
    const icons = {
      user_action: <User className="w-4 h-4" />,
      admin_action: <Shield className="w-4 h-4" />,
      security: <Lock className="w-4 h-4" />,
      system: <Settings className="w-4 h-4" />,
      database: <Database className="w-4 h-4" />,
      api: <Globe className="w-4 h-4" />,
      job_action: <FileText className="w-4 h-4" />,
      performance: <Activity className="w-4 h-4" />
    };
    return icons[type] || icons.system;
  };

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setShowLogModal(true);
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Type', 'Action', 'User', 'IP Address', 'Message'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.level,
        log.type,
        log.action,
        log.userName || 'System',
        log.ipAddress,
        `"${log.message}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Logs exported successfully');
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
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600">Monitor system activities and events</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportLogs}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Export
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
            </div>
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">
                {logs.filter(l => l.level === 'error').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-2xl font-bold text-yellow-600">
                {logs.filter(l => l.level === 'warning').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Events</p>
              <p className="text-2xl font-bold text-purple-600">
                {logs.filter(l => l.type === 'security').length}
              </p>
            </div>
            <Lock className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">User Actions</p>
              <p className="text-2xl font-bold text-blue-600">
                {logs.filter(l => l.type === 'user_action').length}
              </p>
            </div>
            <User className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="user_action">User Actions</option>
            <option value="admin_action">Admin Actions</option>
            <option value="security">Security</option>
            <option value="system">System</option>
            <option value="api">API</option>
            <option value="job_action">Job Actions</option>
            <option value="performance">Performance</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getLevelIcon(log.level)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {getTypeIcon(log.type)}
                      <span className="ml-2 capitalize">{log.type.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{log.userName || 'System'}</div>
                      {log.userEmail && (
                        <div className="text-xs text-gray-500">{log.userEmail}</div>
                      )}
                      <div className="text-xs text-gray-500">{log.ipAddress}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="capitalize">{log.action.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleViewLog(log)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {showLogModal && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Log Details</h3>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="text-sm text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Level</label>
                    <div className="flex items-center mt-1">
                      {getLevelIcon(selectedLog.level)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(selectedLog.level)}`}>
                        {selectedLog.level.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedLog.type.replace('_', ' ')}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedLog.action.replace('_', ' ')}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <p className="text-sm text-gray-900">{selectedLog.userName || 'System'}</p>
                    {selectedLog.userEmail && (
                      <p className="text-xs text-gray-500">{selectedLog.userEmail}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="text-sm text-gray-900">{selectedLog.ipAddress}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Agent</label>
                    <p className="text-sm text-gray-900 break-all">{selectedLog.userAgent}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <p className="text-sm text-gray-900">{selectedLog.message}</p>
                  </div>
                </div>
              </div>
              
              {selectedLog.details && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
