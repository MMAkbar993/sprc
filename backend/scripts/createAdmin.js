import connectDB from '../config/database.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const createAdmin = async () => {
  try {
    console.log('🔧 Creating admin user...');

    // Connect to MongoDB
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@college.edu' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: admin@college.edu');
      console.log('🔑 Password: password (if not changed)');
      process.exit(0);
    }

    // Hash password
    const adminPassword = await bcrypt.hash('password', 12);

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@college.edu',
      password_hash: adminPassword,
      name: 'Admin User',
      role: 'admin',
      phone: '+92-300-1234567',
      address: 'Taunsa, DG Khan, Punjab, Pakistan',
      date_of_birth: new Date('1980-01-15'),
      blood_group: 'O+',
      nationality: 'Pakistani',
      religion: 'Islam',
      emergency_contact: '+92-300-1234567',
      guardian_name: 'Admin Guardian',
      is_active: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📧 Email: admin@college.edu');
    console.log('🔑 Password: password');
    console.log('');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdmin();

