# Performance Report - Manual Mode Setup Guide

## 🎯 Overview

The Performance Report system has been converted to **manual mode only**. Admins can now generate reports on-demand whenever they need them, without any automated scheduling.

---

## 📋 What's Different

### Before (Automated)
- Reports generated automatically every Friday at 5 PM
- Reports generated automatically on month-end at 5 PM
- Cron jobs running in background
- Admin had to wait for scheduled time

### After (Manual)
- Reports generated on-demand by admin
- Click "Generate Weekly Report" button
- Click "Generate Monthly Report" button
- No background jobs
- Admin has full control

---

## 🚀 Getting Started

### 1. No Additional Setup Needed
The system is ready to use as-is. No configuration required.

### 2. Start Server
```bash
npm start
# Server starts normally, no scheduler initialization
```

### 3. Access Reports
1. Login as admin
2. Go to Admin Dashboard
3. Click "Performance Reports" tab
4. Click "Generate Weekly Report" or "Generate Monthly Report"
5. Report appears in list

---

## 📊 UI Layout

```
Performance Analysis Reports
├── Report Type Filter (All/Weekly/Monthly)
├── Status Filter (Active/Archived)
├── [Generate Weekly Report] Button
├── [Generate Monthly Report] Button
├── Info Message: "Reports are generated manually on-demand"
├── Report Selection Dropdown
├── [Export JSON] [Export CSV] [Archive] [Delete] Buttons
├── Summary Cards (6 metrics)
├── Employee Metrics Table
├── Department Performance Cards
├── Project Activity Table
├── Top Performers List
├── At-Risk Employees List
└── Recommendations
```

---

## 🔘 Button Functions

### Generate Weekly Report
- **Location**: Filter panel
- **Action**: Generates report for current week (Monday-Friday)
- **Time**: ~2-5 seconds
- **Result**: Report appears in list

### Generate Monthly Report
- **Location**: Filter panel
- **Action**: Generates report for current month (1st-last day)
- **Time**: ~3-10 seconds
- **Result**: Report appears in list

### Export JSON
- **Location**: Report actions
- **Action**: Downloads full report as JSON file
- **Format**: Complete report data structure

### Export CSV
- **Location**: Report actions
- **Action**: Downloads report as CSV file
- **Format**: Tabular format for Excel/Sheets

### Archive
- **Location**: Report actions
- **Action**: Hides report from active list
- **Result**: Report moves to archived section

### Delete
- **Location**: Report actions
- **Action**: Permanently removes report
- **Confirmation**: Yes/No dialog

---

## 📈 Report Contents

Each generated report includes:

### Summary Section
- Total Submissions
- Active Employees
- Avg Projects/Submission
- Submission Rate %
- Quality Score /100
- Consistency Score /100

### Employee Metrics
- Name & Email
- Submission Count
- Total Projects
- Consistency & Quality Scores
- Performance Status

### Department Performance
- Department Name
- Average Submissions
- Quality & Consistency Scores
- Employee Count
- Ranking

### Project Activity
- Project Name
- Frequency
- Employee Count
- Avg Description Length
- % of Total Work

### Top Performers
- Top 5 employees
- Combined score
- Reason for ranking

### At-Risk Employees
- Identified employees
- Score & reason
- Actionable insights

### Recommendations
- Auto-generated suggestions
- Performance improvement tips
- Load balancing advice

---

## 🔌 API Endpoints

### Generate Reports
```
POST /api/reports/trigger/weekly
POST /api/reports/trigger/monthly
POST /api/reports/generate (with custom date range)
```

### View Reports
```
GET /api/reports (list all)
GET /api/reports/:id (get specific)
GET /api/reports/latest/:reportType (get latest)
```

### Export Reports
```
GET /api/reports/:id/export/json
GET /api/reports/:id/export/csv
```

### Manage Reports
```
PUT /api/reports/:id/archive
DELETE /api/reports/:id
```

---

## 💡 Usage Scenarios

### Scenario 1: Weekly Review
1. Every Friday, admin clicks "Generate Weekly Report"
2. Report generates for Mon-Fri
3. Admin reviews metrics
4. Identifies top performers
5. Notes at-risk employees
6. Takes action

### Scenario 2: Monthly Analysis
1. At month-end, admin clicks "Generate Monthly Report"
2. Report generates for entire month
3. Admin compares with previous month
4. Analyzes department performance
5. Plans resource allocation
6. Exports as CSV for sharing

