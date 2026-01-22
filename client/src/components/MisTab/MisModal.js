import { useState, useEffect } from 'react';
import toast from '../../utils/toast';

const MisModal = ({ isOpen, onClose, onSave, title, initialData, isEditMode }) => {
  const [rows, setRows] = useState(initialData || [
    { id: 1, projectName: '', description: '' }
  ]);
  const [nextId, setNextId] = useState(initialData ? Math.max(...initialData.map(r => r.id)) + 1 : 2);

  // Update rows when initialData changes (for edit mode)
  useEffect(() => {
    if (isOpen && initialData && isEditMode) {
      setRows(initialData);
      setNextId(Math.max(...initialData.map(r => r.id)) + 1);
    } else if (isOpen && !isEditMode) {
      setRows([{ id: 1, projectName: '', description: '' }]);
      setNextId(2);
    }
  }, [isOpen, initialData, isEditMode]);
  

  // Handle input change for a specific row
  const handleInputChange = (id, field, value) => {
    setRows(rows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // Add a new row
  const handleAddRow = () => {
    setRows([
      ...rows,
      { id: nextId, projectName: '', description: '' }
    ]);
    setNextId(nextId + 1);
  };

  // Remove a row
  const handleRemoveRow = (id) => {
    if (rows.length === 1) {
      toast.warning('You must have at least one row');
      return;
    }
    setRows(rows.filter(row => row.id !== id));
  };

  // Save data
  const handleSave = () => {
    // Validate that all rows have required fields
    const allFilled = rows.every(row => row.projectName.trim() && row.description.trim());
    
    if (!allFilled) {
      toast.warning('Please fill in all fields');
      return;
    }

    console.log(isEditMode ? 'Updating data:' : 'Saving data:', rows);
    toast.success(isEditMode ? 'Data updated successfully!' : 'Data saved successfully!');
    
    // Pass data to parent component
    if (onSave) {
      onSave(rows);
    }
    
    // Reset and close
    setRows([{ id: 1, projectName: '', description: '' }]);
    setNextId(2);
  };

  // Cancel
  const handleCancel = () => {
    setRows([{ id: 1, projectName: '', description: '' }]);
    setNextId(2);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
        maxWidth: '700px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '2px solid #f3f4f6'
        }}>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: 700 }}>
            {title}
          </h2>
          <button
            onClick={handleCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#94a3b8'
            }}
          >
            ✕
          </button>
        </div>

        {/* Rows Container */}
        <div style={{ marginBottom: '20px' }}>
          {rows.map((row, index) => (
            <div key={row.id} style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              alignItems: 'flex-end',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              {/* Row Number */}
              <div style={{
                minWidth: '30px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#64748b'
              }}>
                {index + 1}.
              </div>

              {/* Project Name Input */}
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748b',
                  marginBottom: '6px'
                }}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={row.projectName}
                  onChange={(e) => handleInputChange(row.id, 'projectName', e.target.value)}
                  placeholder="Enter project name"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    color: '#334155',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Description Input */}
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748b',
                  marginBottom: '6px'
                }}>
                  Description
                </label>
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) => handleInputChange(row.id, 'description', e.target.value)}
                  placeholder="Enter description"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    color: '#334155',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Add Button (only on last row) */}
              {index === rows.length - 1 && (
                <button
                  onClick={handleAddRow}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#5b7cfa',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '16px',
                    transition: 'all 0.2s',
                    minWidth: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4c63d2'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#5b7cfa'}
                  title="Add new row"
                >
                  +
                </button>
              )}

              {/* Delete Button (only if more than one row) */}
              {rows.length > 1 && (
                <button
                  onClick={() => handleRemoveRow(row.id)}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#fee2e2',
                    color: '#ef4444',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '16px',
                    transition: 'all 0.2s',
                    minWidth: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#fecaca'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#fee2e2'}
                  title="Delete row"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          paddingTop: '16px',
          borderTop: '2px solid #f3f4f6'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d1d5db'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e5e7eb'}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              backgroundColor: '#5b7cfa',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4c63d2'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#5b7cfa'}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default MisModal;
