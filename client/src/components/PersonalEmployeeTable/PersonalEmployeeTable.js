import { useMemo, useState, useCallback, useEffect } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../config/axios';
import { getTableAvatarUrl } from '../../utils/avatarUtils';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import '../../styles/PersonalEmployeeTable.css';
import PersonalTaskPanel from './PersonalTaskPanel';
import EditPersonalInfoModal from './EditPersonalInfoModal';
import AddTaskModal from './AddTaskModal';

const PersonalEmployeeTable = () => {
  const { user } = useAuth();
  const currentUserName = user?.name || '';
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    jobTitle: '',
    startDate: ''
  });
  const [addTaskData, setAddTaskData] = useState({
    taskName: '',
    project: '',
    AssignedBy: '',
    startDate: '',
    endDate: '',
    remark: '',
    status: 'pending'
  });
  const [personalData, setPersonalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch personal data
  const fetchPersonalData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get('/api/auth/me');

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

      setPersonalData(transformedData);
    } catch (error) {
      console.error('Error fetching personal data:', error);
      setError('Failed to load your personal data');
      setPersonalData([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPersonalData();
  }, [fetchPersonalData]);

  useEffect(() => {
    if (user && user.avatar) {
      fetchPersonalData();
    }
  }, [user, fetchPersonalData]);

  // Handle edit personal
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

  // Save edit
  const handleSaveEdit = useCallback(async () => {
    try {
      const formData = new FormData();
      if (editFormData.jobTitle) formData.append('jobTitle', editFormData.jobTitle);
      if (editFormData.startDate) formData.append('startDate', editFormData.startDate);

      await axios.put('/api/users/profile', formData);
      await fetchPersonalData();
      setEditModalOpen(false);
      setEditFormData({ jobTitle: '', startDate: '' });
      alert('Personal information updated successfully!');
    } catch (error) {
      alert('Failed to update personal information: ' + (error.response?.data?.message || error.message));
    }
  }, [editFormData, fetchPersonalData]);

  // Handle add task
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

  // Save new task
  const handleSaveNewTask = useCallback(async () => {
    if (!addTaskData.taskName.trim() || !addTaskData.project.trim()) {
      alert('Please fill in required fields (Task Name and Project)');
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
      await fetchPersonalData();
      setAddTaskModalOpen(false);
      setAddTaskData({
        taskName: '',
        project: '',
        AssignedBy:'',
        startDate: '',
        endDate: '',
        remark: '',
        status: 'pending'
      });
      alert('New task added successfully!');
    } catch (error) {
      alert('Failed to create task: ' + (error.response?.data?.message || error.message));
    }
  }, [addTaskData, fetchPersonalData]);

  // Export data
  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  const handleExportData = () => {
    const tasksToExport = personalData[0]?.tasks || [];
    // Transform tasks to only include primitive values for CSV export
    const exportData = tasksToExport.map(task => ({
      taskName: task.taskName || '',
      project: task.project || '',
      AssignedBy: task.AssignedBy || '',
      startDate: task.startDate ? new Date(task.startDate).toLocaleDateString() : '',
      endDate: task.endDate ? new Date(task.endDate).toLocaleDateString() : '',
      remark: task.remark || '',
      status: task.status || ''
    }));
    const csv = generateCsv(csvConfig)(exportData);
    download(csvConfig)(csv);
  };

  // Columns
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
                  gap: '12px',
                  padding: '8px 0',
                }}
              >
                <img
                  alt="avatar"
                  height={36}
                  width={36}
                  src={getTableAvatarUrl(row.original.avatar)}
                  loading="lazy"
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/36?text=U';
                  }}
                />
                <span style={{ fontWeight: '500', color: '#333' }}>{renderedCellValue}</span>
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
          {
            id: 'actions',
            header: 'Actions',
            size: 120,
            enableEditing: false,
            enableSorting: false,
            Cell: () => (
              <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Tooltip title="Edit Personal Info">
                  <IconButton 
                    onClick={handleEditPersonal} 
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
              </Box>
            ),
          },
        ],
      },
    ],
    [handleEditPersonal],
  );

  const table = useMaterialReactTable({
    columns,
    data: personalData,
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
    renderDetailPanel: ({ row }) => <PersonalTaskPanel row={row} onRefresh={fetchPersonalData} />,
    muiDetailPanelProps: {
      sx: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
      }
    },
    renderTopToolbarCustomActions: () => (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={handleAddTask}
          className="btn-primary"
          title="Add New Task"
        >
          + Add Task
        </button>
        <button
          onClick={handleExportData}
          className="btn-success"
          title="Export All Data"
        >
          📥 Export All Data
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

      <EditPersonalInfoModal
        isOpen={editModalOpen}
        formData={editFormData}
        onFormChange={(field, value) => setEditFormData(prev => ({ ...prev, [field]: value }))}
        onSave={handleSaveEdit}
        onCancel={() => setEditModalOpen(false)}
      />

      <AddTaskModal
        isOpen={addTaskModalOpen}
        formData={addTaskData}
        onFormChange={(field, value) => setAddTaskData(prev => ({ ...prev, [field]: value }))}
        onSave={handleSaveNewTask}
        onCancel={() => setAddTaskModalOpen(false)}
      />
    </>
  );
};

export default PersonalEmployeeTable;
