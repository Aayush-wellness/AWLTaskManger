import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Upload } from 'lucide-react';
import axios from '../../config/axios';
import * as XLSX from 'xlsx';
import './BulkTaskAssignmentModal.css';

const BulkTaskAssignmentModal = ({ isOpen, onClose, onTasksCreated, isEmbedded = false }) => {
  // Step 1: Department & Assignee Selection
  const [departments, setDepartments] = useState([]);
  const [expandedDept, setExpandedDept] = useState(null);
  const [selectedAssignees, setSelectedAssignees] = useState({});
  const [employees, setEmployees] = useState({});

  // Step 2: File Upload & Parsing
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractHeadlines, setExtractHeadlines] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);

  // Step 3: Task Preview & Assignment
  const [extractedTasks, setExtractedTasks] = useState([]);
  const [taskEdits, setTaskEdits] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/api/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch employees for a department
  const fetchEmployeesForDept = async (deptId) => {
    try {
      const res = await axios.get(`/api/users/department/${deptId}`);
      setEmployees(prev => ({
        ...prev,
        [deptId]: res.data
      }));
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  // const handleDepartmentClick = (deptId) => {
  //   if (expandedDept === deptId) {
  //     setExpandedDept(null);
  //   } else {
  //     setExpandedDept(deptId);
  //     if (!employees[deptId]) {
  //       fetchEmployeesForDept(deptId);
  //     }
  //   }
  // };

  const handleDepartmentClick = (deptId) => {
    setExpandedDept(deptId)
    if(!employees[deptId]){
      fetchEmployeesForDept(deptId)
    } else if(expandedDept === deptId){
      setExpandedDept(null)
    }
  }

  const handleAssigneeToggle = (employeeId) => {
    setSelectedAssignees(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const selectedCount = Object.values(selectedAssignees).filter(Boolean).length;

  // File upload handling
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setProcessingError(null);
    setIsProcessing(true);

    try {
      let extractedHeadlines = [];

      if (file.type === 'application/pdf') {
        extractedHeadlines = await extractFromPDF(file);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        extractedHeadlines = await extractFromDOCX(file);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        file.type === 'application/vnd.ms-powerpoint'
      ) {
        extractedHeadlines = await extractFromPPT(file);
      } else if (file.type === 'text/plain') {
        extractedHeadlines = await extractFromText(file);
      } else {
        throw new Error('Unsupported file type. Please upload PDF, DOCX, PPT, or TXT.');
      }

      if (extractedHeadlines.length === 0) {
        throw new Error('No content found in the file.');
      }

      // Initialize task edits with default values
      const initialEdits = {};
      extractedHeadlines.forEach((headline, idx) => {
        initialEdits[idx] = {
          title: headline,
          priority: 'Medium',
          dueDate: getDefaultDueDate(),
          included: true
        };
      });

      setExtractedTasks(extractedHeadlines);
      setTaskEdits(initialEdits);
    } catch (err) {
      setProcessingError(err.message || 'Failed to process file');
      setUploadedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractFromPDF = async (file) => {
    try {
      // For PDF parsing in browser, we'll use a simple text extraction approach
      // by reading the file as text and extracting lines
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      return lines.slice(0, 20); // Limit to 50 items
    } catch (err) {
      throw new Error('Failed to parse PDF. Please ensure it contains extractable text.');
    }
  };

  const extractFromDOCX = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      return data.flat().filter(item => item && String(item).trim().length > 0).slice(0, 50);
    } catch (err) {
      throw new Error('Failed to parse DOCX: ' + err.message);
    }
  };

  const extractFromPPT = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      return data.flat().filter(item => item && String(item).trim().length > 0).slice(0, 50);
    } catch (err) {
      throw new Error('Failed to parse PPT: ' + err.message);
    }
  };

  const extractFromText = async (file) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      return lines.slice(0, 50);
    } catch (err) {
      throw new Error('Failed to parse text file: ' + err.message);
    }
  };

  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const handleTaskEdit = (index, field, value) => {
    setTaskEdits(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }));
  };

  const handleTaskToggle = (index) => {
    setTaskEdits(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        included: !prev[index].included
      }
    }));
  };

  const includedTasksCount = Object.values(taskEdits).filter(t => t.included).length;

  const handleCreateTasks = async () => {
    const selectedEmployeeIds = Object.keys(selectedAssignees).filter(id => selectedAssignees[id]);
    const tasksToCreate = Object.entries(taskEdits)
      .filter(([_, task]) => task.included)
      .map(([_, task]) => task);

    if (selectedEmployeeIds.length === 0) {
      alert('Please select at least one assignee');
      return;
    }

    if (tasksToCreate.length === 0) {
      alert('Please select at least one task to create');
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = await axios.get('/api/users/test-auth');
      const assignedByName = currentUser.data.user.name;

      // Create tasks for each selected employee
      const promises = selectedEmployeeIds.flatMap(employeeId =>
        tasksToCreate.map(async (task) => {
          // Create task
          await axios.post(`/api/users/${employeeId}/tasks`, {
            taskName: task.title,
            project: task.project || 'Bulk Assignment',
            startDate: new Date().toISOString(),
            endDate: task.dueDate,
            status: 'pending',
            priority: task.priority,
            AssignedBy: assignedByName
          });

          // Create notification for the employee
          await axios.post('/api/notifications/create', {
            userId: employeeId,
            message: `New task assigned: ${task.title}`,
            type: 'task_assigned',
            relatedId: employeeId
          });
        })
      );

      await Promise.all(promises);

      alert(`Successfully created ${tasksToCreate.length} task(s) for ${selectedEmployeeIds.length} employee(s)`);
      onTasksCreated();
      handleClose();
    } catch (err) {
      console.error('Error creating tasks:', err);
      alert('Failed to create tasks: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedAssignees({});
    setUploadedFile(null);
    setExtractedTasks([]);
    setTaskEdits({});
    setProcessingError(null);
    onClose();
  };

  return (
    <>
      {isEmbedded ? (
        // Embedded mode - render content directly without Dialog
        <div className="bulk-task-embedded-container">
          <div className="bulk-task-embedded-content">
            {/* Left Panel: Department & Assignee Selection */}
            <Box sx={{ flex: '0 0 25%', borderRight: '1px solid #e0e0e0', pr: 2, overflowY: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Select Assignees
              </Typography>
              <Chip
                label={`${selectedCount} selected`}
                color="primary"
                sx={{ mb: 2 }}
              />

              {departments.map(dept => (
                <Box key={dept._id} sx={{ mb: 2 }}>
                  <Button
                    fullWidth
                    onClick={() => handleDepartmentClick(dept._id)}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: expandedDept === dept._id ? '#5b7cfa' : '#374151',
                      backgroundColor: expandedDept === dept._id ? '#f0f4ff' : 'transparent',
                      '&:hover': { backgroundColor: '#f9fafb' }
                    }}
                  >
                    {expandedDept === dept._id ? '▼' : '▶'} {dept.name}
                  </Button>

                  {expandedDept === dept._id && employees[dept._id] && (
                    <Box sx={{ pl: 2, mt: 1 }}>
                      {employees[dept._id].map(emp => (
                        <FormControlLabel
                          key={emp._id}
                          control={
                            <Checkbox
                              checked={selectedAssignees[emp._id] || false}
                              onChange={() => handleAssigneeToggle(emp._id)}
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {emp.name}
                              <Typography variant="caption" sx={{ display: 'block', color: '#9ca3af' }}>
                                {emp.jobTitle}
                              </Typography>
                            </Typography>
                          }
                          sx={{ display: 'block', mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>

            {/* Center Panel: File Upload & Parsing */}
            <Box sx={{ flex: '0 0 25%', borderRight: '1px solid #e0e0e0', pr: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Upload Document
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                Upload a PDF, DOCX, or PPT file to extract tasks
              </Typography>

              <Paper
                sx={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': { borderColor: '#5b7cfa', backgroundColor: '#f8f9ff' }
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.txt"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
                <Upload size={32} style={{ margin: '0 auto 12px', color: '#5b7cfa' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Drag and drop your file here
                </Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 2 }}>
                  or click to browse
                </Typography>
                <Button variant="outlined" size="small">
                  Browse Files
                </Button>
              </Paper>

              {uploadedFile && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                    ✓ {uploadedFile.name}
                  </Typography>
                </Box>
              )}

              {isProcessing && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <CircularProgress size={24} />
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    Processing file...
                  </Typography>
                </Box>
              )}

              {processingError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {processingError}
                </Alert>
              )}

              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Checkbox
                  checked={extractHeadlines}
                  onChange={(e) => setExtractHeadlines(e.target.checked)}
                />
                <Typography variant="body2">
                  Extract Headlines as Tasks
                </Typography>
              </Box>
            </Box>

            {/* Right Panel: Task Preview & Assignment */}
            <Box sx={{ flex: '0 0 50%', overflowY: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Task Preview
              </Typography>

              {extractedTasks.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Upload a document to see extracted tasks
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {extractedTasks.map((task, idx) => (
                    <Paper key={idx} sx={{ p: 2, backgroundColor: '#f9fafb' }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Checkbox
                          checked={taskEdits[idx]?.included || false}
                          onChange={() => handleTaskToggle(idx)}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          value={taskEdits[idx]?.title || ''}
                          onChange={(e) => handleTaskEdit(idx, 'title', e.target.value)}
                          placeholder="Task name"
                        />
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <FormControl size="small">
                          <InputLabel>Priority</InputLabel>
                          <Select
                            value={taskEdits[idx]?.priority || 'Medium'}
                            onChange={(e) => handleTaskEdit(idx, 'priority', e.target.value)}
                            label="Priority"
                          >
                            <MenuItem value="Low">Low</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                          </Select>
                        </FormControl>

                        <TextField
                          type="date"
                          size="small"
                          value={taskEdits[idx]?.dueDate || ''}
                          onChange={(e) => handleTaskEdit(idx, 'dueDate', e.target.value)}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </div>

          {/* Action Buttons */}
          <div className="bulk-task-embedded-actions">
            <Button
              variant="contained"
              onClick={handleCreateTasks}
              disabled={
                selectedCount === 0 ||
                extractedTasks.length === 0 ||
                includedTasksCount === 0 ||
                isSubmitting
              }
            >
              {isSubmitting ? 'Creating...' : `Create & Assign ${includedTasksCount} Tasks`}
            </Button>
          </div>
        </div>
      ) : (
        // Dialog mode - original implementation
        <Dialog open={isOpen} onClose={handleClose} maxWidth="xl" fullWidth>
          <DialogTitle>Bulk Task Assignment</DialogTitle>
          <DialogContent sx={{ display: 'flex', gap: 2, p: 2, minHeight: '600px' }}>
            {/* Left Panel: Department & Assignee Selection */}
            <Box sx={{ flex: '0 0 25%', borderRight: '1px solid #e0e0e0', pr: 2, overflowY: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Select Assignees
              </Typography>
              <Chip
                label={`Selected: ${selectedCount}`}
                color="primary"
                sx={{ mb: 2 }}
              />

              {departments.map(dept => (
                <Box key={dept._id} sx={{ mb: 2 }}>
                  <Button
                    fullWidth
                    onClick={() => handleDepartmentClick(dept._id)}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: expandedDept === dept._id ? '#5b7cfa' : '#374151',
                      backgroundColor: expandedDept === dept._id ? '#f0f4ff' : 'transparent',
                      '&:hover': { backgroundColor: '#f9fafb' }
                    }}
                  >
                    {expandedDept === dept._id ? '▼' : '▶'} {dept.name}
                  </Button>

                  {expandedDept === dept._id && employees[dept._id] && (
                    <Box sx={{ pl: 2, mt: 1 }}>
                      {employees[dept._id].map(emp => (
                        <FormControlLabel
                          key={emp._id}
                          control={
                            <Checkbox
                              checked={selectedAssignees[emp._id] || false}
                              onChange={() => handleAssigneeToggle(emp._id)}
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {emp.name}
                              <Typography variant="caption" sx={{ display: 'block', color: '#9ca3af' }}>
                                {emp.jobTitle}
                              </Typography>
                            </Typography>
                          }
                          sx={{ display: 'block', mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>

            {/* Center Panel: File Upload & Parsing */}
            <Box sx={{ flex: '0 0 25%', borderRight: '1px solid #e0e0e0', pr: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Upload File
              </Typography>

              <Paper
                sx={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': { borderColor: '#5b7cfa', backgroundColor: '#f8f9ff' }
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.txt"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
                <Upload size={32} style={{ margin: '0 auto 12px', color: '#5b7cfa' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Drag & drop or click to browse
                </Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                  PDF, DOCX, PPT, or TXT
                </Typography>
              </Paper>

              {uploadedFile && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                    ✓ {uploadedFile.name}
                  </Typography>
                </Box>
              )}

              {isProcessing && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <CircularProgress size={24} />
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    Processing file...
                  </Typography>
                </Box>
              )}

              {processingError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {processingError}
                </Alert>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={extractHeadlines}
                    onChange={(e) => setExtractHeadlines(e.target.checked)}
                  />
                }
                label="Extract Headlines as Tasks"
                sx={{ mt: 2, display: 'block' }}
              />
            </Box>

            {/* Right Panel: Task Preview & Assignment */}
            <Box sx={{ flex: '0 0 50%', overflowY: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Task Preview ({includedTasksCount} selected)
              </Typography>

              {extractedTasks.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Upload a file to see extracted tasks
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {extractedTasks.map((task, idx) => (
                    <Paper key={idx} sx={{ p: 2, backgroundColor: '#f9fafb' }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Checkbox
                          checked={taskEdits[idx]?.included || false}
                          onChange={() => handleTaskToggle(idx)}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          value={taskEdits[idx]?.title || ''}
                          onChange={(e) => handleTaskEdit(idx, 'title', e.target.value)}
                          placeholder="Task name"
                        />
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <FormControl size="small">
                          <InputLabel>Priority</InputLabel>
                          <Select
                            value={taskEdits[idx]?.priority || 'Medium'}
                            onChange={(e) => handleTaskEdit(idx, 'priority', e.target.value)}
                            label="Priority"
                          >
                            <MenuItem value="Low">Low</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                          </Select>
                        </FormControl>

                        <TextField
                          type="date"
                          size="small"
                          value={taskEdits[idx]?.dueDate || ''}
                          onChange={(e) => handleTaskEdit(idx, 'dueDate', e.target.value)}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateTasks}
              disabled={
                selectedCount === 0 ||
                extractedTasks.length === 0 ||
                includedTasksCount === 0 ||
                isSubmitting
              }
            >
              {isSubmitting ? 'Creating...' : `Create & Assign ${includedTasksCount} Tasks`}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default BulkTaskAssignmentModal;
