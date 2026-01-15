const EditPersonalInfoModal = ({ 
  isOpen, 
  formData, 
  onFormChange, 
  onSave, 
  onCancel 
}) => {
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
          width: '400px',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Edit Personal Information</h2>

        <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          <div style={{ marginBottom: '16px' }}>
            <label>Job Title</label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => onFormChange('jobTitle', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => onFormChange('startDate', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
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

export default EditPersonalInfoModal;
