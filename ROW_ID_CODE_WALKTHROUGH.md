# Code Walkthrough: row.id === id

## The Complete Code with Annotations

```javascript
import { useState } from 'react';

const MisModal = ({ isOpen, onClose, title }) => {
  // Initial state: Start with one empty row
  const [rows, setRows] = useState([
    { id: 1, projectName: '', description: '' }
    //  ↑ Each row has a unique ID
  ]);
  
  // Track the next ID to assign
  const [nextId, setNextId] = useState(2);
  //                                    ↑ Next row will have ID 2

  // ═══════════════════════════════════════════════════════════
  // FUNCTION 1: Update a specific row's field
  // ═══════════════════════════════════════════════════════════
  const handleInputChange = (id, field, value) => {
    //                       ↑ The ID of the row to update
    //                              ↑ Which field to update (projectName or description)
    //                                     ↑ The new value
    
    setRows(rows.map(row => {
      // Loop through each row in the array
      
      if (row.id === id) {
      //  ↑ Check if this row's ID matches the ID we're looking for
      
        // YES! This is the row we want to update
        return { ...row, [field]: value };
        //     ↑ Keep all existing properties
        //                    ↑ Update only the specified field
      } else {
        // NO! This is not the row we want
        return row;
        // ↑ Return it unchanged
      }
    }));
  };

  // ═══════════════════════════════════════════════════════════
  // FUNCTION 2: Add a new row
  // ═══════════════════════════════════════════════════════════
  const handleAddRow = () => {
    setRows([
      ...rows,  // Keep all existing rows
      { id: nextId, projectName: '', description: '' }
      //  ↑ Create new row with the next available ID
    ]);
    
    setNextId(nextId + 1);
    // ↑ Increment the ID counter for the next row
  };

  // ═══════════════════════════════════════════════════════════
  // FUNCTION 3: Delete a specific row
  // ═══════════════════════════════════════════════════════════
  const handleRemoveRow = (id) => {
    //                     ↑ The ID of the row to delete
    
    setRows(rows.filter(row => {
      // Keep only rows where the condition is TRUE
      
      return row.id !== id;
      //      ↑ Keep this row if its ID is NOT equal to the ID we're deleting
      //         (This removes the row with matching ID)
    }));
  };

  // ═══════════════════════════════════════════════════════════
  // FUNCTION 4: Save all rows
  // ═══════════════════════════════════════════════════════════
  const handleSave = () => {
    console.log('Saving data:', rows);
    // ↑ All rows with their IDs and data
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER: Display the rows
  // ═══════════════════════════════════════════════════════════
  return (
    <div>
      {rows.map((row, index) => (
        // ↑ Loop through each row
        
        <div key={row.id}>
        //   ↑ Use the ID as the key (React best practice)
        
          <input
            value={row.projectName}
            onChange={(e) => handleInputChange(row.id, 'projectName', e.target.value)}
            //                                  ↑ Pass the row's ID to the function
          />
          
          <input
            value={row.description}
            onChange={(e) => handleInputChange(row.id, 'description', e.target.value)}
            //                                  ↑ Pass the row's ID to the function
          />
          
          <button onClick={() => handleRemoveRow(row.id)}>
            //                                  ↑ Pass the row's ID to delete
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## Step-by-Step Execution Example

### Initial State:
```javascript
rows = [
  { id: 1, projectName: '', description: '' }
]
nextId = 2
```

### User Types "Project A" in Row 1's Project Name:

**Step 1**: Event fires
```javascript
onChange={(e) => handleInputChange(row.id, 'projectName', e.target.value)}
                                    ↑ row.id = 1
                                                ↑ field = 'projectName'
                                                           ↑ value = 'Project A'
```

**Step 2**: Function is called
```javascript
handleInputChange(1, 'projectName', 'Project A')
```

**Step 3**: Map through rows
```javascript
rows.map(row => {
  // Iteration 1:
  // row = { id: 1, projectName: '', description: '' }
  // Check: row.id === id  →  1 === 1  →  TRUE ✓
  // Action: Update projectName
  // Return: { id: 1, projectName: 'Project A', description: '' }
})
```

**Step 4**: State updates
```javascript
rows = [
  { id: 1, projectName: 'Project A', description: '' }
]
```

---

### User Clicks + Button:

**Step 1**: Function is called
```javascript
handleAddRow()
```

**Step 2**: Add new row
```javascript
setRows([
  ...rows,  // { id: 1, projectName: 'Project A', description: '' }
  { id: nextId, projectName: '', description: '' }
  //  ↑ { id: 2, projectName: '', description: '' }
])
```

**Step 3**: Increment ID counter
```javascript
setNextId(nextId + 1)  // 2 + 1 = 3
```

**Step 4**: State updates
```javascript
rows = [
  { id: 1, projectName: 'Project A', description: '' },
  { id: 2, projectName: '', description: '' }
]
nextId = 3
```

---

### User Types "Project B" in Row 2's Project Name:

**Step 1**: Event fires
```javascript
onChange={(e) => handleInputChange(row.id, 'projectName', e.target.value)}
                                    ↑ row.id = 2
