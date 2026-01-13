import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Plus, Building2 } from 'lucide-react';
import EmployeeTable from '../../components/EmployeeTable/EmployeeTable';
import BulkTaskAssignmentModal from './BulkTaskAssignmentModal';

const EmployeesTab = () => {
  const { user } = useAuth();
  const [showBulkTaskModal, setShowBulkTaskModal] = useState(false);

  const handleTasksCreated = () => {
    window.location.reload();
  };

  return (
    <div className="modern-tab-content">
      {/* Modern Header */}
      <div className="content-header">
        <div className="header-left">
          <div className="header-icon-wrapper" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Users size={24} />
          </div>
          <div className="header-text">
            <h1>Employee Directory</h1>
            <div className="header-subtitle">
              <Building2 size={14} />
              <span>{user?.department?.name || user?.department || 'Your Department'}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button 
            onClick={() => setShowBulkTaskModal(true)} 
            className="primary-action-btn"
          >
            <Plus size={18} />
            <span>Assign Tasks</span>
          </button>
        </div>
      </div>

      {/* Employee Table Container */}
      <div className="modern-card">
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
