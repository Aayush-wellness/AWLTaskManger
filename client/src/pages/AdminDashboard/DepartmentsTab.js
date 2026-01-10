import { useState } from 'react';
import { Plus } from 'lucide-react';
import axios from '../../config/axios';
import toast from '../../utils/toast';

const DepartmentsTab = ({ departments, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/departments', newDept);
      setNewDept({ name: '', description: '' });
      setShowModal(false);
      onRefresh();
      toast.success('Department created successfully!');
    } catch (err) {
      toast.error('Failed to create department');
    }
  };

  const handleDeleteDepartment = async (deptId, deptName) => {
    if (window.confirm(`Are you sure you want to delete the department "${deptName}"? This action cannot be undone and will affect all users in this department.`)) {
      try {
        await axios.delete(`/api/departments/${deptId}`);
        onRefresh();
        toast.success('Department deleted successfully!');
      } catch (err) {
        toast.error('Failed to delete department: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div>
      <div className="header-section">
        <h2>Departments</h2>
        <button onClick={() => setShowModal(true)} className="add-btn">
          <Plus size={20} /> Add Department
        </button>
      </div>

      <div className="cards-grid">
        {departments.map(dept => (
          <div key={dept._id} className="info-card">
            <div className="card-header">
              <h3>{dept.name}</h3>
              <button 
                onClick={() => handleDeleteDepartment(dept._id, dept.name)}
                className="delete-card-btn"
                title="Delete Department"
              >
                🗑️
              </button>
            </div>
            <p>{dept.description}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Department</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Department Name"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newDept.description}
                onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                rows="4"
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsTab;
