import { useCallback } from 'react';

const EditEmployeeModal = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSave
}) => {
  const handleSaveEdit = useCallback(() => {
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      alert('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }

    onSave();
  }, [formData, onSave]);

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
        <h2>Edit Employee</h2>

        <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
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
            <label>Department *</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => onInputChange('department', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Job Title *</label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => onInputChange('jobTitle', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>Start Date *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => onInputChange('startDate', e.target.value)}
              required
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
              style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
