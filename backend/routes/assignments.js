import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/assignments';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'assignment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|txt|zip|rar|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, TXT, ZIP, RAR, and image files are allowed'));
    }
  }
});

// ========== FACULTY ROUTES ==========

// @route   POST /api/assignments
// @desc    Create new assignment (Faculty)
// @access  Private (Faculty)
router.post('/', [
  authenticateToken,
  requireRole('faculty'),
  body('course_id').notEmpty().withMessage('Course ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['assignment', 'quiz', 'project', 'exam']).withMessage('Invalid type'),
  body('total_marks').isInt({ min: 1 }).withMessage('Total marks must be at least 1'),
  body('due_date').isISO8601().withMessage('Valid due date is required')
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

    const { course_id, title, description, type, total_marks, due_date, attachments } = req.body;
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
    // Allow if: 1) No instructor assigned yet, 2) Faculty is the instructor, 3) Admin role
    const isAuthorized = !course.instructor_id || 
                        course.instructor_id?.toString() === facultyId ||
                        req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create assignments for this course. This course is assigned to another instructor.'
      });
    }

    // If no instructor assigned, assign this faculty member
    if (!course.instructor_id) {
      course.instructor_id = facultyId;
      await course.save();
    }

    // Create assignment
    const assignment = await Assignment.create({
      course_id,
      title,
      description,
      type,
      total_marks,
      due_date,
      attachments: attachments || [],
      created_by: facultyId
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: { assignment }
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating assignment'
    });
  }
});

// @route   GET /api/assignments/course/:courseId
// @desc    Get all assignments for a course (Faculty)
// @access  Private (Faculty)
router.get('/course/:courseId', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const { courseId } = req.params;

    const assignments = await Assignment.find({ course_id: courseId })
      .sort({ due_date: -1 })
      .lean();

    // Get submission count for each assignment
    const assignmentsWithStats = await Promise.all(assignments.map(async (assignment) => {
      const totalSubmissions = await Submission.countDocuments({ assignment_id: assignment._id });
      const gradedSubmissions = await Submission.countDocuments({ 
        assignment_id: assignment._id,
        status: 'graded'
      });

      return {
        ...assignment,
        totalSubmissions,
        gradedSubmissions
      };
    }));

    res.json({
      success: true,
      data: { assignments: assignmentsWithStats }
    });

  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assignments'
    });
  }
});

// @route   GET /api/assignments/:assignmentId/submissions
// @desc    Get all submissions for an assignment (Faculty)
// @access  Private (Faculty)
router.get('/:assignmentId/submissions', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignment_id: assignmentId })
      .populate({
        path: 'student_id',
        populate: {
          path: 'user_id',
          select: 'name email'
        }
      })
      .sort({ submitted_at: -1 })
      .lean();

    res.json({
      success: true,
      data: { submissions }
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    });
  }
});

// @route   PUT /api/assignments/:submissionId/grade
// @desc    Grade a submission (Faculty)
// @access  Private (Faculty)
router.put('/:submissionId/grade', [
  authenticateToken,
  requireRole('faculty'),
  body('marks_obtained').isInt({ min: 0 }).withMessage('Marks must be a positive number')
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

    const { submissionId } = req.params;
    const { marks_obtained, feedback } = req.body;
    const facultyId = req.user.id;

    const submission = await Submission.findById(submissionId)
      .populate('assignment_id');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Verify marks don't exceed total marks
    if (marks_obtained > submission.assignment_id.total_marks) {
      return res.status(400).json({
        success: false,
        message: `Marks cannot exceed total marks (${submission.assignment_id.total_marks})`
      });
    }

    // Update grade
    submission.grade = {
      marks_obtained,
      feedback: feedback || '',
      graded_by: facultyId,
      graded_at: new Date()
    };
    submission.status = 'graded';

    await submission.save();

    // Populate student details
    await submission.populate({
      path: 'student_id',
      populate: {
        path: 'user_id',
        select: 'name email'
      }
    });

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: { submission }
    });

  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while grading submission'
    });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment (Faculty)
// @access  Private (Faculty)
router.put('/:id', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: { assignment }
    });

  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating assignment'
    });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment (Faculty)
// @access  Private (Faculty)
router.delete('/:id', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Optionally delete all submissions for this assignment
    await Submission.deleteMany({ assignment_id: id });

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting assignment'
    });
  }
});

// ========== STUDENT ROUTES ==========

