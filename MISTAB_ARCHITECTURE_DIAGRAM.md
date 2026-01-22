# MisTab Architecture Diagram

## Component Hierarchy

```
EmployeeDashboard.js
    │
    └─→ MisTab/index.js
        │
        └─→ MisTabContainer.js (Main Container)
            │
            ├─→ MisHeader.js
            │   └─→ [Add MIS Data Button]
            │
            ├─→ MisEmptyState.js (if no data)
            │   └─→ [Empty State Message + Button]
            │
            ├─→ MisFilterPanel.js (if has data)
            │   ├─→ [Search Input]
            │   ├─→ [Date Filter Dropdown]
            │   ├─→ [Sort Dropdown]
            │   └─→ [Statistics Display]
            │
            ├─→ MisCardGrid.js (if has data)
            │   └─→ MisCard.js (for each entry)
            │       ├─→ [Card Header]
            │       ├─→ [Edit/Delete Buttons]
            │       ├─→ [Data Table]
            │       └─→ [Card Footer]
            │
            ├─→ MisPagination.js (if has data)
            │   ├─→ [Previous Button]
            │   ├─→ [Page Numbers]
            │   └─→ [Next Button]
            │
            └─→ MisModal.js
                ├─→ [Form Inputs]
                ├─→ [Add/Remove Rows]
                └─→ [Save/Cancel Buttons]
```

---

## State Management Flow

```
MisTabContainer
│
├─ Modal States
│  ├─ isOpen: boolean
│  ├─ isEditMode: boolean
│  └─ editingCardId: string | null
│
├─ Data State
│  └─ savedData: Array<MisEntry>
│
└─ Filter & Pagination States
   ├─ searchQuery: string
   ├─ sortBy: 'newest' | 'oldest' | 'alphabetical'
   ├─ filterPeriod: 'all' | 'today' | 'week' | 'month'
   └─ currentPage: number
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Component Mount                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              fetchMISData() - API Call                      │
│              GET /api/mis                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           Convert Dates & Store in State                   │
│           setSavedData(dataWithDates)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              User Interacts with UI                        │
│  (Search, Filter, Sort, Pagination, Add/Edit/Delete)      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           getFilteredData() Function                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Apply Search Filter                              │   │
│  │    - Search project names & descriptions            │   │
│  │    - Case-insensitive matching                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 2. Apply Date Filter                                │   │
│  │    - Today / Last 7 Days / Last 30 Days / All Time  │   │
│  │    - Calculate date ranges                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 3. Apply Sort                                       │   │
│  │    - Newest First / Oldest First / Alphabetical     │   │
│  │    - Sort filtered results                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 4. Return Filtered Data                             │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           Pagination Calculation                            │
│  - Calculate total pages                                   │
│  - Calculate start index                                   │
│  - Slice data for current page                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Render Components                              │
│  - MisFilterPanel (if has data)                            │
│  - MisCardGrid (if has data)                               │
│  - MisPagination (if has data)                             │
│  - MisEmptyState (if no data)                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              User Sees Results                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Props Flow Diagram

```
MisTabContainer
│
├─→ MisHeader
│   └─ Props: { onAddClick }
│
├─→ MisFilterPanel
│   └─ Props: {
│       searchQuery, onSearchChange,
│       sortBy, onSortChange,
│       filterPeriod, onFilterChange,
│       totalEntries, filteredCount,
│       currentPage, totalPages
│     }
│
├─→ MisCardGrid
│   └─ Props: { data, onEdit, onDelete }
│       │
│       └─→ MisCard (for each item)
│           └─ Props: { item, index, onEdit, onDelete }
│
├─→ MisPagination
│   └─ Props: { currentPage, totalPages, onPageChange }
│
└─→ MisModal
    └─ Props: {
        isOpen, onClose, onSave,
        title, initialData, isEditMode
      }
```

---

## Event Handler Flow

```
User Action
    │
    ├─→ Click "Add MIS Data"
    │   └─→ handleAddClick()
    │       └─→ setIsOpen(true)
    │           └─→ MisModal opens
    │
    ├─→ Type in Search Box
    │   └─→ onSearchChange(query)
    │       └─→ setSearchQuery(query)
    │           └─→ getFilteredData() recalculates
    │               └─→ Component re-renders
    │
    ├─→ Select Date Filter
    │   └─→ onFilterChange(period)
    │       └─→ setFilterPeriod(period)
    │           └─→ setCurrentPage(1)
    │               └─→ getFilteredData() recalculates
    │                   └─→ Component re-renders
    │
    ├─→ Select Sort Method
    │   └─→ onSortChange(sortBy)
    │       └─→ setSortBy(sortBy)
    │           └─→ setCurrentPage(1)
    │               └─→ getFilteredData() recalculates
    │                   └─→ Component re-renders
    │
    ├─→ Click Page Number
    │   └─→ onPageChange(page)
    │       └─→ setCurrentPage(page)
    │           └─→ paginatedData recalculates
    │               └─→ Component re-renders
    │
    ├─→ Click Edit Button
    │   └─→ handleEditCard(cardId)
    │       └─→ setEditingCardId(cardId)
    │           └─→ setIsEditMode(true)
    │               └─→ setIsOpen(true)
    │                   └─→ MisModal opens with data
    │
    ├─→ Click Delete Button
    │   └─→ handleDeleteCard(id)
    │       └─→ Confirm dialog
    │           └─→ axios.delete()
    │               └─→ setSavedData() (remove item)
    │                   └─→ Component re-renders
    │
    └─→ Save in Modal
        └─→ handleSaveData() or handleUpdateCard()
            └─→ axios.post() or axios.put()
                └─→ setSavedData() (add/update item)
                    └─→ setIsOpen(false)
                        └─→ Component re-renders
