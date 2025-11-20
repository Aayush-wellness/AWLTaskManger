const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'blocked'],
    default: 'pending'
  },
  remark: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Group tasks submitted together
  submissionGroup: {
    type: String,
    default: function() {
      return new mongoose.Types.ObjectId().toString();
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
