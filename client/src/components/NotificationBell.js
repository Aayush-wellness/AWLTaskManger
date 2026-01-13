import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, Trash2, CheckCircle, Clock, AlertCircle, X, BellOff, Sparkles } from 'lucide-react';
import axios from '../config/axios';
import '../styles/NotificationBell-Modern.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const notificationResponse = await axios.get('/api/notifications');
      setNotifications(notificationResponse.data.notifications || []);
      setUnreadCount(notificationResponse.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      const notification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_COMPLETED':
        return <CheckCircle size={18} className="notif-icon completed" />;
      case 'TASK_ASSIGNED':
        return <Sparkles size={18} className="notif-icon assigned" />;
      case 'TASK_DEADLINE':
        return <AlertCircle size={18} className="notif-icon deadline" />;
      case 'TASK_UPDATED':
        return <Clock size={18} className="notif-icon updated" />;
      default:
        return <Bell size={18} className="notif-icon default" />;
    }
  };

  // Get time ago string
  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  // Filter notifications
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button
        className={`notification-trigger ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {unreadCount > 0 && <span className="notification-pulse"></span>}
      </button>

      {showDropdown && (
        <div className="notification-panel">
          {/* Header */}
          <div className="notification-panel-header">
            <div className="header-title">
              <Bell size={20} />
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount} new</span>
              )}
            </div>
            <button className="close-panel-btn" onClick={() => setShowDropdown(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="notification-filters">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                <Check size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="notification-list">
            {loading ? (
              <div className="notification-state">
                <div className="loading-spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="notification-state empty">
                <BellOff size={48} />
                <h4>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</h4>
                <p>We'll notify you when something important happens</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-card ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-icon-wrapper">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-body">
                    <p className="notification-text">{notification.message}</p>
                    
                    {notification.metadata?.projectName && (
                      <span className="notification-project">
                        {notification.metadata.projectName}
                      </span>
                    )}
                    
                    {notification.metadata?.dueDate && (
                      <span className="notification-due">
                        Due: {new Date(notification.metadata.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    
                    <span className="notification-time">
                      {getTimeAgo(notification.createdAt)}
                    </span>
                  </div>

                  <div className="notification-actions">
                    {!notification.read && (
                      <button
                        className="action-btn mark-read"
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteNotification(notification._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
