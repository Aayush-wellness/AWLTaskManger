const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not Set',
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not Set',
      mongoConnection: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      userCount: userCount,
      databaseTest: 'Success'
    });
  } catch (error) {
    res.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not Set',
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not Set',
      mongoConnection: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      error: error.message,
      databaseTest: 'Failed'
    });
  }
});

// Create admin user endpoint (for initial setup)
app.post('/api/setup/admin', async (req, res) => {
  try {
    const User = require('./models/User');
    const Department = require('./models/Department');
    const bcrypt = require('bcryptjs');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      return res.json({ message: 'Admin user already exists', email: 'admin@example.com' });
    }

    // Create default department if it doesn't exist
    let department = await Department.findOne({ name: 'Administration' });
    if (!department) {
      department = new Department({
        name: 'Administration',
        description: 'Administrative department'
      });
      await department.save();
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      department: department._id
    });

    await adminUser.save();

    res.json({ 
      message: 'Admin user created successfully',
      email: 'admin@example.com',
      password: 'admin123',
      note: 'Please change this password after first login'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Setup failed', 
      message: error.message 
    });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/project-vendors', require('./routes/projectVendors'));
app.use('/api/notifications' , require('./routes/notificationRoutes'));

// Error handling middleware 
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));