import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/Department.js';

dotenv.config();

const departments = [
  {
    name: 'BS Urdu',
    code: 'URDU',
    description: 'Comprehensive program in Urdu language, literature, and linguistics fostering appreciation of rich cultural heritage.'
  },
  {
    name: 'BS Information Technology',
    code: 'IT',
    description: 'Focus on practical applications of computing technology, empowering students to get the right career break in IT field.'
  },
  {
    name: 'BS English',
    code: 'ENG',
    description: 'Comprehensive English language and literature program developing communication and analytical skills.'
  },
  {
    name: 'BS Botany',
    code: 'BOT',
    description: 'Study of plant life, ecology, and botanical sciences preparing students for careers in environmental and life sciences.'
  },
  {
    name: 'BS Zoology',
    code: 'ZOO',
    description: 'Comprehensive study of animal life, behavior, and biological sciences for aspiring biologists and researchers.'
  },
  {
    name: 'BBA (Business Administration)',
    code: 'BBA',
    description: 'Business administration and management program providing essential skills for successful careers in business sector.'
  },
  {
    name: 'B.Ed (1.5 years program)',
    code: 'BED',
    description: 'Education program for aspiring teachers focusing on pedagogical skills and teaching methodologies.'
  }
];

const populateDepartments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college_portal');
    console.log('✅ Connected to MongoDB');

    // Clear existing departments
    await Department.deleteMany({});
    console.log('🗑️  Cleared existing departments');

    // Insert departments
    const result = await Department.insertMany(departments);
    console.log(`✅ Successfully created ${result.length} departments:`);
    
    result.forEach(dept => {
      console.log(`   - ${dept.name} (${dept.code})`);
    });

    console.log('\n✨ Department population complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error populating departments:', error);
    process.exit(1);
  }
};

populateDepartments();

