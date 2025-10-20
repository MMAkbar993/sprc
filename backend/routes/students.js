import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Grade from '../models/Grade.js';
import Announcement from '../models/Announcement.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();

// @route   GET /api/students/dashboard
// @desc    Get student dashboard data
// @access  Private (Student)
router.get('/dashboard', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get student data
    const student = await Student.findOne({ user_id: userId })
      .populate('user_id', 'name email phone address date_of_birth blood_group nationality religion emergency_contact guardian_name')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Get enrolled courses
    const enrollments = await Enrollment.find({ 
      student_id: student._id, 
      status: 'active' 
    })
    .populate({
      path: 'course_id',
      populate: { path: 'instructor_id', select: 'name email' }
    })
    .lean();

    const courses = enrollments.map(e => ({
      ...e.course_id,
      enrollment_date: e.enrollment_date,
      enrollment_status: e.status
    }));

    // Get pending assignments
    const courseIds = enrollments.map(e => e.course_id._id);
    const upcomingAssignments = await Assignment.find({
      course_id: { $in: courseIds },
      due_date: { $gt: new Date() }
    })
    .populate('course_id', 'name code')
    .sort({ due_date: 1 })
    .limit(5)
    .lean();

    // Get recent submissions and grades
    const recentGrades = await Grade.find({ student_id: student._id })
      .populate({
        path: 'assignment_id',
        populate: { path: 'course_id', select: 'name code credits' }
      })
      .populate('graded_by', 'name')
      .sort({ graded_at: -1 })
      .limit(5)
      .lean();

    // Get announcements
    const announcements = await Announcement.find({
      target_audience: { $in: ['all', 'students'] },
      is_active: true
    })
    .populate('author_id', 'name')
    .sort({ created_at: -1 })
    .limit(5)
    .lean();

    // Calculate attendance percentage
    const attendanceRecords = await Attendance.find({
      student_id: student._id
    }).lean();

    const attendancePercentage = attendanceRecords.length > 0
      ? Math.round((attendanceRecords.filter(a => a.status === 'present').length / attendanceRecords.length) * 100)
      : 0;

    // Calculate CGPA from grades
    let cgpa = 0;
    if (recentGrades.length > 0) {
      const totalGradePoints = recentGrades.reduce((sum, grade) => sum + (grade.grade_point || 0), 0);
      cgpa = totalGradePoints / recentGrades.length;
    }

    res.json({
      success: true,
      data: {
        student,
        enrolledCourses: courses.length,
        pendingAssignments: upcomingAssignments.length,
        cgpa: cgpa.toFixed(2),
        attendancePercentage,
        courses,
        upcomingAssignments,
        recentGrades,
        announcements,
        upcomingClasses: [], // Can be calculated from course schedules
        recentActivities: [] // Can be built from submissions/grades
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/students/courses
// @desc    Get student's enrolled courses
// @access  Private (Student)
router.get('/courses', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester } = req.query;

    // Get student
    const student = await Student.findOne({ user_id: userId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Build query filter
    const filter = {
      student_id: student._id,
      status: 'active'
    };

    if (semester) {
      filter.semester = parseInt(semester);
    }

    // Get enrollments with populated course data
    const enrollments = await Enrollment.find(filter)
      .populate({
        path: 'course_id',
        populate: [
          { path: 'instructor_id', select: 'name email' },
          { path: 'department_id', select: 'name code' }
        ]
      })
      .sort({ 'course_id.name': 1 })
      .lean();

    const courses = enrollments.map(e => ({
      ...e.course_id,
      enrollment_date: e.enrollment_date,
      enrollment_status: e.status,
      instructor_name: e.course_id.instructor_id?.name
    }));

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

// @route   GET /api/students/courses/:courseId
// @desc    Get specific course details for student
// @access  Private (Student)
router.get('/courses/:courseId', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    // Get student
    const student = await Student.findOne({ user_id: userId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Check if student is enrolled in this course
    const enrollment = await Enrollment.findOne({
      student_id: student._id,
      course_id: courseId,
      status: 'active'
    })
    .populate({
      path: 'course_id',
      populate: [
        { path: 'instructor_id', select: 'name email' },
        { path: 'department_id', select: 'name code' }
      ]
    })
    .lean();

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or not enrolled'
      });
    }

    // Get course assignments with student submissions and grades
    const assignments = await Assignment.find({ course_id: courseId })
      .sort({ due_date: 1 })
      .lean();

    // Get student submissions for these assignments
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({
      assignment_id: { $in: assignmentIds },
      student_id: student._id
    })
    .populate('grade_id')
    .lean();

    // Combine assignments with submissions
    const assignmentsWithSubmissions = assignments.map(assignment => {
      const submission = submissions.find(s => s.assignment_id.toString() === assignment._id.toString());
      return {
        ...assignment,
        submission
      };
    });

    res.json({
      success: true,
      data: {
        course: {
          ...enrollment.course_id,
          enrollment_date: enrollment.enrollment_date,
          instructor_name: enrollment.course_id.instructor_id?.name
        },
        assignments: assignmentsWithSubmissions
      }
    });

  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course details'
    });
  }
});

// @route   GET /api/students/grades
// @desc    Get student's grades
// @access  Private (Student)
router.get('/grades', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester } = req.query;

    // Get student
    const student = await Student.findOne({ user_id: userId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Get all grades for student
    const grades = await Grade.find({ student_id: student._id })
      .populate({
        path: 'assignment_id',
        populate: { path: 'course_id', select: 'name code credits semester' }
      })
      .populate('graded_by', 'name')
      .sort({ graded_at: -1 })
      .lean();

    // Filter by semester if provided
    let filteredGrades = grades;
    if (semester) {
      filteredGrades = grades.filter(g => g.assignment_id?.course_id?.semester === parseInt(semester));
    }

    // Calculate course-wise grades
    const courseGrades = {};
    filteredGrades.forEach(grade => {
      if (!grade.assignment_id?.course_id) return;
      
      const courseKey = grade.assignment_id.course_id.code;
      if (!courseGrades[courseKey]) {
        courseGrades[courseKey] = {
          course_name: grade.assignment_id.course_id.name,
          course_code: grade.assignment_id.course_id.code,
          credits: grade.assignment_id.course_id.credits,
          semester: grade.assignment_id.course_id.semester,
          grades: [],
          totalMarks: 0,
          obtainedMarks: 0
        };
      }
      courseGrades[courseKey].grades.push(grade);
      courseGrades[courseKey].totalMarks += grade.total_marks || 0;
      courseGrades[courseKey].obtainedMarks += grade.marks_obtained || 0;
    });

    // Calculate percentage and GPA for each course
    Object.keys(courseGrades).forEach(courseKey => {
      const course = courseGrades[courseKey];
      if (course.totalMarks > 0) {
        course.percentage = ((course.obtainedMarks / course.totalMarks) * 100).toFixed(2);
        course.gpa = calculateGPA(parseFloat(course.percentage));
      } else {
        course.percentage = 0;
        course.gpa = 0;
      }
    });

    res.json({
      success: true,
      data: {
        grades: filteredGrades,
        courseGrades: Object.values(courseGrades)
      }
    });

  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching grades'
    });
  }
});

