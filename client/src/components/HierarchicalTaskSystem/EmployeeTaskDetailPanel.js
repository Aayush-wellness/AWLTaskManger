import { useMemo, useState, useCallback } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, IconButton, Tooltip, Button } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from '../../config/axios';
import AddTaskModal from '../EmployeeTable/AddTaskModal';
import EditTaskModal from '../EmployeeTable/EditTaskModal';
import { useAuth } from '../../context/AuthContext';

const EmployeeTaskDetailPanel = ({ employee, onTasksUpdate }) => {
  const { user: currentUser } = useAuth();
  const currentUserName = currentUser?.name || '';
  const [tasks, setTasks] = useState(employee.tasks || []);
  const [taskEditModalOpen, setTaskEditModalOpen] = useState(false);
  const [editingTaskData, setEditingTaskData] = useState({
    taskName: '',
    project: '',
    AssignedBy: '',
    startDate: '',
    endDate: '',
    remark: '',
    status: 'pending'
  });
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [addTaskData, setAddTaskData] = useState({
    taskName: '',
    project: '',
    AssignedBy: '',
    startDate: '',
    endDate: '',
    remark: '',
    status: 'pending'
  });

  // EDIT action for detail panel
  const handleEditDetailTask = useCallback((detailRow) => {
    const taskData = detailRow.original;
    // Use _id (MongoDB ID) first, then id as fallback
    const taskId = taskData._id ? taskData._id.toString() : taskData.id;
    console.log('taskID::', taskId);
    if (!taskId) {
      alert('Error: Task ID not found');
      return;
    }

    setEditingTaskData({
      id: taskId,
      taskName: taskData.taskName || '',
      project: taskData.project || '',
      AssignedBy: taskData.AssignedBy || '',
      startDate: taskData.startDate || '',
      endDate: taskData.endDate || '',
      remark: taskData.remark || '',
      status: taskData.status || 'pending'
    });
    setTaskEditModalOpen(true);
  }, []);

  // TASK INPUT CHANGE handler
  const handleTaskInputChange = useCallback((field, value) => {
    setEditingTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // ADD TASK handlers
  const handleAddTask = useCallback(() => {
    setAddTaskData({
      taskName: '',
      project: '',
      AssignedBy: currentUserName,
      startDate: '',
      endDate: '',
      remark: '',
      status: 'pending'
    });
    setAddTaskModalOpen(true);
  }, [currentUserName]);

  const handleAddTaskInputChange = useCallback((field, value) => {
    setAddTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSaveNewTask = useCallback(async () => {
    if (!addTaskData.taskName.trim() || !addTaskData.project.trim()) {
      alert('Please fill in required fields (Task and Project)');
      return;
    }

    try {
      const newTask = {
        id: Date.now().toString(),
        taskName: addTaskData.taskName,
        project: addTaskData.project,
        AssignedBy: addTaskData.AssignedBy || '',
        startDate: addTaskData.startDate || '',
        endDate: addTaskData.endDate || '',
        remark: addTaskData.remark || '',
        status: addTaskData.status || 'pending'
      };

      const updatedTasks = [...tasks, newTask];

      // Add task to employee
      await axios.put(`/api/users/${employee._id}`, { tasks: updatedTasks });

      // Create notification for the employee
      try {
        await axios.post('/api/notifications/create', {
          recipientId: employee._id,
          taskName: newTask.taskName,
          assignedBy: newTask.AssignedBy,
          projectName: newTask.project,
          dueDate: newTask.endDate
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }

      setTasks(updatedTasks);
      onTasksUpdate(updatedTasks);
      alert('New task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task: ' + (error.response?.data?.message || error.message));
    }

    setAddTaskModalOpen(false);
    setAddTaskData({
      taskName: '',
      project: '',
      AssignedBy: '',
      startDate: '',
      endDate: '',
      remark: '',
      status: 'pending'
    });
  }, [addTaskData, tasks, employee.id, onTasksUpdate]);

  // SAVE TASK EDIT action
  const handleSaveTaskEdit = useCallback(async () => {
    if (!editingTaskData.taskName.trim() || !editingTaskData.project.trim()) {
      alert('Please fill in required fields (Task and Project)');
      return;
    }
         console.log('editing_id: ', editingTaskData?.id);
         
    try {
      await axios.put(`/api/users/update-task/${editingTaskData.id}`, {
        taskName: editingTaskData.taskName,
        project: editingTaskData.project,
        AssignedBy: editingTaskData.AssignedBy,
        startDate: editingTaskData.startDate,
        endDate: editingTaskData.endDate,
        remark: editingTaskData.remark,
        status: editingTaskData.status
      });

      const updatedTasks = tasks.map(task => {
        // Use _id (MongoDB ID) first, then id as fallback
        const taskId = task._id ? task._id.toString() : task.id;
        if (task && taskId === editingTaskData.id) {
          return {
            ...task,
            taskName: editingTaskData.taskName,
            project: editingTaskData.project,
            AssignedBy: editingTaskData.AssignedBy,
            startDate: editingTaskData.startDate,
            endDate: editingTaskData.endDate,
            remark: editingTaskData.remark,
            status: editingTaskData.status
          };
        }
        return task;
      });

      setTasks(updatedTasks);
      onTasksUpdate(updatedTasks);
      alert('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task: ' + (error.response?.data?.message || error.message));
    }

    setTaskEditModalOpen(false);
    setEditingTaskData({
      taskName: '',
      project: '',
      AssignedBy: '',
      startDate: '',
      endDate: '',
      remark: '',
      status: 'pending'
    });
  }, [editingTaskData, tasks, onTasksUpdate]);

  // DELETE action for detail panel
  const openDeleteDetailConfirmModal = useCallback(async (detailRow) => {
    if (window.confirm(`Are you sure you want to delete this task?`)) {
      try {
        // Use _id (MongoDB ID) first, then id as fallback
        const taskToDeleteId = detailRow.original._id ? detailRow.original._id.toString() : detailRow.original.id;

        const updatedTasks = tasks.filter(task => {
          const taskId = task._id ? task._id.toString() : task.id;
          return taskId !== taskToDeleteId;
        });

        await axios.put(`/api/users/${employee._id}`, { tasks: updatedTasks });

        setTasks(updatedTasks);
        onTasksUpdate(updatedTasks);
        alert('Task deleted successfully!');
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
      }
    }
  }, [tasks, employee._id, onTasksUpdate]);

  const detailColumns = useMemo(
    () => [
      {
        accessorKey: 'taskName',
        header: 'Task',
        size: 200,
      },
      {
        accessorKey: 'project',
        header: 'Project',
        size: 150,
      },
      {
        accessorKey: 'AssignedBy',
        header: 'Assigned By',
        size: 150,
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        size: 120,
        Cell: ({ cell }) => {
          const date = new Date(cell.getValue());
          return date.toLocaleDateString();
        },
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        size: 120,
        Cell: ({ cell }) => {
          const date = new Date(cell.getValue());
          return date.toLocaleDateString();
        },
      },
      {
        accessorKey: 'remark',
        header: 'Remark',
        size: 200,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const statusColors = {
            'pending': '#FFA500',
            'in-progress': '#007BFF',
            'completed': '#28A745',
            'blocked': '#DC3545'
          };
          return (
            <span style={{
              backgroundColor: statusColors[status] || '#ccc',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {status}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 100,
        Cell: ({ row: detailRow }) => (
          <Box sx={{ display: 'flex', gap: '0.5rem' }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => handleEditDetailTask(detailRow)}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => openDeleteDetailConfirmModal(detailRow)}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [handleEditDetailTask, openDeleteDetailConfirmModal]
  );

  const detailTable = useMaterialReactTable({
    columns: detailColumns,
    data: tasks || [],
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
    enableFiltersToggle: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableStickyHeader: true,
    enableRowSelection: false,
    enableExpandAll: false,
    enableExpanding: false,
    enableRowActions: false,
    muiTableContainerProps: {
      sx: {
        maxHeight: '300px',
      }
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 'bold',
        backgroundColor: '#f3f4f6',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        borderBottom: '2px solid #e5e7eb',
      }
    },
  });

  return (
    <>
      <div style={{
        padding: '16px',
        backgroundColor: '#97bcf3',
        borderRadius: '8px',
        marginTop: '8px',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h4 style={{ margin: 0 }}>Tasks ({tasks?.length || 0})</h4>
          <Button
            onClick={handleAddTask}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#28a745',
              '&:hover': {
                backgroundColor: '#218838'
              }
            }}
          >
            + Add Task
          </Button>
        </div>
        <div style={{
          maxHeight: '300px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          backgroundColor: '#ffffff'
        }}>
          <MaterialReactTable table={detailTable} />
        </div>
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={taskEditModalOpen}
        onClose={() => setTaskEditModalOpen(false)}
        formData={editingTaskData}
        onInputChange={handleTaskInputChange}
        onSave={handleSaveTaskEdit}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={addTaskModalOpen}
        onClose={() => setAddTaskModalOpen(false)}
        formData={addTaskData}
        onInputChange={handleAddTaskInputChange}
        onSave={handleSaveNewTask}
      />
    </>
  );
};

export default EmployeeTaskDetailPanel;
