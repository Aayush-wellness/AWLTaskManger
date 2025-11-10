# Setup Instructions

## MongoDB Setup Options

You have two options for MongoDB:

### Option 1: MongoDB Atlas (Cloud - Recommended for Quick Start)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `.env` file with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee-task-management?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB Installation

**For macOS (using Homebrew):**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**For macOS (without Homebrew):**
Download from: https://www.mongodb.com/try/download/community

## Running the Setup

Once MongoDB is ready:

```bash
# Run the setup script to create admin user and departments
node setup.js
```

This will create:
- Admin user (admin@example.com / admin123)
- 7 departments: Software Developer, Graphics Design, Finance, Research, Compliance, Digital Marketing, Customer Support

## Start the Application

```bash
# Start both frontend and backend
npm run dev
```

Access the application at: http://localhost:3000

## Default Credentials

- **Admin**: admin@example.com / admin123
- **Employees**: Register through the registration page
