const express = require('express');
const router = express.Router();
const ProjectVendor = require('../models/ProjectVendor');
const { auth } = require('../middleware/auth');

// Get all vendors for a specific project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const vendors = await ProjectVendor.find({ project: req.params.projectId })
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all vendors (for admin overview)
router.get('/', auth, async (req, res) => {
  try {
    const vendors = await ProjectVendor.find()
      .populate('project', 'name')
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add vendor/quote to project
router.post('/', auth, async (req, res) => {
  try {
    const {
      project,
      entryType,
      vendorName,
      agencyName,
      contactPerson,
      contactEmail,
      contactPhone,
      quote,
      documentLinks,
      notes,
      status
    } = req.body;

    const vendor = new ProjectVendor({
      project,
      entryType,
      vendorName,
      agencyName,
      contactPerson,
      contactEmail,
      contactPhone,
      quote,
      documentLinks: documentLinks || [],
      notes,
      status,
      addedBy: req.user.userId
    });

    await vendor.save();
    const populatedVendor = await ProjectVendor.findById(vendor._id)
      .populate('addedBy', 'name email')
      .populate('project', 'name');

    res.status(201).json(populatedVendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update vendor/quote
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      entryType,
      vendorName,
      agencyName,
      contactPerson,
      contactEmail,
      contactPhone,
      quote,
      documentLinks,
      notes,
      status
    } = req.body;

    const vendor = await ProjectVendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Update fields
    if (entryType) vendor.entryType = entryType;
    if (vendorName !== undefined) vendor.vendorName = vendorName;
    if (agencyName !== undefined) vendor.agencyName = agencyName;
    if (contactPerson !== undefined) vendor.contactPerson = contactPerson;
    if (contactEmail !== undefined) vendor.contactEmail = contactEmail;
    if (contactPhone !== undefined) vendor.contactPhone = contactPhone;
    if (quote !== undefined) vendor.quote = quote;
    if (documentLinks) vendor.documentLinks = documentLinks;
    if (notes !== undefined) vendor.notes = notes;
    if (status) vendor.status = status;

    await vendor.save();
    const updatedVendor = await ProjectVendor.findById(vendor._id)
      .populate('addedBy', 'name email')
      .populate('project', 'name');

    res.json(updatedVendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete vendor/quote
router.delete('/:id', auth, async (req, res) => {
  try {
    const vendor = await ProjectVendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Only allow deletion by the person who added it or admin
    if (vendor.addedBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await ProjectVendor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
