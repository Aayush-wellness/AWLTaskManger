const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const User = require('./server/models/User');
const Department = require('./server/models/Department');

const departments = [
  { name: 'Software Developer', description: 'Software development and engineering team' },
  { name: 'Graphics Design', description: 'Creative design and visual content team' },
  { name: 'Finance', description: 'Financial management and accounting team' },
  { name: 'Research', description: 'Research and development team' },
  { name: 'Compliance', description: 'Compliance and regulatory team' },
  { name: 'Digital Marketing', description: 'Digital marketing and social media team' },
  { name: 'Customer Support', description: 'Customer service and support team' }
];

async function setup() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    await Department.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create departments
    const createdDepartments = await Department.insertMany(departments);
    console.log(`✓ Created ${createdDepartments.length} departments:`);
    createdDepartments.forEach(dept => {
      console.log(`  - ${dept.name}`);
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    await admin.save();
    console.log('\n✓ Admin user created successfully');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');

    console.log('\n✅ Setup completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Run "npm run dev" to start the application');
    console.log('2. Login with admin credentials');
    console.log('3. Register employees who can select from the departments');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();
