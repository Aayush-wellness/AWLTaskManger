import PersonalEmployeeTable from '../../components/PersonalEmployeeTable/index';

const TasksTab = () => {
  return (
    <div>
      <div className="header-section">
        <h2>My Personal Dashboard</h2>
        <p style={{ color: '#666', fontSize: '14px', margin: '8px 0' }}>
          Manage your personal information and tasks
        </p>
      </div>
      <div className="personal-table-container">
        <PersonalEmployeeTable />
      </div>
    </div>
  );
};

export default TasksTab;
