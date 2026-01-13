import { ClipboardList, Sparkles } from 'lucide-react';
import PersonalEmployeeTable from '../../components/PersonalEmployeeTable/index';

const TasksTab = () => {
  return (
    <div className="modern-tab-content">
      {/* Modern Header */}
      <div className="content-header">
        <div className="header-left">
          <div className="header-icon-wrapper">
            <ClipboardList size={24} />
          </div>
          <div className="header-text">
            <h1>My Personal Dashboard</h1>
            <p>Manage your tasks and track your progress</p>
          </div>
        </div>
        <div className="header-right">
          <div className="header-badge">
            <Sparkles size={14} />
            <span>Stay productive!</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="modern-card">
        <PersonalEmployeeTable />
      </div>
    </div>
  );
};

export default TasksTab;
