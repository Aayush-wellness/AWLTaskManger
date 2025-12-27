const AddTaskModal = ({ 
  isOpen, 
  formData, 
  onFormChange, 
  onSubmit, 
  onCancel,
  projects,
  employees
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Assign New Task</h2>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label>Task Name *</label>
            <input
              type="text"
              placeholder="Enter task name"
              value={formData.taskName}
              onChange={(e) => onFormChange('taskName', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Project *</label>
            <select
              value={formData.project}
              onChange={(e) => onFormChange('project', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', borderRadius: '4px' }}
            >
              <option value="">Select a project</option>
              {projects.map(proj => (
                <option key={proj._id} value={proj._id}>{proj.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Assign To *</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => onFormChange('assignedTo', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', borderRadius: '4px' }}
            >
              <option value="">Select an employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => onFormChange('dueDate', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => onFormChange('status', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', borderRadius: '4px' }}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onCancel} 
              className="cancel-btn"
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
