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

  // Listen for global employee data changes (from PersonalEmployeeTable)
  useEffect(() => {
    const handleEmployeeDataChanged = () => {
      console.log('Employee data changed event received, refreshing...');
      fetchDepartmentEmployees();
    };

    window.addEventListener('employeeDataChanged', handleEmployeeDataChanged);
    
    return () => {
      window.removeEventListener('employeeDataChanged', handleEmployeeDataChanged);
    };
  }, [fetchDepartmentEmployees]);
  
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
  const handleSaveEdit = useCallback(async () => {
    if (!editingEmployeeId) return;
    
    // Basic validation
    if (!editFormData.firstName.trim() || !editFormData.lastName.trim() || !editFormData.email.trim()) {
      alert('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }
    
    try {
      console.log('Updating employee:', editingEmployeeId, 'with data:', editFormData);
      
      // API call to update employee
      const response = await axios.put(`/api/users/update-employee/${editingEmployeeId}`, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        jobTitle: editFormData.jobTitle,
        startDate: editFormData.startDate
      });
      
      console.log('Employee update response:', response.data);
      
      // Refresh the employee list from MongoDB
      await fetchDepartmentEmployees();
      
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
      
      alert('Employee updated successfully!');
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee: ' + (error.response?.data?.message || error.message));
    }
  }, [editFormData, editingEmployeeId, fetchDepartmentEmployees]);

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

  const handleBulkDelete = useCallback(async () => {
    const selectedEmployeeIds = Object.keys(selectedRows);
    if (selectedEmployeeIds.length === 0) {
      alert('Please select employees to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedEmployeeIds.length} selected employees?`)) {
      try {
        console.log('Bulk deleting employees:', selectedEmployeeIds);
        
        // API call to bulk delete employees
        const response = await axios.delete('/api/users/bulk-delete', {
          data: { employeeIds: selectedEmployeeIds }
        });
        
        console.log('Bulk delete response:', response.data);
        
        // Refresh the employee list from MongoDB
        await fetchDepartmentEmployees();
        
        // Clear selection
        setSelectedRows({});
        
        alert(`${response.data.deletedCount} employees deleted successfully!`);
      } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('Failed to delete employees: ' + (error.response?.data?.message || error.message));
      }
    }
  }, [selectedRows, fetchDepartmentEmployees]);

  const handleBulkEditInputChange = useCallback((field, value) => {
    setBulkEditData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSaveBulkEdit = useCallback(async () => {
    const selectedEmployeeIds = Object.keys(selectedRows);
    
    // Only update fields that have values
    const updateData = {};
    if (bulkEditData.jobTitle.trim()) updateData.jobTitle = bulkEditData.jobTitle;
    if (bulkEditData.startDate.trim()) updateData.startDate = bulkEditData.startDate;
    // Note: Department updates are handled by administrators, not included in bulk edit

    if (Object.keys(updateData).length === 0) {
      alert('Please fill at least one field to update');
      return;
    }

    try {
      console.log('Bulk updating employees:', selectedEmployeeIds, 'with data:', updateData);
      
      // API call to bulk update employees
      const response = await axios.put('/api/users/bulk-update', {
        employeeIds: selectedEmployeeIds,
        updateData: updateData
      });
      
      console.log('Bulk update response:', response.data);
      
      // Refresh the employee list from MongoDB
      await fetchDepartmentEmployees();
      
      // Close modal and reset state
      setBulkEditModalOpen(false);
      setSelectedRows({});
      setBulkEditData({
        department: '',
        jobTitle: '',
        startDate: ''
      });

      alert(`${response.data.modifiedCount} employees updated successfully!`);
    } catch (error) {
      console.error('Error in bulk update:', error);
      alert('Failed to update employees: ' + (error.response?.data?.message || error.message));
    }
  }, [selectedRows, bulkEditData, fetchDepartmentEmployees]);

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

  // Refresh employee data (to sync with PersonalEmployeeTable changes)
  const refreshEmployeeData = useCallback(async () => {
    console.log('Refreshing employee data...');
    await fetchDepartmentEmployees();
  }, [fetchDepartmentEmployees]);

  //DELETE action
  const openDeleteConfirmModal = useCallback(async (row) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        console.log('Deleting employee:', row.original.id);
        
        // API call to delete employee
        const response = await axios.delete(`/api/users/delete-employee/${row.original.id}`);
        
        console.log('Employee delete response:', response.data);
        
        // Refresh the employee list from MongoDB
        await fetchDepartmentEmployees();
        
        alert('Employee deleted successfully!');
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee: ' + (error.response?.data?.message || error.message));
      }
    }
  }, [fetchDepartmentEmployees]);

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
                  src={getTableAvatarUrl(row.original.avatar, `${row.original.firstName} ${row.original.lastName}`)}
                  loading="lazy"
                  style={{ 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
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
            Cell: ({ row }) => {
              const isCurrentUser = row.original.id === user?.id;
              const isAdmin = user?.role === 'admin';
              const canEdit = isAdmin || isCurrentUser;
              const canDelete = isAdmin || isCurrentUser;
              
              return (
                <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                  {canEdit && (
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditEmployee(row)} size="small">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  )}
                  {canDelete && (
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => openDeleteConfirmModal(row)} size="small">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  )}
                  {!canEdit && !canDelete && (
                    <span style={{ fontSize: '12px', color: '#999' }}>No actions</span>
                  )}
                </Box>
              );
            },
          },
        ],
      },
      // {
      //   id: 'jobInfo',
      //   header: 'Job Info',
      //   columns: [
           // Remark
      //     // {
      //     //   accessorKey: 'signatureCatchPhrase',
      //     //   header: 'Remark',
      //     //   size: 300,
      //     //   id:'sub-table',
      //     //   muiEditTextFieldProps: {
      //     //     error: !!validationErrors?.signatureCatchPhrase,
      //     //     helperText: validationErrors?.signatureCatchPhrase,
      //     //     onFocus: () =>
      //     //       setValidationErrors({
      //     //         ...validationErrors,
      //     //         signatureCatchPhrase: undefined,
      //     //       }),
      //     //   },
      //     // },
           // Start Date
      //     // {
      //     //   accessorFn: (row) => new Date(row.startDate), //convert to Date for sorting and filtering
      //     //   id: 'startDate',
      //     //   header: 'Start Date',
      //     //   filterVariant: 'date',
      //     //   filterFn: 'lessThan',
      //     //   sortingFn: 'datetime',
      //     //   Cell: ({ cell }) => cell.getValue()?.toLocaleDateString(), //render Date as a string
      //     //   Header: ({ column }) => <em>{column.columnDef.header}</em>, //custom header markup
      //     //   muiEditTextFieldProps: {
      //     //     type: 'date',
      //     //     sx: {
      //     //       minWidth: '250px',
      //     //     },
      //     //   },
      //     //   muiFilterTextFieldProps: {
      //     //     sx: {
      //     //       minWidth: '250px',
      //     //     },
      //     //   },
      //     // },
            // End Date
      //     // {
      //     //   accessorFn: (row) => row.endDate ? new Date(row.endDate) : null, // Assuming endDate exists and convert to Date
      //     //   id: 'endDate',
      //     //   header: 'End Date',
      //     //   filterVariant: 'date',
      //     //   filterFn: 'lessThan',
      //     //   sortingFn: 'datetime',
      //     //   Cell: ({ cell }) => cell.getValue()?.toLocaleDateString(), //render Date as a string
      //     //   Header: ({ column }) => <em>{column.columnDef.header}</em>, //custom header markup
      //     //   muiEditTextFieldProps: {
      //     //     type: 'date',
      //     //     sx: {
      //     //       minWidth: '250px',
      //     //     },
      //     //   },
      //     //   muiFilterTextFieldProps: {
      //     //     sx: {
      //     //       minWidth: '250px',
      //     //     },
      //     //   },
      //     // },
      //   ],
      // },
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
    enableRowSelection: user?.role === 'admin', // Only admins can select rows for bulk operations
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
    renderDetailPanel: ({ row }) => <EmployeeDetailPanel row={row} onUpdateEmployee={updateEmployeeFromDetail} onRefreshData={refreshEmployeeData} user={user} />,
    
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
      const isAdmin = user?.role === 'admin';
      
      return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isAdmin && (
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
              title="Add New Employee (Admin Only)"
            >
              + Add Employee
            </button>
          )}
          
          {selectedRowCount > 0 && (
            <>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {selectedRowCount} selected
              </span>
              {isAdmin && (
                <>
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
                    title="Bulk Edit Selected (Admin Only)"
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
                    title="Bulk Delete Selected (Admin Only)"
                  >
                    <DeleteSweep style={{ fontSize: '16px' }} />
                    Bulk Delete
                  </button>
                </>
              )}
              {!isAdmin && (
                <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                  Admin privileges required for bulk operations
                </span>
              )}
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
const EmployeeDetailPanel = ({ row, onUpdateEmployee, onRefreshData, user }) => {
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

  const handleSaveNewTask = useCallback(async () => {
    // Basic validation
    if (!addTaskData.taskName.trim() || !addTaskData.project.trim()) {
      alert('Please fill in required fields (Task and Project)');
      return;
    }

    try {
      // Create new task object
      const newTask = {
        taskName: addTaskData.taskName,
        project: addTaskData.project,
        startDate: addTaskData.startDate || new Date().toISOString().split('T')[0],
        endDate: addTaskData.endDate,
        remark: addTaskData.remark || 'Task assigned from employee panel'
      };

      console.log('Adding task to employee:', row.original.id, newTask);

      // API call to add task to specific user
      const response = await axios.post(`/api/users/add-task-to-user/${row.original.id}`, newTask);
      
      console.log('Task added to employee:', response.data);

      // Refresh the entire employee data to get latest from MongoDB
      if (onRefreshData) {
        await onRefreshData();
      }

      // Close modal and reset form
      setAddTaskModalOpen(false);
      setAddTaskData({
        taskName: '',
        project: '',
        startDate: '',
        endDate: '',
        remark: ''
      });

      alert('Task added successfully!');
    } catch (error) {
      console.error('Error adding task to employee:', error);
      alert('Failed to add task: ' + (error.response?.data?.message || error.message));
    }
  }, [addTaskData, row, onUpdateEmployee]);

  // SAVE TASK EDIT action
  const handleSaveTaskEdit = useCallback(async () => {
    // Basic validation
    if (!editingTaskData.taskName.trim() || !editingTaskData.project.trim()) {
      alert('Please fill in required fields (Task and Project)');
      return;
    }
    
    try {
      console.log('Updating task for employee:', row.original.id, editingTaskData);

      // API call to update task for specific user
      const response = await axios.put(`/api/users/update-task-for-user/${row.original.id}/${editingTaskData.id}`, editingTaskData);
      
      console.log('Task updated for employee:', response.data);

      // Refresh the entire employee data to get latest from MongoDB
      if (onRefreshData) {
        await onRefreshData();
      }
      
      // Close modal and reset state
      setTaskEditModalOpen(false);
      setEditingTaskData({
        taskName: '',
        project: '',
        startDate: '',
        endDate: '',
        remark: ''
      });

      alert('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task for employee:', error);
      alert('Failed to update task: ' + (error.response?.data?.message || error.message));
    }
  }, [editingTaskData, row, onUpdateEmployee]);

  // DELETE action for detail panel
  const openDeleteDetailConfirmModal = useCallback(async (detailRow) => {
    if (window.confirm(`Are you sure you want to delete this task?`)) {
      try {
        console.log('Deleting task for employee:', row.original.id, detailRow.original.id);

        // API call to delete task for specific user
        await axios.delete(`/api/users/delete-task-for-user/${row.original.id}/${detailRow.original.id}`);
        
        console.log('Task deleted for employee');

        // Refresh the entire employee data to get latest from MongoDB
        if (onRefreshData) {
          await onRefreshData();
        }
        
        alert('Task deleted successfully!');
      } catch (error) {
        console.error('Error deleting task for employee:', error);
        alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
      }
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
        // ✅ Cell renderer for action buttons with role-based access
        Cell: ({ row:detailRow }) => {
          // Check if current user can manage tasks for this employee
          const isCurrentUserRow = row.original.id === user?.id;
          const isAdmin = user?.role === 'admin';
          const canManageTasks = isAdmin || isCurrentUserRow;
          
          return (
            <Box sx={{ display: 'flex', gap: '0.5rem' }}>
              {canManageTasks && (
                <>
                  <Tooltip title="Edit Task">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditDetailTask(detailRow)}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Task">
                    <IconButton
                      color="error"
                      onClick={() => openDeleteDetailConfirmModal(detailRow)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {!canManageTasks && (
                <span style={{ fontSize: '12px', color: '#999' }}>View only</span>
              )}
            </Box>
          );
        },
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
      {/* Add Task Button - Role-based access */}
      {(() => {
        const isCurrentUserRow = row.original.id === user?.id;
        const isAdmin = user?.role === 'admin';
        const canAddTasks = isAdmin || isCurrentUserRow;
        
        return canAddTasks ? (
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
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
              View only - Cannot add tasks
            </span>
          </div>
        );
      })()}
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













