# Git Repository Setup & Push Guide

## Step 1: Initialize Git Repository (if not already done)
```bash
cd Employeetask
git init
```

## Step 2: Add Remote Repository
```bash
# Replace with your GitHub repository URL
git remote add origin https://github.com/yourusername/your-repo-name.git

# Check if remote is added correctly
git remote -v
```

## Step 3: Check Current Status
```bash
git status
```

## Step 4: Add Files to Staging
```bash
# Add all files except those in .gitignore
git add .

# Or add specific files
git add package.json
git add client/
git add server/
git add .gitignore
```

## Step 5: Commit Changes
```bash
git commit -m "Initial commit: Employee Management System with MongoDB integration"

# Or more detailed commit
git commit -m "feat: Complete employee management system

- MongoDB integration with user authentication
- Role-based access control (Admin/Employee)
- Avatar upload functionality with file size limits
- Task management with CRUD operations
- Excel export functionality
- Bulk operations for admins
- Profile settings with real-time updates
- Department-based employee filtering"
```

## Step 6: Create and Push to Branch
```bash
# Create new branch
git checkout -b main

# Or create feature branch
git checkout -b feature/employee-management

# Push to remote repository
git push -u origin main

# Or push feature branch
git push -u origin feature/employee-management
```

## Alternative: Push to existing branch
```bash
# If repository already exists
git branch -M main
git push -u origin main
```

## Step 7: Verify Upload
- Go to your GitHub repository
- Check that files are uploaded
- Verify that `uploads/` folder is NOT uploaded (due to .gitignore)
- Only `.gitkeep` files should be visible in uploads directory

## Common Git Commands for Future Updates

### Daily Workflow
```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "fix: your change description"

# Push changes
git push origin main
```

### Branch Management
```bash
# Create new feature branch
git checkout -b feature/new-feature

# Switch between branches
git checkout main
git checkout feature/new-feature

# Merge branch to main
git checkout main
git merge feature/new-feature

# Delete branch after merge
git branch -d feature/new-feature
```

## Important Notes

### ✅ What WILL be uploaded:
- All source code files
- Configuration files (package.json, etc.)
- Documentation files
- .gitkeep files (to maintain folder structure)

### ❌ What will NOT be uploaded:
- node_modules/ (dependencies)
- uploads/ (avatar files)
- .env (environment variables)
- Build files
- Log files

### Security Checklist:
- ✅ .env file is in .gitignore
- ✅ uploads/ folder is in .gitignore
- ✅ node_modules/ is in .gitignore
- ✅ Sensitive data is not committed

## Troubleshooting

### If you get authentication error:
```bash
# Use personal access token instead of password
# Go to GitHub Settings > Developer settings > Personal access tokens
# Generate new token and use it as password
```

### If repository already exists:
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

### If you want to ignore already tracked files:
```bash
git rm -r --cached uploads/
git commit -m "Remove uploads folder from tracking"
git push origin main
```