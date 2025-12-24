import { useCallback } from 'react';

const BulkEditModal = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSave,
  selectedCount
}) => {
  const handleSaveBulkEdit = useCallback(() => {
    // Only update fields that have values
    const updateData = {};
    if (formData.department?.trim()) updateData.department = formData.department;
    if (formData.jobTitle?.trim()) updateData.jobTitle = formData.jobTitle;
    if (formData.startDate?.trim()) updateData.startDate = formData.startDate;

    if (Object.keys(updateData).length === 0) {
      alert('Please fill at least one field to update');
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
        <h2>Bulk Edit Employees</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Editing {selectedCount} selected employee(s). Leave fields empty to skip.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); handleSaveBulkEdit(); }}>
          <div style={{ marginBottom: '16px' }}>
            <label>Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => onInputChange('department', e.target.value)}
              placeholder="Leave empty to skip"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Job Title</label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => onInputChange('jobTitle', e.target.value)}
              placeholder="Leave empty to skip"
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
              Update {selectedCount} Employee(s)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkEditModal;
