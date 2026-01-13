import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, ListTodo, FolderPlus, BarChart3, Search, Bell } from 'lucide-react';
import axios from '../../config/axios';
import NotificationBell from '../../components/NotificationBell';
import DashboardTab from './DashboardTab';
import TasksTab from './TasksTab';
import ProjectsTab from './ProjectsTab';
import ProjectDashboard from './ProjectDashboard';
import EmployeeListModal from './EmployeeListModal';
import '../../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data
  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const [tasksRes, employeesRes, deptRes, projRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/users'),
        axios.get('/api/departments'),
        axios.get('/api/projects')
      ]);
      setTasks(tasksRes.data);
      setEmployees(employeesRes.data);
      setDepartments(deptRes.data);
      setProjects(projRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  }, []);

  // Manual refresh
  const handleManualRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time updates
  useEffect(() => {
    let interval;
    if (activeTab === 'tasks' || activeTab === 'dashboard' || activeTab === 'projects-dashboard') {
      interval = setInterval(() => {
        fetchData();
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, fetchData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Tab configuration
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'All Tasks', icon: ListTodo },
    { id: 'projects', label: 'Bulk Task', icon: FolderPlus },
    { id: 'projects-dashboard', label: 'Project Dashboard', icon: BarChart3 },
  ];

  return (
    <div className="admin-dashboard-modern">
      {/* Modern Navbar */}
      <nav className="modern-navbar">
        <div className="navbar-left">
          <div className="brand-logo">
            <div className="logo-icon">
              <LayoutDashboard size={24} />
            </div>
            <span className="brand-text">TaskFlow</span>
          </div>
        </div>

        <div className="navbar-center">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search tasks, projects..." className="search-input" />
          </div>
        </div>

        <div className="navbar-right">
          <NotificationBell />
          <div className="user-profile">
            <div className="user-avatar-modern">
              {getInitials(user?.name)}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn-modern">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="dashboard-layout">
        {/* Modern Tab Navigation */}
        <div className="modern-tabs-container">
          <div className="modern-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`modern-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <div className="tab-indicator" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="modern-content">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              tasks={tasks} 
              employees={employees}
              onEmployeeClick={() => setShowEmployeeModal(true)}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksTab
              tasks={tasks}
              employees={employees}
              departments={departments}
              projects={projects}
              lastUpdated={lastUpdated}
              isRefreshing={isRefreshing}
              onRefresh={fetchData}
              onManualRefresh={handleManualRefresh}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsTab projects={projects} onRefresh={fetchData} />
          )}

          {activeTab === 'projects-dashboard' && (
            <ProjectDashboard projects={projects} employees={employees} />
          )}
        </div>
      </div>

      <EmployeeListModal
        isOpen={showEmployeeModal}
        employees={employees}
        onClose={() => setShowEmployeeModal(false)}
      />
    </div>
  );
};

export default AdminDashboard;
