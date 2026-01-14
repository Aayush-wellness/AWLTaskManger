const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all employees (admin only)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find({ role: 'employee' })
      .select('-password')
      .populate('department');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test route to verify authentication
router.get('/test-auth', auth, async (req, res) => {
  try {
    console.log('Test auth - User ID:', req.user.userId);
    const user = await User.findById(req.user.userId).select('-password').populate('department');
    res.json({ message: 'Authentication working', user: user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get employees from same department
router.get('/department/:departmentId', auth, async (req, res) => {
  try {
    const { departmentId } = req.params;
    const currentUserId = req.user.userId;
    
    console.log('Fetching employees for department:', departmentId);
    console.log('Current user ID:', currentUserId);
    
    // Find all users in the same department (excluding current user for now, but you can include if needed)
    const employees = await User.find({ 
      department: departmentId,
      // _id: { $ne: currentUserId } // Uncomment if you want to exclude current user
    })
    .select('-password')
    .populate('department')
    .sort({ createdAt: -1 });
    
    console.log(`Found ${employees.length} employees in department ${departmentId}`);
    
    res.json(employees);
  } catch (error) {
    console.error('Error fetching department employees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new employee (same department)
router.post('/create-employee', auth, async (req, res) => {
  try {
    const { name, email, department, jobTitle, startDate, password } = req.body;
    const currentUserId = req.user.userId;
    
    console.log('Creating employee:', { name, email, department, jobTitle });
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Get current user to verify department access
    const currentUser = await User.findById(currentUserId).populate('department');
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }
    
    // Verify that the department matches current user's department (security check)
    const targetDepartmentId = department.toString();
    const currentDepartmentId = (currentUser.department._id || currentUser.department).toString();
    
    if (targetDepartmentId !== currentDepartmentId) {
      return res.status(403).json({ message: 'You can only create employees in your own department' });
    }
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password || 'defaultPassword123', 10);
    
    // Create new employee
    const newEmployee = new User({
      name,
      email,
      password: hashedPassword,
      department: targetDepartmentId,
      jobTitle: jobTitle || 'Employee',
      startDate: startDate || new Date(),
      role: 'employee'
    });
    
    await newEmployee.save();
    
    // Return the created employee (without password)
    const createdEmployee = await User.findById(newEmployee._id)
      .select('-password')
      .populate('department');
    
    console.log('Employee created successfully:', createdEmployee.name);
    
    res.status(201).json({
      message: 'Employee created successfully',
      employee: createdEmployee
    });
    
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add task to user's profile
router.post('/add-task', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskName, project, startDate, endDate, remark, status, AssignedBy } = req.body;
    
    console.log('Adding task for user:', userId);
    console.log('Task data:', { taskName, project, AssignedBy, startDate, endDate, remark, status });
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize tasks array if it doesn't exist
    if (!user.tasks) {
      user.tasks = [];
    }
    
    // Create new task
    const newTask = {
      id: Date.now().toString(),
      taskName,
      project,
      AssignedBy: AssignedBy || 'Self',
      startDate: startDate || new Date(),
      endDate: endDate || null,
      remark: remark || '',
      status: status || 'pending'
    };
    
    // Add task to user's tasks array
    user.tasks.push(newTask);
    await user.save();
    
    console.log('Task added successfully:', newTask);
    
    res.status(201).json({
      message: 'Task added successfully',
      task: newTask
    });
    
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create task for a specific employee (for bulk assignment)
router.post('/:userId/tasks', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { taskName, project, startDate, endDate, remark, status, priority, AssignedBy } = req.body;
    
    console.log('Creating task for employee:', userId);
    console.log('Task data:', { taskName, project, startDate, endDate, remark, status, priority, AssignedBy });
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Initialize tasks array if it doesn't exist
    if (!user.tasks) {
      user.tasks = [];
    }
    
    // Create new task with MongoDB _id
    const newTask = {
      _id: new (require('mongoose')).Types.ObjectId(),
      taskName,
      project,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      remark: remark || '',
      status: status || 'pending',
      priority: priority || 'Medium',
      AssignedBy: AssignedBy || 'Admin',
      createdAt: new Date()
    };
    
    // Add task to user's tasks array
    user.tasks.push(newTask);
    await user.save();
    
    console.log('Task created successfully:', newTask);
    
    res.status(201).json({
      message: 'Task created successfully',
      task: newTask
    });
    
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user's task
router.put('/update-task/:taskId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;
    const { taskName, project, AssignedBy, startDate, endDate, remark, status } = req.body;

    console.log('Updating task:', taskId, 'for user:', userId);
    console.log('Request body:', { taskName, project, AssignedBy, startDate, endDate, remark, status });
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find and update the task
    const taskIndex = user.tasks.findIndex(task => task.id === taskId || task._id?.toString() === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Store old status to check if it changed to completed
    const oldStatus = user.tasks[taskIndex].status;
    const oldAssignedBy = user.tasks[taskIndex].AssignedBy;
    const oldTaskName = user.tasks[taskIndex].taskName;
    const oldProject = user.tasks[taskIndex].project;
    
    // Update task data
    user.tasks[taskIndex] = {
      ...user.tasks[taskIndex],
      taskName: taskName || user.tasks[taskIndex].taskName,
      project: project || user.tasks[taskIndex].project,
      AssignedBy: AssignedBy || user.tasks[taskIndex].AssignedBy,
      startDate: startDate || user.tasks[taskIndex].startDate,
      endDate: endDate || user.tasks[taskIndex].endDate,
      remark: remark || user.tasks[taskIndex].remark,
      status: status || user.tasks[taskIndex].status
    };
    
    await user.save();
    
    console.log('Task updated successfully:', user.tasks[taskIndex]);
    
    // Send notification to assigner if task status changed to completed
    const newStatus = status || oldStatus;
    const assignerName = AssignedBy || oldAssignedBy;
    
    if (newStatus === 'completed' && oldStatus !== 'completed' && assignerName && assignerName !== 'Self') {
      try {
        // Find the user who assigned the task
        const Notification = require('../models/Notification');
        const assigner = await User.findOne({ name: assignerName });
        
        if (assigner && assigner._id.toString() !== userId) {
          const notification = new Notification({
            recipient: assigner._id,
            type: 'TASK_COMPLETED',
            message: `${user.name} has completed the task: "${taskName || oldTaskName}"`,
            read: false,
            metadata: {
              completedBy: user.name,
              taskName: taskName || oldTaskName,
              projectName: project || oldProject,
              completedAt: new Date()
            }
          });
          
          await notification.save();
          console.log('Task completion notification sent to:', assigner.name);
        }
      } catch (notifError) {
        console.error('Error sending task completion notification:', notifError);
        // Don't fail the task update if notification fails
      }
    }
    
    res.json({
      message: 'Task updated successfully',
      task: user.tasks[taskIndex]
    });
    
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a specific employee's task (for admin/manager viewing employee details)
router.put('/:employeeId/update-task/:taskId', auth, async (req, res) => {
  try {
    const { employeeId, taskId } = req.params;
    const { taskName, project, AssignedBy, startDate, endDate, remark, status } = req.body;

    console.log('Updating task:', taskId, 'for employee:', employeeId);
    console.log('Request body:', { taskName, project, AssignedBy, startDate, endDate, remark, status });
    
    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Find and update the task
    const taskIndex = user.tasks.findIndex(task => task._id?.toString() === taskId || task.id === taskId);

    if (taskIndex === -1) {
      console.log('Task not found. Available tasks:', user.tasks.map(t => ({ id: t.id, _id: t._id?.toString() })));
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Store old status to check if it changed to completed
    const oldStatus = user.tasks[taskIndex].status;
    const oldAssignedBy = user.tasks[taskIndex].AssignedBy;
    const oldTaskName = user.tasks[taskIndex].taskName;
    const oldProject = user.tasks[taskIndex].project;
    
    // Update task data
    user.tasks[taskIndex] = {
      ...user.tasks[taskIndex],
      taskName: taskName || user.tasks[taskIndex].taskName,
      project: project || user.tasks[taskIndex].project,
      AssignedBy: AssignedBy || user.tasks[taskIndex].AssignedBy,
      startDate: startDate || user.tasks[taskIndex].startDate,
      endDate: endDate || user.tasks[taskIndex].endDate,
      remark: remark || user.tasks[taskIndex].remark,
      status: status || user.tasks[taskIndex].status
    };
    
    await user.save();
    
    console.log('Task updated successfully:', user.tasks[taskIndex]);
    
    // Send notification to assigner if task status changed to completed
    const newStatus = status || oldStatus;
    const assignerName = AssignedBy || oldAssignedBy;
    
    if (newStatus === 'completed' && oldStatus !== 'completed' && assignerName && assignerName !== 'Self') {
      try {
        const Notification = require('../models/Notification');
        const assigner = await User.findOne({ name: assignerName });
        
        if (assigner && assigner._id.toString() !== employeeId) {
          const notification = new Notification({
            recipient: assigner._id,
            type: 'TASK_COMPLETED',
            message: `${user.name} has completed the task: "${taskName || oldTaskName}"`,
            read: false,
            metadata: {
              completedBy: user.name,
              taskName: taskName || oldTaskName,
              projectName: project || oldProject,
              completedAt: new Date()
            }
          });
          
          await notification.save();
          console.log('Task completion notification sent to:', assigner.name);
        }
      } catch (notifError) {
        console.error('Error sending task completion notification:', notifError);
      }
    }
    
    res.json({
      message: 'Task updated successfully',
      task: user.tasks[taskIndex]
    });
    
  } catch (error) {
    console.error('Error updating employee task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user's task
router.delete('/delete-task/:taskId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;
    
    console.log('Deleting task:', taskId, 'for user:', userId);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find and remove the task
    const taskIndex = user.tasks.findIndex(task => task.id === taskId || task._id.toString() === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Remove task from array
    const deletedTask = user.tasks.splice(taskIndex, 1)[0];
    await user.save();
    
    console.log('Task deleted successfully:', deletedTask);
    
    res.json({
      message: 'Task deleted successfully',
      task: deletedTask
    });
    
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Simple test update route
router.put('/test-update', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;
    
    console.log('Test update - User ID:', userId);
    console.log('Test update - New name:', name);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Current user name:', user.name);
    user.name = name;
    await user.save();
    console.log('Updated user name:', user.name);
    
    res.json({ message: 'Test update successful', user: { name: user.name } });
  } catch (error) {
    console.error('Test update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile (MUST BE BEFORE /:userId route)
router.put('/profile', [auth, upload.single('avatar')], async (req, res) => {
  try {
    console.log('Profile update request received');
    console.log('User ID:', req.user.userId);
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    
    const userId = req.user.userId;
    const { name, email, phone, address, jobTitle, startDate } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.name, user.email);

    // Update user fields
    if (name) {
      console.log('Updating name from', user.name, 'to', name);
      user.name = name;
    }
    if (email) {
      console.log('Updating email from', user.email, 'to', email);
      user.email = email;
    }
    if (phone) user.phone = phone;
    if (address) user.address = address;
    // Note: Department updates should be handled by administrators
    // if (department) user.department = department;
    if (jobTitle) user.jobTitle = jobTitle;
    if (startDate) user.startDate = startDate;

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if it exists and is not a placeholder
      if (user.avatar && !user.avatar.includes('placeholder') && !user.avatar.includes('pravatar')) {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      
      // Set new avatar path
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    console.log('Saving user...');
    await user.save();
    console.log('User saved successfully');

    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-password').populate('department');
    console.log('Updated user:', updatedUser.name, updatedUser.email);
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }
    
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ 
        message: 'File upload error', 
        error: error.message 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new task (including tasks array) - GENERIC ROUTE (MUST BE LAST)
router.put('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { tasks, name, email, phone, address, jobTitle, startDate } = req.body;

    console.log('Updating user:', userId);
    console.log('Update data:', { tasks, name, email, phone, address, jobTitle, startDate });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if tasks are being updated
    if (tasks !== undefined) {
      user.tasks = tasks;
      // NOTE: Notification creation is handled by frontend calling /api/notifications/create
      // This prevents duplicate notifications
    }

    // Update other fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (jobTitle) user.jobTitle = jobTitle;
    if (startDate) user.startDate = startDate;

    await user.save();

    console.log('User updated successfully');

    const updatedUser = await User.findById(userId).select('-password').populate('department');
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available employees for a department (employees not in this department)
router.get('/available-for-department/:departmentId', auth, async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    console.log('Fetching available employees for department:', departmentId);
    
    // Find all employees NOT in this department
    const availableEmployees = await User.find({
      department: { $ne: departmentId },
      role: 'employee'
    })
    .select('-password')
    .populate('department')
    .sort({ name: 1 });
    
    console.log(`Found ${availableEmployees.length} available employees`);
    
    res.json(availableEmployees);
  } catch (error) {
    console.error('Error fetching available employees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
