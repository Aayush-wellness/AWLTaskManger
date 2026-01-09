import { useMemo, useState, useCallback } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from '../../config/axios';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import { useAuth } from '../../context/AuthContext';

const EmployeeDetailPanel = ({ row, onUpdateEmployee, fetchDepartmentEmployees }) => {

    const { user: currentUser } = useAuth();
    const currentUserName = currentUser?.name || '';
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
        // Use id if available, otherwise use _id (MongoDB's default)
        const taskId = taskData.id || (taskData._id ? taskData._id.toString() : null);

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

            const updatedTasks = [...(row.original.tasks || []), newTask];

            console.log('=== TASK ASSIGNMENT DEBUG ===');
            console.log('Current User (Sender):', currentUser?.id, currentUser?.name);
            console.log('Employee ID (Receiver):', row.original.id, row.original.firstName, row.original.lastName);
            console.log('New task being added:', newTask);
            
            // Add task to employee
            await axios.put(`/api/users/${row.original.id}`, { tasks: updatedTasks });

            // Create notification for the employee
            try {
                console.log('Creating notification for recipient:', row.original.id);
                await axios.post('/api/notifications/create', {
                    recipientId: row.original.id,
                    taskName: newTask.taskName,
                    assignedBy: newTask.AssignedBy,
                    projectName: newTask.project,
                    dueDate: newTask.endDate
                });
                console.log('Notification created successfully for:', row.original.id);
            } catch (notifError) {
                console.error('Error creating notification:', notifError);
                // Don't fail the task creation if notification fails
            }

            alert('New task added successfully!');
            console.log('New task added:', newTask);

            row.original.tasks = updatedTasks;

            if (fetchDepartmentEmployees) {
                await fetchDepartmentEmployees();
            }
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
    }, [addTaskData, row, fetchDepartmentEmployees, currentUser]);

    // SAVE TASK EDIT action
    const handleSaveTaskEdit = useCallback(async () => {
        if (!editingTaskData.taskName.trim() || !editingTaskData.project.trim()) {
            alert('Please fill in required fields (Task and Project)');
            return;
        }

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

            alert('Task updated successfully!');

            const updatedTasks = row.original.tasks.map(task => {
                // Compare both id and _id (convert _id to string for comparison)
                const taskId = task.id || (task._id ? task._id.toString() : null);
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
            row.original.tasks = updatedTasks;

            if (fetchDepartmentEmployees) {
                await fetchDepartmentEmployees();
            }
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
    }, [editingTaskData, row, fetchDepartmentEmployees]);

    // DELETE action for detail panel
    const openDeleteDetailConfirmModal = useCallback(async (detailRow) => {
        if (window.confirm(`Are you sure you want to delete this task?`)) {
            try {
                // Get the task ID to delete (handle both id and _id)
                const taskToDeleteId = detailRow.original.id || (detailRow.original._id ? detailRow.original._id.toString() : null);

                const updatedTasks = row.original.tasks.filter(task => {
                    const taskId = task.id || (task._id ? task._id.toString() : null);
                    return taskId !== taskToDeleteId;
                });

                await axios.put(`/api/users/${row.original.id}`, { tasks: updatedTasks });

                alert('Task deleted successfully!');
                console.log('Task deleted:', detailRow.original);

                row.original.tasks = updatedTasks;

                if (fetchDepartmentEmployees) {
                    await fetchDepartmentEmployees();
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
            }
        }
    }, [row, fetchDepartmentEmployees]);

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
        enableFiltersToggle: false,
        enableTopToolbar: false,
        enableBottomToolbar: false,
        enableStickyHeader: true,
        enableRowSelection: false,
        enableExpandAll: false,
        enableExpanding: false,
        enableRowActions: false,

        // ADD THIS CONFIGURATION FOR STICKY HEADER
        muiTableContainerProps: {
            sx: {
                maxHeight: '200px', // Must match your outer container's maxHeight
                // overflow: 'auto', // Enable scrolling within the table container itself
            }
        },

        // ADD THIS TO STYLE THE STICKY HEADER
        muiTableHeadCellProps: {
            sx: {
                fontWeight: 'bold',
                backgroundColor: '#f3f4f6', // Light gray background for header
                position: 'sticky',
                top: 0,
                zIndex: 1, // Ensure header stays above scrolling content
                borderBottom: '2px solid #e5e7eb', // Visual separation
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
                color:'white'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <h4 style={{ margin: 0 }}>My Tasks ({row.original.tasks?.length || 0})</h4>
                    <button
                        onClick={handleAddTask}
                        style={{
                            padding: '6px 12px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        + Add Task
                    </button>
                </div>
                <div style={{
                    maxHeight: '290px', // This sets the maximum height of the visible area
                    // overflowY: 'auto', // This enables vertical scrolling when content exceeds maxHeight
                    // overflowX: 'auto', // This enables horizontal scrolling if the table is too wide
                    border: '1px solid #e5e7eb', // Optional: adds a subtle border around the scrollable area
                    borderRadius: '4px', // Optional: rounds the corners slightly
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

export default EmployeeDetailPanel;
