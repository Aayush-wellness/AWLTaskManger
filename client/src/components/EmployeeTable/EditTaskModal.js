import { useCallback } from 'react';

const EditTaskModal = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSave
}) => {
  // Helper function to format date to YYYY-MM-DD for date input
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    
    // Convert to Date object if it's a string
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const handleSaveTaskEdit = useCallback(() => {
    // Basic validation
    if (!formData.taskName?.trim() || !formData.project?.trim()) {
      alert('Please fill in required fields (Task and Project)');
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
        <h2>Edit Task</h2>

        <form onSubmit={(e) => { e.preventDefault(); handleSaveTaskEdit(); }}>
          <div style={{ marginBottom: '16px' }}>
            <label>Task *</label>
            <input
              type="text"
              value={formData.taskName}
              onChange={(e) => onInputChange('taskName', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Project *</label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => onInputChange('project', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Assigned By</label>
            <input
              type="text"
              value={formData.AssignedBy}
              disabled
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>Auto-filled with task assigner's name</small>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Start Date</label>
            <input
              type="date"
              value={formatDateForInput(formData.startDate)}
              onChange={(e) => onInputChange('startDate', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>End Date</label>
            <input
              type="date"
              value={formatDateForInput(formData.endDate)}
              onChange={(e) => onInputChange('endDate', e.target.value)}
              min={formatDateForInput(formData.startDate)}
              disabled={!formData.startDate}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Remark</label>
            <textarea
              value={formData.remark}
              onChange={(e) => onInputChange('remark', e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', resize: 'vertical' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => onInputChange('status', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In-progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
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
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
