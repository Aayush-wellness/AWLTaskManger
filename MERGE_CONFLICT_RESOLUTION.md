# Merge Conflict Resolution Guide

## What happened?
- Git tried to merge your local changes with remote repository
- Both versions had changes in same files
- Git couldn't decide which version to keep
- Manual resolution needed

## Files with conflicts:
- client/package-lock.json
- client/src/components/EmployeeTable.js
- client/src/components/PersonalEmployeeTable.js
- client/src/components/ProfileSettings.js
- client/src/pages/EmployeeDashboard.js
- client/src/utils/avatarUtils.js
- server/routes/auth.js
- server/routes/users.js

## Resolution Strategy:
Since our local changes are the most recent and complete implementation,
we'll keep our version (the current working version).

## Commands to resolve:
```bash
# Keep our version for all conflicted files
git checkout --ours client/package-lock.json
git checkout --ours client/src/components/EmployeeTable.js
git checkout --ours client/src/components/PersonalEmployeeTable.js
git checkout --ours client/src/components/ProfileSettings.js
git checkout --ours client/src/pages/EmployeeDashboard.js
git checkout --ours client/src/utils/avatarUtils.js
git checkout --ours server/routes/auth.js
git checkout --ours server/routes/users.js

# Mark conflicts as resolved
git add .

# Complete the merge
git commit -m "resolve: Merge conflicts - keeping latest implementation"
```

## Alternative: Abort merge and force push
```bash
# If you want to start fresh
git merge --abort
git push --force-with-lease origin dev
```