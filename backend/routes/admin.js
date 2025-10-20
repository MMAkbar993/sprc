import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import Enrollment from '../models/Enrollment.js';
import Announcement from '../models/Announcement.js';

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    // Get total students
    const totalStudents = await Student.countDocuments();

    // Get total faculty
    const totalFaculty = await Faculty.countDocuments({ is_active: true });

    // Get total courses
    const totalCourses = await Course.countDocuments({ is_active: true });

    // Get total departments
    const totalDepartments = await Department.countDocuments({ is_active: true });

    // Get recent students (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentStudents = await Student.find({ createdAt: { $gte: sevenDaysAgo } })
      .populate('user_id', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get recent courses (last 7 days)
    const recentCourses = await Course.find({ createdAt: { $gte: sevenDaysAgo } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Combine recent activities
    const recentActivities = [
      ...recentStudents.map(s => ({
        type: 'student',
        message: `New student registration: ${s.user_id?.name}`,
        time: s.createdAt
      })),
      ...recentCourses.map(c => ({
        type: 'course',
        message: `Course added: ${c.name} (${c.code})`,
        time: c.createdAt
      }))
    ].sort((a, b) => b.time - a.time).slice(0, 10);

    // Get virtual classes count
    const virtualClasses = await Course.countDocuments({ is_virtual: true, is_active: true });

    // Get new students this month
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newStudents = await Student.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newCourses = await Course.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newFaculty = await Faculty.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        activeCourses: totalCourses,
        totalDepartments,
        virtualClasses,
        newStudents,
        newCourses,
        newFaculty,
        newVirtualClasses: 0,
        recentActivities,
        upcomingEvents: []
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/admin/students
// @desc    Get all students
// @access  Private (Admin)
router.get('/students', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 100, search, department, batch } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    let baseFilters = [];

    if (department) {
      baseFilters.push({ department });
    }

    if (batch) {
      baseFilters.push({ batch });
    }

    // Apply search if provided
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      
      const searchFilter = {
        $or: [
          { user_id: { $in: userIds } },
          { student_id: { $regex: search, $options: 'i' } }
        ]
      };
      
      baseFilters.push(searchFilter);
    }

    // Combine all filters
    if (baseFilters.length > 0) {
      filter = baseFilters.length === 1 ? baseFilters[0] : { $and: baseFilters };
    }

    // Get students with populated user data
    const students = await Student.find(filter)
      .populate('user_id', 'name email phone is_active createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    // Format student data to include user fields at top level
    const formattedStudents = students.map(s => ({
      _id: s._id,
      student_id: s.student_id,
      name: s.user_id?.name,
      email: s.user_id?.email,
      phone: s.user_id?.phone,
      department: s.department,
      program: s.program,
      batch: s.batch,
      semester: s.semester,
      section: s.section,
      cgpa: s.cgpa,
      is_active: s.user_id?.is_active,
      user_id: s.user_id?._id,
      admission_date: s.admission_date
    }));

    // Get total count
    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      data: {
        students: formattedStudents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students'
    });
  }
});

// @route   GET /api/admin/faculty
// @desc    Get all faculty
// @access  Private (Admin)
router.get('/faculty', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 100, search, department } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};

    if (department) {
      filter.department = department;
    }

    // Apply search if provided
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      
      // Combine department filter with search filter
      const searchFilter = {
        $or: [
          { user_id: { $in: userIds } },
          { employee_id: { $regex: search, $options: 'i' } }
        ]
      };
      
      if (department) {
        filter = {
          $and: [
            { department },
            searchFilter
          ]
        };
      } else {
        filter = searchFilter;
      }
    }

    // Get faculty with populated user data
    const faculty = await Faculty.find(filter)
      .populate('user_id', 'name email phone is_active createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    // Format faculty data to include user fields at top level
    const formattedFaculty = faculty.map(f => ({
      _id: f._id,
      employee_id: f.employee_id,
      name: f.user_id?.name,
      email: f.user_id?.email,
      phone: f.user_id?.phone,
      department: f.department,
      designation: f.designation,
      qualification: f.qualification,
      specialization: f.specialization,
      joining_date: f.joining_date,
      is_active: f.user_id?.is_active,
      user_id: f.user_id?._id
    }));

    // Get total count
    const total = await Faculty.countDocuments(filter);

    res.json({
      success: true,
      data: {
        faculty: formattedFaculty,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get faculty error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching faculty'
    });
  }
});

// @route   GET /api/admin/announcements
// @desc    Get all announcements
// @access  Private (Admin)
router.get('/announcements', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('author_id', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { announcements }
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcements'
    });
  }
});

// @route   POST /api/admin/announcements
// @desc    Create announcement
// @access  Private (Admin)
router.post('/announcements', [
  authenticateToken,
  requireRole('admin'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('target_audience').isIn(['all', 'students', 'faculty']).withMessage('Invalid audience'),
  body('priority').isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, target_audience, priority } = req.body;
    const authorId = req.user.id;

    const announcement = await Announcement.create({
      title,
      content,
      author_id: authorId,
      target_audience,
      priority,
      is_active: true
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('author_id', 'name email');

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: { announcement: populatedAnnouncement }
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating announcement'
    });
  }
});

