# Employee Task Management Platform

A modern MERN stack application for managing employee tasks with role-based access control.

## Features

### Employee Features
- Daily task management with multiple tasks per day
- Add tasks with project selection using a plus button
- Update task status (Pending, In Progress, Completed, Blocked)
- Add remarks to tasks in the evening
- View all tasks for the current day

### Admin Features
- Comprehensive dashboard with statistics and charts
- View all employee tasks with filtering options:
  - Filter by department
  - Filter by employee name
  - Filter by date range
- Download tasks as Excel spreadsheet
- Create and manage projects
- Create and manage departments
- View all employees

## Tech Stack

- **Frontend**: React, Recharts, Lucide Icons
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Setup Steps

1. **Clone and install dependencies**
```bash
npm run install-all
```

2. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee-task-management
JWT_SECRET=your_secure_random_secret_key
NODE_ENV=development
```

3. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

4. **Run the application**
```bash
# Development mode (runs both server and client)
npm run dev

# Or run separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Creating Admin User

Since registration creates employees by default, you need to manually create an admin user in MongoDB:

```javascript
// Connect to MongoDB and run:
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash
  role: "admin",
  department: null,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use this Node.js script:
```javascript
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/employee-task-management');

const User = require('./server/models/User');

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin'
  });
  await admin.save();
  console.log('Admin created');
  process.exit();
}

createAdmin();
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new employee
- `POST /api/auth/login` - Login

### Tasks
- `GET /api/tasks` - Get tasks (filtered for employees, all for admin)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task status and remark
- `GET /api/tasks/export/excel` - Download tasks as Excel (admin only)

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (admin only)

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department (admin only)

### Users
- `GET /api/users` - Get all employees (admin only)

## Project Structure

```
├── server/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   └── server.js        # Express server
├── client/
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── context/     # Auth context
│   │   └── styles/      # CSS files
│   └── public/
├── package.json
└── README.md
```

## Default Credentials

After creating departments and admin user:
- **Admin**: admin@example.com / admin123
- **Employee**: Register through the registration page

## License

MIT
