import connectDB from '../config/database.js';

const setupDatabase = async () => {
  try {
    console.log('🔄 Starting MongoDB setup...');

    // Connect to MongoDB
    await connectDB();

    console.log('✅ MongoDB connection established successfully!');
    console.log('📊 Database indexes will be created automatically by Mongoose models');
    console.log('🎯 All collections are ready for use');

  } catch (error) {
    console.error('❌ MongoDB setup failed:', error);
    throw error;
  }
};

// Run setup
setupDatabase()
  .then(() => {
    console.log('🎉 MongoDB setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 MongoDB setup failed:', error);
    process.exit(1);
  });
