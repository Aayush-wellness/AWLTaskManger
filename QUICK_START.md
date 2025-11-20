# Quick Start Guide

## Step 1: Install MongoDB

Since MongoDB is not installed on your system, here are the easiest options:

### Option A: Use MongoDB Atlas (Free Cloud Database - 5 minutes)

1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free
3. Create a free cluster (M0 Sandbox)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)
6. Update the `.env` file with your connection string

### Option B: Install MongoDB Locally

**macOS:**
```bash
# Install Homebrew first (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0
```

## Step 2: Run Setup Script

After MongoDB is ready, run:

```bash
node setup.js
```

This creates:
- ✓ Admin user (admin@example.com / admin123)
- ✓ 7 Departments (Software Developer, Graphics Design, Finance, Research, Compliance, Digital Marketing, Customer Support)

## Step 3: Start the Application

```bash
npm run dev
```

Visit: http://localhost:3000

## Login Credentials

**Admin Dashboard:**
- Email: admin@example.com
- Password: admin123

**Employee Registration:**
- Employees can register and select their department

---

## Troubleshooting

**If you get connection errors:**
1. Make sure MongoDB is running (for local) or connection string is correct (for Atlas)
2. Check the `.env` file has the correct MONGODB_URI

**If ports are in use:**
- Backend uses port 5000
- Frontend uses port 3000
- Change PORT in .env if needed
