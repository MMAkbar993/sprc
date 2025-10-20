import connectDB from '../config/database.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';

// All BS-IT courses organized by semester
const courses = [
  // SEMESTER I
  {
    code: 'CS-301',
    name: 'Introduction to Information and Communication Technologies',
    semester: 1,
    credits: 3,
    credit_hours: '3(2-1)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'CS-303',
    name: 'Programming Fundamentals',
    semester: 1,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'CS-305',
    name: 'Programming Fundamentals Lab',
    semester: 1,
    credits: 1,
    credit_hours: '1(0-1)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'MATH-307',
    name: 'Mathematics I (Introduction to Algebra)',
    semester: 1,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'MATH',
    prerequisites: []
  },
  {
    code: 'ENG-307',
    name: 'English-I Functional English',
    semester: 1,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'ENG',
    prerequisites: []
  },
  {
    code: 'PST-301',
    name: 'Pakistan Studies',
    semester: 1,
    credits: 2,
    credit_hours: '2(2-0)',
    department: 'PST',
    prerequisites: []
  },
  {
    code: 'PHY-634',
    name: 'Applied Physics',
    semester: 1,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'PHY',
    prerequisites: []
  },

  // SEMESTER II
  {
    code: 'CS-302',
    name: 'Object Oriented Programming',
    semester: 2,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'CS',
    prerequisites: ['CS-303']
  },
  {
    code: 'CS-304',
    name: 'Object Oriented Programming Lab',
    semester: 2,
    credits: 1,
    credit_hours: '1(0-1)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'CS-306',
    name: 'Discrete Structures',
    semester: 2,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'IT-302',
    name: 'IT Infrastructure',
    semester: 2,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'ENG-308',
    name: 'English-II Communication Skills',
    semester: 2,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'ENG',
    prerequisites: []
  },
  {
    code: 'IS-302',
    name: 'Islamic Studies/Ethics',
    semester: 2,
    credits: 2,
    credit_hours: '2(2-0)',
    department: 'IS',
    prerequisites: []
  },
  {
    code: 'MATH-312',
    name: 'Calculus & Analytical Geometry',
    semester: 2,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'MATH',
    prerequisites: []
  },

  // SEMESTER III
  {
    code: 'CS-401',
    name: 'Data Structure and Algorithms',
    semester: 3,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'CS',
    prerequisites: ['CS-302']
  },
  {
    code: 'CS-403',
    name: 'Data Structure and Algorithms Lab',
    semester: 3,
    credits: 1,
    credit_hours: '1(0-1)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'CS-405',
    name: 'Computer Networks',
    semester: 3,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'CS-407',
    name: 'Computer Networks Lab',
    semester: 3,
    credits: 1,
    credit_hours: '1(0-1)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'CS-409',
    name: 'Software Engineering',
    semester: 3,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'ENG-409',
    name: 'English-III Technical Writing and Presentation Skills',
    semester: 3,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'ENG',
    prerequisites: []
  },
  {
    code: 'BA-301',
    name: 'Fundamentals of Accounting',
    semester: 3,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'BA',
    prerequisites: []
  },

  // SEMESTER IV
  {
    code: 'CS-402',
    name: 'Operating Systems',
    semester: 4,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'CS-404',
    name: 'Operating Systems Lab',
    semester: 4,
    credits: 1,
    credit_hours: '1(0-1)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'CS-406',
    name: 'Database Systems',
    semester: 4,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'CS-408',
    name: 'Database Systems Lab',
    semester: 4,
    credits: 1,
    credit_hours: '1(0-1)',
    department: 'CS',
    prerequisites: []
  },
  {
    code: 'IT-410',
    name: 'Web Technologies',
    semester: 4,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-412',
    name: 'Visual Programming',
    semester: 4,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'BA-601',
    name: 'Organizational Behavior',
    semester: 4,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'BA',
    prerequisites: []
  },

  // SEMESTER V
  {
    code: 'IT-501',
    name: 'System & Network Administration',
    semester: 5,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: ['CS-405']
  },
  {
    code: 'IT-503',
    name: 'System & Network Administration Lab',
    semester: 5,
    credits: 1,
    credit_hours: '1(0-1)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-505',
    name: 'IT-Project Management',
    semester: 5,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-507',
    name: 'Web Programming',
    semester: 5,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-509',
    name: 'Artificial Intelligence',
    semester: 5,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-511',
    name: 'Software Requirements Engineering',
    semester: 5,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'STAT-302',
    name: 'Introduction to Probability & Probability Distributions',
    semester: 5,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'STAT',
    prerequisites: []
  },

  // SEMESTER VI
  {
    code: 'IT-502',
    name: 'Database Administration & Management',
    semester: 6,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: ['CS-406']
  },
  {
    code: 'IT-504',
    name: 'Database Administration & Management Lab',
    semester: 6,
    credits: 1,
    credit_hours: '1(0-1)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-506',
    name: 'Mobile Application Development',
    semester: 6,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-508',
    name: 'Data Science',
    semester: 6,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-510',
    name: 'Internet of Things',
    semester: 6,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'CS-512',
    name: 'Information Security',
    semester: 6,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'CS',
    prerequisites: []
  },

  // SEMESTER VII
  {
    code: 'BA-404',
    name: 'Financial Management',
    semester: 7,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'BA',
    prerequisites: []
  },
  {
    code: 'IT-601',
    name: 'Final Year Project- I',
    semester: 7,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: ['CS-406', 'CS-409']
  },
  {
    code: 'IT-603',
    name: 'Virtual System & Services',
    semester: 7,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-605',
    name: 'Virtual System & Services Lab',
    semester: 7,
    credits: 1,
    credit_hours: '1(0-1)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-607',
    name: 'Cloud Computing',
    semester: 7,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-609',
    name: 'Formal Methods in Software Engineering',
    semester: 7,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },

  // SEMESTER VIII
  {
    code: 'BA-605',
    name: 'Entrepreneurship',
    semester: 8,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'BA',
    prerequisites: []
  },
  {
    code: 'MATH-411',
    name: 'Operation Research',
    semester: 8,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'MATH',
    prerequisites: []
  },
  {
    code: 'IT-602',
    name: 'Final Year Project- II',
    semester: 8,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: ['IT-601']
  },
  {
    code: 'IT-604',
    name: 'Cyber Security',
    semester: 8,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-606',
    name: 'Professional Practices',
    semester: 8,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  },

  // OTHER COURSES OFFERED BY THE DEPARTMENT
  {
    code: 'CS-308',
    name: 'Software Packages',
    semester: 1,
    credits: 3,
    credit_hours: '3(2-1)',
    department: 'CS',
    prerequisites: ['CS-301']
  },
  {
    code: 'IT-310',
    name: 'Computational Chemistry',
    semester: 2,
    credits: 2,
    credit_hours: '2(2-0)',
    department: 'IT',
    prerequisites: []
  },
  {
    code: 'IT-414',
    name: 'Artistic Design and Creativity',
    semester: 4,
    credits: 3,
    credit_hours: '3(3-0)',
    department: 'IT',
    prerequisites: []
  }
];