// @route   GET /api/assignments/my-assignments
// @desc    Get student's assignments (Student)
// @access  Private (Student)
router.get('/my-assignments', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { course_id, status } = req.query;

    // Get student record
    const student = await Student.findOne({ user_id: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Get student's enrolled courses
    const enrollments = await mongoose.model('Enrollment').find({
      student_id: student._id,
      status: 'active'
    }).select('course_id');

    const courseIds = enrollments.map(e => e.course_id);

    // Build query
    const query = { course_id: { $in: courseIds } };
    if (course_id) {
      query.course_id = course_id;
    }

    const assignments = await Assignment.find(query)
      .populate('course_id', 'code name')
      .sort({ due_date: -1 })
      .lean();

    // Get submission status for each assignment
    const assignmentsWithSubmissions = await Promise.all(assignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        assignment_id: assignment._id,
        student_id: student._id
      }).lean();

      return {
        ...assignment,
        submission,
        isOverdue: new Date() > new Date(assignment.due_date),
        daysUntilDue: Math.ceil((new Date(assignment.due_date) - new Date()) / (1000 * 60 * 60 * 24))
      };
    }));

    // Filter by status if provided
    let filteredAssignments = assignmentsWithSubmissions;
    if (status === 'submitted') {
      filteredAssignments = assignmentsWithSubmissions.filter(a => a.submission);
    } else if (status === 'pending') {
      filteredAssignments = assignmentsWithSubmissions.filter(a => !a.submission && !a.isOverdue);
    } else if (status === 'overdue') {
      filteredAssignments = assignmentsWithSubmissions.filter(a => !a.submission && a.isOverdue);
    }

    res.json({
      success: true,
      data: { assignments: filteredAssignments }
    });

  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assignments'
    });
  }
});

// @route   POST /api/assignments/:assignmentId/submit
// @desc    Submit assignment (Student)
// @access  Private (Student)
router.post('/:assignmentId/submit', authenticateToken, requireRole('student'), upload.single('file'), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { submission_text, submission_link } = req.body;
    const userId = req.user.id;

    // Get student record
    const student = await Student.findOne({ user_id: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Get assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
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
        message: 'Assignment already submitted. Please update your submission instead.'
      });
    }

    // Check if late
    const isLate = new Date() > new Date(assignment.due_date);

    // Prepare submission data
    const submissionData = {
      assignment_id: assignmentId,
      student_id: student._id,
      submission_text: submission_text || '',
      submission_link: submission_link || '',
      is_late: isLate,
      status: isLate ? 'late' : 'submitted'
    };

    // Add file if uploaded
    if (req.file) {
      submissionData.submission_file = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }

    // Create submission
    const submission = await Submission.create(submissionData);

    res.status(201).json({
      success: true,
      message: isLate ? 'Assignment submitted (Late)' : 'Assignment submitted successfully',
      data: { submission }
    });

  } catch (error) {
    console.error('Submit assignment error:', error);
    // Delete uploaded file if submission failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Server error while submitting assignment'
    });
  }
});

// @route   PUT /api/assignments/:assignmentId/update-submission
// @desc    Update submission (Student)
// @access  Private (Student)
router.put('/:assignmentId/update-submission', authenticateToken, requireRole('student'), upload.single('file'), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { submission_text, submission_link } = req.body;
    const userId = req.user.id;

    // Get student record
    const student = await Student.findOne({ user_id: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Find existing submission
    const submission = await Submission.findOne({
      assignment_id: assignmentId,
      student_id: student._id
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'No submission found to update'
      });
    }

    // Don't allow update if already graded
    if (submission.status === 'graded') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update graded submission'
      });
    }

    // Update fields
    if (submission_text) submission.submission_text = submission_text;
    if (submission_link) submission.submission_link = submission_link;

    // Update file if new one uploaded
    if (req.file) {
      // Delete old file if exists
      if (submission.submission_file && fs.existsSync(submission.submission_file.path)) {
        fs.unlinkSync(submission.submission_file.path);
      }

      submission.submission_file = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }

    submission.submitted_at = new Date();
    await submission.save();

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: { submission }
    });

  } catch (error) {
    console.error('Update submission error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating submission'
    });
  }
});

// @route   GET /api/assignments/:assignmentId/my-submission
// @desc    Get student's submission for an assignment (Student)
// @access  Private (Student)
router.get('/:assignmentId/my-submission', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id;

    // Get student record
    const student = await Student.findOne({ user_id: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    const submission = await Submission.findOne({
      assignment_id: assignmentId,
      student_id: student._id
    })
    .populate('assignment_id')
    .lean();

    res.json({
      success: true,
      data: { submission }
    });

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submission'
    });
  }
});

export default router;

