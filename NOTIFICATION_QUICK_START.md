# Notification System - Quick Start

## What's New
A notification bell has been added to both Employee and Admin dashboards. When someone assigns a task to an employee in the same department, they receive a notification.

## Where to Find It
- **Location**: Top navbar, left of the Profile button
- **Icon**: Bell icon with red badge showing unread count
- **Dashboards**: Both Employee Dashboard and Admin Dashboard

## How to Use

### Assigning a Task
1. Go to Employee Dashboard
2. Click on an employee to expand their tasks
3. Click "Edit" on a task or add a new task
4. Fill in the form and set "Assigned By" field
5. Click Save
6. The assigned employee will see a notification

### Viewing Notifications
1. Click the bell icon in the navbar
2. A dropdown appears showing all notifications
3. Unread notifications have a blue background
4. Each notification shows:
   - Who assigned the task
   - Task name
   - Project name
   - Due date (if set)
   - When it was created

### Managing Notifications
- **Mark as Read**: Click the check icon on a notification
- **Delete**: Click the trash icon on a notification
- **Mark All as Read**: Click the check icon in the header

## Features
✅ Real-time notification updates (every 10 seconds)
✅ Unread count badge
✅ Mark individual notifications as read
✅ Mark all notifications as read
✅ Delete notifications
✅ Shows notification metadata (assignee, project, due date)
✅ Responsive design
✅ Works on both Employee and Admin dashboards

## Backend Endpoints
All endpoints require authentication token:

- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Files Added
- `client/src/components/NotificationBell.js` - Main component
- `client/src/styles/NotificationBell.css` - Styling

## Files Modified
- `server/routes/users.js` - Creates notifications on task assignment
- `server/routes/notificationRoutes.js` - Fixed bugs
- `client/src/pages/EmployeeDashboard.js` - Added bell to navbar
- `client/src/pages/AdminDashboard.js` - Added bell to navbar

## Testing
1. Create/edit a task and set "Assigned By" field
2. Look for the bell icon in navbar
3. Click it to see notifications
4. Notifications auto-refresh every 10 seconds

## Notes
- Notifications are only created when a task is newly assigned (AssignedBy field changes from empty to filled)
- Notifications persist in the database
- Unread count is calculated in real-time
- Notifications are user-specific (each user only sees their own)
