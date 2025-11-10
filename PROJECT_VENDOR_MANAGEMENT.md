# Project Resource Management System

## Overview
A flexible system for managing project resources including vendors, agencies, in-house research, and documents. Both admins and employees can add entries with quotes and related documents for comprehensive project tracking.

## Features

### 1. Flexible Entry Types
Add different types of entries for each project:

**Entry Types:**
- **Vendor** - External vendors providing services/products
- **Agency** - Marketing or service agencies
- **In-house Research** - Internal research and documentation
- **Document/Resource** - General project documents and resources

**Information Fields (all optional except entry type):**
- Vendor/Person Name
- Agency/Company Name
- Contact Person
- Contact Email
- Contact Phone

**Quote Details:**
- Quote Amount (INR only)

**Additional Information:**
- Status (Pending, In Discussion, Approved, Rejected)
- Notes/Comments
- Multiple Document Links

### 2. Document Management
- Add multiple document links per entry
- Each document has a name and URL
- Documents are organized by entry
- Easy access with external link icons
- Documents can be proposals, contracts, specifications, research papers, etc.

### 3. Project Details View
Click on any project card to see:
- Project information (name, description, status)
- List of all entries (vendors, agencies, documents) for that project
- Entry count badge on project cards
- Full details including contacts and quotes
- Entry type badges for easy identification

### 4. Access Control
- **Employees**: Can add, edit, and delete their own entries
- **Admins**: Can view all entries and manage projects
- Both roles can access project details and all information
- Perfect for collaborative project documentation

## How to Use

### For Employees

#### Viewing Projects
1. Navigate to Employee Dashboard
2. Click on the "Projects" tab
3. See all available projects with vendor counts
4. Click on any project card to view details

#### Adding an Entry
1. Click on a project card
2. Click "Add Entry" button
3. Select entry type:
   - Vendor (for external vendors)
   - Agency (for marketing/service agencies)
   - In-house Research (for internal documentation)
   - Document/Resource (for general project documents)
4. Fill in details (all optional):
   - Enter vendor/person name
   - Add agency/company name
   - Provide contact information
   - Enter quote amount in INR
   - Set status (Pending, In Discussion, etc.)
   - Add notes if needed
5. Add document links:
   - Enter document name (e.g., "Proposal", "Research Paper", "Contract")
   - Enter document URL (Google Drive, Dropbox, etc.)
   - Click + to add
   - Repeat for multiple documents
6. Click "Add Entry" to save

#### Editing an Entry
1. Open project details
2. Click the edit icon (pencil) on any entry card
3. Update information as needed
4. Click "Update Entry"

#### Deleting an Entry
1. Open project details
2. Click the delete icon (trash) on the entry card
3. Confirm deletion

### For Admins

#### Creating Projects
1. Go to Admin Dashboard
2. Click "Projects" tab
3. Click "Add Project"
4. Enter project name, description, and status
5. Click "Create"

#### Viewing Project Entries
1. Click on any project card in the Projects tab
2. View all entries added by employees
3. See entry counts on project cards
4. Access all details and documents
5. Entry type badges help identify the type of each entry

#### Managing Entries
- Admins can add, edit, and delete any entry
- View who added each entry (tracked automatically)
- Update entry status (approve/reject quotes)
- Perfect for reviewing vendor proposals and research

## Data Tracked

### Per Entry
- Entry type (Vendor, Agency, In-house, Document)
- Vendor/Agency/Person name
- Contact details (person, email, phone)
- Quote amount in INR
- Status of the entry
- Notes and comments
- Multiple document links
- Who added the entry
- When it was created/updated

### Per Project
- Total number of entries
- All quotes and details
- Complete document repository
- Project status
- Mix of vendors, agencies, and research documents

## Benefits

✅ **Flexible System** - Add vendors, agencies, research, or just documents
✅ **Centralized Information** - All project resources in one place
✅ **Document Organization** - Keep project documents organized by entry
✅ **Quote Comparison** - Easy comparison of multiple quotes in INR
✅ **Collaboration** - Employees can add entries, admins can review
✅ **Audit Trail** - Track who added each entry and when
✅ **Status Tracking** - Monitor approval status
✅ **Easy Access** - Quick access to contacts and documents
✅ **In-house Research** - Document internal research alongside vendor quotes

## Technical Implementation

### Backend

**New Model:** `ProjectVendor`
- Stores all vendor information
- References Project and User (who added it)
- Supports multiple document links
- Tracks timestamps

**New Routes:** `/api/project-vendors`
- GET `/project/:projectId` - Get vendors for a project
- GET `/` - Get all vendors (admin overview)
- POST `/` - Add new vendor
- PUT `/:id` - Update vendor
- DELETE `/:id` - Delete vendor

**Updated:** `Project` routes
- Now includes vendor count for each project

### Frontend

**New Component:** `ProjectDetails`
- Modal view for project details
- Vendor list with full information
- Add/Edit vendor forms
- Document link management
- Responsive design

**Updated Components:**
- AdminDashboard - Projects tab with clickable cards
- EmployeeDashboard - New Projects tab
- Both show vendor counts on project cards

### Database Schema

```javascript
ProjectVendor {
  project: ObjectId (ref: Project)
  entryType: String (enum: vendor, agency, inhouse, document)
  vendorName: String
  agencyName: String
  contactPerson: String
  contactEmail: String
  contactPhone: String
  quote: Number (INR)
  documentLinks: [{
    name: String,
    url: String,
    uploadedAt: Date
  }]
  notes: String
  status: String (enum: pending, approved, rejected, in-discussion)
  addedBy: ObjectId (ref: User)
  timestamps: true
}
```

## API Endpoints

### Get Entries for Project
```
GET /api/project-vendors/project/:projectId
Auth: Required
Returns: Array of entries with populated user info
```

### Add Entry
```
POST /api/project-vendors
Auth: Required
Body: {
  project, entryType, vendorName, agencyName, contactPerson,
  contactEmail, contactPhone, quote (INR),
  documentLinks, notes, status
}
Returns: Created entry with populated data
```

### Update Entry
```
PUT /api/project-vendors/:id
Auth: Required
Body: Any entry fields to update
Returns: Updated entry
```

### Delete Entry
```
DELETE /api/project-vendors/:id
Auth: Required (must be creator or admin)
Returns: Success message
```

## Use Cases

1. **Vendor Management** - Track multiple vendor quotes for a project
2. **Agency Coordination** - Manage marketing and service agency proposals
3. **Research Documentation** - Store in-house research and findings
4. **Document Repository** - Keep all project-related documents organized
5. **Quote Comparison** - Compare quotes from different sources in INR
6. **Collaborative Work** - Team members can add resources as they find them

## Future Enhancements (Optional)

- File upload instead of just links
- Entry comparison view
- Export entries to Excel
- Rating system
- Email notifications for approvals
- Entry history across projects
- Budget tracking and comparison
- Currency conversion for international quotes
