const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { auth, adminAuth } = require('../middleware/auth');

// Get all departments (public access for registration)
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create department (admin only)
router.post('/', [auth, adminAuth], async (req, res) => {
  try {
    const { name, description } = req.body;

    const department = new Department({
      name,
      description,
      createdBy: req.user.userId
    });

    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete department (admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const departmentId = req.params.id;
    
    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if there are users associated with this department
    const User = require('../models/User');
    const userCount = await User.countDocuments({ department: departmentId });
    
    if (userCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete department. There are ${userCount} user(s) associated with this department. Please reassign the users first.` 
      });
    }
    
    // Delete the department
    await Department.findByIdAndDelete(departmentId);
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
