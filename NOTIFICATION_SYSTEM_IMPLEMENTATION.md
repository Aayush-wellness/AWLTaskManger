# Notification System Implementation Guide

## Overview
A real-time notification system has been implemented to notify employees when tasks are assigned to them. The system includes:
- Backend notification creation and management
- Frontend notification bell with dropdown
- Automatic polling for new notifications
- Mark as read/delete functionality

## Architecture

### Backend Components

#### 1. Notification Model (`server/models/Notification.js`)
Stores notification data with the following fields:
- `recipient`: User ID who receives the notification
- `type`: Notification type (TASK_ASSIGNED, TASK_DEADLINE, TASK_UPDATED, TASK_COMPLETED)
- `message`: Display message
- `read`: Boolean flag for read status
- `createdAt`: Timestamp
- `relatedTask`: Reference to the task
- `metadata`: Additional data (assignedBy, projectName, taskName, dueDate)

#### 2. Notification Routes (`server/routes/notificationRoutes.js`)
Endpoints:
- `GET /api/notifications` - Fetch all notifications for logged-in user
- `PUT /api/notifications/:notificationId/read` - Mark single notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/:notificationId` - Delete a notification

#### 3. Task Assignment Integration (`server/routes/users.js`)
When a task is updated with an `AssignedBy` value:
1. Checks if task is being newly assigned (wasn't assigned before)
2. Creates a notification for the recipient
3. Stores metadata about the assignment

### Frontend Components

#### 1. NotificationBell Component (`client/src/components/NotificationBell.js`)
Features:
- Bell icon with unread count badge
- Dropdown showing all notifications
- Auto-refresh every 10 seconds
- Mark as read/delete individual notifications
- Mark all as read functionality
- Click-outside to close dropdown

#### 2. Styling (`client/src/styles/NotificationBell.css`)
- Responsive design
- Hover effects
- Unread notification highlighting
- Scrollable notification list

#### 3. Integration Points
- Added to `EmployeeDashboard.js` navbar (left of Profile button)
- Added to `AdminDashboard.js` navbar (left of Logout button)

## How It Works

### Task Assignment Flow
1. User edits a task and sets the "Assigned By" field
2. Frontend sends PUT request to `/api/users/update-task/:taskId`
3. Backend checks if this is a new assignment
4. If new assignment, creates a Notification document
5. Frontend polls `/api/notifications` every 10 seconds
6. NotificationBell updates with new notifications
7. User sees notification in the bell dropdown

### Notification Lifecycle
1. **Created**: When task is assigned
2. **Unread**: Displayed with blue background
3. **Read**: User clicks check icon or "Mark all as read"
4. **Deleted**: User clicks trash icon

## API Endpoints

### Get Notifications
```
GET /api/notifications
Headers: Authorization: Bearer <token>

Response:
{
  "notifications": [
    {
      "_id": "...",
      "recipient": "userId",
      "type": "TASK_ASSIGNED",
      "message": "John assigned you a new task: Project Setup",
      "read": false,
      "createdAt": "2025-12-19T10:30:00Z",
      "metadata": {
        "assignedBy": "John",
        "taskName": "Project Setup",
        "projectName": "Website Redesign",
        "dueDate": "2025-12-25T00:00:00Z"
      }
    }
  ],
  "unreadCount": 3
}
```

### Mark as Read
```
PUT /api/notifications/:notificationId/read
Headers: Authorization: Bearer <token>

Response: Updated notification object
```

### Mark All as Read
```
PUT /api/notifications/mark-all-read
Headers: Authorization: Bearer <token>

Response: { "message": "All notifications marked as read" }
```

### Delete Notification
```
DELETE /api/notifications/:notificationId
Headers: Authorization: Bearer <token>

Response: { "message": "Notification deleted" }
```

## Files Modified/Created

### Created Files
- `Employeetask/client/src/components/NotificationBell.js` - Main notification component
- `Employeetask/client/src/styles/NotificationBell.css` - Notification styling
- `Employeetask/NOTIFICATION_SYSTEM_IMPLEMENTATION.md` - This guide

### Modified Files
- `Employeetask/server/models/Notification.js` - Already existed, verified structure
- `Employeetask/server/routes/notificationRoutes.js` - Fixed bugs and corrected field names
- `Employeetask/server/routes/users.js` - Added notification creation on task assignment
- `Employeetask/server/server.js` - Already had notification routes registered
- `Employeetask/client/src/pages/EmployeeDashboard.js` - Added NotificationBell component
- `Employeetask/client/src/pages/AdminDashboard.js` - Added NotificationBell component

## Bug Fixes Applied

### Backend Fixes
1. Fixed `require.Router()` → `express.Router()` in notificationRoutes.js
2. Changed `req.user.id` → `req.user.userId` (correct auth middleware field)
3. Changed `isRead` → `read` (correct schema field name)
4. Fixed route method from GET to PUT for marking as read
5. Fixed route path from `/read-all` to `/mark-all-read`
6. Fixed `findByIdAndDelete` → `findOneAndDelete` with query object

## Testing the Feature

### Step 1: Create/Edit a Task
1. Go to Employee Dashboard
2. Click on an employee to expand their tasks
3. Click "Edit" on a task or create a new task
4. Set the "Assigned By" field to your name
5. Save the task

### Step 2: Check Notifications
1. Look for the bell icon in the navbar (left of Profile button)
2. Click the bell to open the notification dropdown
3. You should see a notification about the task assignment
4. The badge shows the count of unread notifications

### Step 3: Manage Notifications
- Click the check icon to mark as read
- Click the trash icon to delete
- Click "Mark all as read" to mark all notifications as read

## Polling Mechanism
- Notifications are fetched every 10 seconds automatically
- This ensures users see new notifications without page refresh
- Can be adjusted by changing the interval in NotificationBell.js (line 32)

## Future Enhancements
1. WebSocket integration for real-time notifications (instead of polling)
2. Email notifications for important tasks
3. Notification preferences/settings
4. Notification categories/filtering
5. Sound alerts for new notifications
6. Desktop notifications using browser API

## Troubleshooting

### Notifications not appearing
1. Check browser console for errors
2. Verify `/api/notifications` endpoint is working (use browser DevTools)
3. Ensure task has "Assigned By" field set
4. Check MongoDB for Notification documents

### Notifications not updating
1. Check if polling is working (should see network requests every 10 seconds)
2. Verify auth token is valid
3. Check server logs for errors

### Styling issues
1. Ensure NotificationBell.css is imported
2. Check for CSS conflicts with existing styles
3. Verify Lucide React icons are installed

## Dependencies
- React hooks (useState, useEffect, useCallback, useRef)
- Axios for API calls
- Lucide React for icons (Bell, X, Check, Trash2)
- MongoDB for data persistence