### Scenario 3: Ad-Hoc Analysis
1. Admin needs quick performance check
2. Clicks "Generate Weekly Report"
3. Views current week's metrics
4. Exports as JSON for analysis
5. Shares with team

### Scenario 4: Performance Improvement
1. Admin identifies at-risk employee
2. Reviews their metrics in report
3. Provides support/training
4. Generates report next week
5. Tracks improvement

---

## 📊 Metrics Explained

### Consistency Score (0-100)
- Measures submission frequency
- Based on: (Actual Submissions / Expected) × 100
- Expected: 5/week or 20/month
- Penalty: -10 points per gap > 3 days

### Quality Score (0-100)
- Measures submission quality
- Base: 50 points
- Description length: +10-30 points
- Project diversity: +5-15 points
- Naming conventions: +5 points

### Status
- **Excellent**: Average score >= 80
- **On-Track**: Average score >= 60
- **At-Risk**: Average score < 60

---

## 🎯 Best Practices

### 1. Regular Generation
- Generate weekly reports every Friday
- Generate monthly reports on month-end
- Maintain consistent schedule

### 2. Review & Action
- Review metrics immediately after generation
- Identify trends and patterns
- Take corrective action for at-risk employees

### 3. Export & Share
- Export reports for stakeholder sharing
- Use CSV for Excel analysis
- Use JSON for system integration

### 4. Archive Old Reports
- Archive reports older than 3 months
- Keep dashboard clean
- Maintain performance

### 5. Track Improvements
- Generate reports regularly
- Compare metrics over time
- Measure impact of interventions

---

## 🔧 Customization

### Change Report Date Range

Edit `server/jobs/reportScheduler.js`:

```javascript
// Weekly: Change from Mon-Fri to Sun-Sat
const sunday = new Date(today);
sunday.setDate(today.getDate() - dayOfWeek);

// Monthly: Change from 1st-last to custom range
const customStart = new Date(year, month, 15);
const customEnd = new Date(year, month + 1, 14);
```

### Adjust Scoring Thresholds

Edit `server/services/metricsService.js`:

```javascript
// Change status thresholds
if (avgScore >= 85) return 'excellent';  // Was 80
if (avgScore >= 65) return 'on-track';   // Was 60
return 'at-risk';
```

---

## 🐛 Troubleshooting

### Report Generation Fails
**Solution:**
1. Check server logs
2. Verify MIS data exists
3. Check database connection
4. Try again

### Report Not Appearing
**Solution:**
1. Refresh page
2. Check filters (not archived)
3. Verify report generated
4. Check browser console

### Export Not Working
**Solution:**
1. Verify report exists
2. Try different format
3. Check browser console
4. Check file permissions

### Metrics Look Wrong
**Solution:**
1. Verify MIS data accuracy
2. Check calculation logic
3. Test with sample data
4. Review metric formulas

---

## 📱 Mobile Access

The Performance Report system is responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices (limited functionality)

**Note**: Export and detailed analysis work best on desktop.

---

## 🔐 Security

- Admin-only access (role-based)
- Authentication required
- Authorization checks on all endpoints
- No sensitive data in logs
- CORS configured

---

## 📊 Performance

- **Report Generation**: 2-10 seconds (depends on data)
- **API Response**: < 500ms
- **Dashboard Load**: < 2 seconds
- **Export**: < 1 second

---

## 📞 Support

### Documentation
- `PERFORMANCE_REPORT_MANUAL_MODE.md` - Changes made
- `PERFORMANCE_REPORT_README.md` - Main guide
- `PERFORMANCE_REPORT_QUICK_START.md` - Quick start

### Troubleshooting
1. Check documentation
2. Review server logs
3. Test API endpoints
4. Verify database

---

## ✅ Verification Checklist

Before using:
- [ ] Server started successfully
- [ ] Admin Dashboard accessible
- [ ] Performance Reports tab visible
- [ ] Generate buttons visible
- [ ] Can generate weekly report
- [ ] Can generate monthly report
- [ ] Reports appear in list
- [ ] Can view report details
- [ ] Can export as JSON
- [ ] Can export as CSV
- [ ] Can archive report
- [ ] Can delete report

---

## 🎉 Ready to Use!

The Performance Report system is ready for manual operation. Admins can now generate reports on-demand with full control.

**Key Features:**
- ✅ Manual report generation
- ✅ Weekly & monthly reports
- ✅ Comprehensive metrics
- ✅ Export functionality
- ✅ Report management
- ✅ No automation needed

**Start generating reports now!** 📊
