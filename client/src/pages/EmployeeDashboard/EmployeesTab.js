import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import EmployeeTable from '../../components/EmployeeTable/EmployeeTable';
import BulkTaskAssignmentModal from './BulkTaskAssignmentModal';
import { Button } from '@mui/material';
import { Plus } from 'lucide-react';

const EmployeesTab = () => {
  const { user } = useAuth();
  const [showBulkTaskModal, setShowBulkTaskModal] = useState(false);

  const handleTasksCreated = () => {
    // Refresh the employee table if needed
    window.location.reload();
  };

  return (
    <div>
      <div className="header-section">
        <h2>
          Employee Hierarchy - {user?.department?.name || user?.department || 'Your Department'}
        </h2>
        <Button
          variant="contained"
          onClick={() => setShowBulkTaskModal(true)}
          sx={{
            backgroundColor: '#5b7cfa',
            '&:hover': { backgroundColor: '#4c63d2' },
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={20} /> Assign Tasks
        </Button>
      </div>
      <div className="employee-table-container">
        <EmployeeTable />
      </div>

      {/* Bulk Task Assignment Modal */}
      <BulkTaskAssignmentModal
        isOpen={showBulkTaskModal}
        onClose={() => setShowBulkTaskModal(false)}
        onTasksCreated={handleTasksCreated}
      />
    </div>
  );
};

export default EmployeesTab;
