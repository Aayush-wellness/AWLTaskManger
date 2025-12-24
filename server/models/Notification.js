const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Who should receive this notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // What type of notification is this?
  type: {
    type: String,
    enum: ['TASK_ASSIGNED', 'TASK_DEADLINE', 'TASK_UPDATED', 'TASK_COMPLETED'],
    required: true
  },
  
  // The message to display to the user
  message: {
    type: String,
    required: true
  },
  
  // Has the user seen this notification yet?
  read: {
    type: Boolean,
    default: false
  },
  
  // When was this notification created?
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Link back to the related task (so users can click to view it)
  relatedTask: {
    taskId: String,
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Additional data that might be useful
  metadata: {
    assignedBy: String,
    projectName: String,
    taskName: String,
    dueDate: Date
  }
}, { 
  timestamps: true 
});

// Index for faster queries - we'll frequently search by recipient and read status
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);