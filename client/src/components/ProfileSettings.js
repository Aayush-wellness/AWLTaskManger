import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, MapPin, Calendar, Download, Edit2, Save, X, Camera, 
  Briefcase, Building2, Shield, Clock, CheckCircle, AlertCircle, TrendingUp,
  Award, Target, BarChart3
} from 'lucide-react';
import axios from '../config/axios';
import toast from '../utils/toast';
import { getAvatarUrl } from '../utils/avatarUtils';
import '../styles/ProfileSettings.css';

const ProfileSettings = ({ isOpen, onClose, onProfileUpdate }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    jobTitle: '',
    startDate: '',
    avatar: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    blocked: 0,
    overdue: 0
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        const userData = response.data;
        
        const profileData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          department: userData.department?.name || userData.department || '',
          jobTitle: userData.jobTitle || '',
          startDate: userData.startDate ? userData.startDate.split('T')[0] : '',
          avatar: userData.avatar || ''
        };
        
        setProfileData(profileData);
        setOriginalData(profileData);
        setAvatarPreview(userData.avatar || '');

        // Calculate task stats from user's tasks
        if (userData.tasks && Array.isArray(userData.tasks)) {
          const now = new Date();
          const stats = {
            total: userData.tasks.length,
            completed: userData.tasks.filter(t => t.status === 'completed').length,
            inProgress: userData.tasks.filter(t => t.status === 'in-progress').length,
            pending: userData.tasks.filter(t => t.status === 'pending').length,
            blocked: userData.tasks.filter(t => t.status === 'blocked').length,
            overdue: userData.tasks.filter(t => 
              t.status !== 'completed' && t.endDate && new Date(t.endDate) < now
            ).length
          };
          setTaskStats(stats);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (user) {
          const userData = {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            department: user.department?.name || user.department || '',
            jobTitle: user.jobTitle || '',
            startDate: user.startDate ? user.startDate.split('T')[0] : '',
            avatar: user.avatar || ''
          };
          setProfileData(userData);
          setOriginalData(userData);
          setAvatarPreview(user.avatar || '');
        }
      }
    };

    if (isOpen && user) {
      fetchUserProfile();
    }
  }, [user, isOpen]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (key !== 'avatar' && key !== 'department') {
          formData.append(key, profileData[key]);
        }
      });
      if (avatarFile) formData.append('avatar', avatarFile);

      const response = await axios.put('/api/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateUser(response.data.user);
      
      const updatedProfileData = {
        name: response.data.user.name || '',
        email: response.data.user.email || '',
        phone: response.data.user.phone || '',
        address: response.data.user.address || '',
        department: response.data.user.department?.name || response.data.user.department || '',
        jobTitle: response.data.user.jobTitle || '',
        startDate: response.data.user.startDate ? response.data.user.startDate.split('T')[0] : '',
        avatar: response.data.user.avatar || ''
      };
      
      setProfileData(updatedProfileData);
      setOriginalData(updatedProfileData);
      setAvatarPreview(response.data.user.avatar || '');
      setIsEditing(false);
      setAvatarFile(null);
      
      if (onProfileUpdate) onProfileUpdate(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setAvatarPreview(originalData.avatar);
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleDownloadAvatar = async () => {
    if (!user.avatar) {
      toast.warning('No avatar to download');
      return;
    }
    try {
      const avatarUrl = getAvatarUrl(user.avatar);
      const response = await fetch(avatarUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.name}-avatar.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download avatar');
    }
  };

  // Save avatar only (without editing other fields)
  const handleSaveAvatar = async () => {
    if (!avatarFile) {
      toast.warning('No new avatar selected');
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      // Include current profile data to prevent overwriting
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('phone', profileData.phone || '');
      formData.append('address', profileData.address || '');
      formData.append('jobTitle', profileData.jobTitle || '');
      formData.append('startDate', profileData.startDate || '');

      const response = await axios.put('/api/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateUser(response.data.user);
      
      const updatedProfileData = {
        name: response.data.user.name || '',
        email: response.data.user.email || '',
        phone: response.data.user.phone || '',
        address: response.data.user.address || '',
        department: response.data.user.department?.name || response.data.user.department || '',
        jobTitle: response.data.user.jobTitle || '',
        startDate: response.data.user.startDate ? response.data.user.startDate.split('T')[0] : '',
        avatar: response.data.user.avatar || ''
      };
      
      setProfileData(updatedProfileData);
      setOriginalData(updatedProfileData);
      setAvatarPreview(response.data.user.avatar || '');
      setAvatarFile(null);
      
      if (onProfileUpdate) onProfileUpdate(response.data.user);
      toast.success('Avatar updated successfully! It will be visible to others.');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel avatar change
  const handleCancelAvatar = () => {
    setAvatarPreview(originalData.avatar);
    setAvatarFile(null);
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : name.substring(0, 2).toUpperCase();
  };

  // Get avatar gradient
  const getAvatarGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];
    const index = name ? name.charCodeAt(0) % gradients.length : 0;
    return gradients[index];
  };

  // Calculate completion percentage
  const completionRate = useMemo(() => {
    if (taskStats.total === 0) return 0;
    return Math.round((taskStats.completed / taskStats.total) * 100);
  }, [taskStats]);

  // Calculate days since joining
  const daysSinceJoining = useMemo(() => {
    if (!profileData.startDate) return null;
    const start = new Date(profileData.startDate);
    const now = new Date();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return diff;
  }, [profileData.startDate]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'stats', label: 'Statistics', icon: <BarChart3 size={16} /> },
  ];

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-modern" onClick={(e) => e.stopPropagation()}>
        {/* Header with gradient */}
        <div className="profile-modal-header">
          <div className="header-gradient-bg"></div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
          
          {/* Avatar Section in Header */}
          <div className="header-avatar-section">
            <div className="avatar-wrapper">
              {avatarPreview ? (
                <img src={getAvatarUrl(avatarPreview)} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-initials" style={{ background: getAvatarGradient(profileData.name) }}>
                  {getInitials(profileData.name)}
                </div>
              )}
              {/* Always show camera button for avatar upload */}
              <label className="avatar-edit-btn" title="Change avatar">
                <Camera size={16} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </label>
              <div className="avatar-status-dot"></div>
            </div>
            <div className="header-user-info">
              <h2>{profileData.name || 'User'}</h2>
              <p>{profileData.jobTitle || 'Team Member'}</p>
              <div className="header-badges">
                <span className="role-badge">
                  <Shield size={12} />
                  {user?.role || 'Employee'}
                </span>
                {profileData.department && (
                  <span className="dept-badge">
                    <Building2 size={12} />
                    {profileData.department}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="profile-modal-content">
          {activeTab === 'profile' && (
            <div className="profile-tab-content">
              {/* Quick Stats Row */}
              <div className="quick-stats-row">
                <div className="quick-stat">
                  <div className="quick-stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <Target size={18} />
                  </div>
                  <div className="quick-stat-info">
                    <span className="quick-stat-value">{taskStats.total}</span>
                    <span className="quick-stat-label">Total Tasks</span>
                  </div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <CheckCircle size={18} />
                  </div>
                  <div className="quick-stat-info">
                    <span className="quick-stat-value">{completionRate}%</span>
                    <span className="quick-stat-label">Completion</span>
                  </div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                    <Clock size={18} />
                  </div>
                  <div className="quick-stat-info">
                    <span className="quick-stat-value">{daysSinceJoining || '—'}</span>
                    <span className="quick-stat-label">Days Active</span>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="profile-form-section">
                <div className="section-header">
                  <h3>Personal Information</h3>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
                      <Edit2 size={14} />
                      Edit
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label><User size={14} /> Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="field-value">{profileData.name || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="form-field">
                    <label><Mail size={14} /> Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="field-value">{profileData.email || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="form-field">
                    <label><Phone size={14} /> Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="field-value">{profileData.phone || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="form-field">
                    <label><MapPin size={14} /> Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter your address"
                      />
                    ) : (
                      <div className="field-value">{profileData.address || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="form-field">
                    <label><Briefcase size={14} /> Job Title</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        placeholder="Enter your job title"
                      />
                    ) : (
                      <div className="field-value">{profileData.jobTitle || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="form-field">
                    <label><Calendar size={14} /> Start Date</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profileData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                      />
                    ) : (
                      <div className="field-value">
                        {profileData.startDate ? new Date(profileData.startDate).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        }) : 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="form-field full-width">
                    <label><Building2 size={14} /> Department</label>
                    <div className="field-value readonly">
                      {profileData.department || 'Not assigned'}
                      <span className="field-hint">Contact admin to change department</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="form-actions">
                    <button onClick={handleCancel} className="btn-cancel" disabled={isLoading}>
                      <X size={16} /> Cancel
                    </button>
                    <button onClick={handleSave} className="btn-save" disabled={isLoading}>
                      <Save size={16} /> {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              {/* Avatar Actions */}
              <div className="avatar-management-section">
                <h4><Camera size={16} /> Profile Photo</h4>
                <p className="avatar-hint">Your profile photo is visible to all team members</p>
                
                {avatarFile && (
                  <div className="avatar-pending-actions">
                    <div className="avatar-pending-notice">
                      <CheckCircle size={16} />
                      <span>New photo selected - click Save to update</span>
                    </div>
                    <div className="avatar-action-buttons">
                      <button onClick={handleCancelAvatar} className="btn-cancel-avatar" disabled={isLoading}>
                        <X size={14} /> Cancel
                      </button>
                      <button onClick={handleSaveAvatar} className="btn-save-avatar" disabled={isLoading}>
                        <Save size={14} /> {isLoading ? 'Saving...' : 'Save Photo'}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="avatar-buttons-row">
                  <label className="upload-avatar-btn">
                    <Camera size={16} />
                    <span>Upload New Photo</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                  </label>
                  {user?.avatar && (
                    <button onClick={handleDownloadAvatar} className="download-btn">
                      <Download size={16} /> Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-tab-content">
              {/* Performance Overview */}
              <div className="stats-section">
                <h3><TrendingUp size={18} /> Performance Overview</h3>
                
                <div className="completion-ring-card">
                  <div className="completion-ring">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                      <circle 
                        cx="50" cy="50" r="40" fill="none" 
                        stroke="url(#completionGradient)" 
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${completionRate * 2.51} 251`}
                        transform="rotate(-90 50 50)"
                      />
                      <defs>
                        <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#667eea" />
                          <stop offset="100%" stopColor="#764ba2" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="ring-center">
                      <span className="ring-value">{completionRate}%</span>
                      <span className="ring-label">Complete</span>
                    </div>
                  </div>
                  <div className="completion-details">
                    <h4>Task Completion Rate</h4>
                    <p>You've completed {taskStats.completed} out of {taskStats.total} tasks</p>
                    {completionRate >= 80 && (
                      <div className="achievement-badge">
                        <Award size={16} /> Excellent Performance!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Task Breakdown */}
              <div className="stats-section">
                <h3><BarChart3 size={18} /> Task Breakdown</h3>
                <div className="task-stats-grid">
                  <div className="task-stat-card">
                    <div className="stat-card-icon completed">
                      <CheckCircle size={20} />
                    </div>
                    <div className="stat-card-info">
                      <span className="stat-card-value">{taskStats.completed}</span>
                      <span className="stat-card-label">Completed</span>
                    </div>
                    <div className="stat-card-bar">
                      <div 
                        className="stat-bar-fill completed" 
                        style={{ width: `${taskStats.total ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="task-stat-card">
                    <div className="stat-card-icon in-progress">
                      <Clock size={20} />
                    </div>
                    <div className="stat-card-info">
                      <span className="stat-card-value">{taskStats.inProgress}</span>
                      <span className="stat-card-label">In Progress</span>
                    </div>
                    <div className="stat-card-bar">
                      <div 
                        className="stat-bar-fill in-progress" 
                        style={{ width: `${taskStats.total ? (taskStats.inProgress / taskStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="task-stat-card">
                    <div className="stat-card-icon pending">
                      <Target size={20} />
                    </div>
                    <div className="stat-card-info">
                      <span className="stat-card-value">{taskStats.pending}</span>
                      <span className="stat-card-label">Pending</span>
                    </div>
                    <div className="stat-card-bar">
                      <div 
                        className="stat-bar-fill pending" 
                        style={{ width: `${taskStats.total ? (taskStats.pending / taskStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="task-stat-card">
                    <div className="stat-card-icon blocked">
                      <AlertCircle size={20} />
                    </div>
                    <div className="stat-card-info">
                      <span className="stat-card-value">{taskStats.blocked}</span>
                      <span className="stat-card-label">Blocked</span>
                    </div>
                    <div className="stat-card-bar">
                      <div 
                        className="stat-bar-fill blocked" 
                        style={{ width: `${taskStats.total ? (taskStats.blocked / taskStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {taskStats.overdue > 0 && (
                  <div className="overdue-alert">
                    <AlertCircle size={18} />
                    <span>You have {taskStats.overdue} overdue task{taskStats.overdue !== 1 ? 's' : ''} that need attention</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
