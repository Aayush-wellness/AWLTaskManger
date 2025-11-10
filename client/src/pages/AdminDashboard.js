import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Download, Plus, Users, FolderKanban, Briefcase } from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import ProjectDetails from '../components/ProjectDetails';
import '../styles/Dashboard.css';

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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchData = async () => {
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
    } catch (err) {
      console.error('Failed to fetch data');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get('/api/tasks/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tasks.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download Excel');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    totalEmployees: employees.length
  };

  const statusData = [
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#3b82f6' },
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#fbbf24' },
    { name: 'Blocked', value: tasks.filter(t => t.status === 'blocked').length, color: '#ef4444' }
  ];

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Admin Dashboard</h1>
        <div className="nav-right">
          <span>Welcome, {user?.name}</span>
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
          Departments
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'dashboard' && (
          <>
            <div className="stats-grid">
              <StatCard icon={<FolderKanban />} title="Total Tasks" value={stats.totalTasks} color="#667eea" />
              <StatCard 
                icon={<Users />} 
                title="Total Employees" 
                value={stats.totalEmployees} 
                color="#48bb78" 
                clickable={true}
                onClick={() => setShowEmployeeModal(true)}
              />
              <StatCard icon={<Briefcase />} title="Completed Tasks" value={stats.completedTasks} color="#10b981" />
              <StatCard icon={<FolderKanban />} title="Pending Tasks" value={stats.pendingTasks} color="#fbbf24" />
            </div>

            <div className="charts-section">
              <div className="chart-card">
                <h3>Task Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </>
        )}

        {activeTab === 'tasks' && (
          <>
            <div className="filters-section">
              <h3>Filter Tasks</h3>
              <div className="filters-grid">
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
                <select
                  value={filters.employee}
                  onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                >
                  <option value="">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  placeholder="End Date"
                />
                <button onClick={handleDownloadExcel} className="download-btn">
                  <Download size={18} /> Download Excel
                </button>
              </div>
            </div>

            <div className="tasks-table">
              <h3>All Submitted Tasks ({tasks.length})</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Task</th>
                    <th>Description</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        No tasks found
                      </td>
                    </tr>
                  ) : (
                    tasks.map(task => (
                      <tr key={task._id}>
                        <td>{new Date(task.date).toLocaleDateString()}</td>
                        <td>{task.employee?.name}</td>
                        <td>{task.title}</td>
                        <td>{task.description || '-'}</td>
                        <td>{task.project?.name}</td>
                        <td>
                          <span className={`status-badge ${task.status}`}>
                            {task.status}
                          </span>
                        </td>
                        <td>{task.remark || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'projects' && (
          <ProjectsTab projects={projects} onRefresh={fetchData} />
        )}

        {activeTab === 'departments' && (
          <DepartmentsTab departments={departments} onRefresh={fetchData} />
        )}
      </div>

      {/* Employee List Modal */}
      {showEmployeeModal && (
        <div className="modal-overlay" onClick={() => setShowEmployeeModal(false)}>
          <div className="modal employee-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Registered Employees ({employees.length})</h2>
            <div className="employee-list">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    employees.map(emp => (
                      <tr key={emp._id}>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>
                          {emp.department?.name || 'Not Assigned'}
                        </td>
                        <td>{new Date(emp.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowEmployeeModal(false)} className="submit-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, color, clickable, onClick }) => (
  <div 
    className={`stat-card ${clickable ? 'clickable' : ''}`} 
    style={{ borderLeft: `4px solid ${color}` }}
    onClick={clickable ? onClick : undefined}
  >
    <div className="stat-icon" style={{ color }}>{icon}</div>
    <div className="stat-info">
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  </div>
);

const ProjectsTab = ({ projects, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'active' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', newProject);
      setNewProject({ name: '', description: '', status: 'active' });
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert('Failed to create project');
    }
  };

  return (
    <div>
      <div className="header-section">
        <h2>Projects</h2>
        <button onClick={() => setShowModal(true)} className="add-btn">
          <Plus size={20} /> Add Project
        </button>
      </div>

      <div className="cards-grid">
        {projects.map(project => (
          <div 
            key={project._id} 
            className="info-card project-card-clickable"
            onClick={() => setSelectedProject(project)}
          >
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="card-footer">
              <span className={`status-badge ${project.status}`}>{project.status}</span>
              {project.vendorCount > 0 && (
                <span className="vendor-count">{project.vendorCount} entr{project.vendorCount !== 1 ? 'ies' : 'y'}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Project</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows="4"
              />
              <select
                value={newProject.status}
                onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onRefresh={onRefresh}
          userRole="admin"
        />
      )}
    </div>
  );
};

const DepartmentsTab = ({ departments, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/departments', newDept);
      setNewDept({ name: '', description: '' });
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert('Failed to create department');
    }
  };

  return (
    <div>
      <div className="header-section">
        <h2>Departments</h2>
        <button onClick={() => setShowModal(true)} className="add-btn">
          <Plus size={20} /> Add Department
        </button>
      </div>

      <div className="cards-grid">
        {departments.map(dept => (
          <div key={dept._id} className="info-card">
            <h3>{dept.name}</h3>
            <p>{dept.description}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Department</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Department Name"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newDept.description}
                onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                rows="4"
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
