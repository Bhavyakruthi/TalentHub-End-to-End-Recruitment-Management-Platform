import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/navbar.css';
import {
    Bell,
    Search,
    Menu,
    User,
    Settings,
    LogOut,
    ChevronDown
} from 'lucide-react';

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const notifications = [
        {
            id: 1,
            title: 'New job application',
            message: 'John Doe applied for Frontend Developer position',
            time: '5 min ago',
            unread: true
        },
        {
            id: 2,
            title: 'Interview scheduled',
            message: 'Interview with Sarah Johnson scheduled for tomorrow',
            time: '1 hour ago',
            unread: true
        },
        {
            id: 3,
            title: 'Application status updated',
            message: 'Your application for Backend Developer has been reviewed',
            time: '2 hours ago',
            unread: false
        }
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <button
                        onClick={onToggleSidebar}
                        className="navbar-menu-btn"
                    >
                        <Menu />
                    </button>
                    <div className={`navbar-logo-mobile ${isSidebarOpen ? 'hidden' : ''}`}>
                        <h1>✨ JobPortal</h1>
                    </div>
                    <div className="navbar-search-desktop">
                        <div className="navbar-search-group">
                            <div className="navbar-search-icon">
                                <Search />
                            </div>
                            <input
                                type="text"
                                placeholder="🔍 Search jobs, candidates, or companies..."
                                className="navbar-search-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="navbar-right">
                    <button className="navbar-search-mobile-btn">
                        <Search />
                    </button>

                    <div className="navbar-notification" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="navbar-notification-btn"
                        >
                            <Bell />
                            {unreadCount > 0 && (
                                <span className="navbar-notification-badge">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="navbar-notification-dropdown">
                                <div className="navbar-notification-header">
                                    <h3>Notifications</h3>
                                </div>
                                <div className="navbar-notification-list">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`navbar-notification-item${notification.unread ? ' unread' : ''}`}
                                        >
                                            <div className="navbar-notification-title-row">
                                                <p>{notification.title}</p>
                                                <span>{notification.time}</span>
                                            </div>
                                            <p className="navbar-notification-message">
                                                {notification.message}
                                            </p>
                                            {notification.unread && (
                                                <span className="navbar-notification-dot"></span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="navbar-notification-footer">
                                    <button>
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="navbar-profile" ref={dropdownRef}>
                        <button
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="navbar-profile-btn"
                        >
                            <div className="navbar-profile-avatar">
                                <User />
                            </div>
                            <span className="navbar-profile-name">
                                {user?.name || 'User'}
                            </span>
                            <ChevronDown />
                        </button>
                        {showProfileDropdown && (
                            <div className="navbar-profile-dropdown">
                                <div className="navbar-profile-header">
                                    <p>{user?.name}</p>
                                    <p>{user?.email}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowProfileDropdown(false);
                                        const basePath = user?.role === 'jobseeker' ? '/jobseeker' : user?.role === 'recruiter' ? '/recruiter' : '/admin';
                                        navigate(`${basePath}/profile`);
                                    }}
                                    className="navbar-profile-item"
                                >
                                    <User className="navbar-profile-icon" />
                                    Profile
                                </button>
                                <button
                                    onClick={() => {
                                        setShowProfileDropdown(false);
                                        const basePath = user?.role === 'jobseeker' ? '/jobseeker' : user?.role === 'recruiter' ? '/recruiter' : '/admin';
                                        navigate(`${basePath}/settings`);
                                    }}
                                    className="navbar-profile-item"
                                >
                                    <Settings className="navbar-profile-icon" />
                                    Settings
                                </button>
                                <div className="navbar-profile-divider"></div>
                                <button
                                    onClick={() => {
                                        setShowProfileDropdown(false);
                                        handleLogout();
                                    }}
                                    className="navbar-profile-item logout"
                                >
                                    <LogOut className="navbar-profile-icon" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showNotifications && (
                <div
                    className="navbar-overlay"
                    onClick={() => setShowNotifications(false)}
                />
            )}
            {showProfileDropdown && (
                <div
                    className="navbar-overlay"
                    onClick={() => setShowProfileDropdown(false)}
                />
            )}
        </nav>
    );
};

export default Navbar;