```

---

## Component Responsibility Matrix

| Component | State | Props | Events | Renders |
|-----------|-------|-------|--------|---------|
| **MisTabContainer** | ✓ | - | ✓ | ✓ |
| **MisHeader** | - | ✓ | ✓ | ✓ |
| **MisFilterPanel** | - | ✓ | ✓ | ✓ |
| **MisEmptyState** | - | ✓ | ✓ | ✓ |
| **MisCard** | - | ✓ | ✓ | ✓ |
| **MisCardGrid** | - | ✓ | - | ✓ |
| **MisPagination** | - | ✓ | ✓ | ✓ |
| **MisModal** | ✓ | ✓ | ✓ | ✓ |

---

## File Size Comparison

### Before (Monolithic)
```
MisTab.js: 743 lines
```

### After (Component-Based)
```
MisTabContainer.js:  200 lines
MisCard.js:          150 lines
MisFilterPanel.js:   120 lines
MisPagination.js:    100 lines
MisHeader.js:         30 lines
MisCardGrid.js:       30 lines
MisEmptyState.js:     40 lines
index.js:              3 lines
─────────────────────────────
Total:               673 lines (70 lines saved!)
```

---

## Rendering Flow

```
MisTabContainer renders
    │
    ├─→ Check if savedData.length === 0
    │   │
    │   ├─ YES → Render MisEmptyState
    │   │
    │   └─ NO → Render:
    │       ├─→ MisHeader
    │       ├─→ MisFilterPanel
    │       ├─→ MisCardGrid
    │       │   └─→ MisCard (for each paginatedData item)
    │       └─→ MisPagination
    │
    └─→ Always render MisModal
```

---

## Performance Optimization

```
MisTabContainer
    │
    ├─ useEffect (fetch data on mount)
    │   └─ Runs once on component mount
    │
    ├─ useEffect (reset page on filter change)
    │   └─ Runs when searchQuery, sortBy, or filterPeriod changes
    │
    ├─ getFilteredData() (memoizable)
    │   └─ Called on every render
    │   └─ Could be wrapped with useMemo()
    │
    └─ Pagination calculation
        └─ Efficient slice operation
        └─ Only renders 10 items at a time
```

---

## API Integration

```
MisTabContainer
    │
    ├─ GET /api/mis
    │   └─ fetchMISData()
    │       └─ Called on component mount
    │       └─ Populates savedData
    │
    ├─ POST /api/mis
    │   └─ handleSaveData()
    │       └─ Called when creating new entry
    │       └─ Adds to savedData
    │
    ├─ PUT /api/mis/:id
    │   └─ handleUpdateCard()
    │       └─ Called when editing entry
    │       └─ Updates in savedData
    │
    └─ DELETE /api/mis/:id
        └─ handleDeleteCard()
            └─ Called when deleting entry
            └─ Removes from savedData
```

---

## Error Handling Flow

```
API Call
    │
    ├─ Success
    │   └─ Update state
    │       └─ Show success toast
    │           └─ Component re-renders
    │
    └─ Error
        └─ Log error to console
            └─ Show error toast
                └─ State unchanged
                    └─ Component re-renders with old data
```

---

## Responsive Design

```
Desktop (1200px+)
├─ 4 cards per row
├─ Full filter controls
└─ All features visible

Tablet (768px - 1199px)
├─ 2 cards per row
├─ Stacked filters
└─ All features visible

Mobile (< 768px)
├─ 1 card per row
├─ Vertical filters
└─ All features visible
```

---

## Conclusion

This architecture provides:
- ✓ Clear separation of concerns
- ✓ Easy to understand data flow
- ✓ Efficient rendering
- ✓ Scalable component structure
- ✓ Maintainable codebase
- ✓ Testable components
- ✓ Reusable components

---

**Version**: 1.0
**Date**: January 21, 2026
**Status**: Production Ready
