import { useMemo, useState, useCallback, useEffect } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, IconButton } from '@mui/material';
import { Edit, Delete, EditNote, DeleteSweep } from '@mui/icons-material';
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
import BulkEditModal from './BulkEditModal';

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

  // Bulk Edit Modal State
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [bulkEditData, setBulkEditData] = useState({
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

  // BULK OPERATIONS handlers
  const handleBulkEdit = useCallback(() => {
    const selectedEmployeeIds = Object.keys(selectedRows);
    if (selectedEmployeeIds.length === 0) {
      toast.warning('Please select employees to edit');
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
      toast.warning('Please select employees to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedEmployeeIds.length} selected employees?`)) {
      setLocalEmployees(prevEmployees => {
        return prevEmployees.filter(employee => !selectedEmployeeIds.includes(employee.id));
      });

      setSelectedRows({});
      toast.success(`${selectedEmployeeIds.length} employees deleted successfully!`);
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

    const updateData = {};
    if (bulkEditData.department?.trim()) updateData.department = bulkEditData.department;
    if (bulkEditData.jobTitle?.trim()) updateData.jobTitle = bulkEditData.jobTitle;
    if (bulkEditData.startDate?.trim()) updateData.startDate = bulkEditData.startDate;

    if (Object.keys(updateData).length === 0) {
      toast.warning('Please fill at least one field to update');
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

    toast.success(`${selectedEmployeeIds.length} employees updated successfully!`);
  }, [selectedRows, bulkEditData]);

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
    enableRowSelection: true,
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

    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
        {user && user.id === row.original.id && (
          <IconButton
            color="secondary"
            onClick={() => handleEditEmployee(row)}
          >
            <Edit />
          </IconButton>
        )}
        {user && user.id === row.original.id && (
          <IconButton
            color="error"
            onClick={() => openDeleteConfirmModal(row)}
          >
            <Delete />
          </IconButton>
        )}
      </Box>
    ),

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

    state: {
      isLoading: isLoading,
      isSaving: false,
      showAlertBanner: !!error,
      showProgressBars: isLoading,
      rowSelection: selectedRows,
    },

    onRowSelectionChange: setSelectedRows,
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

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={bulkEditModalOpen}
        onClose={() => setBulkEditModalOpen(false)}
        formData={bulkEditData}
        onInputChange={handleBulkEditInputChange}
        onSave={handleSaveBulkEdit}
        selectedCount={Object.keys(selectedRows).length}
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
