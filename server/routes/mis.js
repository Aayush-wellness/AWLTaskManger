const express = require('express');
const router = express.Router();
const MIS = require('../models/MIS');
const { auth } = require('../middleware/auth');

// Get all MIS entries for current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const misEntries = await MIS.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'MIS entries fetched successfully',
      data: misEntries
    });
  } catch (error) {
    console.error('Error fetching MIS entries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get MIS entries for a specific employee (Admin only)
router.get('/employee/:employeeId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }

    const { employeeId } = req.params;

    const misEntries = await MIS.find({ userId: employeeId })
      .sort({ createdAt: -1 });

    res.json({
      message: 'MIS entries fetched successfully',
      data: misEntries
    });
  } catch (error) {
    console.error('Error fetching employee MIS entries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all MIS entries from all employees (Admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }
    
    const misEntries = await MIS.find()
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'All MIS entries fetched successfully',
      data: misEntries
    });
  } catch (error) {
    console.error('Error fetching all MIS entries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single MIS entry by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const misEntry = await MIS.findById(id);
    
    if (!misEntry) {
      return res.status(404).json({ message: 'MIS entry not found' });
    }
    
    // Check if user owns this entry
    if (misEntry.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    res.json({
      message: 'MIS entry fetched successfully',
      data: misEntry
    });
  } catch (error) {
    console.error('Error fetching MIS entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new MIS entry
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { rows } = req.body;
    
    // Validate rows
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'Rows are required and must be an array' });
    }
    
    // Validate each row
    for (let row of rows) {
      if (!row.projectName || !row.description) {
        return res.status(400).json({ message: 'Each row must have projectName and description' });
      }
    }
    
    const misEntry = new MIS({
      userId,
      rows,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await misEntry.save();
    
    console.log('MIS entry created:', misEntry._id);
    
    res.status(201).json({
      message: 'MIS entry created successfully',
      data: misEntry
    });
  } catch (error) {
    console.error('Error creating MIS entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update MIS entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { rows } = req.body;
    
    // Find the entry
    const misEntry = await MIS.findById(id);
    
    if (!misEntry) {
      return res.status(404).json({ message: 'MIS entry not found' });
    }
    
    // Check if user owns this entry
    if (misEntry.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    // Validate rows
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'Rows are required and must be an array' });
    }
    
    // Validate each row
    for (let row of rows) {
      if (!row.projectName || !row.description) {
        return res.status(400).json({ message: 'Each row must have projectName and description' });
      }
    }
    
    // Update the entry
    misEntry.rows = rows;
    misEntry.updatedAt = new Date();
    
    await misEntry.save();
    
    console.log('MIS entry updated:', misEntry._id);
    
    res.json({
      message: 'MIS entry updated successfully',
      data: misEntry
    });
  } catch (error) {
    console.error('Error updating MIS entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete MIS entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Find the entry
    const misEntry = await MIS.findById(id);
    
    if (!misEntry) {
      return res.status(404).json({ message: 'MIS entry not found' });
    }
    
    // Check if user owns this entry
    if (misEntry.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    // Delete the entry
    await MIS.findByIdAndDelete(id);
    
    console.log('MIS entry deleted:', id);
    
    res.json({
      message: 'MIS entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting MIS entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
