import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Mail,
  Send,
  Inbox,
  Archive,
  Trash2,
  Star,
  StarOff,
  Search,
  Filter,
  Paperclip,
  Users,
  Edit,
  Reply,
  Forward,
  MoreHorizontal,
  Clock,
  RotateCcw,
  Plus,
  FileText,
  User,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Email = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [folderFilter, setFolderFilter] = useState('inbox');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    attachments: []
  });

  // Mock email data
  const mockEmails = [
    {
      id: 1,
      from: 'sarah.johnson@email.com',
      fromName: 'Sarah Johnson',
      to: 'recruiter@company.com',
      subject: 'Thank you for the interview opportunity',
      body: 'Dear Hiring Team,\n\nThank you for taking the time to interview me for the Senior Frontend Developer position...',
      date: '2024-01-25T10:30:00Z',
      isRead: false,
      isStarred: true,
      folder: 'inbox',
      hasAttachment: false,
      labels: ['candidate', 'interview'],
      type: 'received',
      candidateId: 1,
      jobId: 1
    },
    {
      id: 2,
      from: 'recruiter@company.com',
      fromName: 'HR Team',
      to: 'michael.chen@email.com',
      subject: 'Interview Confirmation - DevOps Engineer Position',
      body: 'Dear Michael,\n\nI hope this email finds you well. I wanted to confirm our upcoming interview...',
      date: '2024-01-24T14:15:00Z',
      isRead: true,
      isStarred: false,
      folder: 'sent',
      hasAttachment: true,
      labels: ['interview', 'confirmation'],
      type: 'sent',
      candidateId: 2,
      jobId: 2
    },
    {
      id: 3,
      from: 'emily.rodriguez@email.com',
      fromName: 'Emily Rodriguez',
      to: 'recruiter@company.com',
      subject: 'Portfolio Update - UX Designer Application',
      body: 'Hello,\n\nI wanted to share an updated version of my portfolio that includes some recent projects...',
      date: '2024-01-24T09:45:00Z',
      isRead: true,
      isStarred: false,
      folder: 'inbox',
      hasAttachment: true,
      labels: ['candidate', 'portfolio'],
      type: 'received',
      candidateId: 3,
      jobId: 3
    },
    {
      id: 4,
      from: 'recruiter@company.com',
      fromName: 'HR Team',
      to: 'david.kim@email.com',
      subject: 'Application Status Update',
      body: 'Dear David,\n\nThank you for your interest in the Data Scientist position at our company...',
      date: '2024-01-23T16:20:00Z',
      isRead: true,
      isStarred: false,
      folder: 'sent',
      hasAttachment: false,
      labels: ['rejection', 'feedback'],
      type: 'sent',
      candidateId: 4,
      jobId: 4
    },
    {
      id: 5,
      from: 'hr@company.com',
      fromName: 'Jessica Taylor',
      to: 'recruiter@company.com',
      subject: 'Reference Check Request',
      body: 'Hi,\n\nI hope you are doing well. I am writing to request a reference check...',
      date: '2024-01-23T11:10:00Z',
      isRead: false,
      isStarred: true,
      folder: 'inbox',
      hasAttachment: false,
      labels: ['reference', 'urgent'],
      type: 'received',
      candidateId: 5,
      jobId: 5
    }
  ];

  const emailTemplates = [
    {
      id: 1,
      name: 'Interview Invitation',
      subject: 'Interview Invitation - {{jobTitle}} Position',
      body: 'Dear {{candidateName}},\n\nThank you for your application for the {{jobTitle}} position at {{companyName}}. We were impressed with your background and would like to invite you for an interview.\n\nInterview Details:\nDate: {{interviewDate}}\nTime: {{interviewTime}}\nDuration: {{duration}} minutes\nLocation: {{location}}\n\nPlease confirm your availability by replying to this email.\n\nBest regards,\n{{recruiterName}}'
    },
    {
      id: 2,
      name: 'Application Received',
      subject: 'Application Received - {{jobTitle}} Position',
      body: 'Dear {{candidateName}},\n\nThank you for your interest in the {{jobTitle}} position at {{companyName}}. We have successfully received your application.\n\nOur team will review your application and get back to you within the next few business days.\n\nBest regards,\n{{recruiterName}}'
    },
    {
      id: 3,
      name: 'Rejection Email',
      subject: 'Update on Your Application - {{jobTitle}} Position',
      body: 'Dear {{candidateName}},\n\nThank you for your time and interest in the {{jobTitle}} position at {{companyName}}.\n\nAfter careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.\n\nWe encourage you to apply for future positions that match your skills and experience.\n\nBest wishes,\n{{recruiterName}}'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchEmails = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEmails(mockEmails);
        setFilteredEmails(mockEmails.filter(email => email.folder === 'inbox'));
      } catch (error) {
        toast.error('Failed to fetch emails');
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  useEffect(() => {
    let filtered = emails.filter(email => email.folder === folderFilter);

    if (searchTerm) {
      filtered = filtered.filter(email =>
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.body.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmails(filtered);
  }, [searchTerm, folderFilter, emails]);

  const handleFolderChange = (folder) => {
    setFolderFilter(folder);
    setSelectedEmails([]);
  };

  const handleEmailSelect = (emailId) => {
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    } else {
      setSelectedEmails([...selectedEmails, emailId]);
    }
  };

  const handleMarkAsRead = (emailIds) => {
    setEmails(prevEmails =>
      prevEmails.map(email =>
        emailIds.includes(email.id) ? { ...email, isRead: true } : email
      )
    );
  };

  const handleMarkAsUnread = (emailIds) => {
    setEmails(prevEmails =>
      prevEmails.map(email =>
        emailIds.includes(email.id) ? { ...email, isRead: false } : email
      )
    );
  };

  const handleStarToggle = (emailId) => {
    setEmails(prevEmails =>
      prevEmails.map(email =>
        email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
      )
    );
  };

  const handleDelete = (emailIds) => {
    if (window.confirm(`Are you sure you want to delete ${emailIds.length} email(s)?`)) {
      setEmails(prevEmails =>
        prevEmails.map(email =>
          emailIds.includes(email.id) ? { ...email, folder: 'trash' } : email
        )
      );
      setSelectedEmails([]);
      toast.success('Email(s) moved to trash');
    }
  };

  const handleArchive = (emailIds) => {
    setEmails(prevEmails =>
      prevEmails.map(email =>
        emailIds.includes(email.id) ? { ...email, folder: 'archive' } : email
      )
    );
    setSelectedEmails([]);
    toast.success('Email(s) archived');
  };

  const handleCompose = () => {
    setShowCompose(true);
    setSelectedEmail(null);
    setComposeData({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
      attachments: []
    });
  };

  const handleReply = (email) => {
    setShowCompose(true);
    setComposeData({
      to: email.from,
      cc: '',
      bcc: '',
      subject: `Re: ${email.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${email.fromName}\nDate: ${new Date(email.date).toLocaleString()}\nSubject: ${email.subject}\n\n${email.body}`,
      attachments: []
    });
  };

  const handleSendEmail = async () => {
    if (!composeData.to || !composeData.subject) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEmail = {
        id: Date.now(),
        from: 'recruiter@company.com',
        fromName: 'HR Team',
        to: composeData.to,
        subject: composeData.subject,
        body: composeData.body,
        date: new Date().toISOString(),
        isRead: true,
        isStarred: false,
        folder: 'sent',
        hasAttachment: composeData.attachments.length > 0,
        labels: [],
        type: 'sent'
      };

      setEmails(prevEmails => [newEmail, ...prevEmails]);
      setShowCompose(false);
      toast.success('Email sent successfully');
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const useTemplate = (template) => {
    setComposeData(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body
    }));
  };

  const getFolderCount = (folder) => {
    return emails.filter(email => email.folder === folder).length;
  };

  const getUnreadCount = () => {
    return emails.filter(email => email.folder === 'inbox' && !email.isRead).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RotateCcw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600">Communicate with candidates and team members</p>
        </div>
        <button
          onClick={handleCompose}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Compose
        </button>
      </div>

      <div className="flex-1 flex space-x-6 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow border p-4 space-y-4">
          {/* Folders */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Folders</h3>
            <div className="space-y-1">
              {[
                { key: 'inbox', label: 'Inbox', icon: Inbox },
                { key: 'sent', label: 'Sent', icon: Send },
                { key: 'archive', label: 'Archive', icon: Archive },
                { key: 'trash', label: 'Trash', icon: Trash2 }
              ].map(folder => {
                const Icon = folder.icon;
                const count = getFolderCount(folder.key);
                const unreadCount = folder.key === 'inbox' ? getUnreadCount() : 0;
                
                return (
                  <button
                    key={folder.key}
                    onClick={() => handleFolderChange(folder.key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 ${
                      folderFilter === folder.key ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {folder.label}
                    </div>
                    <div className="flex items-center space-x-1">
                      {unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                          {unreadCount}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{count}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Templates */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Templates</h3>
            <div className="space-y-1">
              {emailTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => {
                    setShowCompose(true);
                    useTemplate(template);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow border flex flex-col">
          {/* Email List Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 capitalize">{folderFilter}</h2>
              <div className="flex space-x-2">
                {selectedEmails.length > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMarkAsRead(selectedEmails)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                    >
                      Mark Read
                    </button>
                    <button
                      onClick={() => handleArchive(selectedEmails)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => handleDelete(selectedEmails)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-auto">
            {filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Mail className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No emails found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search criteria' : `No emails in ${folderFilter}`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      selectedEmails.includes(email.id) ? 'bg-blue-50' : ''
                    } ${!email.isRead ? 'bg-blue-25' : ''}`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(email.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleEmailSelect(email.id);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarToggle(email.id);
                        }}
                        className={`mt-1 ${email.isStarred ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {email.type === 'sent' ? `To: ${email.to}` : email.fromName}
                              </span>
                              {!email.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                              {email.hasAttachment && (
                                <Paperclip className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <h4 className={`text-sm mt-1 ${!email.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                              {email.subject}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {email.body}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              {email.labels.map((label, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">
                              {new Date(email.date).toLocaleDateString()}
                            </span>
                            <div className="flex space-x-1 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReply(email);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Reply"
                              >
                                <Reply className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="More"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Detail/Compose Panel */}
        {(selectedEmail || showCompose) && (
          <div className="w-96 bg-white rounded-lg shadow border p-6 overflow-auto">
            {showCompose ? (
              /* Compose Email */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Compose Email</h3>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
                    <input
                      type="email"
                      value={composeData.to}
                      onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="recipient@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <input
                      type="text"
                      value={composeData.subject}
                      onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Email subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={composeData.body}
                      onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Type your message here..."
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleSendEmail}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      <Send className="w-4 h-4 inline mr-2" />
                      Send
                    </button>
                    <button
                      onClick={() => setShowCompose(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedEmail && (
              /* Email Detail */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Email Details</h3>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">From:</span>
                    <p className="text-sm text-gray-900">{selectedEmail.fromName} ({selectedEmail.from})</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Subject:</span>
                    <p className="text-sm text-gray-900">{selectedEmail.subject}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Date:</span>
                    <p className="text-sm text-gray-900">{new Date(selectedEmail.date).toLocaleString()}</p>
                  </div>

                  <div className="border-t pt-3">
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedEmail.body}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <button
                      onClick={() => handleReply(selectedEmail)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Reply className="w-4 h-4 inline mr-1" />
                      Reply
                    </button>
                    <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                      <Forward className="w-4 h-4 inline mr-1" />
                      Forward
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Email;
