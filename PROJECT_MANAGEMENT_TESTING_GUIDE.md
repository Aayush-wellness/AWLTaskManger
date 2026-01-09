# Project Management Testing Guide

## Setup & Prerequisites

1. **Server Running**: Ensure backend server is running on `http://localhost:5002`
2. **Frontend Running**: Ensure frontend is running on `http://localhost:3000`
3. **Database**: MongoDB should have departments and employees data
4. **Authentication**: Must be logged in as admin user

## Test Scenarios

### Test 1: Create Project with Team Members

**Steps**:
1. Navigate to Admin Dashboard → Projects tab
2. Click "Create Project" button
3. Enter project name: "Q1 Development Sprint"
4. Select a department from dropdown
5. Click on 2-3 employees to add them as team members
6. For each member, add 2-3 tasks:
   - Task 1: "Design UI mockups"
   - Task 2: "Implement backend API"
   - Task 3: "Write unit tests"
7. Click "Create Project" button

**Expected Results**:
- Modal closes
- New project appears in projects grid
- Project card shows team members with avatars
- Overall progress shows 0% (no tasks completed)
- Each member shows 0% progress

### Test 2: Toggle Task Completion

**Steps**:
1. Find the created project card
2. Click the expand button (chevron down) to expand
3. Click on task checkboxes to mark tasks as complete
4. Mark 1-2 tasks as complete for each member

**Expected Results**:
- Checkmark icon appears for completed tasks
- Task text becomes strikethrough
- Member progress bar updates
- Overall progress bar updates
- Progress percentages change accordingly

### Test 3: Collapse/Expand Project Card

**Steps**:
1. Click expand button (chevron) on project card
2. Verify tasks are visible
3. Click expand button again to collapse

**Expected Results**:
- Tasks section appears/disappears smoothly
- Chevron icon rotates
- No errors in console

### Test 4: Delete Project

**Steps**:
1. Click "Delete" button on project card
2. Confirm deletion in dialog

**Expected Results**:
- Confirmation dialog appears
- Project is removed from grid
- Projects list refreshes
- Success message appears

### Test 5: Multiple Projects

**Steps**:
1. Create 2-3 different projects with different team members
2. Verify all projects display in grid
3. Toggle tasks in different projects
4. Verify progress calculations are independent

**Expected Results**:
- All projects display correctly
- Progress bars are independent
- No cross-contamination between projects

### Test 6: Responsive Design

**Steps**:
1. Open DevTools (F12)
2. Toggle device toolbar
3. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1200px+)

**Expected Results**:
- Grid adjusts to 1 column on mobile
- Grid adjusts to 2 columns on tablet
- Grid adjusts to 2-3 columns on desktop
- All elements remain readable and clickable

### Test 7: Error Handling

**Steps**:
1. Try creating project without name (should show validation error)
2. Try creating project without team members (should show validation error)
3. Try creating project with empty task names (should show validation error)
4. Disconnect network and try to create project

**Expected Results**:
- Validation errors appear
- Error messages are clear
- Form doesn't submit with invalid data
- Network errors are handled gracefully

### Test 8: Department Selection

**Steps**:
1. Open CreateProjectModal
2. Select different departments
3. Verify employee list updates for each department

**Expected Results**:
- Employee list updates when department changes
- Correct employees appear for selected department
- No employees from other departments appear

## Browser Console Checks

After each test, check browser console (F12 → Console tab) for:
- ❌ No red errors
- ⚠️ Minimal warnings
- ✅ Successful API calls logged

## Performance Checks

1. **Load Time**: Project grid should load within 2 seconds
2. **Interaction**: Task toggle should respond immediately
3. **Animations**: Smooth transitions without jank
4. **Memory**: No memory leaks when toggling tasks repeatedly

## Data Verification

After creating a project, verify in MongoDB:
```javascript
// Check project was created
db.projects.findOne({ name: "Q1 Development Sprint" })

// Check tasks were assigned to users
db.users.findOne({ _id: ObjectId("...") }).tasks
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Modal doesn't open | Check if departments are loaded, refresh page |
| Employees not showing | Verify department has employees, check network tab |
| Progress not updating | Refresh page, check backend logs |
| Delete not working | Check if user has admin role, verify backend endpoint |
| Styling looks broken | Clear browser cache (Ctrl+Shift+Delete), hard refresh (Ctrl+Shift+R) |

## Success Criteria

✅ All 8 test scenarios pass
✅ No console errors
✅ Responsive on all screen sizes
✅ Progress calculations are accurate
✅ All CRUD operations work (Create, Read, Update, Delete)
✅ Error handling works properly
✅ Performance is acceptable

## Notes

- Tasks are stored in the project's `memberTasks` object
- Each task has a unique ID for updates
- Progress is calculated in real-time on the frontend
- Backend stores tasks in user's tasks array
- Deletion is permanent and cannot be undone
