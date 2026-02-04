const AddTaskModal = ({
  isOpen,
  formData,
  onFormChange,
  onSave,
  onCancel,
  projects = []
}) => {
  // Calculate max end date (10 days from start date)
  const getMaxEndDate = () => {
    if (!formData.startDate) return '';
    
    const startDate = new Date(formData.startDate);
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(startDate.getDate() + 10);
    
    return maxEndDate.toISOString().split('T')[0];
  };

  // Handle start date change and validate end date
  const handleStartDateChange = (value) => {
    onFormChange('startDate', value);
    
    // If end date is set and exceeds 10 days from new start date, clear it
    if (formData.endDate && value) {
      const startDate = new Date(value);
      const endDate = new Date(formData.endDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 10) {
        onFormChange('endDate', '');
      }
    }
  };

  // Handle form submission with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate 10-day limit
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 10) {
        alert('End date cannot be more than 10 days from start date');
        return;
      }
    }
    
    onSave();
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
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
      }}
      onClick={(e) => {
        // Close modal only if clicking on the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          width: '500px',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Add New Task</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label>Task Name *</label>
            <input
              type="text"
              value={formData.taskName}
              onChange={(e) => onFormChange('taskName', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Project *</label>
            <select
              value={formData.project}
              onChange={(e) => onFormChange('project', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            >
              <option value="">-- Select Project --</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj.name}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label>Assigned By</label>
            <input
              type="text"
              value={formData.AssignedBy}
              disabled
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>Auto-filled with your name</small>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Start Date *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>End Date *</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => onFormChange('endDate', e.target.value)}
              required
              min={formData.startDate}
              max={getMaxEndDate()}
              disabled={!formData.startDate}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
            {formData.startDate && (
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                Maximum 10 days from start date (until {new Date(getMaxEndDate()).toLocaleDateString()})
              </small>
            )}
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
              className="modal-btn modal-btn-submit success"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
