import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
} from '@mui/material';
import { X as XIcon } from 'lucide-react';
import axios from '../../config/axios';
import toast from '../../utils/toast';
import useProjects from '../../hooks/useProjects';
import './BulkTaskAssignmentModal.css';

const BulkTaskAssignmentModal = ({ isOpen, onClose, onTasksCreated }) => {
  // Step 1: Department & Assignee Selection
  const [departments, setDepartments] = useState([]);
  const [expandedDept, setExpandedDept] = useState(null);
  const [selectedAssignees, setSelectedAssignees] = useState({});
  const [employees, setEmployees] = useState({});

  // Step 2: Task Creation
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    project: '',
    priority: 'Medium',
    dueDate: getDefaultDueDate()
  });

  const { projects } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/api/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  // Fetch employees for a department
  const fetchEmployeesForDept = async (deptId) => {
    try {
      const res = await axios.get(`/api/users/department/${deptId}`);
      setEmployees(prev => ({
        ...prev,
        [deptId]: res.data
      }));
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleDepartmentClick = (deptId) => {
    setExpandedDept(deptId);
    if (!employees[deptId]) {
      fetchEmployeesForDept(deptId);
    } else if (expandedDept === deptId) {
      setExpandedDept(null);
    }
  };

  const handleAssigneeToggle = (employeeId) => {
    setSelectedAssignees(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const selectedCount = Object.values(selectedAssignees).filter(Boolean).length;

  function getDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  }

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast.warning('Please enter a task title');
      return;
    }

    if (!newTask.project.trim()) {
      toast.warning('Please select a project');
      return;
    }

    setTasks(prev => [...prev, { ...newTask, id: Date.now() }]);
    setNewTask({
      title: '',
      project: '',
      priority: 'Medium',
      dueDate: getDefaultDueDate()
    });
  };

  const handleRemoveTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleCreateTasks = async () => {
    const selectedEmployeeIds = Object.keys(selectedAssignees).filter(id => selectedAssignees[id]);

    if (selectedEmployeeIds.length === 0) {
      toast.warning('Please select at least one assignee');
      return;
    }

    if (tasks.length === 0) {
      toast.warning('Please add at least one task');
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = await axios.get('/api/users/test-auth');
      const assignedByName = currentUser.data.user.name;

      // Create tasks for each selected employee
      const promises = selectedEmployeeIds.flatMap(employeeId =>
        tasks.map(async (task) => {
          // Create task
          await axios.post(`/api/users/${employeeId}/tasks`, {
            taskName: task.title,
            project: task.project,
            startDate: new Date().toISOString(),
            endDate: task.dueDate,
            status: 'pending',
            priority: task.priority,
            AssignedBy: assignedByName
          });

          // Create notification for the employee
          try {
            await axios.post('/api/notifications/create', {
              recipientId: employeeId,
              taskName: task.title,
              assignedBy: assignedByName,
              projectName: task.project,
              dueDate: task.dueDate
            });
          } catch (notifError) {
            console.error('Error creating notification:', notifError);
          }
        })
      );

      await Promise.all(promises);

      toast.success(`Successfully created ${tasks.length} task(s) for ${selectedEmployeeIds.length} employee(s)`);
      onTasksCreated();
      handleClose();
    } catch (err) {
      console.error('Error creating tasks:', err);
      toast.error('Failed to create tasks: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedAssignees({});
    setTasks([]);
    setNewTask({
      title: '',
      project: '',
      priority: 'Medium',
      dueDate: getDefaultDueDate()
    });
    setExpandedDept(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Assign Tasks to Employees</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* Left Panel: Department & Assignee Selection */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontSize: '14px', fontWeight: 600 }}>
              Select Assignees
            </Typography>
            <Chip
              label={`${selectedCount} selected`}
              color="primary"
              size="small"
              sx={{ mb: 2 }}
            />

            <Box sx={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px', p: 1 }}>
              {departments.map(dept => (
                <Box key={dept._id} sx={{ mb: 1 }}>
                  <Button
                    fullWidth
                    onClick={() => handleDepartmentClick(dept._id)}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: expandedDept === dept._id ? '#5b7cfa' : '#374151',
                      backgroundColor: expandedDept === dept._id ? '#f0f4ff' : 'transparent',
                      '&:hover': { backgroundColor: '#f9fafb' },
                      p: 1
                    }}
                  >
                    {expandedDept === dept._id ? '▼' : '▶'} {dept.name}
                  </Button>

                  {expandedDept === dept._id && employees[dept._id] && (
                    <Box sx={{ pl: 2, mt: 0.5 }}>
                      {employees[dept._id].map(emp => (
                        <FormControlLabel
                          key={emp._id}
                          control={
                            <Checkbox
                              checked={selectedAssignees[emp._id] || false}
                              onChange={() => handleAssigneeToggle(emp._id)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ fontSize: '12px' }}>
                              {emp.name}
                              <Typography variant="caption" sx={{ display: 'block', color: '#9ca3af', fontSize: '11px' }}>
                                {emp.jobTitle}
                              </Typography>
                            </Typography>
                          }
                          sx={{ display: 'block', mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Panel: Task Creation */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontSize: '14px', fontWeight: 600 }}>
              Create Tasks
            </Typography>

            {/* Task Input Form */}
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f9fafb', border: '1px solid #e0e0e0' }}>
              <TextField
                fullWidth
                label="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                size="small"
                margin="normal"
                placeholder="Enter task title"
              />

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Project</InputLabel>
                <Select
                  value={newTask.project}
                  onChange={(e) => setNewTask(prev => ({ ...prev, project: e.target.value }))}
                  label="Project"
                >
                  {projects.map(proj => (
                    <MenuItem key={proj._id} value={proj.name}>
                      {proj.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                  label="Priority"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="date"
                label="Due Date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                size="small"
                margin="normal"
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleAddTask}
                sx={{ mt: 2, backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' } }}
              >
                + Add Task
              </Button>
            </Paper>

            {/* Tasks List */}
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Tasks ({tasks.length})
            </Typography>
            <Box sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
              {tasks.length === 0 ? (
                <Typography variant="body2" sx={{ p: 2, color: '#9ca3af', textAlign: 'center' }}>
                  No tasks added yet
                </Typography>
              ) : (
                tasks.map(task => (
                  <Paper
                    key={task.id}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      mx: 1,
                      mt: 1,
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '12px' }}>
                        {task.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', fontSize: '11px' }}>
                        {task.project} • {task.priority} • Due: {task.dueDate}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => handleRemoveTask(task.id)}
                      sx={{ minWidth: 'auto', p: 0.5, color: '#ef4444' }}
                    >
                      <XIcon size={16} />
                    </Button>
                  </Paper>
                ))
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreateTasks}
          disabled={isSubmitting || selectedCount === 0 || tasks.length === 0}
          sx={{ backgroundColor: '#5b7cfa', '&:hover': { backgroundColor: '#4c63d2' } }}
        >
          {isSubmitting ? 'Creating...' : `Create Tasks (${tasks.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkTaskAssignmentModal;
