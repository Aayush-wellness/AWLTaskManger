# Quick Reference - Project Management System

## Files Created/Modified

### New Files
```
✅ client/src/pages/AdminDashboard/CreateProjectModal.js
✅ client/src/pages/AdminDashboard/CreateProjectModal.css
✅ client/src/pages/AdminDashboard/ProjectCard.js
✅ client/src/pages/AdminDashboard/ProjectCard.css
```

### Modified Files
```
✅ client/src/pages/AdminDashboard/ProjectsTab.js
✅ client/src/styles/Dashboard.css
```

## Component Hierarchy

```
AdminDashboard
└── ProjectsTab
    ├── CreateProjectModal
    │   ├── Department Selection
    │   ├── Employee Selection
    │   └── Task Assignment
    └── ProjectCard (multiple)
        ├── Project Header
        ├── Overall Progress
        ├── Team Members
        │   ├── Member Card
        │   ├── Member Progress
        │   └── Task List
        └── Delete Button
```

## Key Functions

### CreateProjectModal
```javascript
fetchDepartmentEmployees(deptId)      // Fetch employees for department
handleAddMember(employee)              // Add employee to project
handleRemoveMember(employeeId)         // Remove employee from project
handleAddTask(employeeId)              // Add task to member
handleRemoveTask(employeeId, idx)      // Remove task from member
handleTaskChange(empId, idx, field)    // Update task field
handleCreateProject()                  // Create project and tasks
```

### ProjectCard
```javascript
getMemberProgress(memberId)            // Calculate member progress %
calculateOverallProgress()             // Calculate project progress %
```

### ProjectsTab
```javascript
handleTaskToggle(projectId, memberId, taskIndex)  // Toggle task completion
handleDeleteProject(projectId, name)   // Delete project
```

## API Endpoints

### Read
```
GET /api/departments
GET /api/users/department/:departmentId
GET /api/projects
```

### Create
```
POST /api/projects
POST /api/users/:userId/tasks
```

### Update
```
PUT /api/users/:employeeId/update-task/:taskId
```

### Delete
```
DELETE /api/projects/:projectId
```

## CSS Classes

### Modal
```css
.create-project-modal
.modal-header
.modal-content
.form-section
.form-input
.employees-list
.employee-item
.members-tasks-container
.member-task-section
.task-input-group
.modal-actions
```

### Card
```css
.project-card
.project-card-header
.project-card-body
.progress-section
.progress-bar
.team-members
.member-card
.member-progress-bar
.member-tasks
.task-item
.project-card-footer
```

### Grid
```css
.projects-grid
.empty-state
```

## State Management

### CreateProjectModal State
```javascript
projectName              // String
selectedDept             // String (department ID)
deptEmployees           // Array of employees
selectedMembers         // Array of selected employees
memberTasks             // Object { employeeId: [tasks] }
loading                 // Boolean
```

### ProjectsTab State
```javascript
showCreateModal          // Boolean
selectedProject         // Object or null
departments             // Array of departments
projectsList            // Array of projects
```

### ProjectCard Props
```javascript
project                 // Project object
onTaskToggle           // Function
onDelete               // Function
```

## Testing Checklist

- [ ] Create project with 2+ team members
- [ ] Assign 2+ tasks to each member
- [ ] Toggle task completion
- [ ] Verify progress updates
- [ ] Delete project
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1200px+)
- [ ] Check console for errors
- [ ] Verify API calls in Network tab

## Common Tasks

### Add New Feature to ProjectCard
1. Add state in ProjectCard.js
2. Add handler function
3. Add UI element
4. Add CSS styling in ProjectCard.css
5. Test and verify

### Modify Modal Styling
1. Edit CreateProjectModal.css
2. Update class names if needed
3. Test responsive design
4. Verify on all screen sizes

### Add New API Endpoint
1. Create endpoint in backend
2. Add axios call in component
3. Handle response and errors
4. Update state
5. Test with real data

## Debugging Tips

### Check Console
```javascript
// Open DevTools (F12)
// Go to Console tab
// Look for errors (red) and warnings (yellow)
```

### Check Network
```javascript
// Open DevTools (F12)
// Go to Network tab
// Filter by XHR/Fetch
// Check API responses
```

### Check State
```javascript
// Add console.log in component
console.log('State:', { projectName, selectedDept, selectedMembers });
```

### Check CSS
```javascript
// Inspect element (F12)
// Check computed styles
// Look for conflicting styles
```

## Performance Tips

1. **Lazy Load**: Load employees only when department selected
2. **Memoize**: Memoize progress calculations
3. **Debounce**: Debounce API calls if needed
4. **Optimize**: Use React.memo for ProjectCard
5. **Cache**: Cache department/employee data

## Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Color contrast
- ✅ Focus indicators
- ✅ Button titles

## Browser DevTools

### Chrome/Edge
- F12 or Ctrl+Shift+I
- Elements, Console, Network, Performance tabs

### Firefox
- F12 or Ctrl+Shift+I
- Inspector, Console, Network, Performance tabs

### Safari
- Cmd+Option+I
- Elements, Console, Network tabs

## Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "feat: implement project management system"

# Push to dev branch
git push origin dev

# View changes
git diff
```

## Environment Variables

```
REACT_APP_API_URL=http://localhost:5002
REACT_APP_ENV=development
```

## Useful Links

- [React Documentation](https://react.dev)
- [Material-UI](https://mui.com)
- [Lucide Icons](https://lucide.dev)
- [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)

## Contact & Support

For issues or questions:
1. Check console for errors
2. Review testing guide
3. Check implementation documentation
4. Review code comments
5. Check git history for changes

---

**Last Updated**: December 30, 2025
**Version**: 1.0
**Status**: Ready for Use
