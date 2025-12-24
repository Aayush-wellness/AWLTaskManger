# 🔗 Integration Guide

## How to Update Your App to Use the Refactored Components

### Step 1: Update Your Main App File

**Before (Old Import):**
```javascript
import Example from './components/EmployeeTable';

export default function App() {
  return (
    <div>
      <Example />
    </div>
  );
}
```

**After (New Import):**
```javascript
import { EmployeeTable } from './components/EmployeeTable';

export default function App() {
  return (
    <div>
      <EmployeeTable />
    </div>
  );
}
```

---

## Step 2: Verify All Dependencies

Make sure these packages are installed:
```bash
npm install @mui/material @mui/icons-material
npm install material-react-table
npm install @tanstack/react-query
npm install @mui/x-date-pickers dayjs
npm install axios
```

---

## Step 3: Check File Paths

Verify that the import paths in `EmployeeTable.js` match your project structure:

```javascript
// These paths should be correct:
import { useAuth } from '../../context/AuthContext';
import axios from '../../config/axios';
import { getTableAvatarUrl } from '../../utils/avatarUtils';
```

If your paths are different, update them accordingly.

---

## Step 4: Test the Integration

1. **Start your development server:**
   ```bash
   npm start
   ```

2. **Check the browser console** for any errors

3. **Test each feature:**
   - ✓ View employee list
   - ✓ Add new employee
   - ✓ Edit employee
   - ✓ Delete employee
   - ✓ Bulk edit employees
   - ✓ Bulk delete employees
   - ✓ Expand employee row to see tasks
   - ✓ Add task
   - ✓ Edit task
   - ✓ Delete task

---

## Step 5: Optional - Update Old File

Once everything is working, you can delete the old file:

```bash
# Backup first (already done as EmployeeTable.js.backup)
# Then delete the old file
rm src/components/EmployeeTable.js
```

---

## Troubleshooting

### Issue: "Cannot find module"
**Solution:** Check that all import paths are correct relative to your file structure.

### Issue: "useAuth is not defined"
**Solution:** Make sure `AuthContext.js` exists at `src/context/AuthContext.js`

### Issue: "axios is not defined"
**Solution:** Make sure `axios` config exists at `src/config/axios.js`

### Issue: "getTableAvatarUrl is not defined"
**Solution:** Make sure `avatarUtils.js` exists at `src/utils/avatarUtils.js`

### Issue: Modals not appearing
**Solution:** Check browser console for errors. Make sure Material-UI is installed.

### Issue: Table not loading data
**Solution:** 
1. Check network tab in browser DevTools
2. Verify API endpoints are correct
3. Check that user is authenticated

---

## Component API Reference

### EmployeeTable
```javascript
<EmployeeTable />
// No props required - uses AuthContext for user data
```

### EmployeeDetailPanel
```javascript
<EmployeeDetailPanel
  row={employeeRow}                    // Employee row object
  onUpdateEmployee={updateCallback}    // Callback to update employee
  fetchDepartmentEmployees={fetchFn}   // Callback to refresh list
/>
```

### AddEmployeeModal
```javascript
<AddEmployeeModal
  isOpen={boolean}                     // Modal open state
  onClose={closeCallback}              // Close handler
  formData={object}                    // Form data object
  onInputChange={changeCallback}       // Input change handler
  user={userObject}                    // Current user
  onEmployeeAdded={successCallback}    // Success callback
/>
```

### EditEmployeeModal
```javascript
<EditEmployeeModal
  isOpen={boolean}                     // Modal open state
  onClose={closeCallback}              // Close handler
  formData={object}                    // Form data object
  onInputChange={changeCallback}       // Input change handler
  onSave={saveCallback}                // Save handler
/>
```

### BulkEditModal
```javascript
<BulkEditModal
  isOpen={boolean}                     // Modal open state
  onClose={closeCallback}              // Close handler
  formData={object}                    // Form data object
  onInputChange={changeCallback}       // Input change handler
  onSave={saveCallback}                // Save handler
  selectedCount={number}               // Number of selected items
/>
```

### AddTaskModal
```javascript
<AddTaskModal
  isOpen={boolean}                     // Modal open state
  onClose={closeCallback}              // Close handler
  formData={object}                    // Form data object
  onInputChange={changeCallback}       // Input change handler
  onSave={saveCallback}                // Save handler
/>
```

### EditTaskModal
```javascript
<EditTaskModal
  isOpen={boolean}                     // Modal open state
  onClose={closeCallback}              // Close handler
  formData={object}                    // Form data object
  onInputChange={changeCallback}       // Input change handler
  onSave={saveCallback}                // Save handler
/>
```

---

## Environment Variables

Make sure your `.env` file has:
```
REACT_APP_API_URL=http://localhost:5002
```

Or update the axios config accordingly.

---

## Performance Tips

1. **Memoize callbacks** - Already done with `useCallback`
2. **Lazy load modals** - Consider using React.lazy() for modals
3. **Virtualize large lists** - Material React Table supports this
4. **Debounce search** - Add debouncing to search inputs

---

## Future Enhancements

Consider adding:
- [ ] Unit tests for each component
- [ ] CSS modules for styling
- [ ] Redux/Context for global state
- [ ] Error boundaries
- [ ] Loading skeletons
- [ ] Pagination optimization
- [ ] Export to CSV/Excel
- [ ] Advanced filtering
- [ ] Sorting improvements
- [ ] Accessibility improvements

---

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review the component files for comments
3. Check the REFACTORING_GUIDE.md for component details
4. Verify all dependencies are installed

---

## ✅ Integration Checklist

- [ ] Updated imports in main app file
- [ ] Verified all dependencies are installed
- [ ] Checked file paths are correct
- [ ] Tested employee list display
- [ ] Tested add employee
- [ ] Tested edit employee
- [ ] Tested delete employee
- [ ] Tested bulk operations
- [ ] Tested task management
- [ ] Verified no console errors
- [ ] Deleted old EmployeeTable.js (optional)

---

## 🎉 You're All Set!

The refactoring is complete and ready to use. Enjoy your cleaner, more maintainable codebase!