// Departments that need to be created
const departments = [
  { code: 'CS', name: 'Computer Science', description: 'Department of Computer Science' },
  { code: 'IT', name: 'Information Technology', description: 'Department of Information Technology' },
  { code: 'MATH', name: 'Mathematics', description: 'Department of Mathematics' },
  { code: 'ENG', name: 'English', description: 'Department of English' },
  { code: 'PST', name: 'Pakistan Studies', description: 'Department of Pakistan Studies' },
  { code: 'PHY', name: 'Physics', description: 'Department of Physics' },
  { code: 'IS', name: 'Islamic Studies', description: 'Department of Islamic Studies' },
  { code: 'BA', name: 'Business Administration', description: 'Department of Business Administration' },
  { code: 'STAT', name: 'Statistics', description: 'Department of Statistics' }
];

const populateCourses = async () => {
  try {
    console.log('🚀 Starting course population...\n');

    // Connect to MongoDB
    await connectDB();

    // Step 1: Create departments if they don't exist
    console.log('📁 Creating departments...');
    const departmentMap = {};
    
    for (const dept of departments) {
      let department = await Department.findOne({ code: dept.code });
      
      if (!department) {
        department = await Department.create(dept);
        console.log(`   ✅ Created department: ${dept.name} (${dept.code})`);
      } else {
        console.log(`   ℹ️  Department already exists: ${dept.name} (${dept.code})`);
      }
      
      departmentMap[dept.code] = department._id;
    }

    console.log('\n📚 Adding courses...\n');

    // Step 2: Add courses
    let addedCount = 0;
    let existingCount = 0;
    let errorCount = 0;

    for (const courseData of courses) {
      try {
        // Check if course already exists
        const existingCourse = await Course.findOne({ code: courseData.code });
        
        if (existingCourse) {
          console.log(`   ⏭️  Course already exists: ${courseData.code} - ${courseData.name}`);
          existingCount++;
          continue;
        }

        // Get department ID
        const departmentId = departmentMap[courseData.department];
        
        if (!departmentId) {
          console.log(`   ⚠️  Warning: Department not found for ${courseData.code} (${courseData.department})`);
          errorCount++;
          continue;
        }

        // Create course
        await Course.create({
          code: courseData.code,
          name: courseData.name,
          credits: courseData.credits,
          credit_hours: courseData.credit_hours,
          semester: courseData.semester,
          department_id: departmentId,
          prerequisites: courseData.prerequisites || [],
          description: `${courseData.name} - Semester ${courseData.semester}`,
          is_active: true
        });

        console.log(`   ✅ Added: ${courseData.code} - ${courseData.name} (Sem ${courseData.semester})`);
        addedCount++;
      } catch (error) {
        console.error(`   ❌ Error adding course ${courseData.code}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Courses added:        ${addedCount}`);
    console.log(`⏭️  Courses already exist: ${existingCount}`);
    console.log(`❌ Errors:               ${errorCount}`);
    console.log(`📚 Total courses:        ${courses.length}`);
    console.log('='.repeat(60));

    // Display courses by semester
    console.log('\n📋 COURSES BY SEMESTER:');
    console.log('='.repeat(60));
    for (let sem = 1; sem <= 8; sem++) {
      const semCourses = courses.filter(c => c.semester === sem);
      console.log(`\nSemester ${sem}: ${semCourses.length} courses`);
      semCourses.forEach(c => {
        const prereq = c.prerequisites.length > 0 ? ` [PreReq: ${c.prerequisites.join(', ')}]` : '';
        console.log(`  • ${c.code} - ${c.name}${prereq}`);
      });
    }

    // Display other courses
    const otherCourses = courses.filter(c => 
      c.code === 'CS-308' || c.code === 'IT-310' || c.code === 'IT-414'
    );
    if (otherCourses.length > 0) {
      console.log('\n📋 OTHER ELECTIVE COURSES:');
      console.log('='.repeat(60));
      otherCourses.forEach(c => {
        const prereq = c.prerequisites.length > 0 ? ` [PreReq: ${c.prerequisites.join(', ')}]` : '';
        console.log(`  • ${c.code} - ${c.name}${prereq}`);
      });
    }

    console.log('\n✨ Course population completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Failed to populate courses:', error);
    process.exit(1);
  }
};

// Run the script
populateCourses();

