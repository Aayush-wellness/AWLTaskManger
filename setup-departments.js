const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

// Import Department model
const Department = require('./server/models/Department');

const departments = [
  { name: 'Administration', description: 'Administrative department' },
  { name: 'Human Resources', description: 'HR and employee management' },
  { name: 'Information Technology', description: 'IT and software development' },
  { name: 'Finance', description: 'Financial management and accounting' },
  { name: 'Marketing', description: 'Marketing and communications' },
  { name: 'Operations', description: 'Operations and logistics' },
  { name: 'Sales', description: 'Sales and customer relations' }
];

async function setupDepartments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create departments
    for (const deptData of departments) {
      const existingDept = await Department.findOne({ name: deptData.name });
      if (!existingDept) {
        const dept = new Department(deptData);
        await dept.save();
        console.log(`Created department: ${deptData.name}`);
      } else {
        console.log(`Department already exists: ${deptData.name}`);
      }
    }

    console.log('Department setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up departments:', error);
    process.exit(1);
  }
}

setupDepartments();