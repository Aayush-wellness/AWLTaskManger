import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
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

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Employee Dashboard</h1>
        <div className="nav-right">
          <div className="user-info">
            <img 
              src={getSmallAvatarUrl(user?.avatar)} 
              alt="Profile" 
              className="user-avatar"
            />
            <span>Welcome, {user?.name}</span>
          </div>
          <NotificationBell />
          <button onClick={() => setShowProfileSettings(true)} className="profile-btn">
            <Settings size={18} /> Profile
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'tasks' ? 'active' : ''} 
          onClick={() => setActiveTab('tasks')}
        >
          My Tasks
        </button>
        <button 
          className={activeTab === 'projects' ? 'active' : ''} 
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button 
          className={activeTab === 'employees' ? 'active' : ''} 
          onClick={() => setActiveTab('employees')}
        >
          Employees
        </button>
      </div>

      <div className="dashboard-content">
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
