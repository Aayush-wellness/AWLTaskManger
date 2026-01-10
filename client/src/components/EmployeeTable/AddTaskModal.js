import { useCallback } from 'react';
import toast from '../../utils/toast';

const AddTaskModal = ({
    isOpen,
    onClose,
    formData,
    onInputChange,
    onSave,
    projects = []
}) => {
    const handleSaveNewTask = useCallback(() => {
        // Basic validation
        if (!formData.taskName?.trim() || !formData.project?.trim()) {
            toast.warning('Please fill in required fields (Task and Project)');
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
                <h2>Add New Task</h2>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveNewTask(); }}>
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
                        <select
                            value={formData.project}
                            onChange={(e) => onInputChange('project', e.target.value)}
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
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => onInputChange('startDate', e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label>End Date</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => onInputChange('endDate', e.target.value)}
                            min={formData.startDate}
                            disabled={!formData.startDate}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label>Remark</label>
                        <textarea
                            value={formData.remark}
                            onChange={(e) => onInputChange('remark', e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px', resize: 'vertical' }}
                        />
                        <div style={{ marginBottom: '20px' }}>
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => onInputChange(prev => ({ ...prev, status: e.target.value }))}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In-progress</option>
                                <option value="completed">Completed</option>
                            </select>

                        </div>
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
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskModal;
