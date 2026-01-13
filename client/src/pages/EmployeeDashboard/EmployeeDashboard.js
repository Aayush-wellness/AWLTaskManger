import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, ClipboardList, FolderKanban, Users, Search, Bell } from 'lucide-react';
import { getSmallAvatarUrl } from '../../utils/avatarUtils';
import axios from '../../config/axios';
import NotificationBell from '../../components/NotificationBell';
import ProfileSettings from '../../components/ProfileSettings';
import TasksTab from './TasksTab';
import ProjectsTab from './ProjectsTab';
import EmployeesTab from './EmployeesTab';
import '../../styles/EmployeeDashboard-Light.css';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const [projects, setProjects] = useState([]);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get avatar initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get avatar gradient color based on name
  const getAvatarGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    ];
    const index = name ? name.charCodeAt(0) % gradients.length : 0;
    return gradients[index];
  };

  const tabs = [
    { id: 'tasks', label: 'My Tasks', icon: <ClipboardList size={18} /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban size={18} /> },
    { id: 'employees', label: 'Employees', icon: <Users size={18} /> },
  ];

  return (
    <div className="modern-dashboard">
      {/* Modern Navbar */}
      <nav className="modern-navbar">
        <div className="navbar-left">
          <div className="logo-section">
            <div className="logo-icon">
              <ClipboardList size={24} />
            </div>
            <span className="logo-text">TaskFlow</span>
          </div>
        </div>

        <div className="navbar-center">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search tasks, projects..." />
          </div>
        </div>

        <div className="navbar-right">
          <NotificationBell />
          
          <button 
            onClick={() => setShowProfileSettings(true)} 
            className="nav-icon-btn"
            title="Profile Settings"
          >
            <Settings size={20} />
          </button>

          <div className="user-profile-section">
            {user?.avatar ? (
              <img 
                src={getSmallAvatarUrl(user?.avatar)} 
                alt="Profile" 
                className="profile-avatar-img"
              />
            ) : (
              <div 
                className="profile-avatar-initials"
                style={{ background: getAvatarGradient(user?.name) }}
              >
                {getInitials(user?.name)}
              </div>
            )}
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role || 'Employee'}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Modern Tab Navigation */}
      <div className="tab-navigation-wrapper">
        <div className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="dashboard-main-content">
        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'projects' && <ProjectsTab projects={projects} onRefresh={fetchProjects} />}
        {activeTab === 'employees' && <EmployeesTab />}
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        onProfileUpdate={(updatedUser) => {
          console.log('Profile updated, user data:', updatedUser);
        }}
      />
    </div>
  );
};

export default EmployeeDashboard;
