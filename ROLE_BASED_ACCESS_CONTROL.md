# Role-Based Access Control Implementation

## 🎯 Overview
Implemented comprehensive role-based access control where Admin users can manage all employees in their department, while Employee users can only manage their own profile and tasks.

## 🔐 Access Control Rules

### **Admin Users (role: 'admin')**
✅ **Can Do:**
- Edit any employee in their department
- Delete any employee in their department (except themselves)
- Bulk edit multiple employees in their department
- Bulk delete multiple employees in their department
- Add new employees to their department
- Add/edit/delete tasks for any employee in their department
- View all employees in their department

❌ **Cannot Do:**
- Edit/delete employees from other departments
- Delete their own account
- Access employees outside their department

### **Employee Users (role: 'employee')**
✅ **Can Do:**
- Edit their own profile only
- Delete their own account (optional - can be restricted)
- Add/edit/delete their own tasks only
- View other employees in their department (read-only)

❌ **Cannot Do:**
- Edit other employees' profiles
- Delete other employees
- Bulk operations on other employees
- Add new employees
- Manage other employees' tasks
- Access admin-only features

## 🛡️ Security Implementation

### **Server-Side API Protection**

#### Individual Operations:
```javascript
// Role-based access control
if (currentUser.role === 'employee') {
  // Employees can only edit their own profile
  if (currentUserId !== employeeId) {
    return res.status(403).json({ message: 'Employees can only edit their own profile' });
  }
} else if (currentUser.role === 'admin') {
  // Admins can edit employees in their department
  if (currentDepartmentId !== targetDepartmentId) {
    return res.status(403).json({ message: 'Admins can only update employees in their department' });
  }
}
```

#### Bulk Operations:
```javascript
if (currentUser.role === 'employee') {
  // Employees can only bulk update themselves
  if (employeeIds.length !== 1 || employeeIds[0] !== currentUserId) {
    return res.status(403).json({ message: 'Employees can only update their own profile' });
  }
}
```

### **Client-Side UI Protection**

#### Action Buttons:
```javascript
const isCurrentUser = row.original.id === user?.id;
const isAdmin = user?.role === 'admin';
const canEdit = isAdmin || isCurrentUser;
const canDelete = isAdmin || isCurrentUser;
```

#### Bulk Operations:
```javascript
enableRowSelection: user?.role === 'admin', // Only admins can select rows
```

## 📊 API Endpoints Updated

### **Individual Employee Management:**
- `PUT /api/users/update-employee/:employeeId` - Role-based edit access
- `DELETE /api/users/delete-employee/:employeeId` - Role-based delete access

### **Bulk Employee Management:**
- `PUT /api/users/bulk-update` - Admin only (or employee for self)
- `DELETE /api/users/bulk-delete` - Admin only (or employee for self)

### **Task Management:**
- `POST /api/users/add-task-to-user/:userId` - Role-based task creation
- `PUT /api/users/update-task-for-user/:userId/:taskId` - Role-based task editing
- `DELETE /api/users/delete-task-for-user/:userId/:taskId` - Role-based task deletion

## 🎨 UI Changes by Role

### **Admin User Interface:**
- ✅ "Add Employee" button visible
- ✅ Bulk edit/delete buttons visible when rows selected
- ✅ Row selection checkboxes enabled
- ✅ Edit/Delete buttons on all employee rows
- ✅ "Add Task" button on all employee detail panels
- ✅ Task edit/delete actions on all employee tasks

### **Employee User Interface:**
- ❌ "Add Employee" button hidden
- ❌ Bulk operation buttons hidden
- ❌ Row selection disabled
- ✅ Edit/Delete buttons only on their own row
- ❌ "Add Task" button only on their own detail panel
- ✅ Task actions only on their own tasks
- 👁️ "View only" or "No actions" text on other employees

## 🔄 Data Flow Security

### **Before (Department-based only):**
```
User Action → Department Check → MongoDB Operation
```

### **After (Role + Department-based):**
```
User Action → Role Check → Department Check → MongoDB Operation
```

## 🛠️ Implementation Details

### **JWT Token Structure:**
```javascript
{
  userId: user._id,
  role: user.role,  // 'admin' or 'employee'
  iat: timestamp,
  exp: timestamp
}
```

### **Database Role Field:**
```javascript
role: {
  type: String,
  enum: ['admin', 'employee'],
  default: 'employee'
}
```

### **Client-Side Role Access:**
```javascript
const isAdmin = user?.role === 'admin';
const isEmployee = user?.role === 'employee';
```

## 📱 User Experience

### **Admin Experience:**
- Full management capabilities within their department
- Clear visual indicators of admin privileges
- Bulk operations for efficiency
- Complete employee and task management

### **Employee Experience:**
- Self-service profile and task management
- Read-only view of department colleagues
- Clear indicators when actions are restricted
- No confusion about available actions

## 🔧 Error Messages

### **Permission Errors:**
- `"Employees can only edit their own profile"`
- `"Employees can only delete their own account"`
- `"Admins can only update employees in their department"`
- `"Admin privileges required for bulk operations"`

### **UI Indicators:**
- `"No actions"` - When user has no permissions
- `"View only"` - For read-only access
- `"Admin Only"` - For admin-restricted features

## 🎯 Result

Complete role-based access control system where:
- **Security**: All operations properly validated by role
- **User Experience**: Clear, intuitive interface based on permissions
- **Data Integrity**: No unauthorized access to employee data
- **Scalability**: Easy to extend with additional roles
- **Compliance**: Proper access control for employee management

The system now enforces proper role-based permissions at both API and UI levels!