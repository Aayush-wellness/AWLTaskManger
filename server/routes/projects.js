const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const ProjectVendor = require('../models/ProjectVendor');
const { auth, adminAuth } = require('../middleware/auth');

// Get all projects with vendor counts
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    
    // Get vendor counts for each project
    const projectsWithVendors = await Promise.all(
      projects.map(async (project) => {
        const vendorCount = await ProjectVendor.countDocuments({ project: project._id });
        return {
          ...project.toObject(),
          vendorCount
        };
      })
    );
    
    res.json(projectsWithVendors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create project (admin only)
router.post('/', [auth, adminAuth], async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const project = new Project({
      name,
      description,
      status,
      createdBy: req.user.userId
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
