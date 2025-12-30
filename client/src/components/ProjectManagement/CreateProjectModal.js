import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import axios from '../../config/axios';
import '../../styles/CreateProjectModal.css';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated, departments }) => {
  const [step, setStep] = useState(1); // 1: Project Info, 2: Select Members, 3: Add Tasks
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch members when department is selected
  useEffect(() => {
    if (selectedDepartment) {
      fetchDepartmentMembers(selectedDepartment);
    }
  }, [selectedDepartment]);

  const fetchDepartmentMembers = async (deptId) => {
    try {
      const res = await axios.get(`/api/users/department/${deptId}`);
      setAvailableMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      alert('Failed to load department members');
    }
  };

  const handleAddMember = (member) => {
    if (!selectedMembers.find(m => m._id === member._id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleRemoveMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter(m => m._id !== memberId));
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }
    setTasks([...tasks, { ...newTask, id: Date.now() }]);
    setNewTask({ title: '', description: '', dueDate: '' });
  };

  const handleRemoveTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) {
      alert('Please enter project name');
      return;
    }
    if (selectedMembers.length === 0) {
      alert('Please select at least one member');
      return;
    }
    if (tasks.length === 0) {
      alert('Please add at least one task');
      return;
    }

    try {
      setLoading(true);

      // Create project
      const projectRes = await axios.post('/api/projects', {
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        members: selectedMembers.map(m => m._id),
        tasks: tasks
      });

      const projectId = projectRes.data._id;

      // Assign tasks to all selected members
      for (const member of selectedMembers) {
        for (const task of tasks) {
          await axios.post(`/api/users/${member._id}/tasks`, {
            title: task.title,
            project: projectId,
            description: task.description,
            startDate: new Date().toISOString(),
            endDate: task.dueDate,
            status: 'pending',
            assignedBy: 'Admin'
          });

          // Create notification
          try {
            await axios.post('/api/notifications/create', {
              recipientId: member._id,
              taskName: task.title,
              assignedBy: 'Admin',
              projectName: projectData.name,
              dueDate: task.dueDate
            });
          } catch (err) {
            console.error('Failed to create notification:', err);
          }
        }
      }

      alert('Project created successfully with tasks assigned to all members!');
      resetForm();
      onProjectCreated();
      onClose();
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Failed to create project: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setProjectData({ name: '', description: '', status: 'active' });
    setSelectedDepartment('');
    setAvailableMembers([]);
    setSelectedMembers([]);
    setTasks([]);
    setNewTask({ title: '', description: '', dueDate: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-steps">
          <div className={`step ${step === 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Project Info</span>
          </div>
          <div className={`step ${step === 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Select Members</span>
          </div>
          <div className={`step ${step === 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Add Tasks</span>
          </div>
        </div>

        <div className="modal-content">
          {/* Step 1: Project Info */}
          {step === 1 && (
            <div className="step-content">
              <h3>Project Information</h3>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter project description"
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  className="form-input"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={projectData.status}
                  onChange={(e) => setProjectData({ ...projectData, status: e.target.value })}
                  className="form-input"
                >
                  <option value="active">Active</option>
                  <option value="planning">Planning</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Select Members */}
          {step === 2 && (
            <div className="step-content">
              <h3>Select Project Members</h3>
              
              <div className="form-group">
                <label>Select Department *</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="form-input"
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDepartment && (
                <>
                  <div className="members-section">
                    <h4>Available Members</h4>
                    <div className="members-list">
                      {availableMembers.length === 0 ? (
                        <p className="no-data">No members in this department</p>
                      ) : (
                        availableMembers.map(member => (
                          <div key={member._id} className="member-item">
                            <div className="member-info">
                              <span className="member-name">{member.name}</span>
                              <span className="member-role">{member.jobTitle}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddMember(member)}
                              className="add-member-btn"
                              disabled={selectedMembers.find(m => m._id === member._id)}
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="selected-members-section">
                    <h4>Selected Members ({selectedMembers.length})</h4>
                    <div className="selected-members-list">
                      {selectedMembers.length === 0 ? (
                        <p className="no-data">No members selected</p>
                      ) : (
                        selectedMembers.map(member => (
                          <div key={member._id} className="selected-member-item">
                            <div className="member-info">
                              <span className="member-name">{member.name}</span>
                              <span className="member-role">{member.jobTitle}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member._id)}
                              className="remove-member-btn"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Add Tasks */}
          {step === 3 && (
            <div className="step-content">
              <h3>Add Project Tasks</h3>
              <p className="step-info">These tasks will be assigned to all selected members</p>

              <div className="add-task-form">
                <div className="form-group">
                  <label>Task Title *</label>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Enter task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="form-input"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="form-input"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="add-task-btn"
                >
                  <Plus size={18} /> Add Task
                </button>
              </div>

              <div className="tasks-list-section">
                <h4>Project Tasks ({tasks.length})</h4>
                {tasks.length === 0 ? (
                  <p className="no-data">No tasks added yet</p>
                ) : (
                  <div className="tasks-list">
                    {tasks.map(task => (
                      <div key={task.id} className="task-item">
                        <div className="task-info">
                          <span className="task-title">{task.title}</span>
                          {task.dueDate && (
                            <span className="task-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(task.id)}
                          className="remove-task-btn"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else onClose();
            }}
            className="btn-secondary"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleCreateProject();
            }}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating...' : step === 3 ? 'Create Project' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
