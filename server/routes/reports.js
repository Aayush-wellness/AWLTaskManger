const express = require('express');
const router = express.Router();
const ReportService = require('../services/reportService');
const ReportScheduler = require('../jobs/reportScheduler');
const { auth } = require('../middleware/auth');

// Middleware to check admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized - Admin access required' });
  }
  next();
};

/**
 * GET /api/reports
 * Get all reports with pagination and filters
 */
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, reportType, archived } = req.query;

    const filters = {};
    if (reportType) filters.reportType = reportType;
    if (archived !== undefined) filters.archived = archived === 'true';

    const result = await ReportService.getAllReports(parseInt(page), parseInt(limit), filters);

    res.json({
      message: 'Reports fetched successfully',
      data: result.reports,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/reports/latest/:reportType
 * Get latest report of a specific type
 */
router.get('/latest/:reportType', auth, adminOnly, async (req, res) => {
  try {
    const { reportType } = req.params;

    if (!['weekly', 'monthly'].includes(reportType)) {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    const report = await ReportService.getLatestReport(reportType);

    if (!report) {
      return res.status(404).json({ message: 'No report found' });
    }

    res.json({
      message: 'Latest report fetched successfully',
      data: report
    });
  } catch (error) {
    console.error('Error fetching latest report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/reports/:id
 * Get a specific report by ID
 */
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await ReportService.getReportById(id);

    res.json({
      message: 'Report fetched successfully',
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    if (error.message === 'Report not found') {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/reports/:id/comparison
 * Get report comparison (current vs previous)
 */
router.get('/:reportType/comparison', auth, adminOnly, async (req, res) => {
  try {
    const { reportType } = req.params;

    if (!['weekly', 'monthly'].includes(reportType)) {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    const comparison = await ReportService.getReportComparison(reportType);

    if (!comparison) {
      return res.status(404).json({ message: 'Not enough reports for comparison' });
    }

    res.json({
      message: 'Report comparison fetched successfully',
      data: comparison
    });
  } catch (error) {
    console.error('Error fetching report comparison:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/reports/:id/export/json
 * Export report as JSON
 */
router.get('/:id/export/json', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const jsonData = await ReportService.exportReportToJSON(id);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="report-${id}.json"`);
    res.send(jsonData);
  } catch (error) {
    console.error('Error exporting report:', error);
    if (error.message === 'Report not found') {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/reports/:id/export/csv
 * Export report as CSV
 */
router.get('/:id/export/csv', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const csvData = await ReportService.exportReportToCSV(id);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report-${id}.csv"`);
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting report:', error);
    if (error.message === 'Report not found') {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/reports/employee/:userId/trend
 * Get employee performance trend
 */
router.get('/employee/:userId/trend', auth, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const trend = await ReportService.getEmployeePerformanceTrend(userId);

    res.json({
      message: 'Employee trend fetched successfully',
      data: trend
    });
  } catch (error) {
    console.error('Error fetching employee trend:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * POST /api/reports/generate
 * Generate on-demand report
 */
router.post('/generate', auth, adminOnly, async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;

    // Validate input
    if (!reportType || !['weekly', 'monthly'].includes(reportType)) {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    const report = await ReportService.generateOnDemandReport(reportType, start, end, req.user.userId);

    res.status(201).json({
      message: 'Report generated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * POST /api/reports/trigger/weekly
 * Manually trigger weekly report generation
 */
router.post('/trigger/weekly', auth, adminOnly, async (req, res) => {
  try {
    const report = await ReportScheduler.triggerWeeklyReport();

    res.status(201).json({
      message: 'Weekly report triggered successfully',
      data: report
    });
  } catch (error) {
    console.error('Error triggering weekly report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * POST /api/reports/trigger/monthly
 * Manually trigger monthly report generation
 */
router.post('/trigger/monthly', auth, adminOnly, async (req, res) => {
  try {
    const report = await ReportScheduler.triggerMonthlyReport();

    res.status(201).json({
      message: 'Monthly report triggered successfully',
      data: report
    });
  } catch (error) {
    console.error('Error triggering monthly report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * PUT /api/reports/:id/archive
 * Archive a report
 */
router.put('/:id/archive', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await ReportService.archiveReport(id);

    res.json({
      message: 'Report archived successfully',
      data: report
    });
  } catch (error) {
    console.error('Error archiving report:', error);
    if (error.message === 'Report not found') {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * DELETE /api/reports/:id
 * Delete a report
 */
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await ReportService.deleteReport(id);

    res.json({
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    if (error.message === 'Report not found') {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
