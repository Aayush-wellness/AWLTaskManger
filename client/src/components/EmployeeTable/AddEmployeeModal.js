import { useCallback } from 'react';
import axios from '../../config/axios';
import toast from '../../utils/toast';

const AddEmployeeModal = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  user,
  onEmployeeAdded
}) => {
  const handleSaveNewEmployee = useCallback(async () => {
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.warning('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }

    if (!user || !user.department) {
      toast.error('Unable to determine your department. Please try again.');
      return;
    }

    try {
      // Create new employee object for API
      const newEmployeeData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        department: user.department.id || user.department._id || user.department,
        jobTitle: formData.jobTitle || 'Employee',
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        password: 'defaultPassword123',
        role: 'employee'
      };

      console.log('Creating new employee:', newEmployeeData);

      // API call to create employee
      const response = await axios.post('/api/users/create-employee', newEmployeeData);

      console.log('Employee created:', response.data);

      toast.success('New employee added successfully!');
      onEmployeeAdded();
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('Failed to create employee: ' + (error.response?.data?.message || error.message));
    }
  }, [formData, user, onEmployeeAdded]);

  if (!isOpen) return null;

  return (
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
              value={formData.firstName}
              onChange={(e) => onInputChange('firstName', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => onInputChange('lastName', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
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
              {user?.department?.name || 'Loading...'}
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Job Title</label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => onInputChange('jobTitle', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => onInputChange('startDate', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
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
  );
};

export default AddEmployeeModal;
