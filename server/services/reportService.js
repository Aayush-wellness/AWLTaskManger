const PerformanceReport = require('../models/PerformanceReport');
const MetricsService = require('./metricsService');

class ReportService {
  /**
   * Generate a complete performance report
   */
  static async generateReport(reportType, startDate, endDate, generatedBy = 'system', userId = null) {
    try {
      console.log(`Generating ${reportType} report for period: ${startDate} to ${endDate}`);

      // Calculate all metrics
      const employeeMetrics = await MetricsService.calculateTeamMetrics(startDate, endDate);
      const departmentMetrics = await MetricsService.calculateDepartmentMetrics(employeeMetrics);
      const projectMetrics = await MetricsService.calculateProjectMetrics(startDate, endDate);

      // Identify top performers and at-risk employees
      const topPerformers = MetricsService.identifyTopPerformers(employeeMetrics);
      const atRiskEmployees = MetricsService.identifyAtRiskEmployees(employeeMetrics);

      // Generate recommendations
      const recommendations = MetricsService.generateRecommendations(employeeMetrics, departmentMetrics, projectMetrics);

      // Calculate summary
      const summary = MetricsService.calculateSummary(employeeMetrics, departmentMetrics);

      // Create report document
      const reportData = {
        reportType,
        period: {
          startDate,
          endDate
        },
        generatedAt: new Date(),
        generatedBy,
        generatedByUserId: userId,
        summary,
        employeeMetrics,
        departmentMetrics,
        projectMetrics,
        recommendations,
        topPerformers,
        atRiskEmployees,
        archived: false
      };

      // Save to database
      const report = new PerformanceReport(reportData);
      await report.save();

      console.log(`Report generated successfully: ${report._id}`);
      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Get all reports with pagination
   */
  static async getAllReports(page = 1, limit = 10, filters = {}) {
    try {
      const query = { archived: filters.archived || false };

      if (filters.reportType) {
        query.reportType = filters.reportType;
      }

      if (filters.startDate && filters.endDate) {
        query['period.startDate'] = { $gte: filters.startDate };
        query['period.endDate'] = { $lte: filters.endDate };
      }

      const skip = (page - 1) * limit;

      const reports = await PerformanceReport.find(query)
        .sort({ generatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await PerformanceReport.countDocuments(query);

      return {
        reports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  /**
   * Get a specific report by ID
   */
  static async getReportById(reportId) {
    try {
      const report = await PerformanceReport.findById(reportId);

      if (!report) {
        throw new Error('Report not found');
      }

      return report;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }

  /**
   * Get latest report of a specific type
   */
  static async getLatestReport(reportType) {
    try {
      const report = await PerformanceReport.findOne({
        reportType,
        archived: false
      })
        .sort({ generatedAt: -1 })
        .lean();

      return report;
    } catch (error) {
      console.error('Error fetching latest report:', error);
      throw error;
    }
  }

  /**
   * Archive a report
   */
  static async archiveReport(reportId) {
    try {
      const report = await PerformanceReport.findByIdAndUpdate(
        reportId,
        { archived: true },
        { new: true }
      );

      if (!report) {
        throw new Error('Report not found');
      }

      return report;
    } catch (error) {
      console.error('Error archiving report:', error);
      throw error;
    }
  }

  /**
   * Delete a report
   */
  static async deleteReport(reportId) {
    try {
      const report = await PerformanceReport.findByIdAndDelete(reportId);

      if (!report) {
        throw new Error('Report not found');
      }

      return report;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  /**
   * Generate report for specific date range (on-demand)
   */
  static async generateOnDemandReport(reportType, startDate, endDate, userId) {
    try {
      return await this.generateReport(reportType, startDate, endDate, 'manual', userId);
    } catch (error) {
      console.error('Error generating on-demand report:', error);
      throw error;
    }
  }

  /**
   * Get report comparison (current vs previous)
   */
  static async getReportComparison(reportType) {
    try {
      const reports = await PerformanceReport.find({
        reportType,
        archived: false
      })
        .sort({ generatedAt: -1 })
        .limit(2)
        .lean();

      if (reports.length < 2) {
        return null;
      }

      const current = reports[0];
      const previous = reports[1];

      return {
        current,
        previous,
        comparison: {
          submissionChange: current.summary.totalSubmissions - previous.summary.totalSubmissions,
          qualityChange: current.summary.qualityScore - previous.summary.qualityScore,
          consistencyChange: current.summary.consistencyScore - previous.summary.consistencyScore
        }
      };
    } catch (error) {
      console.error('Error getting report comparison:', error);
      throw error;
    }
  }

  /**
   * Export report to JSON
   */
  static async exportReportToJSON(reportId) {
    try {
      const report = await this.getReportById(reportId);
      return JSON.stringify(report, null, 2);
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  /**
   * Export report to CSV
   */
  static async exportReportToCSV(reportId) {
    try {
      const report = await this.getReportById(reportId);

      let csv = 'Employee Performance Report\n';
      csv += `Report Type: ${report.reportType}\n`;
      csv += `Period: ${report.period.startDate} to ${report.period.endDate}\n`;
      csv += `Generated: ${report.generatedAt}\n\n`;

      // Summary section
      csv += 'SUMMARY\n';
      csv += `Total Submissions,${report.summary.totalSubmissions}\n`;
      csv += `Total Employees,${report.summary.totalEmployees}\n`;
      csv += `Avg Projects/Submission,${report.summary.avgProjectsPerSubmission}\n`;
      csv += `Submission Rate,${report.summary.submissionRate}%\n`;
      csv += `Quality Score,${report.summary.qualityScore}/100\n`;
      csv += `Consistency Score,${report.summary.consistencyScore}/100\n\n`;

      // Employee metrics
      csv += 'EMPLOYEE METRICS\n';
      csv += 'Name,Email,Department,Submissions,Total Projects,Avg Desc Length,Consistency,Quality,Status\n';
      report.employeeMetrics.forEach(emp => {
        csv += `"${emp.userName}","${emp.userEmail}","${emp.department}",${emp.submissions},${emp.totalProjects},${emp.avgDescriptionLength},${emp.consistencyScore},${emp.qualityScore},"${emp.status}"\n`;
      });

      csv += '\n';

      // Department metrics
      csv += 'DEPARTMENT METRICS\n';
      csv += 'Department,Avg Submissions,Avg Quality,Avg Consistency,Employee Count,Ranking\n';
      report.departmentMetrics.forEach(dept => {
        csv += `"${dept.department}",${dept.avgSubmissions},${dept.avgQuality},${dept.avgConsistency},${dept.employeeCount},${dept.ranking}\n`;
      });

      csv += '\n';

      // Project metrics
      csv += 'PROJECT METRICS\n';
      csv += 'Project Name,Frequency,Employee Count,Avg Desc Length,Percentage\n';
      report.projectMetrics.forEach(proj => {
        csv += `"${proj.projectName}",${proj.frequency},${proj.employeeCount},${proj.avgDescriptionLength},${proj.percentage}%\n`;
      });

      return csv;
    } catch (error) {
      console.error('Error exporting report to CSV:', error);
      throw error;
    }
  }

  /**
   * Get employee performance trend
   */
  static async getEmployeePerformanceTrend(userId, limit = 5) {
    try {
      const reports = await PerformanceReport.find({
        'employeeMetrics.userId': userId,
        archived: false
      })
        .sort({ generatedAt: -1 })
        .limit(limit)
        .lean();

      const trend = reports.map(report => {
        const empMetrics = report.employeeMetrics.find(emp => emp.userId.toString() === userId.toString());
        return {
          reportDate: report.generatedAt,
          submissions: empMetrics?.submissions || 0,
          qualityScore: empMetrics?.qualityScore || 0,
          consistencyScore: empMetrics?.consistencyScore || 0,
          status: empMetrics?.status || 'unknown'
        };
      });

      return trend.reverse(); // Oldest first
    } catch (error) {
      console.error('Error getting employee trend:', error);
      throw error;
    }
  }
}

module.exports = ReportService;
