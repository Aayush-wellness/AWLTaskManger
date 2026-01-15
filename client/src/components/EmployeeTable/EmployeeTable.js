import { useMemo, useState, useCallback, useEffect } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../config/axios';
import toast from '../../utils/toast';
import { getTableAvatarUrl } from '../../utils/avatarUtils';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmployeeDetailPanel from './EmployeeDetailPanel';
import AddEmployeeModal from './AddEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';

const EmployeeTableComponent = () => {
  const { user } = useAuth();

  // Edit Employee Modal State
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

  // Employee Data State
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

      const response = await axios.get(
        `/api/users/department/${user.department.id || user.department._id || user.department}`
      );

      console.log('Department employees response:', response.data);

      const transformedEmployees = response.data.map(emp => ({
        id: emp._id,
        firstName: emp.name ? emp.name.split(' ')[0] : '',
        lastName: emp.name ? emp.name.split(' ').slice(1).join(' ') : '',
        email: emp.email,
        jobTitle: emp.jobTitle || 'Employee',
        department: emp.department?.name || 'Unknown',
        startDate: emp.startDate || emp.createdAt,
        avatar: emp.avatar,
        tasks: emp.tasks || [],
        subRows: []
      }));

      setLocalEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error fetching department employees:', error);
      setError('Failed to load employees from your department');
      setLocalEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDepartmentEmployees();
  }, [fetchDepartmentEmployees]);

  useEffect(() => {
    if (user && user.avatar) {
      console.log('User avatar changed, refreshing employee list...');
      fetchDepartmentEmployees();
    }
  }, [user, fetchDepartmentEmployees]);

  // EDIT EMPLOYEE handlers
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

  const handleInputChange = useCallback((field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingEmployeeId) return;

    if (!editFormData.firstName.trim() || !editFormData.lastName.trim() || !editFormData.email.trim()) {
      toast.warning('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }

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

    toast.success('Employee updated successfully!');
    console.log('Employee updated:', editFormData);
  }, [editFormData, editingEmployeeId]);

  // ADD EMPLOYEE handlers
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

  const handleAddEmployeeSuccess = useCallback(async () => {
    setAddModalOpen(false);
    setAddFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      jobTitle: '',
      startDate: ''
    });
    await fetchDepartmentEmployees();
  }, [fetchDepartmentEmployees]);

  // UPDATE EMPLOYEE FROM DETAIL PANEL
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

  // DELETE EMPLOYEE
  const openDeleteConfirmModal = useCallback((row) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setLocalEmployees(prevEmployees => {
        return prevEmployees.filter(employee => employee.id !== row.original.id);
      });

      toast.success('Employee deleted successfully!');
      console.log('Employee deleted:', row.original.id);
    }
  }, []);

  // TABLE COLUMNS
  const columns = useMemo(
    () => [
      {
        id: 'employee',
        header: 'Employee',
        columns: [
          {
            accessorFn: (row) => `${row.firstName} ${row.lastName}`,
            id: 'name',
            header: 'Name',
            size: 250,
            enableEditing: false,
            Cell: ({ renderedCellValue, row }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorKey: 'department',
            header: 'Department',
            size: 200,
          },
          {
            accessorKey: 'jobTitle',
            header: 'Role',
            size: 200,
          },
          {
            accessorKey: 'email',
            enableClickToCopy: true,
            filterVariant: 'autocomplete',
            header: 'Email',
            size: 300,
          },
          {
            accessorFn: (row) => new Date(row.startDate),
            id: 'Joining',
            header: 'Joining Date',
            filterVariant: 'date',
            filterFn: 'lessThan',
            sortingFn: 'datetime',
            Cell: ({ cell }) => cell.getValue()?.toLocaleDateString(),
          },
        ],
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: localEmployees,
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    enableRowSelection: false,
    enableEditing: false,
    enableRowActions: true,

    getRowId: (row) => row.id,
    enableStickyHeader: true,
    enablePagination: true,

    muiTableContainerProps: {
      sx: {
        maxHeight: '600px',
        overflowX: 'auto',
        overflowY: 'auto',
        position: 'relative',
      }
    },

    muiTableProps: {
      sx: {
        tableLayout: 'fixed',
      }
    },

    initialState: {
      showColumnFilters: false,
      showGlobalFilter: false,
      columnPinning: { right: ['mrt-row-actions'] },
      expanded: true, // Expand all rows by default
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
    muiToolbarAlertBannerProps: error
      ? {
        color: 'error',
        children: error || 'Error loading employees from your department',
      }
      : undefined,

    renderDetailPanel: ({ row }) => (
      <EmployeeDetailPanel
        row={row}
        onUpdateEmployee={updateEmployeeFromDetail}
        fetchDepartmentEmployees={fetchDepartmentEmployees}
      />
    ),

    muiDetailPanelProps: {
      sx: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        width: 'auto',
        maxWidth: '100%',
        '& .MuiPaper-root': {
          boxShadow: 'none',
          backgroundColor: 'transparent',
        }
      }
    },

    muiExpandedRowProps: {
      sx: {
        backgroundColor: 'transparent',
        '& td': {
          backgroundColor: 'transparent',
          border: 'none'
        }
      }
    },

    // Make entire row clickable to expand/collapse
    muiTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        // Don't toggle if clicking on buttons, links, checkboxes, or interactive elements
        if (event.target.closest('button, a, input, .MuiIconButton-root, .MuiCheckbox-root')) {
          return;
        }
        row.toggleExpanded();
      },
      sx: {
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgba(91, 124, 250, 0.04)',
        },
      },
    }),

    renderRowActions: ({ row }) => {
      // Check if this row is the current logged-in user
      const userId = user?.id || user?._id;
      const rowId = row.original.id || row.original._id;
      const isCurrentUser = userId && rowId && userId === rowId;
      
      // Only show actions for the logged-in user's own row
      if (!isCurrentUser) {
        return null;
      }
      
      return (
        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
          <IconButton
            color="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleEditEmployee(row);
            }}
            title="Edit your profile"
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteConfirmModal(row);
            }}
            title="Delete your account"
          >
            <Delete />
          </IconButton>
        </Box>
      );
    },

    renderTopToolbarCustomActions: () => (
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
      </div>
    ),

    state: {
      isLoading: isLoading,
      isSaving: false,
      showAlertBanner: !!error,
      showProgressBars: isLoading,
    },
  });

  return (
    <>
      <MaterialReactTable table={table} />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        formData={editFormData}
        onInputChange={handleInputChange}
        onSave={handleSaveEdit}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        formData={addFormData}
        onInputChange={handleAddInputChange}
        user={user}
        onEmployeeAdded={handleAddEmployeeSuccess}
      />
    </>
  );
};

const queryClient = new QueryClient();

const EmployeeTable = () => (
  <QueryClientProvider client={queryClient}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <EmployeeTableComponent />
    </LocalizationProvider>
  </QueryClientProvider>
);

export default EmployeeTable;
