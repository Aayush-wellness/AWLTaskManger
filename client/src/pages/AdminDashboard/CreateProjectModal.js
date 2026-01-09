import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import axios from '../../config/axios';

const CreateProjectModal = ({ isOpen, onClose, departments, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!formData.department) {
      setError('Department is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/projects', {
        name: formData.name,
        description: formData.description,
        department: formData.department,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      setFormData({
        name: '',
        description: '',
        department: '',
        startDate: '',
        endDate: '',
      });

      onProjectCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      department: '',
      startDate: '',
      endDate: '',
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          fullWidth
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          placeholder="Enter project name"
        />

        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={3}
          placeholder="Enter project description"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Department</InputLabel>
          <Select
            name="department"
            value={formData.department}
            onChange={handleChange}
            label="Department"
          >
            {departments.map(dept => (
              <MenuItem key={dept._id} value={dept._id}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
          <TextField
            type="date"
            label="Start Date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            type="date"
            label="End Date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectModal;
