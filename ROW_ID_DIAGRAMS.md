# Visual Diagrams: row.id === id

## Diagram 1: The Array Structure

```
rows Array:
┌─────────────────────────────────────────────────────────┐
│ Index 0                                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ id: 1                                               │ │
│ │ projectName: 'Project A'                            │ │
│ │ description: 'Description A'                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Index 1                                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ id: 2                                               │ │
│ │ projectName: 'Project B'                            │ │
│ │ description: 'Description B'                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Index 2                                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ id: 3                                               │ │
│ │ projectName: 'Project C'                            │ │
│ │ description: 'Description C'                        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Diagram 2: Update Flow (row.id === id)

```
User Types in Row 2's Project Name Field
                    ↓
        handleInputChange(2, 'projectName', 'Marketing')
                    ↓
        ┌───────────────────────────────────────┐
        │ rows.map(row => {                     │
        │   if (row.id === 2) {                 │
        │     Update this row                   │
        │   } else {                            │
        │     Keep unchanged                    │
        │   }                                   │
        │ })                                    │
        └───────────────────────────────────────┘
                    ↓
        ┌─────────────────────────────────────┐
        │ Iteration 1: row.id = 1             │
        │ Check: 1 === 2 ? NO ❌              │
        │ Action: Keep unchanged              │
        └─────────────────────────────────────┘
                    ↓
        ┌─────────────────────────────────────┐
        │ Iteration 2: row.id = 2             │
        │ Check: 2 === 2 ? YES ✓              │
        │ Action: Update projectName          │
        └─────────────────────────────────────┘
                    ↓
        ┌─────────────────────────────────────┐
        │ Iteration 3: row.id = 3             │
        │ Check: 3 === 2 ? NO ❌              │
        │ Action: Keep unchanged              │
        └─────────────────────────────────────┘
                    ↓
        State Updated Successfully!
```

---

## Diagram 3: Delete Flow (row.id !== id)

```
User Clicks Delete on Row 2
                    ↓
        handleRemoveRow(2)
                    ↓
        ┌───────────────────────────────────────┐
        │ rows.filter(row => {                  │
        │   return row.id !== 2                 │
        │ })                                    │
        │ (Keep rows where ID is NOT 2)         │
        └───────────────────────────────────────┘
                    ↓
        ┌─────────────────────────────────────┐
        │ Check Row 1: 1 !== 2 ? YES ✓        │
        │ Action: Keep this row               │
        └─────────────────────────────────────┘
                    ↓
        ┌─────────────────────────────────────┐
        │ Check Row 2: 2 !== 2 ? NO ❌        │
        │ Action: Remove this row             │
        └─────────────────────────────────────┘
                    ↓
        ┌─────────────────────────────────────┐
        │ Check Row 3: 3 !== 2 ? YES ✓        │
        │ Action: Keep this row               │
        └─────────────────────────────────────┘
                    ↓
        State Updated: Row 2 Deleted!
```

---

## Diagram 4: Add Flow

```
User Clicks + Button
                    ↓
        handleAddRow()
                    ↓
        ┌───────────────────────────────────────┐
        │ setRows([                             │
        │   ...rows,                            │
        │   { id: nextId, ... }                 │
        │ ])                                    │
        │ setNextId(nextId + 1)                 │
        └───────────────────────────────────────┘
                    ↓
        Before:
        rows = [
          { id: 1, ... },
          { id: 2, ... }
        ]
        nextId = 3
                    ↓
        After:
        rows = [
          { id: 1, ... },
          { id: 2, ... },
          { id: 3, ... }  ← NEW ROW
        ]
        nextId = 4
```

---

## Diagram 5: Complete User Journey

```
START
  ↓
┌─────────────────────────────────────┐
│ Initial State:                      │
│ rows = [{ id: 1, ... }]             │
│ nextId = 2                          │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ User types "Project A" in Row 1     │
│ handleInputChange(1, ..., 'A')      │
│ 1 === 1 ? YES → Update              │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ rows = [{ id: 1, name: 'A', ... }]  │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ User clicks + button                │
│ handleAddRow()                      │
│ Add new row with id: 2              │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ rows = [                            │
│   { id: 1, name: 'A', ... },        │
│   { id: 2, name: '', ... }          │
│ ]                                   │
│ nextId = 3                          │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ User types "Project B" in Row 2     │
│ handleInputChange(2, ..., 'B')      │
│ 2 === 2 ? YES → Update              │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ rows = [                            │
│   { id: 1, name: 'A', ... },        │
│   { id: 2, name: 'B', ... }         │
│ ]                                   │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ User clicks delete on Row 1         │
│ handleRemoveRow(1)                  │
│ 1 !== 1 ? NO → Delete               │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ rows = [                            │
│   { id: 2, name: 'B', ... }         │
│ ]                                   │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ User clicks Save                    │
│ Save all rows to database           │
└─────────────────────────────────────┘
  ↓
