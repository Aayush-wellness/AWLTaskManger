const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  jobTitle: {
    type: String
  },
  startDate: {
    type: Date
  },
  avatar: {
    type: String
  },
  tasks: [{
    id: String,
    taskName: String,
    project: String,
    startDate: Date,
    endDate: Date,
    remark: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
