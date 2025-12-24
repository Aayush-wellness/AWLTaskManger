# Notification System - Quick Flow Summary

## 🎯 Simple 5-Step Flow

### Step 1: Task Assignment
```
User edits a task and sets "Assigned By" field
↓
Frontend sends: PUT /api/users/update-task/:taskId
```

### Step 2: Backend Processing
```
Backend receives request
↓
Checks: Is "Assigned By" being set for the FIRST TIME?
├─ YES → Create notification
└─ NO → Skip (already assigned)
```

### Step 3: Notification Created
```
New Notification document created:
{
  recipient: employeeId,
  message: "John assigned you a new task: Project Setup",
  read: false,
  metadata: { assignedBy, taskName, projectName, dueDate }
}
↓
Saved to MongoDB
```

### Step 4: Frontend Polls
```
NotificationBell component polls every 10 seconds:
GET /api/notifications
↓
Gets: { notifications: [...], unreadCount: 1 }
↓
Updates state
```

### Step 5: Display to User
```
Bell icon shows red badge with count
↓
User clicks bell
↓
Dropdown shows all notifications
↓
User can mark as read or delete
```

---

## 📊 Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EmployeeDashboard.js                                      │
│  ├─ Renders navbar                                         │
│  └─ Includes NotificationBell component                    │
│                                                             │
│  NotificationBell.js                                       │
│  ├─ Polls /api/notifications every 10s                    │
│  ├─ Displays bell icon with badge                         │
│  ├─ Shows dropdown on click                               │
│  └─ Handles mark as read / delete                         │
│                                                             │
│  EmployeeDetailPanel.js                                    │
│  ├─ Opens edit task form                                  │
│  ├─ User sets "Assigned By" field                         │
│  └─ Sends PUT request on save                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTP
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  users.js (PUT /api/users/update-task/:taskId)            │
│  ├─ Receives task update request                          │
│  ├─ Checks if "Assigned By" is new                        │
│  ├─ Creates Notification if new                           │
│  └─ Saves to database                                     │
│                                                             │
│  notificationRoutes.js                                     │
│  ├─ GET /api/notifications → Fetch all                    │
│  ├─ PUT /:id/read → Mark as read                          │
│  ├─ PUT /mark-all-read → Mark all as read                 │
│  └─ DELETE /:id → Delete notification                     │
│                                                             │
│  Notification.js (Model)                                   │
│  └─ Defines schema for notifications                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          ↕ Query
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  notifications collection                                  │
│  ├─ recipient: userId                                     │
│  ├─ type: 'TASK_ASSIGNED'                                 │
│  ├─ message: string                                       │
│  ├─ read: boolean                                         │
│  ├─ createdAt: timestamp                                  │
│  └─ metadata: { assignedBy, taskName, ... }              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Timeline Example

```
10:00 AM - John assigns task to Sarah
├─ John clicks "Edit" on Sarah's task
├─ Sets "Assigned By" to "John Doe"
├─ Clicks Save
└─ Frontend sends PUT request

10:00:01 AM - Backend processes
├─ Receives request
├─ Checks: wasNotAssigned=true, isNowAssigned=true
├─ Creates Notification document
└─ Saves to MongoDB

10:00:02 AM - Sarah's dashboard
├─ NotificationBell is polling
├─ Next poll at 10:10 AM

10:10 AM - Sarah's dashboard polls
├─ Sends GET /api/notifications
├─ Backend queries MongoDB
├─ Returns 1 unread notification
├─ Frontend updates state
└─ Bell icon shows badge "1"

10:10:05 AM - Sarah sees notification
├─ Clicks bell icon
├─ Dropdown opens
├─ Sees: "John Doe assigned you a new task: Project Setup"
└─ Can mark as read or delete

10:10:10 AM - Sarah marks as read
├─ Clicks ✓ button
├─ Sends PUT /api/notifications/:id/read
├─ Backend updates: read=true
├─ Frontend updates state
└─ Notification background changes to normal
```

---

## 🎨 UI Flow

```
NAVBAR
┌────────────────────────────────────────────────────────┐
│ Employee Dashboard                                     │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Welcome, John  🔔¹  [Profile] [Logout]          │  │
│ │                 ↑                                 │  │
│ │            Click here                            │  │
│ └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                      ↓
DROPDOWN OPENS
┌────────────────────────────────────────────────────────┐
│ Notifications                          [✓ Mark All]    │
├────────────────────────────────────────────────────────┤
│ 🔵 John Doe assigned you a new task:   [✓] [🗑]      │
│    Project Setup                                       │
│    Due: 12/25/2025                                     │
│    Dec 19, 2025, 10:30 AM                             │
│                                                        │
│ ⚪ Sarah assigned you a task: Code Review [✓] [🗑]   │
│    Due: 12/20/2025                                     │
│    Dec 19, 2025, 9:15 AM                              │
└────────────────────────────────────────────────────────┘
     ↓                    ↓                    ↓
  Mark as Read         Delete            Mark All Read
     ↓                    ↓                    ↓
  PUT request        DELETE request       PUT request
     ↓                    ↓                    ↓
  Backend updates    Backend deletes    Backend updates all
     ↓                    ↓                    ↓
  Frontend updates   Frontend removes   Frontend updates all
```

---

## 🔑 Key Points

1. **Trigger:** Task assignment (setting "Assigned By" field)
2. **Storage:** MongoDB Notification collection
3. **Polling:** Every 10 seconds from frontend
4. **Display:** Bell icon with unread count badge
5. **Actions:** Mark as read, delete, mark all as read
6. **User-Specific:** Each user only sees their own notifications

---

## 📱 What Happens When...

### When user assigns a task:
```
✓ Notification created in database
✓ Assigned employee will see it on next poll (within 10 seconds)
✓ Bell icon updates with badge count
```

### When user clicks bell icon:
```
✓ Dropdown opens showing all notifications
✓ Unread notifications have blue background
✓ Shows task details and timestamp
```

### When user marks as read:
```
✓ Notification background changes to normal
✓ Unread count decreases
✓ Badge updates
```

### When user deletes notification:
```
✓ Notification removed from dropdown
✓ Removed from database
✓ Unread count decreases if it was unread
```

### When user marks all as read:
```
✓ All notifications marked as read
✓ All backgrounds change to normal
✓ Badge disappears (unreadCount = 0)
```

---

## 🚀 Performance

- **Polling Interval:** 10 seconds (configurable)
- **Max Notifications:** 50 per user
- **Database Index:** Optimized for fast queries
- **Load:** Minimal - only queries when polling

---

## 🔐 Security

- **Authentication:** All endpoints require valid JWT token
- **Authorization:** Users can only see their own notifications
- **Validation:** Input validation on all endpoints
- **Error Handling:** Graceful error messages
