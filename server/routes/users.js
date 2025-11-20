const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

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

module.exports = router;
