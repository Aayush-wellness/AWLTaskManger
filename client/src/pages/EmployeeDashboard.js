import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Download, Filter, TrendingUp, CheckCircle, Clock, AlertCircle, Calendar, FileText, ExternalLink } from 'lucide-react';
import axios from '../config/axios';
import ProjectDetails from '../components/ProjectDetails';
import '../styles/Dashboard.css';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', project: '' });
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
    project: 'all'
  });

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

  const applyFilters = useCallback(() => {
    let filtered = [...tasks];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Project filter
    if (filters.project !== 'all') {
      filtered = filtered.filter(task => task.project?._id === filters.project);
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(task => new Date(task.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(task => new Date(task.date) <= endDate);
    }

    setFilteredTasks(filtered);
  }, [tasks, filters]);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', newTask);
      setNewTask({ title: '', description: '', project: '' });
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      alert('Failed to add task');
    }
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
      project: 'all'
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate statistics
  const today = new Date().toDateString();
  const todayTasks = tasks.filter(task => new Date(task.date).toDateString() === today);
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Employee Dashboard</h1>
        <div className="nav-right">
          <span>Welcome, {user?.name}</span>
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
      </div>

      <div className="dashboard-content">
        {activeTab === 'tasks' && (
          <>
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-today">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3>{todayTasks.length}</h3>
              <p>Tasks Created Today</p>
            </div>
          </div>

          <div className="stat-card stat-total">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <h3>{tasks.length}</h3>
              <p>Total Tasks</p>
            </div>
          </div>

          <div className="stat-card stat-completed">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{completedTasks.length}</h3>
              <p>Completed Tasks</p>
            </div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-icon">
              <AlertCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{pendingTasks.length}</h3>
              <p>Pending Tasks</p>
            </div>
          </div>

          <div className="stat-card stat-progress">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{inProgressTasks.length}</h3>
              <p>In Progress</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="header-section">
          <h2>My Tasks ({filteredTasks.length})</h2>
          <div className="action-buttons">
            <button onClick={() => setShowFilterModal(true)} className="filter-btn">
              <Filter size={18} /> Filter
            </button>
            <button onClick={handleDownloadExcel} className="download-btn">
              <Download size={18} /> Download Excel
            </button>
            <button onClick={() => setShowModal(true)} className="add-btn">
              <Plus size={18} /> Add Task
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.status !== 'all' || filters.project !== 'all' || filters.startDate || filters.endDate) && (
          <div className="active-filters">
            <span className="filter-label">Active Filters:</span>
            {filters.status !== 'all' && <span className="filter-tag">Status: {filters.status}</span>}
            {filters.project !== 'all' && <span className="filter-tag">Project: {projects.find(p => p._id === filters.project)?.name}</span>}
            {filters.startDate && <span className="filter-tag">From: {filters.startDate}</span>}
            {filters.endDate && <span className="filter-tag">To: {filters.endDate}</span>}
            <button onClick={resetFilters} className="clear-filters-btn">Clear All</button>
          </div>
        )}

        {/* Tasks Grid */}
        <div className="tasks-grid">
          {filteredTasks.length === 0 ? (
            <p className="no-tasks">No tasks found. {filters.status !== 'all' || filters.project !== 'all' || filters.startDate || filters.endDate ? 'Try adjusting your filters.' : 'Click "Add Task" to create one.'}</p>
          ) : (
            filteredTasks.map(task => (
              <TaskCard key={task._id} task={task} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />
            ))
          )}
        </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Task</h2>
            <form onSubmit={handleAddTask}>
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows="4"
              />
              <select
                value={newTask.project}
                onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                required
              >
                <option value="">Select Project</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>{project.name}</option>
                ))}
              </select>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="modal filter-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Filter Tasks</h2>
            <div className="filter-form">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="form-group">
                <label>Project</label>
                <select
                  value={filters.project}
                  onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                >
                  <option value="all">All Projects</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={resetFilters} className="reset-btn">
                  Reset Filters
                </button>
                <button type="button" onClick={() => setShowFilterModal(false)} className="submit-btn">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
          </>
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
    </div>
  );
};

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(task.status);
  const [remark, setRemark] = useState(task.remark || '');

  // Reset local state when task prop changes
  useEffect(() => {
    setStatus(task.status);
    setRemark(task.remark || '');
  }, [task.status, task.remark]);

  const handleSave = () => {
    console.log('TaskCard handleSave called with:', { status, remark });
    console.log('Remark details:', `"${remark}"`, 'Length:', remark.length, 'Type:', typeof remark);
    onUpdate(task._id, status, remark);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setStatus(task.status);
    setRemark(task.remark || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      onDelete(task._id);
    }
  };

  const statusColors = {
    pending: '#fbbf24',
    'in-progress': '#3b82f6',
    completed: '#10b981',
    blocked: '#ef4444'
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <h3>{task.title}</h3>
        <span className="status-badge" style={{ background: statusColors[task.status] }}>
          {task.status}
        </span>
      </div>
      <p className="task-date">
        <Calendar size={14} /> {formatDate(task.date)}
      </p>
      <p className="task-description">{task.description}</p>
      <p className="task-project">Project: {task.project?.name}</p>
      
      {isEditing ? (
        <div className="task-edit">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          <textarea
            placeholder="Add remark..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows="2"
          />
          <div className="task-actions">
            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
            <button onClick={handleSave} className="save-btn">Save</button>
          </div>
        </div>
      ) : (
        <>
          {task.remark && <p className="task-remark">Remark: {task.remark}</p>}
          <div className="task-actions">
            <button onClick={() => setIsEditing(true)} className="update-btn">
              Update Status
            </button>
            <button onClick={handleDelete} className="delete-btn">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeDashboard;
