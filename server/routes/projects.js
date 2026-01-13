const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const ProjectVendor = require('../models/ProjectVendor');
const { auth, adminAuth } = require('../middleware/auth');

// Get all projects with vendor counts and document links
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    // Get vendor counts and document links for each project
    const projectsWithVendors = await Promise.all(
      projects.map(async (project) => {
        const vendorCount = await ProjectVendor.countDocuments({ project: project._id });
        
        // Get all document links from vendor entries for this project
        const vendors = await ProjectVendor.find({ project: project._id });
        const allDocumentLinks = [];
        
        vendors.forEach(vendor => {
          if (vendor.documentLinks && vendor.documentLinks.length > 0) {
            vendor.documentLinks.forEach(doc => {
              allDocumentLinks.push({
                name: doc.name,
                url: doc.url,
                vendorName: vendor.vendorName || vendor.agencyName || 'Document Entry',
                entryType: vendor.entryType || 'vendor'
              });
            });
          }
        });
        
        return {
          ...project.toObject(),
          vendorCount,
          documentLinks: allDocumentLinks,
          documentCount: allDocumentLinks.length,
          createdByName: project.createdBy?.name || null
        };
      })
    );
    
    res.json(projectsWithVendors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create project (any authenticated user)
router.post('/', auth, async (req, res) => {
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

// Delete project (any authenticated user)
router.delete('/:id', auth, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if there are tasks associated with this project
    const Task = require('../models/Task');
    const taskCount = await Task.countDocuments({ project: projectId });
    
    if (taskCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete project. There are ${taskCount} task(s) associated with this project. Please reassign or delete the tasks first.` 
      });
    }

    // Delete associated project vendors
    await ProjectVendor.deleteMany({ project: projectId });
    
    // Delete the project
    await Project.findByIdAndDelete(projectId);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