// @route   POST /api/students/assignments/:assignmentId/submit
// @desc    Submit assignment
// @access  Private (Student)
router.post('/assignments/:assignmentId/submit', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const assignmentId = req.params.assignmentId;
    const { content, submission_text, submission_link, attachments } = req.body;

    // Get student
    const student = await Student.findOne({ user_id: userId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Get assignment and check if student is enrolled
    const assignment = await Assignment.findById(assignmentId).populate('course_id');
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      student_id: student._id,
      course_id: assignment.course_id._id,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment_id: assignmentId,
      student_id: student._id
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Assignment already submitted'
      });
    }

    const isLate = new Date() > new Date(assignment.due_date);

    // Create submission
    const submission = await Submission.create({
      assignment_id: assignmentId,
      student_id: student._id,
      submission_text: submission_text || content,
      submission_link,
      file_path: attachments,
      submitted_at: new Date(),
      is_late: isLate,
      status: isLate ? 'late' : 'submitted'
    });

    res.status(201).json({
      success: true,
      message: isLate ? 'Assignment submitted (late)' : 'Assignment submitted successfully',
      data: {
        submission
      }
    });

  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting assignment'
    });
  }
});

// Helper function to calculate GPA from percentage
function calculateGPA(percentage) {
  if (percentage >= 90) return 4.0;
  if (percentage >= 85) return 3.7;
  if (percentage >= 80) return 3.3;
  if (percentage >= 75) return 3.0;
  if (percentage >= 70) return 2.7;
  if (percentage >= 65) return 2.3;
  if (percentage >= 60) return 2.0;
  if (percentage >= 55) return 1.7;
  if (percentage >= 50) return 1.3;
  return 1.0;
}

export default router;
