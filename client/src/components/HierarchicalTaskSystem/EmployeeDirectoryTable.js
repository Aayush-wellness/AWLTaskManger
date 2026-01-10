import { useState, useMemo, useCallback } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Paper,
  Button,
  Box,
  Typography,
  Skeleton,
  Stack,
} from '@mui/material';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import toast from '../../utils/toast';
import EmployeeTaskDetailPanel from './EmployeeTaskDetailPanel';
import './HierarchicalTaskSystem.css';

const EmployeeDirectoryTable = ({ department, employees, onSelectEmployee, onBack, loading }) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [employeesList, setEmployeesList] = useState(employees);

  const handleTasksUpdate = useCallback((employeeId, updatedTasks) => {
    setEmployeesList(prev =>
      prev.map(emp =>
        emp._id === employeeId ? { ...emp, tasks: updatedTasks } : emp
      )
    );
  }, []);

  const rows = useMemo(() => {
    return employeesList.map((emp) => ({
      id: emp._id,
      name: emp.name,
      role: emp.jobTitle,
      email: emp.email,
      originalData: emp,
    }));
  }, [employeesList]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 250,
        sortable: true,
        filterable: true,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 250,
        sortable: true,
        filterable: true,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 300,
        sortable: true,
        filterable: true,
        Cell: ({ cell }) => (
          <a
            href={`mailto:${cell.getValue()}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              color: '#5b7cfa',
              textDecoration: 'none',
            }}
          >
            {cell.getValue()}
          </a>
        ),
      },
    ],
    []
  );

  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  const handleExportEmployees = () => {
    // Export only employee information
    const exportData = rows.map(row => ({
      name: row.name,
      role: row.role,
      email: row.email
    }));
    const csv = generateCsv(csvConfig)(exportData);
    download(csvConfig)(csv);
  };

  const handleExportAllData = () => {
    // Export all employee data with their tasks
    const allData = [];

    employeesList.forEach(emp => {
      const tasks = emp.tasks || [];
      
      if (tasks.length === 0) {
        // If employee has no tasks, still add employee info
        allData.push({
          employeeName: emp.name,
          employeeRole: emp.jobTitle,
          employeeEmail: emp.email,
          taskName: '-',
          project: '-',
          assignedBy: '-',
          startDate: '-',
          endDate: '-',
          remark: '-',
          status: '-'
        });
      } else {
        // Add a row for each task
        tasks.forEach(task => {
          allData.push({
            employeeName: emp.name,
            employeeRole: emp.jobTitle,
            employeeEmail: emp.email,
            taskName: task.taskName || '-',
            project: task.project || '-',
            assignedBy: task.AssignedBy || '-',
            startDate: task.startDate ? new Date(task.startDate).toLocaleDateString() : '-',
            endDate: task.endDate ? new Date(task.endDate).toLocaleDateString() : '-',
            remark: task.remark || '-',
            status: task.status || '-'
          });
        });
      }
    });

    if (allData.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const csv = generateCsv(csvConfig)(allData);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data: rows,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableRowSelection: false,
    enableEditing: false,
    enableRowActions: false,
    enableExpanding: true,
    enableExpandAll: false,
    enablePagination: true,
    enableStickyHeader: true,
    getRowId: (row) => row.id,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: false,
      columnPinning: { right: [] },
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
    muiTableContainerProps: {
      sx: {
        maxHeight: 'calc(100% - 200px)',
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
    renderDetailPanel: ({ row }) => (
      <EmployeeTaskDetailPanel
        employee={row.original.originalData}
        onTasksUpdate={(updatedTasks) => handleTasksUpdate(row.original.id, updatedTasks)}
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
    state: {
      isLoading: loading,
      isSaving: false,
      showAlertBanner: false,
      showProgressBars: loading,
      expanded: expandedRows,
    },
    onExpandedChange: setExpandedRows,
  });

  if (loading) {
    return (
      <Box className="hierarchical-level">
        <Box className="level-header">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
          >
            Back to Departments
          </Button>
          <Typography variant="h5" sx={{ mt: 2 }}>
            {department.name} - Employees
          </Typography>
        </Box>
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Skeleton variant="rectangular" height={400} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box className="hierarchical-level">
      <Box className="level-header">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          variant="outlined"
          size="small"
        >
          Back to Departments
        </Button>
        <Typography variant="h5" sx={{ mt: 2 }}>
          {department.name} - Employees
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {employeesList.length} employee{employeesList.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Export Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportEmployees}
          size="small"
        >
          Export Employees
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportAllData}
          size="small"
          sx={{ backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' } }}
        >
          Export All Data (with Tasks)
        </Button>
      </Box>

      <Paper elevation={2} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <MaterialReactTable table={table} />
      </Paper>
    </Box>
  );
};

export default EmployeeDirectoryTable;
