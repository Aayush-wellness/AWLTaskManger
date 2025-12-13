const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB limit from env or default
  },
  fileFilter: function (_req, file, cb) {
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
    const { taskName, project, startDate, endDate, remark } = req.body;
    
    console.log('Adding task for user:', userId);
    console.log('Task data:', { taskName, project, startDate, endDate, remark });
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize tasks array if it doesn't exist
    if (!user.tasks) {
      user.tasks = [];
    }
    
    // Ensure existing tasks have IDs (migration fix)
    user.tasks = user.tasks.map(task => ({
      ...task.toObject ? task.toObject() : task,
      id: task.id || task._id?.toString() || Date.now().toString() + Math.random()
    }));
    
    // Create new task with guaranteed unique ID
    const newTask = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      taskName,
      project,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      remark: remark || ''
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

// Update user's task
router.put('/update-task/:taskId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;
    const { taskName, project, startDate, endDate, remark } = req.body;
    
    console.log('Updating task:', taskId, 'for user:', userId);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find and update the task
    const taskIndex = user.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update task data
    user.tasks[taskIndex] = {
      ...user.tasks[taskIndex],
      taskName: taskName || user.tasks[taskIndex].taskName,
      project: project || user.tasks[taskIndex].project,
      startDate: startDate || user.tasks[taskIndex].startDate,
      endDate: endDate || user.tasks[taskIndex].endDate,
      remark: remark || user.tasks[taskIndex].remark
    };
    
    await user.save();
    
    console.log('Task updated successfully:', user.tasks[taskIndex]);
    
    res.json({
      message: 'Task updated successfully',
      task: user.tasks[taskIndex]
    });
    
  } catch (error) {
    console.error('Error updating task:', error);
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
    const taskIndex = user.tasks.findIndex(task => task.id === taskId);
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

// Add task to specific user (for employee management)
router.post('/add-task-to-user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { taskName, project, startDate, endDate, remark } = req.body;
    const currentUserId = req.user.userId;
    
    console.log('Adding task to user:', userId, 'by user:', currentUserId);
    console.log('Task data:', { taskName, project, startDate, endDate, remark });
    
    // Get current user to verify department access
    const currentUser = await User.findById(currentUserId).populate('department');
    const targetUser = await User.findById(userId).populate('department');
    
    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify same department access (security check)
    const currentDepartmentId = (currentUser.department._id || currentUser.department).toString();
    const targetDepartmentId = (targetUser.department._id || targetUser.department).toString();
    
    if (currentDepartmentId !== targetDepartmentId) {
      return res.status(403).json({ message: 'You can only manage tasks for users in your department' });
    }
    
    // Initialize tasks array if it doesn't exist
    if (!targetUser.tasks) {
      targetUser.tasks = [];
    }
    
    // Create new task
    const newTask = {
      id: Date.now().toString(),
      taskName,
      project,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      remark: remark || ''
    };
    
    // Add task to user's tasks array
    targetUser.tasks.push(newTask);
    await targetUser.save();
    
    console.log('Task added successfully to user:', newTask);
    
    res.status(201).json({
      message: 'Task added successfully',
      task: newTask
    });
    
  } catch (error) {
    console.error('Error adding task to user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task for specific user (for employee management)
router.put('/update-task-for-user/:userId/:taskId', auth, async (req, res) => {
  try {
    const { userId, taskId } = req.params;
    const { taskName, project, startDate, endDate, remark } = req.body;
    const currentUserId = req.user.userId;
    
    console.log('Updating task:', taskId, 'for user:', userId, 'by user:', currentUserId);
    
    // Get current user to verify department access
    const currentUser = await User.findById(currentUserId).populate('department');
    const targetUser = await User.findById(userId).populate('department');
    
    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify same department access (security check)
    const currentDepartmentId = (currentUser.department._id || currentUser.department).toString();
    const targetDepartmentId = (targetUser.department._id || targetUser.department).toString();
    
    if (currentDepartmentId !== targetDepartmentId) {
      return res.status(403).json({ message: 'You can only manage tasks for users in your department' });
    }
    
    // Find and update the task
    const taskIndex = targetUser.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update task data
    targetUser.tasks[taskIndex] = {
      ...targetUser.tasks[taskIndex],
      taskName: taskName || targetUser.tasks[taskIndex].taskName,
      project: project || targetUser.tasks[taskIndex].project,
      startDate: startDate || targetUser.tasks[taskIndex].startDate,
      endDate: endDate || targetUser.tasks[taskIndex].endDate,
      remark: remark || targetUser.tasks[taskIndex].remark
    };
    
    await targetUser.save();
    
    console.log('Task updated successfully:', targetUser.tasks[taskIndex]);
    
    res.json({
      message: 'Task updated successfully',
      task: targetUser.tasks[taskIndex]
    });
    
  } catch (error) {
    console.error('Error updating task for user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete task for specific user (for employee management)
router.delete('/delete-task-for-user/:userId/:taskId', auth, async (req, res) => {
  try {
    const { userId, taskId } = req.params;
    const currentUserId = req.user.userId;
    
    console.log('Deleting task:', taskId, 'for user:', userId, 'by user:', currentUserId);
    
    // Get current user to verify department access
    const currentUser = await User.findById(currentUserId).populate('department');
    const targetUser = await User.findById(userId).populate('department');
    
    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify same department access (security check)
    const currentDepartmentId = (currentUser.department._id || currentUser.department).toString();
    const targetDepartmentId = (targetUser.department._id || targetUser.department).toString();
    
    if (currentDepartmentId !== targetDepartmentId) {
      return res.status(403).json({ message: 'You can only manage tasks for users in your department' });
    }
    
    // Find and remove the task
    const taskIndex = targetUser.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Remove task from array
    const deletedTask = targetUser.tasks.splice(taskIndex, 1)[0];
    await targetUser.save();
    
    console.log('Task deleted successfully:', deletedTask);
    
    res.json({
      message: 'Task deleted successfully',
      task: deletedTask
    });
    
  } catch (error) {
    console.error('Error deleting task for user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fix tasks without IDs (migration route)
router.post('/fix-task-ids', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log('Fixing task IDs for user:', userId);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.tasks || user.tasks.length === 0) {
      return res.json({ message: 'No tasks to fix', tasksFixed: 0 });
    }
    
    let tasksFixed = 0;
    
    // Fix tasks without proper IDs
    user.tasks = user.tasks.map((task, index) => {
      const taskObj = task.toObject ? task.toObject() : task;
      
      if (!taskObj.id) {
        tasksFixed++;
        return {
          ...taskObj,
          id: Date.now().toString() + '-' + index + '-' + Math.random().toString(36).substr(2, 9)
        };
      }
      
      return taskObj;
    });
    
    await user.save();
    
    console.log(`Fixed ${tasksFixed} tasks for user ${userId}`);
    
    res.json({ 
      message: 'Task IDs fixed successfully', 
      tasksFixed: tasksFixed,
      totalTasks: user.tasks.length
    });
    
  } catch (error) {
    console.error('Error fixing task IDs:', error);
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

// Update user profile
router.put('/profile', [auth, upload.single('avatar')], async (req, res) => {
  try {
    console.log('Profile update request received');
    console.log('User ID:', req.user.userId);
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    
    const userId = req.user.userId;
    const { name, email, phone, address, department, jobTitle, startDate } = req.body;

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

// Bulk update employees (role-based access control)
router.put('/bulk-update', auth, async (req, res) => {
  try {
    const { employeeIds, updateData } = req.body;
    const currentUserId = req.user.userId;
    
    console.log('Bulk updating employees:', employeeIds, 'with data:', updateData);
    console.log('Current user ID:', currentUserId, 'Role:', req.user.role);
    
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ message: 'Employee IDs array is required' });
    }
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Update data is required' });
    }
    
    // Get current user to verify role and department access
    const currentUser = await User.findById(currentUserId).populate('department');
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }
    
    // Role-based access control
    if (currentUser.role === 'employee') {
      // Employees can only bulk update themselves (if they select only their own ID)
      if (employeeIds.length !== 1 || employeeIds[0] !== currentUserId) {
        return res.status(403).json({ message: 'Employees can only update their own profile' });
      }
    } else if (currentUser.role === 'admin') {
      // Admins can bulk update employees in their department
      const currentDepartmentId = (currentUser.department._id || currentUser.department).toString();
      
      // Find all target employees and verify they're in the same department
      const targetEmployees = await User.find({ _id: { $in: employeeIds } }).populate('department');
      
      for (const employee of targetEmployees) {
        const employeeDepartmentId = (employee.department._id || employee.department).toString();
        if (employeeDepartmentId !== currentDepartmentId) {
          return res.status(403).json({ 
            message: `Admins can only update employees in their department. Employee ${employee.name} is in a different department.` 
          });
        }
      }
    } else {
      return res.status(403).json({ message: 'Invalid user role' });
    }
    
    // Prepare update object (only include allowed fields)
    const allowedFields = ['jobTitle', 'startDate'];
    const sanitizedUpdateData = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined && updateData[field] !== '') {
        sanitizedUpdateData[field] = updateData[field];
      }
    }
    
    if (Object.keys(sanitizedUpdateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    // Perform bulk update
    const result = await User.updateMany(
      { _id: { $in: employeeIds } },
      { $set: sanitizedUpdateData }
    );
    
    console.log('Bulk update result:', result);
    
    // Return updated employees
    const updatedEmployees = await User.find({ _id: { $in: employeeIds } })
      .select('-password')
      .populate('department');
    
    res.json({
      message: `Successfully updated ${result.modifiedCount} employees`,
      modifiedCount: result.modifiedCount,
      employees: updatedEmployees
    });
    
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update individual employee (role-based access control)
router.put('/update-employee/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { firstName, lastName, email, jobTitle, startDate } = req.body;
    const currentUserId = req.user.userId;
    
    console.log('Updating employee:', employeeId, 'with data:', req.body);
    console.log('Current user ID:', currentUserId, 'Role:', req.user.role);
    
    // Get current user to verify role and department access
    const currentUser = await User.findById(currentUserId).populate('department');
    const targetEmployee = await User.findById(employeeId).populate('department');
    
    if (!currentUser || !targetEmployee) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Role-based access control
    if (currentUser.role === 'employee') {
      // Employees can only edit their own profile
      if (currentUserId !== employeeId) {
        return res.status(403).json({ message: 'Employees can only edit their own profile' });
      }
    } else if (currentUser.role === 'admin') {
      // Admins can edit employees in their department
      const currentDepartmentId = (currentUser.department._id || currentUser.department).toString();
      const targetDepartmentId = (targetEmployee.department._id || targetEmployee.department).toString();
      
      if (currentDepartmentId !== targetDepartmentId) {
        return res.status(403).json({ message: 'Admins can only update employees in their department' });
      }
    } else {
      return res.status(403).json({ message: 'Invalid user role' });
    }
    
    // Update employee data
    const updateData = {};
    if (firstName && lastName) updateData.name = `${firstName} ${lastName}`;
    if (email) updateData.email = email;
    if (jobTitle) updateData.jobTitle = jobTitle;
    if (startDate) updateData.startDate = startDate;
    
    const updatedEmployee = await User.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('department');
    
    console.log('Employee updated successfully:', updatedEmployee.name);
    
    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
    
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete individual employee (role-based access control)
router.delete('/delete-employee/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const currentUserId = req.user.userId;
    
    console.log('Deleting employee:', employeeId);
    console.log('Current user ID:', currentUserId, 'Role:', req.user.role);
    
    // Get current user to verify role and department access
    const currentUser = await User.findById(currentUserId).populate('department');
    const targetEmployee = await User.findById(employeeId).populate('department');
    
    if (!currentUser || !targetEmployee) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Role-based access control
    if (currentUser.role === 'employee') {
      // Employees can delete their own account (but we might want to restrict this)
      if (currentUserId !== employeeId) {
        return res.status(403).json({ message: 'Employees can only delete their own account' });
      }
      // Optional: Prevent employees from deleting their own account
      // return res.status(403).json({ message: 'Employees cannot delete accounts. Contact admin.' });
    } else if (currentUser.role === 'admin') {
      // Admins can delete employees in their department (but not themselves)
      if (employeeId === currentUserId) {
        return res.status(400).json({ message: 'You cannot delete your own account' });
      }
      
      const currentDepartmentId = (currentUser.department._id || currentUser.department).toString();
      const targetDepartmentId = (targetEmployee.department._id || targetEmployee.department).toString();
      
      if (currentDepartmentId !== targetDepartmentId) {
        return res.status(403).json({ message: 'Admins can only delete employees in their department' });
      }
    } else {
      return res.status(403).json({ message: 'Invalid user role' });
    }
    
    // Delete employee
    await User.findByIdAndDelete(employeeId);
    
    console.log('Employee deleted successfully:', targetEmployee.name);
    
    res.json({
      message: 'Employee deleted successfully',
      employeeName: targetEmployee.name
    });
    
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk delete employees (role-based access control)
router.delete('/bulk-delete', auth, async (req, res) => {
  try {
    const { employeeIds } = req.body;
    const currentUserId = req.user.userId;
    
    console.log('Bulk deleting employees:', employeeIds);
    console.log('Current user ID:', currentUserId, 'Role:', req.user.role);
    
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ message: 'Employee IDs array is required' });
    }
    
    // Get current user to verify role and department access
    const currentUser = await User.findById(currentUserId).populate('department');
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }
    
    // Role-based access control
    if (currentUser.role === 'employee') {
      // Employees can only delete themselves (if they select only their own ID)
      if (employeeIds.length !== 1 || employeeIds[0] !== currentUserId) {
        return res.status(403).json({ message: 'Employees can only delete their own account' });
      }
      // Optional: Prevent employees from deleting their own account
      // return res.status(403).json({ message: 'Employees cannot delete accounts. Contact admin.' });
    } else if (currentUser.role === 'admin') {
      // Prevent self-deletion
      if (employeeIds.includes(currentUserId)) {
        return res.status(400).json({ message: 'You cannot delete your own account' });
      }
      
      // Admins can bulk delete employees in their department
      const currentDepartmentId = (currentUser.department._id || currentUser.department).toString();
      
      // Find all target employees and verify they're in the same department
      const targetEmployees = await User.find({ _id: { $in: employeeIds } }).populate('department');
      
      for (const employee of targetEmployees) {
        const employeeDepartmentId = (employee.department._id || employee.department).toString();
        if (employeeDepartmentId !== currentDepartmentId) {
          return res.status(403).json({ 
            message: `Admins can only delete employees in their department. Employee ${employee.name} is in a different department.` 
          });
        }
      }
    } else {
      return res.status(403).json({ message: 'Invalid user role' });
    }
    
    // Perform bulk delete
    const result = await User.deleteMany({ _id: { $in: employeeIds } });
    
    console.log('Bulk delete result:', result);
    
    res.json({
      message: `Successfully deleted ${result.deletedCount} employees`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
