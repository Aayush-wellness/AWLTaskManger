const MIS = require('../models/MIS');
const User = require('../models/User');

class MetricsService {
  /**
   * Calculate consistency score based on submission frequency and gaps
   */
  static calculateConsistencyScore(submissions, period = 'weekly') {
    if (submissions.length === 0) return 0;

    const expectedSubmissions = period === 'weekly' ? 5 : 20; // Mon-Fri or full month
    const actualSubmissions = submissions.length;

    // Check for gaps (>3 days without submission)
    let gapPenalty = 0;
    const sortedSubmissions = submissions.sort((a, b) => a.createdAt - b.createdAt);

    for (let i = 0; i < sortedSubmissions.length - 1; i++) {
      const gap = (sortedSubmissions[i + 1].createdAt - sortedSubmissions[i].createdAt) / (1000 * 60 * 60 * 24);
      if (gap > 3) gapPenalty += 10;
    }

    const submissionRate = (actualSubmissions / expectedSubmissions) * 100;
    const consistencyScore = Math.max(0, submissionRate - gapPenalty);

    return Math.min(100, Math.round(consistencyScore));
  }

  /**
   * Calculate quality score based on description length and project diversity
   */
  static calculateQualityScore(submission) {
    let score = 50; // Base score

    if (!submission.rows || submission.rows.length === 0) return 0;

    // Bonus for description length (min 50 chars per project)
    const avgDescLength = submission.rows.reduce((sum, row) => sum + (row.description?.length || 0), 0) / submission.rows.length;

    if (avgDescLength > 150) score += 30;
    else if (avgDescLength > 100) score += 20;
    else if (avgDescLength > 50) score += 10;

    // Bonus for project diversity
    const uniqueProjects = new Set(submission.rows.map(r => r.projectName)).size;
    if (uniqueProjects > 5) score += 15;
    else if (uniqueProjects > 3) score += 10;
    else if (uniqueProjects > 1) score += 5;

    // Bonus for proper naming conventions
    const properlyNamed = submission.rows.filter(r => r.projectName && r.projectName.length > 3 && r.projectName.match(/^[A-Z]/)).length;

    if (properlyNamed === submission.rows.length) score += 5;

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate metrics for a single employee
   */
  static async calculateEmployeeMetrics(userId, startDate, endDate) {
    try {
      const submissions = await MIS.find({
        userId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort({ createdAt: 1 });

      if (submissions.length === 0) {
        return {
          userId,
          submissions: 0,
          totalProjects: 0,
          avgDescriptionLength: 0,
          consistencyScore: 0,
          qualityScore: 0,
          submissionDates: [],
          projectBreakdown: []
        };
      }

      // Calculate basic metrics
      const totalProjects = submissions.reduce((sum, sub) => sum + (sub.rows?.length || 0), 0);
      const totalDescLength = submissions.reduce((sum, sub) => 
        sum + sub.rows.reduce((rowSum, row) => rowSum + (row.description?.length || 0), 0), 0
      );
      const avgDescriptionLength = Math.round(totalDescLength / totalProjects);

      // Calculate consistency score
      const period = this.getPeriodType(startDate, endDate);
      const consistencyScore = this.calculateConsistencyScore(submissions, period);

      // Calculate average quality score
      const qualityScores = submissions.map(sub => this.calculateQualityScore(sub));
      const qualityScore = Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length);

      // Get submission dates
      const submissionDates = submissions.map(s => s.createdAt);

      // Calculate project breakdown
      const projectMap = {};
      submissions.forEach(sub => {
        sub.rows.forEach(row => {
          projectMap[row.projectName] = (projectMap[row.projectName] || 0) + 1;
        });
      });

      const projectBreakdown = Object.entries(projectMap)
        .map(([projectName, count]) => ({
          projectName,
          count,
          percentage: Math.round((count / totalProjects) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      return {
        userId,
        submissions: submissions.length,
        totalProjects,
        avgDescriptionLength,
        consistencyScore,
        qualityScore,
        submissionDates,
        projectBreakdown
      };
    } catch (error) {
      console.error('Error calculating employee metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate metrics for all employees
   */
  static async calculateTeamMetrics(startDate, endDate) {
    try {
      const users = await User.find({ role: 'employee' });
      const employeeMetrics = [];

      for (const user of users) {
        const metrics = await this.calculateEmployeeMetrics(user._id, startDate, endDate);
        
        // Get user details
        const userDetails = {
          ...metrics,
          userName: user.name,
          userEmail: user.email,
          department: user.department || 'Unassigned',
          status: this.determineStatus(metrics.consistencyScore, metrics.qualityScore),
          insights: this.generateInsights(metrics)
        };

        employeeMetrics.push(userDetails);
      }

      return employeeMetrics;
    } catch (error) {
      console.error('Error calculating team metrics:', error);
      throw error;
    }
  }

  /**
   * Determine employee status based on scores
   */
  static determineStatus(consistencyScore, qualityScore) {
    const avgScore = (consistencyScore + qualityScore) / 2;

    if (avgScore >= 80) return 'excellent';
    if (avgScore >= 60) return 'on-track';
    return 'at-risk';
  }

  /**
   * Generate insights for an employee
   */
  static generateInsights(metrics) {
    const insights = [];

    if (metrics.consistencyScore < 50) {
      insights.push('Low submission consistency - needs improvement');
    } else if (metrics.consistencyScore >= 80) {
      insights.push('Excellent submission consistency');
    }

    if (metrics.qualityScore < 50) {
      insights.push('Description quality needs improvement');
    } else if (metrics.qualityScore >= 80) {
      insights.push('High-quality submissions');
    }

    if (metrics.totalProjects > 5) {
      insights.push('Working on diverse projects');
    } else if (metrics.totalProjects <= 2) {
      insights.push('Limited project diversity');
    }

    if (metrics.avgDescriptionLength < 50) {
      insights.push('Descriptions are too brief');
    } else if (metrics.avgDescriptionLength > 150) {
      insights.push('Detailed and comprehensive descriptions');
    }

    return insights.join(' | ');
  }

  /**
   * Calculate department metrics
   */
  static async calculateDepartmentMetrics(employeeMetrics) {
    const departmentMap = {};

    employeeMetrics.forEach(emp => {
      if (!departmentMap[emp.department]) {
        departmentMap[emp.department] = {
          department: emp.department,
          employees: [],
          totalQuality: 0,
          totalConsistency: 0,
          employeeCount: 0
        };
      }

      departmentMap[emp.department].employees.push(emp);
      departmentMap[emp.department].totalQuality += emp.qualityScore;
      departmentMap[emp.department].totalConsistency += emp.consistencyScore;
      departmentMap[emp.department].employeeCount += 1;
    });

    const departmentMetrics = Object.values(departmentMap)
      .map(dept => ({
        department: dept.department,
        avgSubmissions: Math.round(dept.employees.reduce((sum, e) => sum + e.submissions, 0) / dept.employeeCount),
        avgQuality: Math.round(dept.totalQuality / dept.employeeCount),
        avgConsistency: Math.round(dept.totalConsistency / dept.employeeCount),
        employeeCount: dept.employeeCount
      }))
      .sort((a, b) => b.avgQuality - a.avgQuality)
      .map((dept, index) => ({ ...dept, ranking: index + 1 }));

    return departmentMetrics;
  }

  /**
   * Calculate project metrics
   */
  static async calculateProjectMetrics(startDate, endDate) {
    try {
      const submissions = await MIS.find({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const projectMap = {};
      let totalProjects = 0;

      submissions.forEach(sub => {
        sub.rows.forEach(row => {
          if (!projectMap[row.projectName]) {
            projectMap[row.projectName] = {
              projectName: row.projectName,
              frequency: 0,
              employees: new Set(),
              totalDescLength: 0,
              descCount: 0
            };
          }

          projectMap[row.projectName].frequency += 1;
          projectMap[row.projectName].employees.add(sub.userId.toString());
          projectMap[row.projectName].totalDescLength += row.description?.length || 0;
          projectMap[row.projectName].descCount += 1;
          totalProjects += 1;
        });
      });

      const projectMetrics = Object.values(projectMap)
        .map(proj => ({
          projectName: proj.projectName,
          frequency: proj.frequency,
          employeeCount: proj.employees.size,
          avgDescriptionLength: Math.round(proj.totalDescLength / proj.descCount),
          percentage: Math.round((proj.frequency / totalProjects) * 100)
        }))
        .sort((a, b) => b.frequency - a.frequency);

      return projectMetrics;
    } catch (error) {
      console.error('Error calculating project metrics:', error);
      throw error;
    }
  }

  /**
   * Identify top performers
   */
  static identifyTopPerformers(employeeMetrics, limit = 5) {
    return employeeMetrics
      .filter(emp => emp.submissions > 0)
      .sort((a, b) => {
        const scoreA = (a.consistencyScore + a.qualityScore) / 2;
        const scoreB = (b.consistencyScore + b.qualityScore) / 2;
        return scoreB - scoreA;
      })
      .slice(0, limit)
      .map(emp => ({
        userId: emp.userId,
        userName: emp.userName,
        score: Math.round((emp.consistencyScore + emp.qualityScore) / 2),
        reason: `${emp.submissions} submissions with ${emp.qualityScore}/100 quality score`
      }));
  }

  /**
   * Identify at-risk employees
   */
  static identifyAtRiskEmployees(employeeMetrics, limit = 5) {
    return employeeMetrics
      .filter(emp => emp.submissions < 3 || emp.consistencyScore < 50)
      .sort((a, b) => {
        const scoreA = (a.consistencyScore + a.qualityScore) / 2;
        const scoreB = (b.consistencyScore + b.qualityScore) / 2;
        return scoreA - scoreB;
      })
      .slice(0, limit)
      .map(emp => ({
        userId: emp.userId,
        userName: emp.userName,
        score: Math.round((emp.consistencyScore + emp.qualityScore) / 2),
        reason: emp.submissions < 3 ? 'Low submission count' : 'Inconsistent submissions'
      }));
  }

  /**
   * Generate recommendations
   */
  static generateRecommendations(employeeMetrics, departmentMetrics, projectMetrics) {
    const recommendations = [];

    // Check for low performers
    const lowPerformers = employeeMetrics.filter(emp => emp.status === 'at-risk');
    if (lowPerformers.length > 0) {
      recommendations.push(`${lowPerformers.length} employees need performance support`);
    }

    // Check for department disparities
    if (departmentMetrics.length > 1) {
      const topDept = departmentMetrics[0];
      const bottomDept = departmentMetrics[departmentMetrics.length - 1];
      const diff = topDept.avgQuality - bottomDept.avgQuality;

      if (diff > 20) {
        recommendations.push(`${bottomDept.department} department needs quality improvement (${diff} points behind ${topDept.department})`);
      }
    }

    // Check for project concentration
    if (projectMetrics.length > 0) {
      const topProject = projectMetrics[0];
      if (topProject.percentage > 40) {
        recommendations.push(`High concentration on "${topProject.projectName}" project (${topProject.percentage}%) - consider load balancing`);
      }
    }

    // Check for consistency issues
    const inconsistentEmployees = employeeMetrics.filter(emp => emp.consistencyScore < 60);
    if (inconsistentEmployees.length > 0) {
      recommendations.push(`${inconsistentEmployees.length} employees have inconsistent submission patterns`);
    }

    return recommendations;
  }

  /**
   * Determine period type
   */
  static getPeriodType(startDate, endDate) {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 7 ? 'weekly' : 'monthly';
  }

  /**
   * Calculate summary metrics
   */
  static calculateSummary(employeeMetrics, departmentMetrics) {
    const totalSubmissions = employeeMetrics.reduce((sum, emp) => sum + emp.submissions, 0);
    const totalEmployees = employeeMetrics.filter(emp => emp.submissions > 0).length;
    const totalProjects = employeeMetrics.reduce((sum, emp) => sum + emp.totalProjects, 0);

    const avgProjectsPerSubmission = totalSubmissions > 0 ? Math.round(totalProjects / totalSubmissions) : 0;
    const submissionRate = totalEmployees > 0 ? Math.round((totalSubmissions / (totalEmployees * 5)) * 100) : 0;
    const qualityScore = employeeMetrics.length > 0 ? Math.round(employeeMetrics.reduce((sum, emp) => sum + emp.qualityScore, 0) / employeeMetrics.length) : 0;
    const consistencyScore = employeeMetrics.length > 0 ? Math.round(employeeMetrics.reduce((sum, emp) => sum + emp.consistencyScore, 0) / employeeMetrics.length) : 0;

    return {
      totalSubmissions,
      totalEmployees,
      avgProjectsPerSubmission,
      submissionRate,
      qualityScore,
      consistencyScore
    };
  }
}

module.exports = MetricsService;
