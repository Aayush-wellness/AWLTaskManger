import { useMemo, useState, useCallback, useEffect } from 'react';

//MRT Imports
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

//Material UI Imports
import { Box, IconButton, Tooltip } from '@mui/material';

//Icons Imports
import { Edit, Delete } from '@mui/icons-material';

//Auth Context
import { useAuth } from '../context/AuthContext';

//Axios for API calls
import axios from '../config/axios';

//Avatar utility
import { getTableAvatarUrl } from '../utils/avatarUtils';

//Date Picker Imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

//React Query Imports
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

//XLSX for Excel file generation
import * as XLSX from 'xlsx';

const PersonalEmployeeTable = () => {
  const { user } = useAuth();
  const [validationErrors, setValidationErrors] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    jobTitle: '',
    startDate: ''
  });
  
  // Add Task Modal State
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [addTaskData, setAddTaskData] = useState({
    taskName: '',
    project: '',
    startDate: '',
    endDate: '',
    remark: ''
  });
  
  // State for personal data
  const [personalData, setPersonalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');

  // Fix task IDs if needed
  const fixTaskIds = useCallback(async () => {
    try {
      console.log('Fixing task IDs...');
      const response = await axios.post('/api/users/fix-task-ids');
      console.log('Task IDs fixed:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fixing task IDs:', error);
      return null;
    }
  }, []);

  // Fetch personal user data
  const fetchPersonalData = useCallback(async () => {
    if (!user) {
      console.log('User not available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching personal data for user:', user.id);
      
      // First, try to fix any task IDs that might be missing
      await fixTaskIds();
      
      // API call to get current user's data
      const response = await axios.get('/api/auth/me');
      
      console.log('Personal data response:', response.data);
      console.log('Tasks from API:', response.data.tasks);
      
      // Transform the data to match the expected format
      const transformedData = [{
        id: response.data.id,
        firstName: response.data.name ? response.data.name.split(' ')[0] : '',
        lastName: response.data.name ? response.data.name.split(' ').slice(1).join(' ') : '',
        email: response.data.email,
        jobTitle: response.data.jobTitle || 'Employee',
        department: response.data.department?.name || 'Unknown',
        startDate: response.data.startDate || response.data.createdAt,
        avatar: response.data.avatar,
        tasks: response.data.tasks || [],
        subRows: []
      }];
      
      console.log('Transformed personal data:', transformedData);
      setPersonalData(transformedData);
    } catch (error) {
      console.error('Error fetching personal data:', error);
      setError('Failed to load your personal data');
      setPersonalData([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, fixTaskIds]);

  // Fetch data when component mounts or user changes
  useEffect(() => {
    fetchPersonalData();
  }, [fetchPersonalData]);

  // Refresh when user profile changes
  useEffect(() => {
    if (user && user.avatar) {
      console.log('User profile changed, refreshing personal data...');
      fetchPersonalData();
    }
  }, [user?.avatar, user?.name, user?.jobTitle, fetchPersonalData]);

  // Filter data by month
  const filterDataByMonth = useCallback((data, month) => {
    if (!month || !data.length) return data;
    
    const filtered = data.map(employee => ({
      ...employee,
      tasks: (employee.tasks || []).filter(task => {
        if (!task.startDate) return false;
        const taskDate = new Date(task.startDate);
        const taskMonth = (taskDate.getMonth() + 1).toString().padStart(2, '0');
        return taskMonth === month;
      })
    }));
    
    return filtered;
  }, []);

  // Update filtered data when month changes
  useEffect(() => {
    const filtered = filterDataByMonth(personalData, selectedMonth);
    setFilteredData(filtered);
  }, [personalData, selectedMonth, filterDataByMonth]);

  // Excel download function
  const downloadExcel = useCallback(() => {
    try {
      if (!personalData.length || !personalData[0].tasks?.length) {
        alert('No tasks available to download');
        return;
      }

      const tasks = personalData[0].tasks || [];
      const filteredTasks = selectedMonth 
        ? tasks.filter(task => {
            if (!task.startDate) return false;
            const taskDate = new Date(task.startDate);
            const taskMonth = (taskDate.getMonth() + 1).toString().padStart(2, '0');
            return taskMonth === selectedMonth;
          })
        : tasks;

      if (!filteredTasks.length) {
        alert('No tasks found for the selected month');
        return;
      }

      // Create Excel workbook using SheetJS
      
      // Prepare data for Excel
      const excelData = filteredTasks.map(task => ({
        'Task Name': task.taskName || '',
        'Project': task.project || '',
        'Start Date': task.startDate ? new Date(task.startDate).toLocaleDateString() : '',
        'End Date': task.endDate ? new Date(task.endDate).toLocaleDateString() : '',
        'Remark': task.remark || ''
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 25 }, // Task Name
        { wch: 20 }, // Project
        { wch: 15 }, // Start Date
        { wch: 15 }, // End Date
        { wch: 30 }  // Remark
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      const monthName = selectedMonth 
        ? ['', 'January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December'][parseInt(selectedMonth)]
        : 'All_Tasks';
      
      XLSX.utils.book_append_sheet(workbook, worksheet, monthName);

      // Generate Excel file and download
      const fileName = `My_Tasks_${monthName}_${new Date().getFullYear()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      alert(`Downloaded ${filteredTasks.length} tasks successfully as Excel file!`);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      
      // Fallback to CSV if XLSX is not available
      console.log('XLSX library not found, falling back to CSV...');
      downloadCSVFallback();
    }
  }, [personalData, selectedMonth]);

  // Fallback CSV download function
  const downloadCSVFallback = useCallback(() => {
    try {
      const tasks = personalData[0].tasks || [];
      const filteredTasks = selectedMonth 
        ? tasks.filter(task => {
            if (!task.startDate) return false;
            const taskDate = new Date(task.startDate);
            const taskMonth = (taskDate.getMonth() + 1).toString().padStart(2, '0');
            return taskMonth === selectedMonth;
          })
        : tasks;

      // Create CSV content
      const headers = ['Task Name', 'Project', 'Start Date', 'End Date', 'Remark'];
      const csvContent = [
        headers.join(','),
        ...filteredTasks.map(task => [
          `"${task.taskName || ''}"`,
          `"${task.project || ''}"`,
          task.startDate ? new Date(task.startDate).toLocaleDateString() : '',
          task.endDate ? new Date(task.endDate).toLocaleDateString() : '',
          `"${task.remark || ''}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const monthName = selectedMonth 
        ? ['', 'January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December'][parseInt(selectedMonth)]
        : 'All';
      
      link.setAttribute('download', `My_Tasks_${monthName}_${new Date().getFullYear()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Downloaded ${filteredTasks.length} tasks as CSV file (Excel format not available)!`);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download tasks. Please try again.');
    }
  }, [personalData, selectedMonth]);

  // Listen for month filter changes
  useEffect(() => {
    const handleMonthFilter = (event) => {
      console.log('Month filter changed:', event.detail.month);
      setSelectedMonth(event.detail.month);
    };

    window.addEventListener('monthFilterChanged', handleMonthFilter);
    
    return () => {
      window.removeEventListener('monthFilterChanged', handleMonthFilter);
    };
  }, []);

  // Listen for Excel download requests
  useEffect(() => {
    const handleDownloadExcel = () => {
      console.log('Excel download requested');
      downloadExcel();
    };

    window.addEventListener('downloadExcel', handleDownloadExcel);
    
    return () => {
      window.removeEventListener('downloadExcel', handleDownloadExcel);
    };
  }, [downloadExcel]);

  //EDIT action for personal info
  const handleEditPersonal = useCallback(() => {
    if (personalData.length > 0) {
      const userData = personalData[0];
      setEditFormData({
        jobTitle: userData.jobTitle || '',
        startDate: userData.startDate ? userData.startDate.split('T')[0] : ''
      });
      setEditModalOpen(true);
    }
  }, [personalData]);

  //SAVE EDIT action
  const handleSaveEdit = useCallback(async () => {
    try {
      const formData = new FormData();
      
      // Add only editable fields
      if (editFormData.jobTitle) formData.append('jobTitle', editFormData.jobTitle);
      if (editFormData.startDate) formData.append('startDate', editFormData.startDate);

      const response = await axios.put('/api/users/profile', formData);
      
      console.log('Personal info updated:', response.data);
      
      // Refresh personal data
      await fetchPersonalData();
      
      // Trigger global refresh event for EmployeeTable
      window.dispatchEvent(new CustomEvent('employeeDataChanged'));
      
      setEditModalOpen(false);
      setEditFormData({
        jobTitle: '',
        startDate: ''
      });
      
      alert('Personal information updated successfully!');
    } catch (error) {
      console.error('Error updating personal info:', error);
      alert('Failed to update personal information: ' + (error.response?.data?.message || error.message));
    }
  }, [editFormData, fetchPersonalData]);

  //ADD TASK handlers
  const handleAddTask = useCallback(() => {
    setAddTaskData({
      taskName: '',
      project: '',
      startDate: '',
      endDate: '',
      remark: ''
    });
    setAddTaskModalOpen(true);
  }, []);

  const handleAddTaskInputChange = useCallback((field, value) => {
    setAddTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSaveNewTask = useCallback(async () => {
    // Basic validation
    if (!addTaskData.taskName.trim() || !addTaskData.project.trim()) {
      alert('Please fill in required fields (Task Name and Project)');
      return;
    }

    try {
      // Create new task object
      const newTask = {
        taskName: addTaskData.taskName,
        project: addTaskData.project,
        startDate: addTaskData.startDate || new Date().toISOString().split('T')[0],
        endDate: addTaskData.endDate,
        remark: addTaskData.remark || 'Personal task'
      };

      console.log('Creating new personal task:', newTask);

      // API call to add task to user's profile
      const response = await axios.post('/api/users/add-task', newTask);
      
      console.log('Task added:', response.data);

      // Refresh personal data
      await fetchPersonalData();

      // Trigger global refresh event for EmployeeTable
      window.dispatchEvent(new CustomEvent('employeeDataChanged'));

      // Close modal and reset form
      setAddTaskModalOpen(false);
      setAddTaskData({
        taskName: '',
        project: '',
        startDate: '',
        endDate: '',
        remark: ''
      });

      alert('New task added successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task: ' + (error.response?.data?.message || error.message));
    }
  }, [addTaskData, fetchPersonalData]);

  const columns = useMemo(
    () => [
      {
        id: 'employee',
        header: 'My Information',
        columns: [
          {
            accessorFn: (row) => `${row.firstName} ${row.lastName}`,
            id: 'name',
            header: 'Name',
            size: 250,
            enableEditing: false,
            Cell: ({ renderedCellValue, row }) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <img
                  alt="avatar"
                  height={30}
                  width={30}
                  src={getTableAvatarUrl(row.original.avatar, `${row.original.firstName} ${row.original.lastName}`)}
                  loading="lazy"
                  style={{ 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}

                />
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorKey: 'department',
            header: 'Department',
            size: 200,
            enableEditing: false,
          },
          {
            accessorKey: 'jobTitle',
            header: 'Role',
            size: 200,
          },
          {
            accessorKey: 'email',
            enableClickToCopy: true,
            header: 'Email',
            size: 300,
            enableEditing: false,
          },
          {
            accessorFn: (row) => new Date(row.startDate),
            id: 'Joining',
            header: 'Joining Date',
            Cell: ({ cell }) => cell.getValue()?.toLocaleDateString(),
            size: 150,
          },
          // Actions column
          {
            id: 'actions',
            header: 'Actions',
            size: 120,
            enableEditing: false,
            enableSorting: false,
            Cell: ({ row }) => (
              <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                <Tooltip title="Edit Personal Info">
                  <IconButton onClick={handleEditPersonal} size="small">
                    <Edit />
                  </IconButton>
                </Tooltip>
              </Box>
            ),
          },
        ],
      },
    ],
    [validationErrors, handleEditPersonal],
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredData.length ? filteredData : personalData,
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableColumnFilterModes: false,
    enableColumnOrdering: false,
    enableGrouping: false,
    enableColumnPinning: false,
    enableFacetedValues: false,
    enableRowActions: false,
    enableRowSelection: false,
    enableEditing: false,

    getRowId: (row) => row.id,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: false,
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    
    muiToolbarAlertBannerProps: error
      ? {
          color: 'error',
          children: error,
        }
      : undefined,

    // Task details panel
    renderDetailPanel: ({ row }) => <PersonalTaskPanel row={row} onRefresh={fetchPersonalData} />,
    
    // Remove card styling from detail panel
    muiDetailPanelProps: {
      sx: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
      }
    },
    
    // Add Task Button in Top Toolbar
    renderTopToolbarCustomActions: () => (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={handleAddTask}
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Add New Task"
        >
          + Add Task
        </button>
      </div>
    ),

    state: {
      isLoading: isLoading,
      showAlertBanner: !!error,
    },
  });

  return (
    <>
      <MaterialReactTable table={table} />
      
      {/* Edit Personal Info Modal */}
      {editModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '400px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>Edit Personal Information</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <div style={{ marginBottom: '16px' }}>
                <label>Job Title</label>
                <input
                  type="text"
                  value={editFormData.jobTitle}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Task Modal */}
      {addTaskModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>Add New Task</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveNewTask(); }}>
              <div style={{ marginBottom: '16px' }}>
                <label>Task Name *</label>
                <input
                  type="text"
                  value={addTaskData.taskName}
                  onChange={(e) => handleAddTaskInputChange('taskName', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Project *</label>
                <input
                  type="text"
                  value={addTaskData.project}
                  onChange={(e) => handleAddTaskInputChange('project', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={addTaskData.startDate}
                  onChange={(e) => handleAddTaskInputChange('startDate', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>End Date</label>
                <input
                  type="date"
                  value={addTaskData.endDate}
                  onChange={(e) => handleAddTaskInputChange('endDate', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Remark</label>
                <textarea
                  value={addTaskData.remark}
                  onChange={(e) => handleAddTaskInputChange('remark', e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setAddTaskModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Personal Task Panel Component
const PersonalTaskPanel = ({ row, onRefresh }) => {
  const [taskEditModalOpen, setTaskEditModalOpen] = useState(false);
  const [editingTaskData, setEditingTaskData] = useState({
    taskName: '',
    project: '',
    startDate: '',
    endDate: '',
    remark: ''
  });

  const handleEditTask = useCallback((task) => {
    setEditingTaskData({
      id: task.id,
      taskName: task.taskName || '',
      project: task.project || '',
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      remark: task.remark || ''
    });
    setTaskEditModalOpen(true);
  }, []);

  const handleSaveTaskEdit = useCallback(async () => {
    try {
      const response = await axios.put(`/api/users/update-task/${editingTaskData.id}`, editingTaskData);
      
      console.log('Task updated:', response.data);
      
      if (onRefresh) {
        await onRefresh();
      }
      
      // Trigger global refresh event for EmployeeTable
      window.dispatchEvent(new CustomEvent('employeeDataChanged'));
      
      setTaskEditModalOpen(false);
      alert('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task: ' + (error.response?.data?.message || error.message));
    }
  }, [editingTaskData, onRefresh]);

  const handleDeleteTask = useCallback(async (taskId) => {
    console.log('Attempting to delete task with ID:', taskId);
    
    if (!taskId || taskId === 'undefined') {
      alert('Error: Task ID is missing. Please refresh the page and try again.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/users/delete-task/${taskId}`);
        
        if (onRefresh) {
          await onRefresh();
        }
        
        // Trigger global refresh event for EmployeeTable
        window.dispatchEvent(new CustomEvent('employeeDataChanged'));
        
        alert('Task deleted successfully!');
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
      }
    }
  }, [onRefresh]);

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
        id: 'actions',
        header: 'Actions',
        size: 100,
        enableEditing: false,
        enableSorting: false,
        Cell: ({ row: taskRow }) => (
          <Box sx={{ display: 'flex', gap: '0.5rem' }}>
            <Tooltip title="Edit">
              <IconButton
                onClick={() => handleEditTask(taskRow.original)}
                size="small"
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => {
                  console.log('Task row data:', taskRow.original);
                  console.log('Task ID:', taskRow.original.id);
                  handleDeleteTask(taskRow.original.id);
                }}
                size="small"
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



  return (
    <>
      <div style={{ 
        marginBottom: '8px',
        paddingTop: '16px',
        textAlign: 'center'
      }}>
        <h4 style={{ 
          fontSize: '20px',
          fontWeight: 'bold',
          margin: 0
        }}>
          My Tasks
        </h4>
      </div>
      <MaterialReactTable table={taskTable} />
      
      {/* Task Edit Modal */}
      {taskEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>Edit Task</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveTaskEdit(); }}>
              <div style={{ marginBottom: '16px' }}>
                <label>Task Name</label>
                <input
                  type="text"
                  value={editingTaskData.taskName}
                  onChange={(e) => setEditingTaskData(prev => ({ ...prev, taskName: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Project</label>
                <input
                  type="text"
                  value={editingTaskData.project}
                  onChange={(e) => setEditingTaskData(prev => ({ ...prev, project: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={editingTaskData.startDate}
                  onChange={(e) => setEditingTaskData(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>End Date</label>
                <input
                  type="date"
                  value={editingTaskData.endDate}
                  onChange={(e) => setEditingTaskData(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Remark</label>
                <textarea
                  value={editingTaskData.remark}
                  onChange={(e) => setEditingTaskData(prev => ({ ...prev, remark: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setTaskEditModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const queryClient = new QueryClient();

const PersonalEmployeeTableWithProvider = () => (
  <QueryClientProvider client={queryClient}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <PersonalEmployeeTable />
    </LocalizationProvider>
  </QueryClientProvider>
);

export default PersonalEmployeeTableWithProvider;