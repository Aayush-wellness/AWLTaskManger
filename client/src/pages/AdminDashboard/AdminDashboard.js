import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import axios from '../../config/axios';
import NotificationBell from '../../components/NotificationBell';
import DashboardTab from './DashboardTab';
import TasksTab from './TasksTab';
import ProjectsTab from './ProjectsTab';
import DepartmentsTab from './DepartmentsTab';
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
  const [filters, setFilters] = useState({
    department: '',
    employee: '',
    startDate: '',
    endDate: ''
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data
  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const [tasksRes, employeesRes, deptRes, projRes] = await Promise.all([
        axios.get('/api/tasks', { params: filters }),
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
  }, [filters]);

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
    if (activeTab === 'tasks' || activeTab === 'dashboard') {
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

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Admin Dashboard</h1>
        <div className="nav-right">
          <span>Welcome, {user?.name}</span>
          <NotificationBell />
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'tasks' ? 'active' : ''} 
          onClick={() => setActiveTab('tasks')}
        >
          All Tasks
        </button>
        <button 
          className={activeTab === 'projects' ? 'active' : ''} 
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button 
          className={activeTab === 'departments' ? 'active' : ''} 
          onClick={() => setActiveTab('departments')}
        >
          Board
        </button>
      </div>

      <div className="dashboard-content">
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
          <ProjectsTab projects={projects} departments={departments} onRefresh={fetchData} />
        )}

        {/* {activeTab === 'departments' && (
          <DepartmentsTab departments={departments} onRefresh={fetchData} />
        )} */}
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
