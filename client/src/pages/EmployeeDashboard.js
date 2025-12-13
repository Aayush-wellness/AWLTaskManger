import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Download, Filter, TrendingUp, CheckCircle, Clock, AlertCircle, Calendar, FileText, ExternalLink, X, Settings } from 'lucide-react';
import { getSmallAvatarUrl } from '../utils/avatarUtils';
import axios from '../config/axios';
import ProjectDetails from '../components/ProjectDetails';
import EmployeeTable from '../components/EmployeeTable';
import PersonalEmployeeTable from '../components/PersonalEmployeeTable';
import ProfileSettings from '../components/ProfileSettings';
import { formatDate } from '../utils/dateUtils';
import '../styles/Dashboard.css';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [newTasks, setNewTasks] = useState([{ title: '', description: '', project: '' }]);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
    project: 'all',
    employee: 'all'
  });
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, 1 = previous week, etc.
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/users');
      console.log('Employees data:', res.data);
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees');
    }
  };

  // Helper function to get week start and end dates
  const getWeekRange = (weekOffset = 0) => {
    const now = new Date();
    const currentDay = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay - (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { startOfWeek, endOfWeek };
  };

  const applyFilters = useCallback(() => {
    let filtered = [...tasks];

    // Weekly filter (always applied)
    const { startOfWeek, endOfWeek } = getWeekRange(currentWeek);
    filtered = filtered.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    });

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Project filter
    if (filters.project !== 'all') {
      filtered = filtered.filter(task => task.project?._id === filters.project);
    }

    // Employee filter
    if (filters.employee !== 'all') {
      filtered = filtered.filter(task => task.employee?._id === filters.employee);
    }

    // Additional date range filter (if specified)
    if (filters.startDate) {
      filtered = filtered.filter(task => new Date(task.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(task => new Date(task.date) <= endDate);
    }

    setFilteredTasks(filtered);
  }, [tasks, filters, currentWeek]);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    
    // Filter out empty tasks
    const validTasks = newTasks.filter(task => task.title.trim() && task.project);
    
    if (validTasks.length === 0) {
      alert('Please add at least one task with title and project');
      return;
    }
    
    try {
      await axios.post('/api/tasks', { tasks: validTasks });
      setNewTasks([{ title: '', description: '', project: '' }]);
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      alert('Failed to add tasks: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddNewTaskRow = () => {
    setNewTasks([...newTasks, { title: '', description: '', project: '' }]);
  };

  const handleRemoveTaskRow = (index) => {
    if (newTasks.length > 1) {
      const updatedTasks = newTasks.filter((_, i) => i !== index);
      setNewTasks(updatedTasks);
    }
  };

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...newTasks];
    updatedTasks[index][field] = value;
    setNewTasks(updatedTasks);
  };

  const handleUpdateTask = async (taskId, status, remark) => {
    console.log('Updating task:', { taskId, status, remark });
    console.log('Remark value:', `"${remark}"`, 'Length:', remark.length);
    
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, { status, remark });
      console.log('Update response:', response.data);
      fetchTasks();
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update task: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(`/api/tasks/export/excel?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my-tasks-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download tasks');
    }
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      startDate: '',
      endDate: '',
      project: 'all',
      employee: 'all'
    });
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => prev + 1);
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => Math.max(0, prev - 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(0);
  };

  const getWeekLabel = () => {
    if (currentWeek === 0) return 'This Week';
    if (currentWeek === 1) return 'Last Week';
    return `${currentWeek} weeks ago`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate statistics
  const today = formatDate(new Date());
  const todayTasks = tasks.filter(task => formatDate(task.date) === today);
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');

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
        {activeTab === 'tasks' && (
          <div>
            <div className="header-section">
              <h2>My Personal Dashboard</h2>
              <p style={{ color: '#666', fontSize: '14px', margin: '8px 0' }}>
                Manage your personal information and tasks
              </p>
            </div>
            <div className="personal-table-container">
              <PersonalEmployeeTable />
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <div className="header-section">
              <h2>Projects</h2>
            </div>

            <div className="cards-grid">
              {projects.length === 0 ? (
                <p className="no-tasks">No projects available.</p>
              ) : (
                projects.map(project => (
                  <div 
                    key={project._id} 
                    className="info-card project-card-clickable"
                    onClick={() => setSelectedProject(project)}
                  >
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    
                    {/* Document Links Section */}
                    {project.documentLinks && project.documentLinks.length > 0 && (
                      <div className="project-documents">
                        <div className="documents-header">
                          <strong>Documents ({project.documentCount}):</strong>
                        </div>
                        <div className="document-links-preview">
                          {project.documentLinks.slice(0, 3).map((doc, idx) => (
                            <a 
                              key={idx} 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="doc-link-small"
                              onClick={(e) => e.stopPropagation()}
                              title={`${doc.name} (from ${doc.vendorName})`}
                            >
                              <FileText size={12} />
                              {doc.name}
                              <ExternalLink size={10} />
                            </a>
                          ))}
                          {project.documentLinks.length > 3 && (
                            <span className="more-docs">+{project.documentLinks.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="card-footer">
                      <span className={`status-badge ${project.status}`}>{project.status}</span>
                      {project.vendorCount > 0 && (
                        <span className="vendor-count">{project.vendorCount} entr{project.vendorCount !== 1 ? 'ies' : 'y'}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div>
            <div className="header-section">
              <h2>
                Employee Hierarchy - {user?.department?.name || user?.department || 'Your Department'}
              </h2>
            </div>
            <div className="employee-table-container">
              <EmployeeTable />
            </div>
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onRefresh={fetchProjects}
          userRole="employee"
        />
      )}

      {/* Profile Settings Modal */}
      <ProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        onProfileUpdate={(updatedUser) => {
          console.log('Profile updated, user data:', updatedUser);
          // The EmployeeTable will automatically refresh due to useAuth context update
        }}
      />
    </div>
  );
};



// Compact Task Group Component
const CompactTaskGroup = ({ taskGroup, onUpdate, onDelete }) => {
  const [expandedTask, setExpandedTask] = useState(null);
  
  const isMultipleTask = taskGroup.length > 1;
  
  return (
    <div className={`compact-task-group ${isMultipleTask ? 'multiple-tasks' : 'single-task'}`}>
      {isMultipleTask && (
        <div className="compact-group-header">
          <div className="group-info">
            <span className="task-count-badge">{taskGroup.length}</span>
            <span className="group-date">{formatDate(taskGroup[0].date)}</span>
          </div>
          <span className="group-label">Tasks submitted together</span>
        </div>
      )}
      
      <div className="compact-tasks-container">
        {taskGroup.map(task => (
          <CompactTaskCard 
            key={task._id}
            task={task}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isExpanded={expandedTask === task._id}
            onToggleExpand={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
            isGrouped={isMultipleTask}
          />
        ))}
      </div>
    </div>
  );
};

// Compact Task Card Component
const CompactTaskCard = ({ task, onUpdate, onDelete, isExpanded, onToggleExpand, isGrouped }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(task.status);
  const [remark, setRemark] = useState(task.remark || '');

  useEffect(() => {
    setStatus(task.status);
    setRemark(task.remark || '');
  }, [task.status, task.remark]);

  const handleSave = () => {
    onUpdate(task._id, status, remark);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setStatus(task.status);
    setRemark(task.remark || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task._id);
    }
  };

  const statusConfig = {
    pending: { color: '#fbbf24', label: 'Pending' },
    'in-progress': { color: '#3b82f6', label: 'In Progress' },
    completed: { color: '#10b981', label: 'Completed' },
    blocked: { color: '#ef4444', label: 'Blocked' }
  };

  const config = statusConfig[task.status] || statusConfig.pending;

  return (
    <div className={`compact-task-card ${task.status} ${isGrouped ? 'grouped' : ''}`}>
      <div className="compact-card-header" onClick={onToggleExpand}>
        <div className="task-title-section">
          <h4 className="compact-task-title">{task.title}</h4>
          <span className="compact-project-name">{task.project?.name}</span>
        </div>
        
        <div className="task-status-section">
          <span 
            className="compact-status-badge" 
            style={{ backgroundColor: config.color }}
          >
            {config.label}
          </span>
        </div>
      </div>

      {!isGrouped && (
        <div className="compact-task-date">
          <Calendar size={12} />
          {formatDate(task.date)}
        </div>
      )}

      {task.description && (
        <p className="compact-task-description">
          {task.description.length > 80 
            ? `${task.description.substring(0, 80)}...` 
            : task.description
          }
        </p>
      )}

      {isExpanded && (
        <div className="compact-task-details">
          {task.description && task.description.length > 80 && (
            <div className="full-description">
              <strong>Full Description:</strong>
              <p>{task.description}</p>
            </div>
          )}
          
          {task.remark && (
            <div className="task-remark-display">
              <strong>Remark:</strong>
              <p>{task.remark}</p>
            </div>
          )}

          {isEditing ? (
            <div className="compact-edit-form">
              <div className="edit-field">
                <label>Status:</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              
              <div className="edit-field">
                <label>Remark:</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Add a remark..."
                  rows="2"
                />
              </div>
              
              <div className="compact-edit-actions">
                <button onClick={handleCancel} className="cancel-btn-small">Cancel</button>
                <button onClick={handleSave} className="save-btn-small">Save</button>
              </div>
            </div>
          ) : (
            <div className="compact-task-actions">
              <button onClick={() => setIsEditing(true)} className="update-status-btn">
                <span className="btn-text">Update Status</span>
              </button>
              <button onClick={handleDelete} className="delete-task-btn">
                <span className="btn-text">Delete</span>
              </button>
            </div>
          )}
        </div>
      )}

      <div className="compact-card-footer">
        <button 
          onClick={onToggleExpand}
          className={`modern-expand-btn ${isExpanded ? 'expanded' : 'collapsed'}`}
          title={isExpanded ? 'Collapse details' : 'Expand details'}
        >
          <span className="expand-icon">
            {isExpanded ? '▲' : '▼'}
          </span>
          <span className="expand-text">
            {isExpanded ? 'Less' : 'More'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
