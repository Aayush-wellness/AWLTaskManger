# Project Departments Admin Features - Requirements Specification

## Overview
Enhance the Project Departments view in the Admin Dashboard to provide more useful administrative capabilities for managing team workload and task assignments.

## User Stories

### US-1: Quick Task Assignment
**As an** admin  
**I want to** assign tasks directly to team members from the Project Departments view  
**So that** I can quickly delegate work without navigating to other screens

**Acceptance Criteria:**
- [x] "Assign Task" button visible for each team member in the department view
- [x] Modal opens with task assignment form (task name, project, start date, end date, priority, remark)
- [x] Project field pre-populated with current project context
- [x] AssignedBy field auto-filled with current admin's name
- [x] Employee receives notification when task is assigned
- [x] Task list refreshes after successful assignment
- [x] Toast notification confirms successful assignment

### US-2: Inline Task Status Updates
**As an** admin  
**I want to** update task status directly from the department view  
**So that** I can quickly manage task progress without opening multiple screens

**Acceptance Criteria:**
- [x] Status dropdown/buttons visible for each task in member's task list
- [x] Status options: pending, in-progress, completed, blocked
- [x] Status updates immediately on selection
- [x] Visual feedback (color change) reflects new status
- [x] Toast notification confirms status update
- [ ] Notification sent to task owner when status changes (handled by backend)

### US-3: Workload Visualization
**As an** admin  
**I want to** see a visual representation of team workload distribution  
**So that** I can identify overloaded or underutilized team members

**Acceptance Criteria:**
- [x] Workload bar/indicator for each team member
- [x] Color coding: green (balanced), yellow (moderate), red (overloaded)
- [x] Threshold indicators (0-5 tasks = balanced, 6-10 = moderate, 11+ = overloaded)
- [x] Summary showing team workload distribution
- [x] Ability to see task count breakdown by status

## Technical Requirements

### API Endpoints Used
- `POST /api/users/:userId/tasks` - Create task for employee
- `PUT /api/users/:employeeId/update-task/:taskId` - Update task status
- `POST /api/notifications/create` - Send notification on task assignment

### Components Modified
- `Employeetask/client/src/pages/AdminDashboard/ProjectDashboard.js` - ProjectDepartmentsView component

### Dependencies
- Custom toast utility: `../../utils/toast`
- Auth context: `../../context/AuthContext`
- Axios for API calls: `../../config/axios`

## Design Notes
- Maintain existing UI styling (gradient colors, rounded cards, modern look)
- Use existing `getAvatarColor()` function for consistent avatar styling
- Follow existing modal patterns (gradient header, clean form layout)
- Workload thresholds: 0-5 tasks (green), 6-10 tasks (yellow), 11+ tasks (red)

## Implementation Status: COMPLETE ✅
All three features have been implemented:
1. Quick Task Assignment - Modal with full form, notifications, and auto-populated fields
2. Inline Task Status Updates - Dropdown in recent tasks section with immediate updates
3. Workload Visualization - Color-coded badges showing balanced/moderate/overloaded status
