import { formatDate } from '../../utils/dateUtils';

const EmployeeListModal = ({ isOpen, employees, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal employee-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Registered Employees ({employees.length})</h2>
        <div className="employee-list">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp._id}>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>
                      {emp.department?.name || 'Not Assigned'}
                    </td>
                    <td>{formatDate(emp.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="submit-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeListModal;