END
```

---

## Diagram 6: The Comparison Logic

```
                    ┌─────────────────────┐
                    │  row.id === id ?    │
                    └─────────────────────┘
                           ↙         ↖
                        YES           NO
                         ↓             ↓
                    ┌─────────┐   ┌──────────┐
                    │ UPDATE  │   │ KEEP     │
                    │ this    │   │ unchanged│
                    │ row     │   │          │
                    └─────────┘   └──────────┘
```

---

## Diagram 7: Array Transformation

```
BEFORE UPDATE:
┌──────────────────────────────────────────────────┐
│ rows = [                                         │
│   { id: 1, projectName: 'A', description: '' }, │
│   { id: 2, projectName: '', description: '' },  │
│   { id: 3, projectName: 'C', description: '' }  │
│ ]                                               │
└──────────────────────────────────────────────────┘

User calls: handleInputChange(2, 'projectName', 'B')

DURING MAP:
┌──────────────────────────────────────────────────┐
│ Row 1: 1 === 2 ? NO  → Keep as is               │
│ Row 2: 2 === 2 ? YES → Update projectName to 'B'│
│ Row 3: 3 === 2 ? NO  → Keep as is               │
└──────────────────────────────────────────────────┘

AFTER UPDATE:
┌──────────────────────────────────────────────────┐
│ rows = [                                         │
│   { id: 1, projectName: 'A', description: '' }, │
│   { id: 2, projectName: 'B', description: '' }, │
│   { id: 3, projectName: 'C', description: '' }  │
│ ]                                               │
└──────────────────────────────────────────────────┘
```

---

## Diagram 8: Filter Transformation

```
BEFORE DELETE:
┌──────────────────────────────────────────────────┐
│ rows = [                                         │
│   { id: 1, projectName: 'A', description: '' }, │
│   { id: 2, projectName: 'B', description: '' }, │
│   { id: 3, projectName: 'C', description: '' }  │
│ ]                                               │
└──────────────────────────────────────────────────┘

User calls: handleRemoveRow(2)

DURING FILTER:
┌──────────────────────────────────────────────────┐
│ Row 1: 1 !== 2 ? YES → Keep                     │
│ Row 2: 2 !== 2 ? NO  → Remove                   │
│ Row 3: 3 !== 2 ? YES → Keep                     │
└──────────────────────────────────────────────────┘

AFTER DELETE:
┌──────────────────────────────────────────────────┐
│ rows = [                                         │
│   { id: 1, projectName: 'A', description: '' }, │
│   { id: 3, projectName: 'C', description: '' }  │
│ ]                                               │
└──────────────────────────────────────────────────┘
```

---

## Diagram 9: ID Assignment

```
Initial:
nextId = 2

Add Row 1:
  Create: { id: 2, ... }
  Increment: nextId = 3

Add Row 2:
  Create: { id: 3, ... }
  Increment: nextId = 4

Add Row 3:
  Create: { id: 4, ... }
  Increment: nextId = 5

Result:
rows = [
  { id: 1, ... },  ← Original
  { id: 2, ... },  ← Added 1st
  { id: 3, ... },  ← Added 2nd
  { id: 4, ... }   ← Added 3rd
]
```

---

## Diagram 10: Decision Tree

```
                    START
                      ↓
            ┌─────────────────────┐
            │ Loop through rows   │
            └─────────────────────┘
                      ↓
            ┌─────────────────────┐
            │ row.id === id ?     │
            └─────────────────────┘
                   ↙         ↖
                YES           NO
                 ↓             ↓
        ┌──────────────┐  ┌──────────────┐
        │ This is the  │  │ This is NOT  │
        │ row we want  │  │ the row we   │
        │              │  │ want         │
        └──────────────┘  └──────────────┘
                 ↓             ↓
        ┌──────────────┐  ┌──────────────┐
        │ UPDATE or    │  │ KEEP         │
        │ DELETE it    │  │ unchanged    │
        └──────────────┘  └──────────────┘
                 ↓             ↓
            ┌─────────────────────┐
            │ More rows?          │
            └─────────────────────┘
                   ↙         ↖
                YES           NO
                 ↓             ↓
            (Loop again)    (Done)
```

---

## Summary

These diagrams show:
1. **How data is structured** (Array of objects with IDs)
2. **How updates work** (Map through and check ID)
3. **How deletions work** (Filter and keep non-matching IDs)
4. **How additions work** (Add new row with new ID)
5. **The complete flow** (User journey from start to end)
6. **The decision logic** (YES/NO based on ID match)
7. **Array transformations** (Before and after states)
8. **ID assignment** (How IDs are generated)
9. **Decision tree** (How the code decides what to do)

All of these revolve around the simple concept: **`row.id === id` finds the right row!**