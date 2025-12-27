import { useAuth } from '../../context/AuthContext';
import EmployeeTable from '../../components/EmployeeTable/EmployeeTable';

const EmployeesTab = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="header-section">
        <h2>
          Employee Hierarchy - {user?.department?.name || user?.department || 'Your Department'}
        </h2>
      </div>
      <div className="employee-table-container">
        <EmployeeTable />
      </div>
    </div>
  );
};

export default EmployeesTab;
