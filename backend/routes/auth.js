import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get additional user data based on role
    let additionalData = {};
    
    if (user.role === 'student') {
      const student = await Student.findOne({ user_id: user._id }).lean();
      
      if (student) {
        additionalData = {
          studentId: student.student_id,
          department: student.department,
          program: student.program,
          batch: student.batch,
          semester: student.semester,
          section: student.section,
          cgpa: student.cgpa
        };
      }
    } else if (user.role === 'faculty') {
      const faculty = await Faculty.findOne({ user_id: user._id }).lean();
      
      if (faculty) {
        additionalData = {
          employeeId: faculty.employee_id,
          department: faculty.department,
          designation: faculty.designation,
          qualification: faculty.qualification
        };
      }
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data (excluding password)
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          ...userWithoutPassword,
          ...additionalData
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/register/student
// @desc    Register new student
// @access  Public (but link shared by admin)
router.post('/register/student', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('studentId').trim().notEmpty(),
  body('department').trim().notEmpty(),
  body('program').trim().notEmpty()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      email, password, name, phone, address, dateOfBirth, bloodGroup, 
      nationality, religion, emergencyContact, guardianName, guardianPhone,
      studentId, department, program, batch, semester, section, courses 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ student_id: studentId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      email,
      password_hash: passwordHash,
      name,
      role: 'student',
      phone,
      address,
      date_of_birth: dateOfBirth,
      blood_group: bloodGroup,
      nationality: nationality || 'Pakistani',
      religion: religion || 'Islam',
      emergency_contact: emergencyContact,
      guardian_name: guardianName,
      is_active: true
    });

    // Create student record
    const studentRecord = await Student.create({
      user_id: newUser._id,
      student_id: studentId,
      department,
      program,
      batch,
      semester: parseInt(semester) || 1,
      section,
      admission_date: new Date(),
      expected_graduation: new Date(new Date().setFullYear(new Date().getFullYear() + 4)),
      cgpa: 0.00
    });

    // Create enrollments for selected courses
    if (courses && Array.isArray(courses) && courses.length > 0) {
      const enrollments = courses.map(courseId => ({
        student_id: studentRecord._id,
        course_id: courseId,
        semester: `Semester ${semester}`,
        enrollment_date: new Date(),
        status: 'active'
      }));
      
      await Enrollment.insertMany(enrollments);
    }

    res.status(201).json({
      success: true,
      message: 'Student registered successfully. Please wait for admin approval.',
      data: { 
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          studentId,
          coursesEnrolled: courses?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/register/faculty
// @desc    Register new faculty
// @access  Public (but link shared by admin)
router.post('/register/faculty', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('employeeId').trim().notEmpty(),
  body('department').trim().notEmpty()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      email, password, name, phone, address, dateOfBirth, bloodGroup, 
      nationality, religion, emergencyContact,
      employeeId, department, designation, qualification, specialization, joiningDate, courses 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if employee ID already exists
    const existingFaculty = await Faculty.findOne({ employee_id: employeeId });
    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      email,
      password_hash: passwordHash,
      name,
      role: 'faculty',
      phone,
      address,
      date_of_birth: dateOfBirth,
      blood_group: bloodGroup,
      nationality: nationality || 'Pakistani',
      religion: religion || 'Islam',
      emergency_contact: emergencyContact,
      is_active: true
    });

    // Create faculty record
    await Faculty.create({
      user_id: newUser._id,
      employee_id: employeeId,
      department,
      designation,
      qualification,
      specialization,
      joining_date: joiningDate || new Date(),
      is_active: true
    });

    // Assign faculty to selected courses as instructor
    if (courses && Array.isArray(courses) && courses.length > 0) {
      await Course.updateMany(
        { _id: { $in: courses } },
        { $set: { instructor_id: newUser._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Faculty registered successfully. Please wait for admin approval.',
      data: { 
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          employeeId,
          coursesAssigned: courses?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Faculty registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register new user (admin only)
// @access  Private (Admin)
router.post('/register', [
  authenticateToken,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('role').isIn(['student', 'faculty', 'admin'])
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can register new users'
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, name, role, phone, address, dateOfBirth, bloodGroup, nationality, religion, emergencyContact, guardianName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      email,
      password_hash: passwordHash,
      name,
      role,
      phone,
      address,
      date_of_birth: dateOfBirth,
      blood_group: bloodGroup,
      nationality,
      religion,
      emergency_contact: emergencyContact,
      guardian_name: guardianName
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { 
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          created_at: newUser.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // Get user data using MongoDB
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let additionalData = {};

    // Get role-specific data
    if (role === 'student') {
      const student = await Student.findOne({ user_id: userId }).lean();
      
      if (student) {
        additionalData = {
          studentId: student.student_id,
          department: student.department,
          program: student.program,
          batch: student.batch,
          semester: student.semester,
          section: student.section,
          cgpa: student.cgpa,
          advisorId: student.advisor_id,
          admissionDate: student.admission_date,
          expectedGraduation: student.expected_graduation
        };
      }
    } else if (role === 'faculty') {
      const faculty = await Faculty.findOne({ user_id: userId }).lean();
      
      if (faculty) {
        additionalData = {
          employeeId: faculty.employee_id,
          department: faculty.department,
          designation: faculty.designation,
          qualification: faculty.qualification,
          specialization: faculty.specialization,
          joiningDate: faculty.joining_date
        };
      }
    }

    // Return user data (excluding password)
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          ...additionalData
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 2 }),
  body('phone').optional(),
  body('address').optional().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('nationality').optional().trim(),
  body('religion').optional().trim(),
  body('emergencyContact').optional(),
  body('guardianName').optional().trim()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const updates = req.body;

    // Build update object for MongoDB
    const updateData = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.address) updateData.address = updates.address;
    if (updates.dateOfBirth) updateData.date_of_birth = updates.dateOfBirth;
    if (updates.bloodGroup) updateData.blood_group = updates.bloodGroup;
    if (updates.nationality) updateData.nationality = updates.nationality;
    if (updates.religion) updateData.religion = updates.religion;
    if (updates.emergencyContact) updateData.emergency_contact = updates.emergencyContact;
    if (updates.guardianName) updateData.guardian_name = updates.guardianName;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Update user using MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password_hash' }
    ).lean();
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
  authenticateToken,
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current password hash using MongoDB
    const user = await User.findById(userId).select('password_hash').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password using MongoDB
    await User.findByIdAndUpdate(userId, { password_hash: newPasswordHash });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;
