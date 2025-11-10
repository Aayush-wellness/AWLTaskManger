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

module.exports = router;
