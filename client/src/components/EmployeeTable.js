import { useMemo, useState, useCallback, useEffect } from 'react';

//MRT Imports
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

//Material UI Imports
import { Box, IconButton, Tooltip } from '@mui/material';

//Icons Imports
import { Edit, Delete, EditNote, DeleteSweep } from '@mui/icons-material';

//Auth Context
import { useAuth } from '../context/AuthContext';

//Axios for API calls
import axios from '../config/axios';

//Avatar utility
import { getTableAvatarUrl } from '../utils/avatarUtils';

//Date Picker Imports - these should just be in your Context Provider
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

//React Query Imports (keeping for wrapper)
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const Example = () => {
  const { user } = useAuth();
  const [validationErrors, setValidationErrors] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    jobTitle: '',
    startDate: ''
  });
  
  // Add Employee Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    jobTitle: '',
    startDate: ''
  });
  
  // State for real employees data from MongoDB
  const [localEmployees, setLocalEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employees from same department
  const fetchDepartmentEmployees = useCallback(async () => {
    if (!user || !user.department) {
      console.log('User or department not available:', user);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching employees for department:', user.department);
      
      // API call to get employees from same department
      const response = await axios.get(`/api/users/department/${user.department.id || user.department._id || user.department}`);
      
      console.log('Department employees response:', response.data);
      
      // Transform the data to match the expected format
      const transformedEmployees = response.data.map(emp => {
        console.log('Employee avatar data:', emp.name, emp.avatar);
        return {
          id: emp._id,
          firstName: emp.name ? emp.name.split(' ')[0] : '',
          lastName: emp.name ? emp.name.split(' ').slice(1).join(' ') : '',
          email: emp.email,
          jobTitle: emp.jobTitle || 'Employee',
          department: emp.department?.name || 'Unknown',
          startDate: emp.startDate || emp.createdAt,
          avatar: emp.avatar, // Keep the original avatar path from MongoDB
          tasks: emp.tasks || [],
          subRows: []
        };
      });
      
      setLocalEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error fetching department employees:', error);
      setError('Failed to load employees from your department');
      
      // Fallback to empty array
      setLocalEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch employees when component mounts or user changes
  useEffect(() => {
    fetchDepartmentEmployees();
  }, [fetchDepartmentEmployees]);

  // Refresh employee list when user avatar or profile changes
  useEffect(() => {
    if (user && user.avatar) {
      console.log('User avatar changed, refreshing employee list...');
      fetchDepartmentEmployees();
    }
  }, [user?.avatar, user?.name, fetchDepartmentEmployees]);
  
  // Bulk operations state
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [bulkEditData, setBulkEditData] = useState({
    department: '',
    jobTitle: '',
    startDate: ''
  });

  // Use local state for employees data
  const fetchedEmployees = localEmployees;
  const isLoadingEmployeesError = !!error;
  const isFetchingEmployees = isLoading;
  const isLoadingEmployees = isLoading;
  // No longer need React Query hooks since we're using local state
  const isDeletingEmployee = false;

  //EDIT action
  const handleEditEmployee = useCallback((row) => {
    const employee = row.original;
    setEditingEmployeeId(employee.id);
    setEditFormData({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      department: employee.department || '',
      jobTitle: employee.jobTitle || '',
      startDate: employee.startDate || ''
    });
    setEditModalOpen(true);
  }, []);

  //SAVE EDIT action
  const handleSaveEdit = useCallback(() => {
    if (!editingEmployeeId) return;
    
    // Basic validation
    if (!editFormData.firstName.trim() || !editFormData.lastName.trim() || !editFormData.email.trim()) {
      alert('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }
    
    // Update the local employees data
    setLocalEmployees(prevEmployees => {
      return prevEmployees.map(employee => {
        if (employee.id === editingEmployeeId) {
          return {
            ...employee,
            firstName: editFormData.firstName,
            lastName: editFormData.lastName,
            email: editFormData.email,
            department: editFormData.department,
            jobTitle: editFormData.jobTitle,
            startDate: editFormData.startDate
          };
        }
        return employee;
      });
    });
    
    // Close the modal and reset state
    setEditModalOpen(false);
    setEditingEmployeeId(null);
    setEditFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      jobTitle: '',
      startDate: ''
    });
    
    // Show success message
    alert('Employee updated successfully!');
    
    // Here you would normally also call an API to persist the changes
    console.log('Employee updated:', editFormData);
  }, [editFormData, editingEmployeeId]);

  //FORM INPUT CHANGE handler
  const handleInputChange = useCallback((field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  //ADD EMPLOYEE handlers
  const handleAddEmployee = useCallback(() => {
    setAddFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      jobTitle: '',
      startDate: ''
    });
    setAddModalOpen(true);
  }, []);

  const handleAddInputChange = useCallback((field, value) => {
    setAddFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSaveNewEmployee = useCallback(async () => {
    // Basic validation
    if (!addFormData.firstName.trim() || !addFormData.lastName.trim() || !addFormData.email.trim()) {
      alert('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }

    if (!user || !user.department) {
      alert('Unable to determine your department. Please try again.');
      return;
    }

    try {
      // Create new employee object for API
      const newEmployeeData = {
        name: `${addFormData.firstName} ${addFormData.lastName}`,
        email: addFormData.email,
        department: user.department.id || user.department._id || user.department,
        jobTitle: addFormData.jobTitle || 'Employee',
        startDate: addFormData.startDate || new Date().toISOString().split('T')[0],
        password: 'defaultPassword123', // You might want to generate a random password
        role: 'employee'
      };

      console.log('Creating new employee:', newEmployeeData);

      // API call to create employee (you'll need to create this endpoint)
      const response = await axios.post('/api/users/create-employee', newEmployeeData);
      
      console.log('Employee created:', response.data);

      // Refresh the employee list
      await fetchDepartmentEmployees();

      // Close modal and reset form
      setAddModalOpen(false);
      setAddFormData({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        jobTitle: '',
        startDate: ''
      });

      alert('New employee added successfully!');
    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Failed to create employee: ' + (error.response?.data?.message || error.message));
    }
  }, [addFormData, user, fetchDepartmentEmployees]);

  // BULK OPERATIONS handlers
  const handleBulkEdit = useCallback(() => {
    const selectedEmployeeIds = Object.keys(selectedRows);
    if (selectedEmployeeIds.length === 0) {
      alert('Please select employees to edit');
      return;
    }
    
    setBulkEditData({
      department: '',
      jobTitle: '',
      startDate: ''
    });
    setBulkEditModalOpen(true);
  }, [selectedRows]);

  const handleBulkDelete = useCallback(() => {
    const selectedEmployeeIds = Object.keys(selectedRows);
    if (selectedEmployeeIds.length === 0) {
      alert('Please select employees to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedEmployeeIds.length} selected employees?`)) {
      setLocalEmployees(prevEmployees => {
        return prevEmployees.filter(employee => !selectedEmployeeIds.includes(employee.id));
      });
      
      setSelectedRows({});
      alert(`${selectedEmployeeIds.length} employees deleted successfully!`);
    }
  }, [selectedRows]);

  const handleBulkEditInputChange = useCallback((field, value) => {
    setBulkEditData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSaveBulkEdit = useCallback(() => {
    const selectedEmployeeIds = Object.keys(selectedRows);
    
    // Only update fields that have values
    const updateData = {};
    if (bulkEditData.department.trim()) updateData.department = bulkEditData.department;
    if (bulkEditData.jobTitle.trim()) updateData.jobTitle = bulkEditData.jobTitle;
    if (bulkEditData.startDate.trim()) updateData.startDate = bulkEditData.startDate;

    if (Object.keys(updateData).length === 0) {
      alert('Please fill at least one field to update');
      return;
    }

    setLocalEmployees(prevEmployees => {
      return prevEmployees.map(employee => {
        if (selectedEmployeeIds.includes(employee.id)) {
          return { ...employee, ...updateData };
        }
        return employee;
      });
    });

    setBulkEditModalOpen(false);
    setSelectedRows({});
    setBulkEditData({
      department: '',
      jobTitle: '',
      startDate: ''
    });

    alert(`${selectedEmployeeIds.length} employees updated successfully!`);
  }, [selectedRows, bulkEditData]);

  //UPDATE EMPLOYEE FROM DETAIL PANEL action
  const updateEmployeeFromDetail = useCallback((employeeId, updatedFields) => {
    setLocalEmployees(prevEmployees => {
      return prevEmployees.map(employee => {
        if (employee.id === employeeId) {
          return {
            ...employee,
            ...updatedFields
          };
        }
        return employee;
      });
    });
  }, []);

  //DELETE action
  const openDeleteConfirmModal = useCallback((row) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      // Update local state to remove the employee
      setLocalEmployees(prevEmployees => {
        return prevEmployees.filter(employee => employee.id !== row.original.id);
      });
      
      // Show success message
      alert('Employee deleted successfully!');
      
      // Here you would normally also call an API to delete the employee
      console.log('Employee deleted:', row.original.id);
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'employee', //id used to define `group` column
        header: 'Employee',
        columns: [
          {
            accessorFn: (row) => `${row.firstName} ${row.lastName}`, //accessorFn used to join multiple data into a single cell
            id: 'name', //id is still required when using accessorFn instead of accessorKey
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
                  src={getTableAvatarUrl(row.original.avatar)}
                  loading="lazy"
                  style={{ 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/30?text=U';
                  }}
                />
                {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorKey: 'department',
            header: 'Department',
            size: 200,
            muiEditTextFieldProps: {
              required: true,
              error: !!validationErrors?.department,
              helperText: validationErrors?.department,
              onFocus: () =>
                setValidationErrors({
                  ...validationErrors,
                  department: undefined,
                }),
            },
          },
          {
            accessorKey: 'jobTitle',
            header: 'Role',
            size: 200,
            muiEditTextFieldProps: {
              required: true,
              error: !!validationErrors?.jobTitle,
              helperText: validationErrors?.jobTitle,
              onFocus: () =>
                setValidationErrors({
                  ...validationErrors,
                  jobTitle: undefined,
                }),
            },
          },
          {
            accessorKey: 'email', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            enableClickToCopy: true,
            filterVariant: 'autocomplete',
            header: 'Email',
            size: 300,
            muiEditTextFieldProps: {
              type: 'email',
              required: true,
              error: !!validationErrors?.email,
              helperText: validationErrors?.email,
              onFocus: () =>
                setValidationErrors({
                  ...validationErrors,
                  email: undefined,
                }),
            },
          },
          {
             accessorFn:(row)=> new Date(row.startDate),
             id:'Joining',
             header:"Joining Date",
             filterVariant: 'date',
            filterFn: 'lessThan',
            sortingFn: 'datetime',
            Cell: ({ cell }) => cell.getValue()?.toLocaleDateString(), //render Date as a string
            Header: ({ column }) => <em>{column.columnDef.header}</em>, //custom header markup
            muiEditTextFieldProps: {
              type: 'date',
              sx: {
                minWidth: '250px',
              },
            },
            muiFilterTextFieldProps: {
              sx: {
                minWidth: '250px',
              },
            },
          },
          // Actions column moved to last position
          {
            id: 'actions',
            header: 'Actions',
            size: 120,
            enableEditing: false,
            enableSorting: false,
            Cell: ({ row }) => (
              <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                <Tooltip title="Edit">
                  <IconButton onClick={() => handleEditEmployee(row)} size="small">
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error" onClick={() => openDeleteConfirmModal(row)} size="small">
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            ),
          },
        ],
      },
     
    ],
    [validationErrors, handleEditEmployee, openDeleteConfirmModal],
  );



  const table = useMaterialReactTable({
    columns,
    data: fetchedEmployees, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: false,
    enableFacetedValues: true,
    enableRowActions: false,
    enableRowSelection: true,
    enableEditing: false,

    getRowId: (row) => row.id,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: false, // Set to true to make global search visible
      columnPinning: {
        left: [],
        right: [],
      },
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [10, 20, 30],
      shape: 'rounded',
      variant: 'outlined',
    },
    muiToolbarAlertBannerProps: isLoadingEmployeesError
      ? {
          color: 'error',
          children: error || 'Error loading employees from your department',
        }
      : undefined,


    //SignatureCatchPhraser
    renderDetailPanel: ({ row }) => <EmployeeDetailPanel row={row} onUpdateEmployee={updateEmployeeFromDetail} />,
    
    // Remove card styling from detail panel
    muiDetailPanelProps: {
      sx: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        '& .MuiPaper-root': {
          boxShadow: 'none',
          backgroundColor: 'transparent'
        }
      }
    },
    
    // Remove card styling from expanded rows
    muiExpandedRowProps: {
      sx: {
        backgroundColor: 'transparent',
        '& td': {
          backgroundColor: 'transparent',
          border: 'none'
        }
      }
    },
    
    // Add Employee Button in Top Toolbar
    renderTopToolbarCustomActions: ({ table }) => {
      const selectedRowCount = Object.keys(table.getState().rowSelection).length;
      
      return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleAddEmployee}
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
            title="Add New Employee"
          >
            + Add Employee
          </button>
          
          {selectedRowCount > 0 && (
            <>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {selectedRowCount} selected
              </span>
              <button
                onClick={handleBulkEdit}
                style={{
                  padding: '8px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Bulk Edit Selected"
              >
                <EditNote style={{ fontSize: '16px' }} />
                Bulk Edit
              </button>
              <button
                onClick={handleBulkDelete}
                style={{
                  padding: '8px 16px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Bulk Delete Selected"
              >
                <DeleteSweep style={{ fontSize: '16px' }} />
                Bulk Delete
              </button>
            </>
          )}
        </div>
      );
    },

    // renderTopToolbar: ({ table }) => {
      

   
     

    //   //  return (
    //   //   <Box
    //   //     sx={(theme) => ({
    //   //       backgroundColor: lighten(theme.palette.background.default, 0.05),
    //   //       display: 'flex',
    //   //       gap: '0.5rem',
    //   //       p: '8px',
    //   //       justifyContent: 'space-between',
    //   //     })}
    //   //   >
    //   //     <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
    //   //       {/* Create New Employee Button */}
    //   //       <Button
    //   //         sx={{ justifyContent: 'left' }}
    //   //         startIcon={<PersonAddAlt />}
    //   //         variant="contained"
    //   //         onClick={() => {
    //   //           setCreatingRowIndex(table.getRowModel().rows.length);
    //   //           table.setCreatingRow(true);
    //   //         }}
    //   //       >
    //   //         Create New Employee
    //   //       </Button>
    //   //     </Box>
    //   //      <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
    //   //       {/* Global Filter and Toggle Filters Button */}
    //   //       <MRT_GlobalFilterTextField table={table} />
    //   //       <MRT_ToggleFiltersButton table={table} />
    //   //     </Box> 
    //   //   </Box>
    //   // );
    // },
    state: {
      isLoading: isLoadingEmployees,
      isSaving: isDeletingEmployee,
      showAlertBanner: isLoadingEmployeesError,
      showProgressBars: isFetchingEmployees,
      rowSelection: selectedRows,
    },
    
    onRowSelectionChange: setSelectedRows,
  });

  return (
    <>
      <MaterialReactTable table={table} />
      
      {/* Edit Employee Modal */}
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
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>Edit Employee</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <div style={{ marginBottom: '16px' }}>
                <label>First Name *</label>
                <input
                  type="text"
                  value={editFormData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Last Name *</label>
                <input
                  type="text"
                  value={editFormData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Email *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Department *</label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Job Title *</label>
                <input
                  type="text"
                  value={editFormData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Start Date *</label>
                <input
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingEmployeeId(null);
                    setEditFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      department: '',
                      jobTitle: '',
                      startDate: ''
                    });
                  }}
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
      
      {/* Add Employee Modal */}
      {addModalOpen && (
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
            <h2>Add New Employee</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveNewEmployee(); }}>
              <div style={{ marginBottom: '16px' }}>
                <label>First Name *</label>
                <input
                  type="text"
                  value={addFormData.firstName}
                  onChange={(e) => handleAddInputChange('firstName', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Last Name *</label>
                <input
                  type="text"
                  value={addFormData.lastName}
                  onChange={(e) => handleAddInputChange('lastName', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Email *</label>
                <input
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => handleAddInputChange('email', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Department</label>
                <div style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '4px',
                  backgroundColor: '#f9fafb',
                  color: '#374151',
                  marginTop: '4px' 
                }}>
                  {user?.department?.name || user?.department || 'Your Department'}
                </div>
                <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  New employees will be added to your department
                </small>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Job Title</label>
                <input
                  type="text"
                  value={addFormData.jobTitle}
                  onChange={(e) => handleAddInputChange('jobTitle', e.target.value)}
                  placeholder="Employee"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={addFormData.startDate}
                  onChange={(e) => handleAddInputChange('startDate', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setAddFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      department: '',
                      jobTitle: '',
                      startDate: ''
                    });
                  }}
                  style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Bulk Edit Modal */}
      {bulkEditModalOpen && (
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
            <h2>Bulk Edit Employees ({Object.keys(selectedRows).length} selected)</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Only fill the fields you want to update. Empty fields will be ignored.
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveBulkEdit(); }}>
              <div style={{ marginBottom: '16px' }}>
                <label>Department</label>
                <input
                  type="text"
                  value={bulkEditData.department}
                  onChange={(e) => handleBulkEditInputChange('department', e.target.value)}
                  placeholder="Leave empty to keep current values"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Job Title</label>
                <input
                  type="text"
                  value={bulkEditData.jobTitle}
                  onChange={(e) => handleBulkEditInputChange('jobTitle', e.target.value)}
                  placeholder="Leave empty to keep current values"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Joining Date</label>
                <input
                  type="date"
                  value={bulkEditData.startDate}
                  onChange={(e) => handleBulkEditInputChange('startDate', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setBulkEditModalOpen(false);
                    setBulkEditData({
                      department: '',
                      jobTitle: '',
                      startDate: ''
                    });
                  }}
                  style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Update Selected Employees
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Table inside the accordion
const EmployeeDetailPanel = ({ row, onUpdateEmployee }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [taskEditModalOpen, setTaskEditModalOpen] = useState(false);
  const [editingTaskData, setEditingTaskData] = useState({
    taskName: '',
    project: '',
    startDate: '',
    endDate: '',
    remark: ''
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



  const isDeletingDetailTask = false;



  // EDIT action for detail panel
  const handleEditDetailTask = useCallback((detailRow) => {
    const taskData = detailRow.original;
    setEditingTaskData({
      id: taskData.id,
      taskName: taskData.taskName || '',
      project: taskData.project || '',
      startDate: taskData.startDate || '',
      endDate: taskData.endDate || '',
      remark: taskData.remark || ''
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

  const handleSaveNewTask = useCallback(() => {
    // Basic validation
    if (!addTaskData.taskName.trim() || !addTaskData.project.trim()) {
      alert('Please fill in required fields (Task and Project)');
      return;
    }

    // Create new task object
    const newTask = {
      id: `${row.original.id}-${Date.now()}`,
      taskName: addTaskData.taskName,
      project: addTaskData.project,
      startDate: addTaskData.startDate || new Date().toISOString().split('T')[0],
      endDate: addTaskData.endDate,
      remark: addTaskData.remark || 'New task assigned'
    };

    // Add new task to employee's tasks array
    if (onUpdateEmployee) {
      const currentTasks = row.original.tasks || [];
      onUpdateEmployee(row.original.id, {
        tasks: [...currentTasks, newTask]
      });
    }

    alert('New task added successfully!');
    console.log('New task added:', newTask);

    // Close modal and reset form
    setAddTaskModalOpen(false);
    setAddTaskData({
      taskName: '',
      project: '',
      startDate: '',
      endDate: '',
      remark: ''
    });
  }, [addTaskData, row, onUpdateEmployee]);

  // SAVE TASK EDIT action
  const handleSaveTaskEdit = useCallback(() => {
    // Basic validation
    if (!editingTaskData.taskName.trim() || !editingTaskData.project.trim()) {
      alert('Please fill in required fields (Task and Project)');
      return;
    }
    
    // Update the specific task in employee's tasks array
    if (onUpdateEmployee) {
      const currentTasks = row.original.tasks || [];
      const updatedTasks = currentTasks.map(task => 
        task.id === editingTaskData.id 
          ? {
              ...task,
              taskName: editingTaskData.taskName,
              project: editingTaskData.project,
              startDate: editingTaskData.startDate,
              endDate: editingTaskData.endDate,
              remark: editingTaskData.remark
            }
          : task
      );
      
      onUpdateEmployee(row.original.id, {
        tasks: updatedTasks
      });
    }
    
    alert('Task updated successfully!');
    console.log('Task updated:', editingTaskData);
    
    // Close modal and reset state
    setTaskEditModalOpen(false);
    setEditingTaskData({
      taskName: '',
      project: '',
      startDate: '',
      endDate: '',
      remark: ''
    });
  }, [editingTaskData, row, onUpdateEmployee]);

  // DELETE action for detail panel
  const openDeleteDetailConfirmModal = useCallback((detailRow) => {
    if (window.confirm(`Are you sure you want to delete this task?`)) {
      // Remove task from employee's tasks array
      if (onUpdateEmployee) {
        const currentTasks = row.original.tasks || [];
        const updatedTasks = currentTasks.filter(task => task.id !== detailRow.original.id);
        
        onUpdateEmployee(row.original.id, {
          tasks: updatedTasks
        });
      }
      
      alert('Task deleted successfully!');
      console.log('Task deleted:', detailRow.original);
    }
  }, [row, onUpdateEmployee]);

  const detailColumns = useMemo(
    () => [
      {
        accessorKey: 'taskName',
        header: 'Task',
        size: 150,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.taskName,
          helperText: validationErrors?.taskName,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              taskName: undefined,
            }),
        },
      },
      {
        accessorKey: 'project',
        header: 'Project',
        size: 150,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.project,
          helperText: validationErrors?.project,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              project: undefined,
            }),
        },
      },
      {
        accessorFn: (row) => new Date(row.startDate),
        id: 'startDate',
        header: 'Start Date',
        Cell: ({ cell }) => cell.getValue()?.toLocaleDateString(),
        size: 150,
        muiEditTextFieldProps: {
          type: 'date',
        },
      },
      {
        accessorFn: (row) => row.endDate ? new Date(row.endDate) : null,
        id: 'endDate',
        header: 'End Date',
        Cell: ({ cell }) => cell.getValue()?.toLocaleDateString(),
        size: 150,
        muiEditTextFieldProps: {
          type: 'date',
        },
      },
      {
        accessorKey: 'remark',
        header: 'Remark',
        size: 250,
        muiEditTextFieldProps: {
          error: !!validationErrors?.remark,
          helperText: validationErrors?.remark,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              remark: undefined,
            }),
        },
      },
      // Actions column moved to last position
      {
        id: 'actions',
        header: 'Actions',
        size: 100,
        enableEditing: false,  // Prevents edit mode for this column
        enableSorting: false,  // Disables sorting on actions
        // ✅ Cell renderer for action buttons
        Cell: ({ row:detailRow }) => (
          <Box sx={{ display: 'flex', gap: '0.5rem' }}>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                onClick={() => handleEditDetailTask(detailRow)}
                size="small"
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => openDeleteDetailConfirmModal(detailRow)}
                size="small"
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [validationErrors, handleEditDetailTask, openDeleteDetailConfirmModal],
  );

  // innerTable
  const detailTable = useMaterialReactTable({
    columns: detailColumns,
    data: row.original.tasks || [], // Pass the employee's tasks array
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: false,

    getRowId: (row) => row.id,
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
    enableStickyHeader: false,
    enableRowSelection: false,
    enableExpandAll: false,
    enableExpanding: false,
    enableRowActions: false,

    // renderRowActions: ({ row: detailRow, table }) => (
    //   <Box sx={{ display: 'flex', gap: '0.5rem'  }}>
    //     <Tooltip title="Edit">
    //       <IconButton
    //         color="primary"
    //         onClick={() => table.setEditingRow(detailRow)}
    //         size="small"
    //       >
    //         <Edit />
    //       </IconButton>
    //     </Tooltip>
    //     <Tooltip title="Delete">
    //       <IconButton
    //         color="error"
    //         onClick={() => openDeleteDetailConfirmModal(detailRow)}
    //         size="small"
    //       >
    //         <Delete />
    //       </IconButton>
    //     </Tooltip>
    //   </Box>
    // ),
   

    muiTableHeadCellProps: { sx: { fontWeight: 'bold', } },
    muiTableBodyCellProps: { sx: { } }, //inner table ke cell ka background color removed 
    state: {
      isSaving: isDeletingDetailTask,
    },
  });

  return (
    <>
      {/* Add Task Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <button
          onClick={handleAddTask}
          style={{
            padding: '6px 12px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Add New Task"
        >
          + Add Task
        </button>
      </div>
      <MaterialReactTable table={detailTable} />
      
      {/* Edit Task Modal */}
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
                <label>Task *</label>
                <input
                  type="text"
                  value={editingTaskData.taskName}
                  onChange={(e) => handleTaskInputChange('taskName', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Project *</label>
                <input
                  type="text"
                  value={editingTaskData.project}
                  onChange={(e) => handleTaskInputChange('project', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={editingTaskData.startDate}
                  onChange={(e) => handleTaskInputChange('startDate', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>End Date</label>
                <input
                  type="date"
                  value={editingTaskData.endDate}
                  onChange={(e) => handleTaskInputChange('endDate', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Remark</label>
                <textarea
                  value={editingTaskData.remark}
                  onChange={(e) => handleTaskInputChange('remark', e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setTaskEditModalOpen(false);
                    setEditingTaskData({
                      jobTitle: '',
                      department: '',
                      startDate: '',
                      endDate: '',
                      signatureCatchPhrase: ''
                    });
                  }}
                  style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Save Task
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
                <label>Task *</label>
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
                  onClick={() => {
                    setAddTaskModalOpen(false);
                    setAddTaskData({
                      taskName: '',
                      project: '',
                      startDate: '',
                      endDate: '',
                      remark: ''
                    });
                  }}
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









const queryClient = new QueryClient();

const ExampleWithLocalizationProvider = () => (
  //App.tsx or AppProviders file
  <QueryClientProvider client={queryClient}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Example />
    </LocalizationProvider>
  </QueryClientProvider>
);

export default ExampleWithLocalizationProvider;