```

**Step 2**: Function is called
```javascript
handleInputChange(2, 'projectName', 'Project B')
```

**Step 3**: Map through rows
```javascript
rows.map(row => {
  // Iteration 1:
  // row = { id: 1, projectName: 'Project A', description: '' }
  // Check: row.id === id  →  1 === 2  →  FALSE ❌
  // Action: Return unchanged
  // Return: { id: 1, projectName: 'Project A', description: '' }
  
  // Iteration 2:
  // row = { id: 2, projectName: '', description: '' }
  // Check: row.id === id  →  2 === 2  →  TRUE ✓
  // Action: Update projectName
  // Return: { id: 2, projectName: 'Project B', description: '' }
})
```

**Step 4**: State updates
```javascript
rows = [
  { id: 1, projectName: 'Project A', description: '' },
  { id: 2, projectName: 'Project B', description: '' }
]
```

---

### User Clicks Delete on Row 1:

**Step 1**: Event fires
```javascript
onClick={() => handleRemoveRow(row.id)}
                                ↑ row.id = 1
```

**Step 2**: Function is called
```javascript
handleRemoveRow(1)
```

**Step 3**: Filter rows
```javascript
rows.filter(row => {
  // Check Row 1:
  // row.id !== id  →  1 !== 1  →  FALSE ❌
  // Action: Remove this row
  
  // Check Row 2:
  // row.id !== id  →  2 !== 1  →  TRUE ✓
  // Action: Keep this row
})
```

**Step 4**: State updates
```javascript
rows = [
  { id: 2, projectName: 'Project B', description: '' }
]
```

---

## The Three Comparison Operators

### 1. `===` (Strict Equality - Used in UPDATE)
```javascript
row.id === id

// Returns TRUE if they are exactly equal
1 === 1  → TRUE
1 === 2  → FALSE
```

### 2. `!==` (Strict Inequality - Used in DELETE)
```javascript
row.id !== id

// Returns TRUE if they are NOT equal
1 !== 2  → TRUE
1 !== 1  → FALSE
```

### 3. `?` and `:` (Ternary Operator - Used in UPDATE)
```javascript
row.id === id ? UPDATE : KEEP

// If row.id === id is TRUE, do UPDATE
// If row.id === id is FALSE, do KEEP
```

---

## Common Mistakes and How to Avoid Them

### ❌ Mistake 1: Forgetting the ID check
```javascript
// This updates ALL rows!
setRows(rows.map(row => ({
  ...row,
  projectName: 'New Project'
})));
```

### ✅ Correct: Include the ID check
```javascript
// This updates only the matching row
setRows(rows.map(row =>
  row.id === id ? { ...row, projectName: 'New Project' } : row
));
```

---

### ❌ Mistake 2: Using wrong comparison operator
```javascript
// This keeps the row we want to delete!
setRows(rows.filter(row => row.id === id));
```

### ✅ Correct: Use !== for deletion
```javascript
// This removes the row we want to delete
setRows(rows.filter(row => row.id !== id));
```

---

### ❌ Mistake 3: Using array index instead of ID
```javascript
// Problem: If we delete row 0, indices shift!
const handleRemoveRow = (index) => {
  rows.splice(index, 1);  // Dangerous!
};
```

### ✅ Correct: Use unique IDs
```javascript
// Solution: IDs never change, even if we delete rows
const handleRemoveRow = (id) => {
  setRows(rows.filter(row => row.id !== id));
};
```

---

## Summary Table

| Operation | Code | Explanation |
|-----------|------|-------------|
| **Update** | `row.id === id ? UPDATE : KEEP` | If ID matches, update; otherwise keep |
| **Delete** | `row.id !== id` | Keep rows where ID does NOT match |
| **Add** | `{ id: nextId, ... }` | Create new row with new ID |
| **Find** | `rows.find(r => r.id === id)` | Get the row with specific ID |

---

## Key Concepts Recap

1. **Each row has a unique ID** (1, 2, 3, ...)
2. **The `id` parameter** tells us which row to update/delete
3. **`row.id === id`** checks if this is the row we want
4. **If TRUE**: Update/Delete this row
5. **If FALSE**: Leave this row alone

This ensures that when you have multiple rows, only the one you want gets modified!