import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { department, semester, isVirtual } = req.query;

    // Build filter object
    const filter = { is_active: true };

    if (department) {
      filter.department = department;
    }

    if (semester) {
      filter.semester = parseInt(semester);
    }

    if (isVirtual !== undefined) {
      filter.is_virtual = isVirtual === 'true';
    }

    // Get courses with instructor details
    const courses = await Course.find(filter)
      .populate('instructor_id', 'name email')
      .populate('department_id', 'name code')
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      data: {
        courses
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get specific course
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const courseId = req.params.id;

    // Get course with populated fields
    const course = await Course.findOne({ _id: courseId, is_active: true })
      .populate('department_id', 'name code')
      .populate('instructor_id', 'name email')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get course assignments
    const assignments = await Assignment.find({ course_id: courseId })
      .sort({ due_date: 1 })
      .lean();

    // Get enrolled students count
    const enrolledCount = await Enrollment.countDocuments({ 
      course_id: courseId, 
      status: 'active' 
    });

    res.json({
      success: true,
      data: {
        course: {
          ...course,
          department_name: course.department_id?.name,
          instructor_name: course.instructor_id?.name,
          assignments,
          enrolledCount
        }
      }
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course'
    });
  }
});

// @route   POST /api/courses
// @desc    Create new course (Admin/Faculty)
// @access  Private (Admin/Faculty)
router.post('/', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      credits,
      department_id,
      instructor_id,
      semester,
      is_virtual,
      schedule
    } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: code.toUpperCase() });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course with this code already exists'
      });
    }

    // Create new course
    const course = await Course.create({
      code,
      name,
      description,
      credits,
      department_id,
      instructor_id,
      semester,
      is_virtual: is_virtual || false,
      schedule: schedule || { days: [], time: '', room: '' }
    });

    // Populate for response
    await course.populate([
      { path: 'department_id', select: 'name code' },
      { path: 'instructor_id', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        course
      }
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course'
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course (Admin/Faculty)
// @access  Private (Admin/Faculty)
router.put('/:id', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const courseId = req.params.id;
    const updates = req.body;

    // Check if course exists
    const existingCourse = await Course.findById(courseId);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: updates },
      { new: true, runValidators: true }
    )
    .populate('department_id', 'name code')
    .populate('instructor_id', 'name email')
    .lean();

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course: updatedCourse
      }
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course'
    });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const courseId = req.params.id;

    // Check if course exists
    const existingCourse = await Course.findById(courseId);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Soft delete by setting is_active to false
    await Course.findByIdAndUpdate(courseId, { is_active: false });

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

// @route   GET /api/courses/:id/students
// @desc    Get students enrolled in course
// @access  Private (Admin/Faculty)
router.get('/:id/students', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const courseId = req.params.id;

    // Get enrollments for this course
    const enrollments = await Enrollment.find({
      course_id: courseId,
      status: 'active'
    })
    .populate({
      path: 'student_id',
      populate: { path: 'user_id', select: 'name email phone' }
    })
    .sort({ 'student_id.user_id.name': 1 })
    .lean();

    // Format student data
    const students = enrollments.map(e => ({
      ...e.student_id,
      name: e.student_id.user_id?.name,
      email: e.student_id.user_id?.email,
      phone: e.student_id.user_id?.phone,
      enrollment_date: e.enrollment_date,
      enrollment_status: e.status
    }));

    res.json({
      success: true,
      data: {
        students
      }
    });

  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course students'
    });
  }
});

export default router;
