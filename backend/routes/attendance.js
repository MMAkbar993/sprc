import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

const router = express.Router();

// ========== FACULTY ROUTES ==========

// @route   POST /api/attendance/mark
// @desc    Mark attendance for students (Faculty)
// @access  Private (Faculty)
router.post('/mark', [
  authenticateToken,
  requireRole('faculty'),
  body('course_id').notEmpty().withMessage('Course ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('students').isArray().withMessage('Students must be an array'),
  body('students.*.student_id').notEmpty().withMessage('Student ID is required'),
  body('students.*.status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid status')
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

    const { course_id, date, students, session_type } = req.body;
    const facultyId = req.user.id;

    // Verify course exists and faculty is the instructor
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if faculty is authorized for this course
    const isAuthorized = !course.instructor_id || 
                        course.instructor_id?.toString() === facultyId ||
                        req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to mark attendance for this course. This course is assigned to another instructor.'
      });
    }

    // If no instructor assigned, assign this faculty member
    if (!course.instructor_id) {
      course.instructor_id = facultyId;
      await course.save();
    }

    // Mark attendance for each student
    const attendanceRecords = [];
    const errors_list = [];

    for (const studentData of students) {
      try {
        // Check if student is enrolled in the course
        const student = await Student.findById(studentData.student_id);
        if (!student) {
          errors_list.push({ student_id: studentData.student_id, error: 'Student not found' });
          continue;
        }

        const enrollment = await Enrollment.findOne({
          student_id: studentData.student_id,
          course_id: course_id,
          status: 'active'
        });

        if (!enrollment) {
          errors_list.push({ student_id: studentData.student_id, error: 'Student not enrolled in course' });
          continue;
        }

        // Create or update attendance record
        const attendanceRecord = await Attendance.findOneAndUpdate(
          {
            student_id: studentData.student_id,
            course_id: course_id,
            date: new Date(date)
          },
          {
            status: studentData.status,
            marked_by: facultyId,
            remarks: studentData.remarks || '',
            session_type: session_type || 'lecture'
          },
          {
            upsert: true,
            new: true
          }
        );

        attendanceRecords.push(attendanceRecord);
      } catch (err) {
        console.error('Error marking attendance for student:', studentData.student_id, err);
        errors_list.push({ student_id: studentData.student_id, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Attendance marked for ${attendanceRecords.length} students`,
      data: {
        marked: attendanceRecords.length,
        errors: errors_list.length,
        attendance: attendanceRecords,
        errors_list
      }
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking attendance'
    });
  }
});

// @route   GET /api/attendance/course/:courseId
// @desc    Get attendance for a course (Faculty)
// @access  Private (Faculty)
router.get('/course/:courseId', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date, startDate, endDate } = req.query;

    // Build query
    const query = { course_id: courseId };

    if (date) {
      const queryDate = new Date(date);
      query.date = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999))
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('student_id', 'student_id user_id')
      .populate({
        path: 'student_id',
        populate: {
          path: 'user_id',
          select: 'name email'
        }
      })
      .sort({ date: -1 })
      .lean();

    res.json({
      success: true,
      data: { attendance }
    });

  } catch (error) {
    console.error('Get course attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance'
    });
  }
});

// @route   GET /api/attendance/course/:courseId/students
// @desc    Get all students enrolled in course for attendance marking (Faculty)
// @access  Private (Faculty)
router.get('/course/:courseId/students', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date } = req.query;

    // Get enrolled students
    const enrollments = await Enrollment.find({
      course_id: courseId,
      status: 'active'
    })
    .populate({
      path: 'student_id',
      populate: {
        path: 'user_id',
        select: 'name email'
      }
    })
    .lean();

    // If date provided, get existing attendance
    let attendanceMap = {};
    if (date) {
      const queryDate = new Date(date);
      const existingAttendance = await Attendance.find({
        course_id: courseId,
        date: {
          $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
          $lt: new Date(queryDate.setHours(23, 59, 59, 999))
        }
      }).lean();

      existingAttendance.forEach(att => {
        attendanceMap[att.student_id.toString()] = att;
      });
    }

    // Prepare student list with attendance status
    const students = enrollments.map(enrollment => ({
      _id: enrollment.student_id._id,
      student_id: enrollment.student_id.student_id,
      name: enrollment.student_id.user_id?.name,
      email: enrollment.student_id.user_id?.email,
      attendance: attendanceMap[enrollment.student_id._id.toString()] || null
    }));

    res.json({
      success: true,
      data: { students }
    });

  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students'
    });
  }
});

// ========== STUDENT ROUTES ==========

// @route   GET /api/attendance/my-attendance
// @desc    Get student's own attendance (Student)
// @access  Private (Student)
router.get('/my-attendance', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { course_id, startDate, endDate } = req.query;

    // Get student record
    const student = await Student.findOne({ user_id: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Build query
    const query = { student_id: student._id };

    if (course_id) {
      query.course_id = course_id;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('course_id', 'code name')
      .sort({ date: -1 })
      .lean();

    res.json({
      success: true,
      data: { attendance }
    });

  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance'
    });
  }
});

// @route   GET /api/attendance/my-attendance/summary
// @desc    Get attendance summary for student (Student)
// @access  Private (Student)
router.get('/my-attendance/summary', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get student record
    const student = await Student.findOne({ user_id: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Get all enrolled courses
    const enrollments = await Enrollment.find({
      student_id: student._id,
      status: 'active'
    }).populate('course_id', 'code name').lean();

    // Calculate attendance for each course
    const summary = await Promise.all(enrollments.map(async (enrollment) => {
      const total = await Attendance.countDocuments({
        student_id: student._id,
        course_id: enrollment.course_id._id
      });

      const present = await Attendance.countDocuments({
        student_id: student._id,
        course_id: enrollment.course_id._id,
        status: { $in: ['present', 'late'] }
      });

      const absent = await Attendance.countDocuments({
        student_id: student._id,
        course_id: enrollment.course_id._id,
        status: 'absent'
      });

      const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

      return {
        course: enrollment.course_id,
        total,
        present,
        absent,
        percentage: parseFloat(percentage)
      };
    }));

    res.json({
      success: true,
      data: { summary }
    });

  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance summary'
    });
  }
});

// ========== ADMIN ROUTES ==========

// @route   GET /api/attendance/reports
// @desc    Get attendance reports (Admin)
// @access  Private (Admin)
router.get('/reports', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { course_id, department, startDate, endDate } = req.query;

    // Build aggregation pipeline
    const matchStage = {};

    if (course_id) {
      matchStage.course_id = mongoose.Types.ObjectId(course_id);
    }

    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'students',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'users',
          localField: 'student.user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'courses',
          localField: 'course_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: {
            student: '$student_id',
            course: '$course_id'
          },
          studentName: { $first: '$user.name' },
          studentId: { $first: '$student.student_id' },
          courseName: { $first: '$course.name' },
          courseCode: { $first: '$course.code' },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0]
            }
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          studentName: 1,
          studentId: 1,
          courseName: 1,
          courseCode: 1,
          total: 1,
          present: 1,
          absent: 1,
          percentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100]
          }
        }
      },
      { $sort: { percentage: -1 } }
    ]);

    res.json({
      success: true,
      data: { reports: attendance }
    });

  } catch (error) {
    console.error('Get attendance reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating reports'
    });
  }
});

export default router;

