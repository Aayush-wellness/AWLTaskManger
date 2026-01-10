import { useMemo, useState, useCallback } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { ViewList, Timeline } from '@mui/icons-material';
import axios from '../../config/axios';
import toast from '../../utils/toast';
import useProjects from '../../hooks/useProjects';
import GanttChart from '../ganttChart';
import EditTaskModal from './EditTaskModal';
import AddTaskPanelModal from './AddTaskPanelModal';

const PersonalTaskPanel = ({ row, onRefresh }) => {
    const { projects, refetchProjects } = useProjects();
  const [viewMode, setViewMode] = useState('table'); // for Gantt-Charts
  const [taskEditModalOpen, setTaskEditModalOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [editingTaskData, setEditingTaskData] = useState({
    taskName: '',
    project: '',
    startDate: '',
    endDate: '',
    remark: '',
    status: 'pending'
  });
  const [addTaskData, setAddTaskData] = useState({
    taskName: '',
    project: '',
    startDate: '',
    endDate: '',
    remark: '',
    status: 'pending'
  });

  // Refetch projects when modals open
  const handleAddTaskClick = useCallback(() => {
    refetchProjects();
    setAddTaskData({
      taskName: '',
      project: '',
      startDate: '',
      endDate: '',
      remark: '',
      status: 'pending'
    });
    setAddTaskModalOpen(true);
  }, [refetchProjects]);

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
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/users/delete-task/${taskId}`);
        if (onRefresh) await onRefresh();
        toast.success('Task deleted successfully!');
      } catch (error) {
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
    return transformToDhtmlxTasks(row.original.tasks || []);
  }, [row.original.tasks]);

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
        Cell: ({ cell }) => cell.getValue() ? cell.getValue() : 'Pending',
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
                onClick={() => handleDeleteTask(taskRow.original.id)}
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
    [handleEditTask, handleDeleteTask],
  );

  const taskTable = useMaterialReactTable({
    columns: taskColumns,
    data: row.original.tasks || [],
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



  // Save new task
  const handleSaveNewTaskFromPanel = useCallback(async () => {
    if (!addTaskData.taskName.trim() || !addTaskData.project.trim()) {
      toast.warning('Please fill in required fields (Task Name and Project)');
      return;
    }

    try {
      const newTask = {
        taskName: addTaskData.taskName,
        project: addTaskData.project,
        startDate: addTaskData.startDate || new Date().toISOString().split('T')[0],
        endDate: addTaskData.endDate,
        remark: addTaskData.remark || 'Personal task',
        status: addTaskData.status
      };

      await axios.post('/api/users/add-task', newTask);
      if (onRefresh) await onRefresh();
      setAddTaskModalOpen(false);
      setAddTaskData({
        taskName: '',
        project: '',
        startDate: '',
        endDate: '',
        remark: '',
        status: 'pending'
      });
      toast.success('New task added successfully!');
    } catch (error) {
      toast.error('Failed to create task: ' + (error.response?.data?.message || error.message));
    }
  }, [addTaskData, onRefresh]);

  return (
    <>
      <div className="task-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h4>My Tasks ({row.original.tasks?.length || 0})</h4>
          
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
        </div>
        
        {viewMode === 'table' && (
          <button
            onClick={handleAddTaskClick}
            className="btn-sm btn-success"
            title="Add New Task"
          >
            Quick Add
          </button>
        )}
      </div>

      {viewMode === 'table' ? (
        <MaterialReactTable table={taskTable} />
      ) : (
        <GanttChart 
          ganttTasks={ganttTasks}
          ganttLinks={ganttLinks}
        />
      )}

      <EditTaskModal
        isOpen={taskEditModalOpen}
        formData={editingTaskData}
        onFormChange={(field, value) => setEditingTaskData(prev => ({ ...prev, [field]: value }))}
        onSave={handleSaveTaskEdit}
        onCancel={() => setTaskEditModalOpen(false)}
        projects={projects}
      />

      <AddTaskPanelModal
        isOpen={addTaskModalOpen}
        formData={addTaskData}
        onFormChange={(field, value) => setAddTaskData(prev => ({ ...prev, [field]: value }))}
        onSave={handleSaveNewTaskFromPanel}
        onCancel={() => setAddTaskModalOpen(false)}
        projects={projects}
      />
    </>
  );
};

export default PersonalTaskPanel;