// @route   PUT /api/admin/announcements/:id
// @desc    Update announcement
// @access  Private (Admin)
router.put('/announcements/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const announcementId = req.params.id;
    const updates = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      announcementId,
      updates,
      { new: true }
    ).populate('author_id', 'name email');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: { announcement }
    });

  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating announcement'
    });
  }
});

// @route   DELETE /api/admin/announcements/:id
// @desc    Delete announcement
// @access  Private (Admin)
router.delete('/announcements/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const announcementId = req.params.id;

    const result = await Announcement.findByIdAndDelete(announcementId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting announcement'
    });
  }
});

// ========== COURSE MANAGEMENT ROUTES ==========

// @route   GET /api/admin/courses
// @desc    Get all courses for admin
// @access  Private (Admin)
router.get('/courses', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor_id', 'name email')
      .populate('department_id', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { courses }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
});

// @route   POST /api/admin/courses
// @desc    Create new course
// @access  Private (Admin)
router.post('/courses', [
  authenticateToken,
  requireRole('admin'),
  body('code').trim().notEmpty().withMessage('Course code is required'),
  body('name').trim().notEmpty().withMessage('Course name is required'),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, name, description, credits, department_id, instructor_id, semester, is_virtual, schedule } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course with this code already exists'
      });
    }

    // Create new course
    const newCourse = await Course.create({
      code: code.toUpperCase(),
      name,
      description,
      credits,
      department_id: department_id || null,
      instructor_id: instructor_id || null,
      semester,
      is_virtual: is_virtual || false,
      schedule: schedule || {},
      is_active: true
    });

    const populatedCourse = await Course.findById(newCourse._id)
      .populate('instructor_id', 'name email')
      .populate('department_id', 'name code');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course: populatedCourse }
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course'
    });
  }
});

// @route   PUT /api/admin/courses/:id
// @desc    Update course
// @access  Private (Admin)
router.put('/courses/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const courseId = req.params.id;
    const updates = req.body;

    // If code is being updated, check for duplicates
    if (updates.code) {
      const existingCourse = await Course.findOne({ 
        code: updates.code.toUpperCase(), 
        _id: { $ne: courseId } 
      });
      
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: 'Course with this code already exists'
        });
      }
      updates.code = updates.code.toUpperCase();
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updates,
      { new: true }
    ).populate('instructor_id', 'name email')
     .populate('department_id', 'name code');

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course: updatedCourse }
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course'
    });
  }
});

// @route   DELETE /api/admin/courses/:id
// @desc    Delete course (soft delete)
// @access  Private (Admin)
router.delete('/courses/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const courseId = req.params.id;

    // Soft delete by setting is_active to false
    const course = await Course.findByIdAndUpdate(
      courseId,
      { is_active: false },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting course'
    });
  }
});

// ========== DEPARTMENT MANAGEMENT ROUTES ==========

// @route   GET /api/admin/departments
// @desc    Get all departments
// @access  Private (Admin)
router.get('/departments', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('head_id', 'name email')
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      data: { departments }
    });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching departments'
    });
  }
});

// @route   POST /api/admin/departments
// @desc    Create new department
// @access  Private (Admin)
router.post('/departments', [
  authenticateToken,
  requireRole('admin'),
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('code').trim().notEmpty().withMessage('Department code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, code, description, head_id } = req.body;

    // Check if department code already exists
    const existingDept = await Department.findOne({ code: code.toUpperCase() });
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this code already exists'
      });
    }

    const newDepartment = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      head_id: head_id || null,
      is_active: true
    });

    const populatedDept = await Department.findById(newDepartment._id)
      .populate('head_id', 'name email');

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department: populatedDept }
    });

  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating department'
    });
  }
});

// @route   PUT /api/admin/departments/:id
// @desc    Update department
// @access  Private (Admin)
router.put('/departments/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const deptId = req.params.id;
    const updates = req.body;

    if (updates.code) {
      const existingDept = await Department.findOne({ 
        code: updates.code.toUpperCase(), 
        _id: { $ne: deptId } 
      });
      
      if (existingDept) {
        return res.status(400).json({
          success: false,
          message: 'Department with this code already exists'
        });
      }
      updates.code = updates.code.toUpperCase();
    }

    const updatedDept = await Department.findByIdAndUpdate(
      deptId,
      updates,
      { new: true }
    ).populate('head_id', 'name email');

    if (!updatedDept) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department: updatedDept }
    });

  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating department'
    });
  }
});

// @route   GET /api/admin/faculty-list
// @desc    Get list of faculty for dropdowns
// @access  Private (Admin)
router.get('/faculty-list', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const faculty = await Faculty.find({ is_active: true })
      .populate('user_id', 'name email')
      .select('user_id employee_id department')
      .lean();

    const facultyList = faculty.map(f => ({
      _id: f.user_id._id,
      name: f.user_id.name,
      email: f.user_id.email,
      employeeId: f.employee_id,
      department: f.department
    }));

    res.json({
      success: true,
      data: { faculty: facultyList }
    });

  } catch (error) {
    console.error('Get faculty list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching faculty list'
    });
  }
});

export default router;
