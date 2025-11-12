const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const ProjectVendor = require('../models/ProjectVendor');
const { auth, adminAuth } = require('../middleware/auth');

// Get all projects with vendor counts and document links
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    
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
          documentCount: allDocumentLinks.length
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
