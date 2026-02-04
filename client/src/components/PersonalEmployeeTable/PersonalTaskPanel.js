import { useMemo, useState, useCallback, useEffect } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { ViewList, Timeline } from '@mui/icons-material';
import axios from '../../config/axios';
import toast from '../../utils/toast';
import useProjects from '../../hooks/useProjects';
import { useAuth } from '../../context/AuthContext';
import GanttChart from '../ganttChart';
import EditTaskModal from './EditTaskModal';

const PersonalTaskPanel = ({ row, onRefresh }) => {
    const { user: currentUser } = useAuth();
    const { projects } = useProjects();
  const [viewMode, setViewMode] = useState('table'); // for Gantt-Charts
  const [taskTab, setTaskTab] = useState('my-tasks'); // 'my-tasks' or 'assigned-tasks'
  const [taskEditModalOpen, setTaskEditModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedTaskForNotes, setSelectedTaskForNotes] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedByFilter, setAssignedByFilter] = useState('all');
  const [assignedTaskStatusFilter, setAssignedTaskStatusFilter] = useState('all');
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loadingAssignedTasks, setLoadingAssignedTasks] = useState(false);
  const [localTasks, setLocalTasks] = useState(row.original.tasks || []);
  const [editingTaskData, setEditingTaskData] = useState({
    taskName: '',
    project: '',
    startDate: '',
    endDate: '',
    remark: '',
    status: 'pending'
  });

  // Update local tasks when row data changes
  useEffect(() => {
    setLocalTasks(row.original.tasks || []);
  }, [row.original.tasks]);

  // Fetch tasks assigned by current user to others
  const fetchAssignedTasks = useCallback(async () => {
    try {
      setLoadingAssignedTasks(true);
      const response = await axios.get('/api/users/assigned-tasks');
      setAssignedTasks(response.data.tasks || []);
      console.log('Assigned tasks fetched:', response.data.tasks?.length);
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
      toast.error('Failed to fetch assigned tasks');
      setAssignedTasks([]);
    } finally {
      setLoadingAssignedTasks(false);
    }
  }, []);

  // Load assigned tasks when switching to that tab
  useEffect(() => {
    if (taskTab === 'assigned-tasks' && assignedTasks.length === 0) {
      fetchAssignedTasks();
    }
  }, [taskTab, fetchAssignedTasks, assignedTasks.length]);

  // Handle opening notes modal
  const handleOpenNotesModal = useCallback((task) => {
    setSelectedTaskForNotes(task);
    setNewNote('');
    setNotesModalOpen(true);
  }, []);

  // Handle adding a note
  const handleAddNote = useCallback(async () => {
    if (!newNote.trim()) {
      toast.warning('Please enter a note');
      return;
    }

    try {
      const taskId = selectedTaskForNotes.id;
      const noteId = Date.now().toString();
      const userId = currentUser?.id;

      if (!userId) {
        toast.error('Error: User ID not found');
        return;
      }
      
      // Find the task and add note
      const updatedTasks = localTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            notes: [
              ...(task.notes || []),
              {
                id: noteId,
                content: newNote,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ]
          };
        }
        return task;
      });

      // Update user with new notes using current user's ID
      await axios.put(`/api/users/${userId}`, { tasks: updatedTasks });
      
      // Update local state - get the updated task
      const updatedTask = updatedTasks.find(t => t.id === taskId);
      
      // Update both local state and row data
      setLocalTasks(updatedTasks);
      row.original.tasks = updatedTasks;
      
      // Update selected task with new notes - this is crucial for UI display
      setSelectedTaskForNotes(updatedTask);
      
      setNewNote('');
      toast.success('Note added successfully!');
      
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note: ' + (error.response?.data?.message || error.message));
    }
  }, [newNote, selectedTaskForNotes, localTasks, onRefresh, currentUser, row]);

  // Handle deleting a note
  const handleDeleteNote = useCallback(async (noteId) => {
    if (!window.confirm('Delete this note?')) {
      return;
    }

    try {
      const taskId = selectedTaskForNotes.id;
      const userId = currentUser?.id;

      if (!userId) {
        toast.error('Error: User ID not found');
        return;
      }
      
      // Find the task and remove note
      const updatedTasks = localTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            notes: (task.notes || []).filter(note => note.id !== noteId)
          };
        }
        return task;
      });

      // Update user using current user's ID
      await axios.put(`/api/users/${userId}`, { tasks: updatedTasks });
      
      // Update local state - get the updated task
      const updatedTask = updatedTasks.find(t => t.id === taskId);
      
      // Update both local state and row data
      setLocalTasks(updatedTasks);
      row.original.tasks = updatedTasks;
      
      // Update selected task with new notes - this is crucial for UI display
      setSelectedTaskForNotes(updatedTask);
      
      toast.success('Note deleted successfully!');
      
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  }, [selectedTaskForNotes, localTasks, onRefresh, currentUser, row]);

  // Handle editing a note
  const handleEditNote = useCallback((noteId, content) => {
    setEditingNoteId(noteId);
    setEditingNoteContent(content);
  }, []);

  // Handle saving edited note
  const handleSaveEditedNote = useCallback(async () => {
    if (!editingNoteContent.trim()) {
      toast.warning('Please enter note content');
      return;
    }

    try {
      const taskId = selectedTaskForNotes.id;
      const userId = currentUser?.id;

      if (!userId) {
        toast.error('Error: User ID not found');
        return;
      }
      
      // Find the task and update the note
      const updatedTasks = localTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            notes: (task.notes || []).map(note => 
              note.id === editingNoteId 
                ? {
                    ...note,
                    content: editingNoteContent,
                    updatedAt: new Date()
                  }
                : note
            )
          };
        }
        return task;
      });

      // Update user using current user's ID
      await axios.put(`/api/users/${userId}`, { tasks: updatedTasks });
      
      // Update local state - get the updated task
      const updatedTask = updatedTasks.find(t => t.id === taskId);
      
      // Update both local state and row data
      setLocalTasks(updatedTasks);
      row.original.tasks = updatedTasks;
      
      // Update selected task with new notes
      setSelectedTaskForNotes(updatedTask);
      
      // Clear editing state
      setEditingNoteId(null);
      setEditingNoteContent('');
      
      toast.success('Note updated successfully!');
      
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  }, [editingNoteId, editingNoteContent, selectedTaskForNotes, localTasks, onRefresh, currentUser, row]);

  // Handle canceling note edit
  const handleCancelEditNote = useCallback(() => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  }, []);

  // Handle removing completed task from the list
  const handleRemoveCompletedTask = useCallback(async (task) => {
    if (!window.confirm(`Remove "${task.taskName}" from the list?\n\nNote: This will delete the task from ${task.assignedToName}'s task list.`)) {
      return;
    }

    try {
      const taskId = task._id || task.id;
      const employeeId = task.assignedToId;

      if (!taskId || !employeeId) {
        toast.error('Error: Missing task or employee information');
        return;
      }

      // Delete the task from the employee's task list
      await axios.delete(`/api/users/${employeeId}/delete-task/${taskId}`);
      
      // Remove from local state
      setAssignedTasks(prev => prev.filter(t => (t._id || t.id) !== taskId));
      
      toast.success(`Task "${task.taskName}" removed successfully!`);
      
      // Optionally refresh the list
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Error removing task:', error);
      toast.error('Failed to remove task: ' + (error.response?.data?.message || error.message));
    }
  }, [onRefresh]);

  // Handle edit task
  const handleEditTask = useCallback((task) => {
    setEditingTaskData({
      id: task.id,
      taskName: task.taskName || '',
      project: task.project || '',
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      remark: task.remark || '',
      status: task.status || 'pending'
    });
    setTaskEditModalOpen(true);
  }, []);

  // Save task edit
  const handleSaveTaskEdit = useCallback(async () => {
    try {
      await axios.put(`/api/users/update-task/${editingTaskData.id}`, editingTaskData);
      if (onRefresh) await onRefresh();
      setTaskEditModalOpen(false);
      toast.success('Task updated successfully!');
    } catch (error) {
      toast.error('Failed to update task: ' + (error.response?.data?.message || error.message));
    }
  }, [editingTaskData, onRefresh]);

  // Delete task
  const handleDeleteTask = useCallback(async (taskId) => {
    console.log('Attempting to delete task with ID:', taskId);
    console.log('Task ID type:', typeof taskId);
    
    if (!taskId) {
      toast.error('Error: Task ID is missing');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        console.log('Making delete request to:', `/api/users/delete-task/${taskId}`);
        await axios.delete(`/api/users/delete-task/${taskId}`);
        if (onRefresh) await onRefresh();
        toast.success('Task deleted successfully!');
      } catch (error) {
        console.error('Delete task error:', error);
        toast.error('Failed to delete task: ' + (error.response?.data?.message || error.message));
      }
    }
  }, [onRefresh]);

  // Transform tasks to Gantt format
  const transformToDhtmlxTasks = (personalTasks) => {
    if (!personalTasks) return { tasks: [], links: [] };

    const calculateDuration = (start, end) => {
      if (!start || !end) return 1;
      const startDate = new Date(start);
      const endDate = new Date(end);
      return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    };

    const tasks = personalTasks.map(task => ({
      id: task.id,
      text: task.taskName,
      start_date: task.startDate,
      end_date: task.endDate,
      duration: calculateDuration(task.startDate, task.endDate),
      progress: task.status === 'completed' ? 1 : task.status === 'in-progress' ? 0.5 : 0,
      type: "task",
      status: task.status
    }));

    return { tasks, links: [] };
  };

  const { tasks: ganttTasks, links: ganttLinks } = useMemo(() => {
    return transformToDhtmlxTasks(localTasks || []);
  }, [localTasks]);

  // Get unique assignedBy values for filter dropdown
  const uniqueAssignedBy = useMemo(() => {
    const assignedBySet = new Set();
    localTasks.forEach(task => {
      if (task.AssignedBy) {
        assignedBySet.add(task.AssignedBy);
      }
    });
    return Array.from(assignedBySet).sort();
  }, [localTasks]);

  // Filter tasks based on status and assignedBy
  const filteredTasks = useMemo(() => {
    let tasks = localTasks || [];
    
    // Debug: Log task structure
    if (tasks.length > 0) {
      console.log('Sample task structure:', tasks[0]);
      console.log('Task IDs:', tasks.map(t => ({ id: t.id, _id: t._id, taskName: t.taskName })));
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      tasks = tasks.filter(task => task.status === statusFilter);
    }
    
    // Filter by assignedBy
    if (assignedByFilter !== 'all') {
      tasks = tasks.filter(task => task.AssignedBy === assignedByFilter);
    }
    
    return tasks;
  }, [localTasks, statusFilter, assignedByFilter]);

  // Get tasks assigned by current user to others (for tracking)
  const allAssignedTasks = useMemo(() => {
    return assignedTasks || [];
  }, [assignedTasks]);

  // Filter assigned tasks by status
  const filteredAssignedTasks = useMemo(() => {
    let tasks = allAssignedTasks || [];
    
    if (assignedTaskStatusFilter !== 'all') {
      tasks = tasks.filter(task => task.status === assignedTaskStatusFilter);
    }
    
    return tasks;
  }, [allAssignedTasks, assignedTaskStatusFilter]);

  // Task columns
  const taskColumns = useMemo(
    () => [
      {
        accessorKey: 'taskName',
        header: 'Task',
        size: 150,
      },
      {
        accessorKey: 'project',
        header: 'Project',
        size: 150,
      },
      {
        accessorKey: 'AssignedBy',
        header: 'Assigned By',
        size: 130,
        Cell: ({ cell }) => cell.getValue() || 'N/A',
      },
      {
        accessorFn: (row) => new Date(row.startDate),
        id: 'startDate',
        header: 'Start Date',
        Cell: ({ cell }) => cell.getValue()?.toLocaleDateString(),
        size: 120,
      },
      {
        accessorFn: (row) => row.endDate ? new Date(row.endDate) : null,
        id: 'endDate',
        header: 'End Date',
        Cell: ({ cell }) => cell.getValue()?.toLocaleDateString() || 'N/A',
        size: 120,
      },
      {
        accessorKey: 'remark',
        header: 'Remark',
        size: 200,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        Cell: ({ cell }) => {
          const status = cell.getValue() || 'pending';
          const statusConfig = {
            'pending': { bg: '#fef3c7', color: '#92400e', label: 'Pending', icon: '⏳' },
            'in-progress': { bg: '#dbeafe', color: '#1e40af', label: 'In Progress', icon: '🔄' },
            'completed': { bg: '#dcfce7', color: '#166534', label: 'Completed', icon: '✅' },
            'blocked': { bg: '#fee2e2', color: '#991b1b', label: 'Blocked', icon: '🚫' }
          };
          const config = statusConfig[status.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280', label: status, icon: '❓' };
          return (
            <span style={{
              backgroundColor: config.bg,
              color: config.color,
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'capitalize',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>{config.icon}</span>
              {config.label}
            </span>
          );
        },
      },
      {
        id: 'notes',
        header: 'Notes',
        size: 100,
        enableSorting: false,
        Cell: ({ row: taskRow }) => {
          // Get notes count from localTasks to ensure it's up to date
          const currentTask = localTasks.find(t => t.id === taskRow.original.id);
          const notesCount = (currentTask?.notes || []).length;
          return (
            <Tooltip title={`${notesCount} note${notesCount !== 1 ? 's' : ''}`}>
              <IconButton
                onClick={() => handleOpenNotesModal(currentTask || taskRow.original)}
                size="small"
                sx={{
                  color: notesCount > 0 ? '#5b7cfa' : '#cbd5e1',
                  backgroundColor: notesCount > 0 ? '#eff6ff' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#dbeafe'
                  }
                }}
              >
                📝 {notesCount}
              </IconButton>
            </Tooltip>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 100,
        enableEditing: false,
        enableSorting: false,
        Cell: ({ row: taskRow }) => (
          <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Tooltip title="Edit">
              <IconButton
                onClick={() => handleEditTask(taskRow.original)}
                size="small"
                sx={{
                  color: '#5b7cfa',
                  '&:hover': {
                    backgroundColor: 'rgba(91, 124, 250, 0.1)'
                  }
                }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                onClick={() => {
                  const taskId = taskRow.original.id || taskRow.original._id;
                  console.log('Delete button clicked for task:', taskRow.original);
                  console.log('Using task ID:', taskId);
                  handleDeleteTask(taskId);
                }}
                size="small"
                sx={{
                  color: '#ef4444',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)'
                  }
                }}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [handleEditTask, handleDeleteTask, handleOpenNotesModal, localTasks],
  );

  const taskTable = useMaterialReactTable({
    columns: taskColumns,
    data: filteredTasks,
    enableEditing: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableSorting: false,
    enableToolbarInternalActions: false,
    enableGlobalFilter: false,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableRowSelection: false,
    enableRowActions: false,
  });

  // Assigned Tasks Columns
  const assignedTasksColumns = useMemo(
    () => [
      {
        accessorKey: 'assignedToName',
        header: 'Employee',
        size: 200,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${getAvatarColor(row.original.assignedToName)} 0%, ${getAvatarColor(row.original.assignedToName)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '16px'
            }}>
              {row.original.assignedToName?.charAt(0).toUpperCase() || 'U'}
            </Box>
            <Box>
              <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                {row.original.assignedToName || 'Unknown'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {row.original.assignedToJobTitle || 'Employee'}
              </div>
            </Box>
          </Box>
        ),
      },
      {
        accessorKey: 'taskName',
        header: 'Task',
        size: 180,
        Cell: ({ cell }) => (
          <span style={{ fontWeight: 500, color: '#334155' }}>
            {cell.getValue() || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'project',
        header: 'Project',
        size: 150,
        Cell: ({ cell }) => (
          <span style={{
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500
          }}>
            {cell.getValue() || 'No Project'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        Cell: ({ cell }) => {
          const status = cell.getValue() || 'pending';
          const statusConfig = {
            'pending': { bg: '#fef3c7', color: '#92400e', label: 'Pending', icon: '⏳' },
            'in-progress': { bg: '#dbeafe', color: '#1e40af', label: 'In Progress', icon: '🔄' },
            'completed': { bg: '#dcfce7', color: '#166534', label: 'Completed', icon: '✅' },
            'blocked': { bg: '#fee2e2', color: '#991b1b', label: 'Blocked', icon: '🚫' }
          };
          const config = statusConfig[status.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280', label: status, icon: '❓' };
          return (
            <span style={{
              backgroundColor: config.bg,
              color: config.color,
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>{config.icon}</span>
              {config.label}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row.endDate ? new Date(row.endDate) : null,
        id: 'endDate',
        header: 'Due Date',
        size: 130,
        Cell: ({ cell }) => {
          const date = cell.getValue();
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <span style={{ fontSize: '14px' }}>📅</span>
              <span style={{ fontSize: '13px' }}>
                {date ? date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'No date'}
              </span>
            </Box>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 100,
        enableSorting: false,
        Cell: ({ row }) => {
          const task = row.original;
          const isCompleted = task.status === 'completed';
          
          if (!isCompleted) {
            return (
              <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                In progress
              </span>
            );
          }
          
          return (
            <Tooltip title="Remove completed task from list">
              <IconButton
                onClick={() => handleRemoveCompletedTask(task)}
                size="small"
                sx={{
                  color: '#ef4444',
                  backgroundColor: '#fee2e2',
                  '&:hover': {
                    backgroundColor: '#fecaca',
                    color: '#dc2626'
                  },
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 600
                }}
              >
                <Delete sx={{ fontSize: '16px', mr: 0.5 }} />
                Remove
              </IconButton>
            </Tooltip>
          );
        },
      },
    ],
    [handleRemoveCompletedTask],
  );

  // Helper function for avatar colors
  const getAvatarColor = (name) => {
    const colors = [
      '#f97316', // orange
      '#3b82f6', // blue
      '#10b981', // green
      '#8b5cf6', // purple
      '#f59e0b', // amber
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const assignedTasksTable = useMaterialReactTable({
    columns: assignedTasksColumns,
    data: filteredAssignedTasks,
    enableEditing: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: true,
    enableSorting: true,
    enableToolbarInternalActions: false,
    enableGlobalFilter: false,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableTopToolbar: false,
    enableBottomToolbar: true,
    enableRowSelection: false,
    enableRowActions: false,
    muiTablePaperProps: {
      sx: {
        boxShadow: 'none',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
      }
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: '#f9fafb',
        fontWeight: 600,
        fontSize: '13px',
        color: '#6b7280',
        borderBottom: '1px solid #e5e7eb',
      }
    },
    muiTableBodyRowProps: {
      sx: {
        '&:hover': {
          backgroundColor: '#f9fafb',
        },
      }
    },
    muiTableBodyCellProps: {
      sx: {
        borderBottom: '1px solid #f3f4f6',
        padding: '16px',
      }
    },
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
    },
  });

  return (
    <>
      <div className="task-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Task Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            backgroundColor: '#f3f4f6',
            padding: '4px',
            borderRadius: '6px'
          }}>
            <button
              onClick={() => {
                setTaskTab('my-tasks');
                setStatusFilter('all');
                setAssignedByFilter('all');
              }}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: taskTab === 'my-tasks' ? '#5b7cfa' : 'transparent',
                color: taskTab === 'my-tasks' ? 'white' : '#6b7280',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              📋 My Tasks
            </button>
            <button
              onClick={() => {
                setTaskTab('assigned-tasks');
                setAssignedTaskStatusFilter('all');
                fetchAssignedTasks(); // Fetch assigned tasks when switching to this tab
              }}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: taskTab === 'assigned-tasks' ? '#5b7cfa' : 'transparent',
                color: taskTab === 'assigned-tasks' ? 'white' : '#6b7280',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              👥 Track Assigned Tasks
            </button>
          </div>

          {taskTab === 'my-tasks' && (
            <>
              <h4>My Tasks ({filteredTasks.length} of {localTasks?.length || 0})</h4>
              
              {/* Filter Section */}
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                flexWrap: 'wrap'
              }}>
            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  color: '#374151'
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Assigned By Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>Assigned By:</label>
              <select
                value={assignedByFilter}
                onChange={(e) => setAssignedByFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  color: '#374151'
                }}
              >
                <option value="all">All Assigners</option>
                {uniqueAssignedBy.map(assignedBy => (
                  <option key={assignedBy} value={assignedBy}>
                    {assignedBy}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters Button */}
            {(statusFilter !== 'all' || assignedByFilter !== 'all') && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setAssignedByFilter('all');
                }}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {taskTab === 'my-tasks' && (
            <div style={{
              display: 'flex',
              gap: '8px',
              backgroundColor: '#f3f4f6',
              padding: '4px',
              borderRadius: '6px'
            }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  background: viewMode === 'table' ? '#5b7cfa' : 'transparent',
                  color: viewMode === 'table' ? 'white' : '#6b7280',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                <ViewList fontSize="small" />
                Table View
              </button>
              <button
                onClick={() => setViewMode('gantt')}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  background: viewMode === 'gantt' ? '#5b7cfa' : 'transparent',
                  color: viewMode === 'gantt' ? 'white' : '#6b7280',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                <Timeline fontSize="small" />
                Gantt Chart
              </button>
            </div>
          )}
            </>
          )}

          {taskTab === 'assigned-tasks' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              flexWrap: 'wrap'
            }}>
              <h4 style={{ margin: 0 }}>Assigned Tasks ({filteredAssignedTasks.length} of {allAssignedTasks.length})</h4>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>Status:</label>
              <select
                value={assignedTaskStatusFilter}
                onChange={(e) => setAssignedTaskStatusFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  color: '#374151'
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              {assignedTaskStatusFilter !== 'all' && (
                <button
                  onClick={() => setAssignedTaskStatusFilter('all')}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '13px',
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  Clear Filter
                </button>
              )}
              <button
                onClick={fetchAssignedTasks}
                disabled={loadingAssignedTasks}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: '#5b7cfa',
                  color: 'white',
                  cursor: loadingAssignedTasks ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  opacity: loadingAssignedTasks ? 0.6 : 1
                }}
              >
                {loadingAssignedTasks ? '🔄 Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          )}
        </div>
      </div>

      {taskTab === 'my-tasks' ? (
        <>
          {viewMode === 'table' ? (
            <MaterialReactTable table={taskTable} />
          ) : (
            <GanttChart 
              ganttTasks={ganttTasks}
              ganttLinks={ganttLinks}
            />
          )}
        </>
      ) : (
        <div style={{
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          marginTop: '12px'
        }}>
          {loadingAssignedTasks ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
              <p style={{ color: '#6b7280', fontWeight: 500 }}>Loading assigned tasks...</p>
            </div>
          ) : filteredAssignedTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
              <h3 style={{ color: '#1f2937', marginBottom: '8px', fontWeight: 600 }}>
                {allAssignedTasks.length === 0 ? 'No Assigned Tasks' : 'No Tasks Match Filter'}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
                {allAssignedTasks.length === 0 
                  ? "You haven't assigned any tasks to team members yet. Assign tasks from the Employee Dashboard or Admin Panel." 
                  : "Try adjusting your filters to see more tasks."}
              </p>
              {allAssignedTasks.length === 0 && (
                <button
                  onClick={fetchAssignedTasks}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#5b7cfa',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  🔄 Refresh
                </button>
              )}
            </div>
          ) : (
            <MaterialReactTable table={assignedTasksTable} />
          )}
        </div>
      )}

      <EditTaskModal
        isOpen={taskEditModalOpen}
        formData={editingTaskData}
        onFormChange={(field, value) => setEditingTaskData(prev => ({ ...prev, [field]: value }))}
        onSave={handleSaveTaskEdit}
        onCancel={() => setTaskEditModalOpen(false)}
        projects={projects}
      />

      {/* Notes Modal */}
      {notesModalOpen && selectedTaskForNotes && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setNotesModalOpen(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '2px solid #f3f4f6'
            }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>
                📝 Notes for: {selectedTaskForNotes.taskName}
              </h3>
              <button
                onClick={() => setNotesModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
              >
                ✕
              </button>
            </div>

            {/* Add Note Section */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>
                Add New Note
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type your note here..."
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '80px',
                    color: '#334155'
                  }}
                />
              </div>
              <button
                onClick={handleAddNote}
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#5b7cfa',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                + Add Note
              </button>
            </div>

            {/* Notes List */}
            <div style={{
              borderTop: '2px solid #f3f4f6',
              paddingTop: '16px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
                All Notes ({(selectedTaskForNotes.notes || []).length})
              </h4>
              
              {(selectedTaskForNotes.notes || []).length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                  No notes yet. Add one above!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(selectedTaskForNotes.notes || []).map((note) => (
                    <div key={note.id} style={{
                      backgroundColor: editingNoteId === note.id ? '#eff6ff' : '#f8fafc',
                      border: editingNoteId === note.id ? '2px solid #5b7cfa' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                      position: 'relative'
                    }}>
                      {editingNoteId === note.id ? (
                        // Edit mode
                        <div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <span style={{
                              fontSize: '11px',
                              color: '#94a3b8',
                              fontWeight: 500
                            }}>
                              Editing note...
                            </span>
                          </div>
                          <textarea
                            value={editingNoteContent}
                            onChange={(e) => setEditingNoteContent(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontFamily: 'inherit',
                              resize: 'vertical',
                              minHeight: '80px',
                              color: '#334155',
                              marginBottom: '8px'
                            }}
                          />
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'flex-end'
                          }}>
                            <button
                              onClick={handleCancelEditNote}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#e5e7eb',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '12px',
                                transition: 'all 0.2s'
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEditedNote}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#5b7cfa',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '12px',
                                transition: 'all 0.2s'
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '8px'
                          }}>
                            <span style={{
                              fontSize: '11px',
                              color: '#94a3b8',
                              fontWeight: 500
                            }}>
                              {new Date(note.createdAt).toLocaleString()}
                              {note.updatedAt && note.updatedAt !== note.createdAt && (
                                <span style={{ marginLeft: '8px', fontStyle: 'italic' }}>
                                  (edited {new Date(note.updatedAt).toLocaleString()})
                                </span>
                              )}
                            </span>
                            <div style={{
                              display: 'flex',
                              gap: '6px'
                            }}>
                              <button
                                onClick={() => handleEditNote(note.id, note.content)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#5b7cfa',
                                  cursor: 'pointer',
                                  fontSize: '16px',
                                  padding: '0',
                                  transition: 'all 0.2s'
                                }}
                                title="Edit note"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  fontSize: '16px',
                                  padding: '0',
                                  transition: 'all 0.2s'
                                }}
                                title="Delete note"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <p style={{
                            margin: 0,
                            color: '#334155',
                            fontSize: '13px',
                            lineHeight: '1.5',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}>
                            {note.content}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonalTaskPanel;
