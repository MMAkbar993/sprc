import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import VirtualClassSession from '../models/VirtualClassSession.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import crypto from 'crypto';

const router = express.Router();

// Generate unique room ID
const generateRoomId = () => {
  return 'room-' + crypto.randomBytes(8).toString('hex');
};

// ========== FACULTY ROUTES ==========

// @route   POST /api/virtualclass/create
// @desc    Create/Schedule virtual class session (Faculty)
// @access  Private (Faculty)
router.post('/create', [
  authenticateToken,
  requireRole('faculty'),
  body('course_id').notEmpty().withMessage('Course ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('scheduled_date').isISO8601().withMessage('Valid date is required'),
  body('duration').optional().isInt({ min: 15, max: 300 }).withMessage('Duration must be between 15 and 300 minutes')
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

    const { course_id, title, description, scheduled_date, duration } = req.body;
    const instructorId = req.user.id;

    // Verify course
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if faculty is authorized for this course
    const isAuthorized = !course.instructor_id || 
                        course.instructor_id?.toString() === instructorId ||
                        req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create sessions for this course. This course is assigned to another instructor.'
      });
    }

    // If no instructor assigned, assign this faculty member
    if (!course.instructor_id) {
      course.instructor_id = instructorId;
      await course.save();
    }

    // Generate unique room ID
    const roomId = generateRoomId();

    // Create session
    const session = await VirtualClassSession.create({
      course_id,
      instructor_id: instructorId,
      title,
      description: description || '',
      scheduled_date,
      duration: duration || 60,
      room_id: roomId,
      status: 'scheduled'
    });

    const populatedSession = await VirtualClassSession.findById(session._id)
      .populate('course_id', 'code name')
      .populate('instructor_id', 'name email');

    res.status(201).json({
      success: true,
      message: 'Virtual class session created successfully',
      data: { session: populatedSession }
    });

  } catch (error) {
    console.error('Create virtual class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating virtual class'
    });
  }
});

// @route   GET /api/virtualclass/my-sessions
// @desc    Get faculty's virtual class sessions (Faculty)
// @access  Private (Faculty)
router.get('/my-sessions', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { status } = req.query;

    const query = { instructor_id: instructorId };
    if (status) {
      query.status = status;
    }

    const sessions = await VirtualClassSession.find(query)
      .populate('course_id', 'code name')
      .sort({ scheduled_date: -1 })
      .lean();

    res.json({
      success: true,
      data: { sessions }
    });

  } catch (error) {
    console.error('Get faculty sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sessions'
    });
  }
});

// @route   PUT /api/virtualclass/:id/start
// @desc    Start virtual class session (Faculty)
// @access  Private (Faculty)
router.put('/:id/start', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const { id } = req.params;

    const session = await VirtualClassSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.instructor_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    session.status = 'ongoing';
    await session.save();

    res.json({
      success: true,
      message: 'Session started',
      data: { session }
    });

  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting session'
    });
  }
});

// @route   PUT /api/virtualclass/:id/end
// @desc    End virtual class session (Faculty)
// @access  Private (Faculty)
router.put('/:id/end', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const { id } = req.params;

    const session = await VirtualClassSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.instructor_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    session.status = 'completed';
    await session.save();

    res.json({
      success: true,
      message: 'Session ended',
      data: { session }
    });

  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while ending session'
    });
  }
});

// ========== STUDENT ROUTES ==========

// @route   GET /api/virtualclass/student/sessions
// @desc    Get student's virtual class sessions (Student)
// @access  Private (Student)
router.get('/student/sessions', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get student's enrolled courses
    const student = await mongoose.model('Student').findOne({ user_id: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    const enrollments = await Enrollment.find({
      student_id: student._id,
      status: 'active'
    }).select('course_id');

    const courseIds = enrollments.map(e => e.course_id);

    // Get sessions for enrolled courses
    const sessions = await VirtualClassSession.find({
      course_id: { $in: courseIds },
      status: { $in: ['scheduled', 'ongoing'] }
    })
    .populate('course_id', 'code name')
    .populate('instructor_id', 'name')
    .sort({ scheduled_date: 1 })
    .lean();

    res.json({
      success: true,
      data: { sessions }
    });

  } catch (error) {
    console.error('Get student sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sessions'
    });
  }
});

// ========== COMMON ROUTES ==========

// @route   GET /api/virtualclass/:roomId
// @desc    Get session by room ID (Faculty/Student)
// @access  Private
router.get('/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;

    const session = await VirtualClassSession.findOne({ room_id: roomId })
      .populate('course_id', 'code name')
      .populate('instructor_id', 'name email')
      .lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: { session }
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching session'
    });
  }
});

// @route   POST /api/virtualclass/:id/join
// @desc    Join virtual class session (Faculty/Student)
// @access  Private
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await VirtualClassSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Add participant
    await session.addParticipant(userId);

    res.json({
      success: true,
      message: 'Joined session successfully',
      data: { 
        session,
        room_id: session.room_id
      }
    });

  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while joining session'
    });
  }
});

export default router;

