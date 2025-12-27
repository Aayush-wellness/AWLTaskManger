import { useState, useMemo } from 'react';
import { ChevronRight, Trash2, Plus } from 'lucide-react';
import axios from '../../config/axios';
import './HierarchicalTaskSystem.css';

const DepartmentMasterTable = ({ departments, onSelectDepartment, onDepartmentsUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepts, setSelectedDepts] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredDepartments = useMemo(() => {
    return departments.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  const selectedCount = Object.values(selectedDepts).filter(Boolean).length;

  const handleSelectDept = (deptId) => {
    setSelectedDepts(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  const handleSelectAll = () => {
    if (selectedCount === filteredDepartments.length) {
      setSelectedDepts({});
    } else {
      const newSelected = {};
      filteredDepartments.forEach(dept => {
        newSelected[dept._id] = true;
      });
      setSelectedDepts(newSelected);
    }
  };

  const handleDeleteDept = async (deptId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/departments/${deptId}`);
        alert('Department deleted successfully!');
        if (onDepartmentsUpdate) {
          await onDepartmentsUpdate();
        }
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Failed to delete department: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(selectedDepts).filter(id => selectedDepts[id]);
    if (selectedIds.length === 0) {
      alert('Please select departments to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} department(s)?`)) {
      try {
        setLoading(true);
        await Promise.all(
          selectedIds.map(deptId => axios.delete(`/api/departments/${deptId}`))
        );
        alert(`${selectedIds.length} department(s) deleted successfully!`);
        setSelectedDepts({});
        if (onDepartmentsUpdate) {
          await onDepartmentsUpdate();
        }
      } catch (error) {
        console.error('Error deleting departments:', error);
        alert('Failed to delete some departments');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddDept = async () => {
    if (!newDeptName.trim()) {
      alert('Please enter a department name');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/departments', { name: newDeptName });
      alert('Department created successfully!');
      setNewDeptName('');
      setShowAddForm(false);
      if (onDepartmentsUpdate) {
        await onDepartmentsUpdate();
      }
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Failed to create department: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hierarchical-level">
      <div className="level-header">
        <h3>Departments</h3>
        <p className="level-description">Select a department to view employees</p>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Toolbar with Add and Bulk Delete */}
      <div className="department-toolbar">
        {selectedCount > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedCount} selected</span>
            <button
              className="bulk-delete-btn"
              onClick={handleBulkDelete}
              disabled={loading}
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
          </div>
        )}
        <button
          className="add-dept-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading}
        >
          <Plus size={16} />
          Add Department
        </button>
      </div>

      {/* Add Department Form */}
      {showAddForm && (
        <div className="add-dept-form">
          <input
            type="text"
            placeholder="Department name"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            className="form-input"
          />
          <div className="form-actions">
            <button
              className="btn-cancel"
              onClick={() => {
                setShowAddForm(false);
                setNewDeptName('');
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn-save"
              onClick={handleAddDept}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <div className="department-list">
        {filteredDepartments.length === 0 ? (
          <div className="empty-state">
            <p>No departments found</p>
          </div>
        ) : (
          <>
            {/* Select All Checkbox */}
            <div className="department-select-all">
              <input
                type="checkbox"
                checked={selectedCount === filteredDepartments.length && filteredDepartments.length > 0}
                onChange={handleSelectAll}
                className="dept-checkbox"
              />
              <span className="select-all-label">Select All</span>
            </div>

            {/* Department Items */}
            {filteredDepartments.map(dept => {
              const employeeCount = dept.employeeCount || 0;
              const isSelected = selectedDepts[dept._id];

              return (
                <div
                  key={dept._id}
                  className={`department-item ${isSelected ? 'selected' : ''}`}
                >
                  <div className="department-checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={isSelected || false}
                      onChange={() => handleSelectDept(dept._id)}
                      className="dept-checkbox"
                    />
                  </div>

                  <div
                    className="department-content"
                    onClick={() => !isSelected && onSelectDepartment(dept)}
                  >
                    <span className="department-name">{dept.name}</span>
                    {employeeCount > 0 && (
                      <span className="employee-badge">{employeeCount}</span>
                    )}
                  </div>

                  <div className="department-actions">
                    <button
                      className="delete-dept-btn"
                      onClick={() => handleDeleteDept(dept._id)}
                      disabled={loading}
                      title="Delete department"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={20} className="chevron-icon" />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentMasterTable;
