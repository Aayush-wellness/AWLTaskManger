const EditTaskModal = ({ 
  isOpen, 
  formData, 
  onFormChange, 
  onSave, 
  onCancel 
}) => {
  if (!isOpen) return null;

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

        <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          <div style={{ marginBottom: '16px' }}>
            <label>Task Name</label>
            <input
              type="text"
              value={formData.taskName}
              onChange={(e) => onFormChange('taskName', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Project</label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => onFormChange('project', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Assigned By</label>
            <input
              type="text"
              value={formData.AssignedBy || ''}
              disabled
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Start Date</label>
            <input
              type="date"
              value={formatDateForInput(formData.startDate)}
              onChange={(e) => onFormChange('startDate', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>End Date</label>
            <input
              type="date"
              value={formatDateForInput(formData.endDate)}
              onChange={(e) => onFormChange('endDate', e.target.value)}
              min={formatDateForInput(formData.startDate)}
              disabled={!formData.startDate}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>Remark</label>
            <textarea
              value={formData.remark}
              onChange={(e) => onFormChange('remark', e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', resize: 'vertical' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => onFormChange('status', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In-progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              className="modal-btn modal-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn-submit"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
