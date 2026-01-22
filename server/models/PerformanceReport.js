const mongoose = require('mongoose');

const performanceReportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: true
  },
  
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  generatedBy: {
    type: String,
    enum: ['system', 'manual'],
    default: 'system'
  },
  
  generatedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  summary: {
    totalSubmissions: Number,
    totalEmployees: Number,
    avgProjectsPerSubmission: Number,
    submissionRate: Number,
    qualityScore: Number,
    consistencyScore: Number
  },
  
  employeeMetrics: [{
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    userEmail: String,
    department: String,
    submissions: Number,
    totalProjects: Number,
    avgDescriptionLength: Number,
    consistencyScore: Number,
    qualityScore: Number,
    status: {
      type: String,
      enum: ['excellent', 'on-track', 'at-risk'],
      default: 'on-track'
    },
    insights: String,
    submissionDates: [Date],
    projectBreakdown: [{
      projectName: String,
      count: Number,
      percentage: Number
    }]
  }],
  
  departmentMetrics: [{
    department: String,
    avgSubmissions: Number,
    avgQuality: Number,
    avgConsistency: Number,
    employeeCount: Number,
    ranking: Number
  }],
  
  projectMetrics: [{
    projectName: String,
    frequency: Number,
    employeeCount: Number,
    avgDescriptionLength: Number,
    percentage: Number
  }],
  
  recommendations: [String],
  
  topPerformers: [{
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    score: Number,
    reason: String
  }],
  
  atRiskEmployees: [{
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    score: Number,
    reason: String
  }],
  
  archived: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for efficient queries
performanceReportSchema.index({ reportType: 1, 'period.startDate': 1 });
performanceReportSchema.index({ generatedAt: -1 });
performanceReportSchema.index({ archived: 1 });

module.exports = mongoose.model('PerformanceReport', performanceReportSchema);
