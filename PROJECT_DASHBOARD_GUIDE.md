# Project Dashboard - Admin Feature Guide

## Overview

The enhanced Project Dashboard provides comprehensive analytics and insights for administrators to monitor project progress, team performance, and productivity trends across the organization.

## Features

### 1. Admin Overview Tab
**At-a-glance metrics for the entire organization:**

- **Total Tasks**: Sum of all tasks across all projects and employees
- **Completed Tasks**: Number of successfully completed tasks
- **In Progress Tasks**: Tasks currently being worked on
- **Overdue Tasks**: Tasks that have passed their due date without completion

**Overall Team Completion Progress:**
- Visual progress bar showing overall completion percentage
- Calculated as: (Completed Tasks / Total Tasks) × 100

**Department Overview:**
- Cards for each department showing:
  - Team member count
  - Total tasks assigned
  - Completed tasks ratio
  - Quick completion percentage

### 2. Project Dashboard Tab
**Project-level overview with risk indicators:**

Each project card displays:
- **Project Name & Description**
- **Overall Progress**: Percentage and visual progress bar
- **Status Breakdown**:
  - ✅ Completed tasks (green)
  - ▶ In Progress tasks (blue)
  - ⚠ Blocked tasks (red)
  - ⏳ Not Started tasks (yellow)
- **Overdue Alert**: Risk indicator showing number of overdue tasks
- **Total Task Count**

**Key Metrics:**
- Completion percentage for quick assessment
- Overdue task count as a risk indicator
- Clear visual separation between projects

**Interaction:**
- Click on any project card to view member contribution details

### 3. Member Contribution Tab
**Per-project team member performance breakdown:**

**Features:**
- **Member Cards** showing:
  - Employee name and job title
  - Task completion percentage with progress bar
  - Individual task status breakdown (Completed, In Progress, Blocked, Pending)
  - Overdue task count with alert
  - Total tasks assigned

- **Click-through Functionality**:
  - Click any member card to open detailed modal
  - View all tasks assigned to that member
  - See task status and due dates
  - Identify blocked or overdue tasks

**Project Filtering:**
- Filter by specific project to see only that project's team members
- Clear filter button to view all members across projects

**Member Details Modal:**
- Comprehensive view of individual member performance
- Task list with status and due dates
- Overall progress percentage
- Quick stats for all task statuses

### 4. Productivity Trends Tab
**Weekly productivity analytics and trends:**

**Line Chart - Daily Task Activity:**
- Tracks task completion over the last 7 days
- Shows three metrics:
  - Completed tasks (green line)
  - In Progress tasks (blue line)
  - Pending tasks (yellow line)
- Helps identify productivity patterns

**Bar Chart - Daily Task Count:**
- Total tasks created/assigned per day
- Shows workload distribution
- Identifies peak activity days

**Use Cases:**
- Identify productivity trends
- Spot bottlenecks or slow periods
- Plan resource allocation
- Monitor team velocity

## Color Coding

- 🟢 **Green (#10b981)**: Completed tasks - Success
- 🔵 **Blue (#3b82f6)**: In Progress - Active work
- 🔴 **Red (#ef4444)**: Blocked - Issues/Risks
- 🟡 **Yellow (#f59e0b)**: Pending - Not started
- 🟣 **Purple (#5b7cfa)**: Primary actions/highlights

## Navigation

1. **Admin Dashboard** → Click "Project Dashboard" tab
2. **View Selection**: Use tabs at the top to switch between views:
   - Admin Overview
   - Project Dashboard
   - Member Contribution
   - Productivity Trends

3. **Drill-Down**:
   - Click project card → View member contribution
   - Click member card → View detailed task list

## Key Insights

### What to Monitor

1. **Overall Completion %**: Target should be increasing over time
2. **Overdue Tasks**: Should be minimized; indicates delays
3. **Blocked Tasks**: Investigate reasons; may indicate blockers
4. **Department Performance**: Compare across departments
5. **Productivity Trends**: Look for consistent patterns

### Action Items

- **High Overdue Count**: Investigate delays, reassign if needed
- **Many Blocked Tasks**: Identify and resolve blockers
- **Low Completion %**: May need resource reallocation
- **Declining Trend**: Check for team issues or workload problems

## Data Refresh

- Dashboard data refreshes every 30 seconds when viewing project dashboard
- Manual refresh available through admin controls
- Real-time updates for task status changes

## Technical Details

### Components
- `ProjectDashboard.js`: Main component with all views
- `ProjectDashboard.css`: Styling for dashboard elements
- Uses Material-UI (MUI) for components
- Recharts for data visualization

### Data Sources
- Employee tasks from user profiles
- Project information from projects collection
- Department information from departments collection

### Calculations
- Completion %: (Completed / Total) × 100
- Overdue: Tasks with endDate < today and status ≠ completed
- Department stats: Aggregated from all employees in department

## Best Practices

1. **Regular Monitoring**: Check dashboard daily for issues
2. **Proactive Management**: Address overdue tasks before they escalate
3. **Team Communication**: Share trends with team for transparency
4. **Resource Planning**: Use trends to plan future sprints
5. **Performance Tracking**: Monitor individual and team metrics

## Troubleshooting

**No data showing?**
- Ensure tasks are assigned to employees
- Check that projects are created
- Verify employees are in departments

**Incorrect calculations?**
- Verify task status values (completed, in-progress, blocked, pending)
- Check task due dates are set correctly
- Ensure employee-task associations are correct

**Performance issues?**
- Dashboard auto-refreshes every 30 seconds
- Large datasets may take time to load
- Consider filtering by project for faster loading
