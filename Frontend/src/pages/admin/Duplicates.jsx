import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Filter,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Copy,
  UserMinus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Merge,
  GitMerge,
  X
} from 'lucide-react';

// Glassmorphism and elegant theme colors
const glassBg = {
  background: 'rgba(255,255,255,0.18)',
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.24)',
  borderRadius: '18px'
};
const accent = '#7f5af0'; // purple
const accent2 = '#2cb67d'; // green
const accent3 = '#fbbf24'; // gold
const danger = '#ff5470'; // red-pink
const textMain = '#232946';
const textSoft = '#6b7280';
const bgSoft = 'rgba(245,246,250,0.7)';

const fadeIn = {
  animation: 'fadeIn 0.7s cubic-bezier(.39,.575,.565,1) both'
};
const scaleIn = {
  animation: 'scaleIn 0.5s cubic-bezier(.39,.575,.565,1) both'
};

const AdminDuplicates = () => {
  const [loading, setLoading] = useState(true);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [currentMergeGroup, setCurrentMergeGroup] = useState(null);
  const [primaryUserId, setPrimaryUserId] = useState(null);

  // Mock duplicate user data
  const mockDuplicateGroups = [
    {
      id: 1,
      duplicateType: 'email_similarity',
      duplicateReason: 'Similar email patterns',
      confidence: 0.95,
      users: [
        {
          id: 101,
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, NY',
          role: 'job_seeker',
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          joinDate: '2024-01-15',
          lastActive: '2024-01-26T10:30:00Z',
          applicationsCount: 12
        },
        {
          id: 102,
          name: 'Jonathan Smith',
          email: 'j.smith@email.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, NY',
          role: 'job_seeker',
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          joinDate: '2024-01-20',
          lastActive: '2024-01-25T14:20:00Z',
          applicationsCount: 3
        }
      ]
    },
    {
      id: 2,
      duplicateType: 'phone_match',
      duplicateReason: 'Identical phone numbers',
      confidence: 1.0,
      users: [
        {
          id: 201,
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+1 (555) 987-6543',
          location: 'San Francisco, CA',
          role: 'job_seeker',
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          joinDate: '2024-01-10',
          lastActive: '2024-01-26T09:15:00Z',
          applicationsCount: 8
        },
        {
          id: 202,
          name: 'Sarah J',
          email: 'sarahj@gmail.com',
          phone: '+1 (555) 987-6543',
          location: 'San Francisco, CA',
          role: 'job_seeker',
          status: 'pending',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          joinDate: '2024-01-22',
          lastActive: '2024-01-24T16:45:00Z',
          applicationsCount: 1
        }
      ]
    },
    {
      id: 3,
      duplicateType: 'name_location_match',
      duplicateReason: 'Same name and location',
      confidence: 0.88,
      users: [
        {
          id: 301,
          name: 'Michael Chen',
          email: 'mike.chen@techcorp.com',
          phone: '+1 (555) 345-6789',
          location: 'Seattle, WA',
          role: 'recruiter',
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          joinDate: '2023-12-20',
          lastActive: '2024-01-26T11:00:00Z',
          jobsPosted: 15
        },
        {
          id: 302,
          name: 'Michael Chen',
          email: 'michael.chen.recruiter@gmail.com',
          phone: '+1 (555) 678-9012',
          location: 'Seattle, WA',
          role: 'recruiter',
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          joinDate: '2024-01-05',
          lastActive: '2024-01-20T08:30:00Z',
          jobsPosted: 2
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchDuplicates = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDuplicateGroups(mockDuplicateGroups);
        setFilteredGroups(mockDuplicateGroups);
      } catch (error) {
        toast.error('Failed to fetch duplicate users');
      } finally {
        setLoading(false);
      }
    };

    fetchDuplicates();
  }, []);

  useEffect(() => {
    let filtered = duplicateGroups;

    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.users.some(user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(group =>
        group.users.some(user => user.role === roleFilter)
      );
    }

    setFilteredGroups(filtered);
  }, [searchTerm, roleFilter, duplicateGroups]);

  const handleMergeUsers = (group) => {
    setCurrentMergeGroup(group);
    setPrimaryUserId(null);
    setShowMergeModal(true);
  };

  const handleDeleteUser = (groupId, userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setDuplicateGroups(prevGroups =>
        prevGroups.map(group => {
          if (group.id === groupId) {
            const updatedUsers = group.users.filter(user => user.id !== userId);
            // If only one user left, remove the entire group
            if (updatedUsers.length <= 1) {
              return null;
            }
            return { ...group, users: updatedUsers };
          }
          return group;
        }).filter(Boolean)
      );
      toast.success('User deleted successfully');
    }
  };

  const handleIgnoreGroup = (groupId) => {
    setDuplicateGroups(prevGroups =>
      prevGroups.filter(group => group.id !== groupId)
    );
    toast.success('Duplicate group ignored');
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return { background: 'rgba(255,84,112,0.12)', color: danger };
    if (confidence >= 0.7) return { background: 'rgba(251,191,36,0.12)', color: accent3 };
    return { background: 'rgba(44,182,125,0.12)', color: accent2 };
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email_similarity':
        return <Mail style={{ color: accent, opacity: 0.7 }} className="w-4 h-4" />;
      case 'phone_match':
        return <Phone style={{ color: accent2, opacity: 0.7 }} className="w-4 h-4" />;
      case 'name_location_match':
        return <MapPin style={{ color: accent3, opacity: 0.7 }} className="w-4 h-4" />;
      default:
        return <Users style={{ color: textSoft, opacity: 0.7 }} className="w-4 h-4" />;
    }
  };

  // Animations keyframes
  const styleSheet = `
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(24px);}
    100% { opacity: 1; transform: none;}
  }
  @keyframes scaleIn {
    0% { opacity: 0; transform: scale(0.95);}
    100% { opacity: 1; transform: scale(1);}
  }
  `;

  if (loading) {
    return (
      <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeIn }}>
        <RotateCcw className="w-10 h-10" style={{ color: accent, animation: 'spin 1s linear infinite' }} />
        <style>{styleSheet}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', color: textMain, background: 'linear-gradient(120deg, #f4f4f8 0%, #e0e7ff 100%)', minHeight: '100vh', padding: '32px 0' }}>
      <style>{styleSheet}</style>
      {/* Header */}
      <div style={{ ...glassBg, ...fadeIn, padding: 32, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: accent, marginBottom: 4 }}>Duplicate Users</h1>
          <p style={{ color: textSoft, fontSize: 16 }}>Identify and manage potential duplicate accounts</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: `linear-gradient(90deg, ${accent2} 0%, ${accent} 100%)`,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 28px',
            fontWeight: 600,
            fontSize: 16,
            boxShadow: '0 2px 12px 0 rgba(127,90,240,0.08)',
            cursor: 'pointer',
            transition: 'transform 0.15s cubic-bezier(.39,.575,.565,1), box-shadow 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <RotateCcw className="w-5 h-5" />
          Refresh Scan
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24, marginBottom: 32 }}>
        <div style={{ ...glassBg, ...scaleIn, padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: textSoft, fontWeight: 500, fontSize: 14 }}>Total Groups</p>
              <p style={{ fontSize: 28, fontWeight: 700 }}>{duplicateGroups.length}</p>
            </div>
            <Copy className="w-8 h-8" style={{ color: accent, opacity: 0.7 }} />
          </div>
        </div>
        <div style={{ ...glassBg, ...scaleIn, padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: textSoft, fontWeight: 500, fontSize: 14 }}>High Confidence</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: danger }}>
                {duplicateGroups.filter(g => g.confidence >= 0.9).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8" style={{ color: danger, opacity: 0.7 }} />
          </div>
        </div>
        <div style={{ ...glassBg, ...scaleIn, padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: textSoft, fontWeight: 500, fontSize: 14 }}>Total Users</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: accent }}>
                {duplicateGroups.reduce((sum, group) => sum + group.users.length, 0)}
              </p>
            </div>
            <Users className="w-8 h-8" style={{ color: accent, opacity: 0.7 }} />
          </div>
        </div>
        <div style={{ ...glassBg, ...scaleIn, padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: textSoft, fontWeight: 500, fontSize: 14 }}>Auto-Merge Ready</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: accent2 }}>
                {duplicateGroups.filter(g => g.confidence === 1.0).length}
              </p>
            </div>
            <GitMerge className="w-8 h-8" style={{ color: accent2, opacity: 0.7 }} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ ...glassBg, ...fadeIn, padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ position: 'relative' }}>
              <Search className="absolute" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: textSoft, width: 18, height: 18 }} />
              <input
                type="text"
                placeholder="Search duplicate groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  border: 'none',
                  borderRadius: 10,
                  background: bgSoft,
                  fontSize: 16,
                  color: textMain,
                  outline: 'none',
                  boxShadow: '0 1px 4px 0 rgba(127,90,240,0.04)',
                  transition: 'box-shadow 0.15s'
                }}
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '12px 18px',
              border: 'none',
              borderRadius: 10,
              background: bgSoft,
              fontSize: 16,
              color: textMain,
              fontWeight: 500,
              outline: 'none',
              boxShadow: '0 1px 4px 0 rgba(44,182,125,0.04)',
              minWidth: 160
            }}
          >
            <option value="all">All Roles</option>
            <option value="job_seeker">Job Seekers</option>
            <option value="recruiter">Recruiters</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Duplicate Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {filteredGroups.map((group, idx) => (
          <div key={group.id} style={{ ...glassBg, ...fadeIn, animationDelay: `${idx * 0.08}s`, overflow: 'hidden', borderLeft: `6px solid ${accent}`, transition: 'box-shadow 0.2s', boxShadow: '0 4px 24px 0 rgba(127,90,240,0.06)' }}>
            {/* Group Header */}
            <div style={{ background: 'rgba(245,246,250,0.7)', padding: '20px 32px', borderBottom: '1px solid rgba(127,90,240,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                {getTypeIcon(group.duplicateType)}
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: accent, marginBottom: 2 }}>
                    Duplicate Group #{group.id}
                  </h3>
                  <p style={{ color: textSoft, fontSize: 15 }}>{group.duplicateReason}</p>
                </div>
                <span style={{
                  ...getConfidenceColor(group.confidence),
                  padding: '4px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  marginLeft: 10,
                  letterSpacing: '0.01em'
                }}>
                  {Math.round(group.confidence * 100)}% Confidence
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleMergeUsers(group)}
                  style={{
                    background: `linear-gradient(90deg, ${accent2} 0%, ${accent} 100%)`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 1px 8px 0 rgba(44,182,125,0.08)',
                    transition: 'transform 0.13s'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <GitMerge className="w-4 h-4" />
                  Merge
                </button>
                <button
                  onClick={() => handleIgnoreGroup(group.id)}
                  style={{
                    background: 'rgba(127,90,240,0.08)',
                    color: accent,
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'background 0.13s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(127,90,240,0.16)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(127,90,240,0.08)'}
                >
                  <X className="w-4 h-4" />
                  Ignore
                </button>
              </div>
            </div>

            {/* Users in Group */}
            <div>
              {group.users.map((user, i) => (
                <div key={user.id} style={{
                  padding: '20px 32px',
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(245,246,250,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: i === group.users.length - 1 ? 'none' : '1px solid rgba(127,90,240,0.06)',
                  transition: 'background 0.18s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${accent}`,
                        boxShadow: '0 2px 8px 0 rgba(127,90,240,0.08)'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16, color: textMain }}>{user.name}</div>
                      <div style={{ color: textSoft, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail className="w-3 h-3" /> {user.email}
                      </div>
                      <div style={{ color: textSoft, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone className="w-3 h-3" /> {user.phone}
                      </div>
                      <div style={{ color: textSoft, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin className="w-3 h-3" /> {user.location}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 160 }}>
                    <div style={{ fontSize: 15, color: textMain }}>
                      Role: <span style={{ textTransform: 'capitalize', color: accent }}>{user.role.replace('_', ' ')}</span>
                    </div>
                    <div style={{ fontSize: 14, color: textSoft }}>
                      Status: <span style={{ textTransform: 'capitalize', color: user.status === 'active' ? accent2 : danger }}>{user.status}</span>
                    </div>
                    <div style={{ fontSize: 14, color: textSoft }}>
                      Joined: {new Date(user.joinDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: 14, color: textSoft }}>
                      {user.role === 'job_seeker' ? `${user.applicationsCount} applications` :
                        user.role === 'recruiter' ? `${user.jobsPosted || 0} jobs posted` : 'Admin user'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        color: accent2,
                        cursor: 'pointer',
                        padding: 6,
                        borderRadius: 6,
                        transition: 'background 0.13s'
                      }}
                      title="View Details"
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(44,182,125,0.08)'}
                      onMouseOut={e => e.currentTarget.style.background = 'none'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(group.id, user.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: danger,
                        cursor: 'pointer',
                        padding: 6,
                        borderRadius: 6,
                        transition: 'background 0.13s'
                      }}
                      title="Delete User"
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,84,112,0.08)'}
                      onMouseOut={e => e.currentTarget.style.background = 'none'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div style={{ ...glassBg, ...fadeIn, textAlign: 'center', padding: 48, marginTop: 48 }}>
          <CheckCircle className="mx-auto h-12 w-12" style={{ color: accent2, marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: accent }}>No duplicates found</h3>
          <p style={{ color: textSoft, fontSize: 15, marginTop: 6 }}>
            All user accounts appear to be unique
          </p>
        </div>
      )}

      {/* Merge Modal */}
      {showMergeModal && currentMergeGroup && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(36,39,54,0.18)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            ...glassBg,
            ...scaleIn,
            width: 420,
            maxWidth: '90vw',
            padding: 32,
            boxShadow: '0 8px 32px 0 rgba(127,90,240,0.18)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: accent }}>Merge Users</h3>
              <button
                onClick={() => setShowMergeModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: textSoft,
                  cursor: 'pointer',
                  fontSize: 20
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p style={{ color: textSoft, fontSize: 15, marginBottom: 18 }}>
              Select which user account to keep as the primary account:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentMergeGroup.users.map((user) => (
                <label key={user.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: user.id === primaryUserId ? `2px solid ${accent2}` : '1px solid rgba(127,90,240,0.10)',
                  background: user.id === primaryUserId ? 'rgba(44,182,125,0.06)' : 'rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                  transition: 'border 0.15s, background 0.15s'
                }}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `2px solid ${accent}`,
                      boxShadow: '0 1px 4px 0 rgba(127,90,240,0.08)'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{user.name}</div>
                    <div style={{ color: textSoft, fontSize: 13 }}>{user.email}</div>
                  </div>
                  <input
                    type="radio"
                    name="primaryUser"
                    checked={primaryUserId === user.id}
                    onChange={() => setPrimaryUserId(user.id)}
                    style={{
                      width: 18,
                      height: 18,
                      accentColor: accent2,
                      cursor: 'pointer'
                    }}
                  />
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28 }}>
              <button
                onClick={() => setShowMergeModal(false)}
                style={{
                  background: 'rgba(127,90,240,0.08)',
                  color: accent,
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 22px',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                  transition: 'background 0.13s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(127,90,240,0.16)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(127,90,240,0.08)'}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!primaryUserId) {
                    toast.error('Please select a primary user');
                    return;
                  }
                  toast.success('Users merged successfully');
                  setShowMergeModal(false);
                  setDuplicateGroups(prev => prev.filter(g => g.id !== currentMergeGroup.id));
                }}
                style={{
                  background: `linear-gradient(90deg, ${accent2} 0%, ${accent} 100%)`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 22px',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 1px 8px 0 rgba(44,182,125,0.08)',
                  transition: 'transform 0.13s'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Merge Users
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDuplicates;
