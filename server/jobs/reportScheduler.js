const ReportService = require('../services/reportService');

class ReportScheduler {
  /**
   * Initialize - No automatic scheduling, only manual triggers
   */
  static initializeSchedules() {
    console.log('Report system initialized (Manual mode - no automatic scheduling)');
  }

  /**
   * Manually trigger weekly report generation
   */
  static async triggerWeeklyReport() {
    try {
      console.log('Generating weekly report...');

      const today = new Date();
      const dayOfWeek = today.getDay();

      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      friday.setHours(23, 59, 59, 999);

      const report = await ReportService.generateReport('weekly', monday, friday, 'manual');
      console.log(`Weekly report generated successfully: ${report._id}`);
      return report;
    } catch (error) {
      console.error('Error generating weekly report:', error);
      throw error;
    }
  }

  /**
   * Manually trigger monthly report generation
   */
  static async triggerMonthlyReport() {
    try {
      console.log('Generating monthly report...');

      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();

      const firstDay = new Date(year, month, 1);
      firstDay.setHours(0, 0, 0, 0);

      const lastDay = new Date(year, month + 1, 0);
      lastDay.setHours(23, 59, 59, 999);

      const report = await ReportService.generateReport('monthly', firstDay, lastDay, 'manual');
      console.log(`Monthly report generated successfully: ${report._id}`);
      return report;
    } catch (error) {
      console.error('Error generating monthly report:', error);
      throw error;
    }
  }

  /**
   * Generate custom date range report
   */
  static async generateCustomReport(reportType, startDate, endDate) {
    try {
      console.log(`Generating custom ${reportType} report for ${startDate} to ${endDate}`);

      const report = await ReportService.generateReport(reportType, startDate, endDate, 'manual');
      console.log(`Custom report generated successfully: ${report._id}`);
      return report;
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  }
}

module.exports = ReportScheduler;
