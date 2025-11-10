const mongoose = require('mongoose');

const projectVendorSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  entryType: {
    type: String,
    enum: ['vendor', 'agency', 'inhouse', 'document'],
    default: 'vendor'
  },
  vendorName: {
    type: String
  },
  agencyName: {
    type: String
  },
  contactPerson: {
    type: String
  },
  contactEmail: {
    type: String
  },
  contactPhone: {
    type: String
  },
  quote: {
    type: Number
  },
  documentLinks: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in-discussion'],
    default: 'pending'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ProjectVendor', projectVendorSchema);
