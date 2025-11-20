# 🚀 Employee Task Management Platform - Start Here

## ✅ What's Been Completed

1. ✓ All dependencies installed (backend + frontend)
2. ✓ Environment configuration file created (.env)
3. ✓ Setup script ready (setup.js)
4. ✓ Complete MERN application built

## ⚠️ Next Step Required: Install MongoDB

MongoDB is not currently installed on your system. Choose one option below:

---

## 🌟 RECOMMENDED: MongoDB Atlas (Cloud - Fastest)

**Takes 5 minutes, no local installation needed:**

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create a free M0 cluster
4. Click "Connect" → "Connect your application"
5. Copy your connection string
6. Open `.env` file and replace the MONGODB_URI line with:
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/employee-task-management?retryWrites=true&w=majority
   ```

Then run:
```bash
node setup.js
npm run dev
```

---

## 💻 ALTERNATIVE: Install MongoDB Locally

**For macOS:**

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0

# Verify it's running
brew services list | grep mongodb
```

Then run:
```bash
node setup.js
npm run dev
```

---

## 📋 What the Setup Script Does

When you run `node setup.js`, it will:

1. ✓ Connect to MongoDB
2. ✓ Create Admin user:
   - Email: admin@example.com
   - Password: admin123
3. ✓ Create 7 Departments:
   - Software Developer
   - Graphics Design
   - Finance
   - Research
   - Compliance
   - Digital Marketing
   - Customer Support

---

## 🎯 After Setup

1. Start the application:
   ```bash
   npm run dev
   ```

2. Open browser: http://localhost:3000

3. Login as Admin:
   - Email: admin@example.com
   - Password: admin123

4. Or register as Employee and select a department

---

## 📱 Application Features

**Employee Dashboard:**
- Add multiple tasks per day
- Select project for each task
- Update task status (Pending, In Progress, Completed, Blocked)
- Add remarks to tasks

**Admin Dashboard:**
- View all employee tasks
- Filter by department, employee, date range
- Download Excel reports
- Create/manage projects and departments
- View statistics and charts

---

## 🆘 Need Help?

If you encounter any issues:
1. Make sure MongoDB is running
2. Check `.env` file has correct MONGODB_URI
3. Ensure ports 3000 and 5000 are available

**Ready to proceed?** Choose MongoDB Atlas or local installation above, then run the setup script!
