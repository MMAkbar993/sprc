import express from 'express';
import { body, validationResult } from 'express-validator';
import VirtualClass from '../models/VirtualClass.js';
import Course from '../models/Course.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/classroom/:courseId
// @desc    Get virtual classroom for course
// @access  Private
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get course details
    const courseResult = await query(`
      SELECT c.*, u.name as instructor_name, d.name as department_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.id = $1 AND c.is_active = true
    `, [courseId]);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const course = courseResult.rows[0];

    // Check if user has access to this course
    if (userRole === 'student') {
      const enrollmentResult = await query(`
        SELECT e.* FROM enrollments e
        JOIN students s ON e.student_id = s.id
        WHERE s.user_id = $1 AND e.course_id = $2 AND e.status = 'active'
      `, [userId, courseId]);

      if (enrollmentResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
    } else if (userRole === 'faculty') {
      if (course.instructor_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You are not the instructor for this course'
        });
      }
    }

    // Get virtual classroom sessions
    const sessionsResult = await query(`
      SELECT * FROM virtual_classrooms
      WHERE course_id = $1 AND is_active = true
      ORDER BY start_time DESC
    `, [courseId]);

    // Get participants (enrolled students)
    const participantsResult = await query(`
      SELECT s.*, u.name, u.email, u.avatar_url
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN enrollments e ON s.id = e.student_id
      WHERE e.course_id = $1 AND e.status = 'active'
      ORDER BY u.name
    `, [courseId]);

    res.json({
      success: true,
      data: {
        course,
        sessions: sessionsResult.rows,
        participants: participantsResult.rows
      }
    });

  } catch (error) {
    console.error('Get classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching classroom data'
    });
  }
});

// @route   POST /api/classroom/:courseId/sessions
// @desc    Create virtual classroom session
// @access  Private (Faculty/Admin)
router.post('/:courseId/sessions', authenticateToken, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { title, description, start_time, end_time, meeting_url, meeting_id, password } = req.body;

    // Check if user is instructor or admin
    if (req.user.role === 'faculty') {
      const courseResult = await query(
        'SELECT instructor_id FROM courses WHERE id = $1',
        [courseId]
      );

      if (courseResult.rows.length === 0 || courseResult.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to create sessions for this course'
        });
      }
    }

    const result = await query(`
      INSERT INTO virtual_classrooms (course_id, title, description, start_time, end_time, meeting_url, meeting_id, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [courseId, title, description, start_time, end_time, meeting_url, meeting_id, password]);

    res.status(201).json({
      success: true,
      message: 'Virtual classroom session created successfully',
      data: {
        session: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Create classroom session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating classroom session'
    });
  }
});

// @route   GET /api/classroom/sessions/:sessionId
// @desc    Get specific virtual classroom session
// @access  Private
router.get('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.user.id;

    // Get session details
    const sessionResult = await query(`
      SELECT vc.*, c.name as course_name, c.code as course_code, u.name as instructor_name
      FROM virtual_classrooms vc
      JOIN courses c ON vc.course_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE vc.id = $1 AND vc.is_active = true
    `, [sessionId]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const session = sessionResult.rows[0];

    // Check if user has access to this session
    if (req.user.role === 'student') {
      const enrollmentResult = await query(`
        SELECT e.* FROM enrollments e
        JOIN students s ON e.student_id = s.id
        WHERE s.user_id = $1 AND e.course_id = $2 AND e.status = 'active'
      `, [userId, session.course_id]);

      if (enrollmentResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
    }

    // Get participants
    const participantsResult = await query(`
      SELECT s.*, u.name, u.email, u.avatar_url
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN enrollments e ON s.id = e.student_id
      WHERE e.course_id = $1 AND e.status = 'active'
      ORDER BY u.name
    `, [session.course_id]);

    res.json({
      success: true,
      data: {
        session,
        participants: participantsResult.rows
      }
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching session data'
    });
  }
});

// @route   PUT /api/classroom/sessions/:sessionId
// @desc    Update virtual classroom session
// @access  Private (Faculty/Admin)
router.put('/sessions/:sessionId', authenticateToken, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const updates = req.body;

    // Check if session exists
    const existingSession = await query(
      'SELECT id, course_id FROM virtual_classrooms WHERE id = $1',
      [sessionId]
    );

    if (existingSession.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check authorization
    if (req.user.role === 'faculty') {
      const courseResult = await query(
        'SELECT instructor_id FROM courses WHERE id = $1',
        [existingSession.rows[0].course_id]
      );

      if (courseResult.rows.length === 0 || courseResult.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this session'
        });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(sessionId);

    const updateQuery = `
      UPDATE virtual_classrooms 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: {
        session: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating session'
    });
  }
});

// @route   DELETE /api/classroom/sessions/:sessionId
// @desc    Delete virtual classroom session
// @access  Private (Faculty/Admin)
router.delete('/sessions/:sessionId', authenticateToken, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    // Check if session exists
    const existingSession = await query(
      'SELECT id, course_id FROM virtual_classrooms WHERE id = $1',
      [sessionId]
    );

    if (existingSession.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check authorization
    if (req.user.role === 'faculty') {
      const courseResult = await query(
        'SELECT instructor_id FROM courses WHERE id = $1',
        [existingSession.rows[0].course_id]
      );

      if (courseResult.rows.length === 0 || courseResult.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this session'
        });
      }
    }

    // Soft delete
    await query(
      'UPDATE virtual_classrooms SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [sessionId]
    );

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting session'
    });
  }
});

// @route   POST /api/classroom/schedule
// @desc    Schedule a new virtual class
// @access  Private (Faculty only)
router.post('/schedule', [
  authenticateToken,
  body('courseId').notEmpty(),
  body('title').trim().notEmpty(),
  body('scheduledDateTime').isISO8601(),
  body('duration').isInt({ min: 15, max: 300 }),
  body('semester').isInt({ min: 1, max: 8 }),
  body('department').trim().notEmpty()
], async (req, res) => {
  try {
    // Check if user is faculty
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only faculty members can schedule classes'
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

    const { 
      courseId, title, description, scheduledDateTime, duration,
      semester, department, section, maxParticipants, instructorId
    } = req.body;

    // Generate unique room ID
    const roomId = `SPRC_${courseId}_${Date.now()}`;

    // Create virtual class
    const virtualClass = await VirtualClass.create({
      course_id: courseId,
      instructor_id: instructorId || req.user.id,
      title,
      description,
      room_id: roomId,
      scheduled_date: scheduledDateTime,
      duration_minutes: parseInt(duration),
      semester: parseInt(semester),
      department,
      section: section || '',
      max_participants: parseInt(maxParticipants) || 100,
      status: 'scheduled'
    });

    res.status(201).json({
      success: true,
      message: 'Virtual class scheduled successfully',
      data: { virtualClass }
    });

  } catch (error) {
    console.error('Schedule class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while scheduling class'
    });
  }
});

// @route   GET /api/classroom/faculty
// @desc    Get all virtual classes by current faculty
// @access  Private (Faculty)
router.get('/faculty', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;

    const query = { instructor_id: req.user.id };
    if (status) {
      query.status = status;
    }

    const classes = await VirtualClass.find(query)
      .populate('course_id', 'name code')
      .sort({ scheduled_date: -1 });

    res.json({
      success: true,
      data: { classes }
    });

  } catch (error) {
    console.error('Fetch faculty classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching classes'
    });
  }
});

// @route   GET /api/classroom/student
// @desc    Get virtual classes for current student
// @access  Private (Student)
router.get('/student', authenticateToken, async (req, res) => {
  try {
    // Get student info from database
    const Student = (await import('../models/Student.js')).default;
    const student = await Student.findOne({ user_id: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Build query for student's classes
    const query = {
      semester: student.semester,
      department: student.department,
      is_active: true,
      $or: [
        { section: '' },  // Classes for all sections
        { section: student.section }  // Classes for specific section
      ]
    };

    const classes = await VirtualClass.find(query)
      .populate('course_id', 'name code')
      .populate('instructor_id', 'name')
      .sort({ scheduled_date: 1 });

    res.json({
      success: true,
      data: { classes }
    });

  } catch (error) {
    console.error('Fetch student classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching classes'
    });
  }
});

// @route   PUT /api/classroom/:classId/start
// @desc    Mark class as started
// @access  Private (Faculty)
router.put('/:classId/start', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;

    const virtualClass = await VirtualClass.findOneAndUpdate(
      { _id: classId, instructor_id: req.user.id },
      {
        status: 'ongoing',
        meeting_started_at: new Date()
      },
      { new: true }
    );

    if (!virtualClass) {
      return res.status(404).json({
        success: false,
        message: 'Virtual class not found or you do not have permission'
      });
    }

    res.json({
      success: true,
      message: 'Class started',
      data: { virtualClass }
    });

  } catch (error) {
    console.error('Start class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting class'
    });
  }
});

// @route   PUT /api/classroom/:classId/end
// @desc    Mark class as completed
// @access  Private (Faculty)
router.put('/:classId/end', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const { recordingUrl, notes } = req.body;

    const virtualClass = await VirtualClass.findOneAndUpdate(
      { _id: classId, instructor_id: req.user.id },
      {
        status: 'completed',
        meeting_ended_at: new Date(),
        recording_url: recordingUrl,
        notes: notes
      },
      { new: true }
    );

    if (!virtualClass) {
      return res.status(404).json({
        success: false,
        message: 'Virtual class not found or you do not have permission'
      });
    }

    res.json({
      success: true,
      message: 'Class ended',
      data: { virtualClass }
    });

  } catch (error) {
    console.error('End class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while ending class'
    });
  }
});

// @route   POST /api/classroom/:classId/join
// @desc    Record student joining a class
// @access  Private (Student)
router.post('/:classId/join', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;

    const virtualClass = await VirtualClass.findById(classId);

    if (!virtualClass) {
      return res.status(404).json({
        success: false,
        message: 'Virtual class not found'
      });
    }

    // Add participant
    virtualClass.participants.push({
      user_id: req.user.id,
      joined_at: new Date()
    });

    await virtualClass.save();

    res.json({
      success: true,
      message: 'Joined class successfully',
      data: { virtualClass }
    });

  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while joining class'
    });
  }
});

// @route   DELETE /api/classroom/:classId
// @desc    Delete/cancel a virtual class
// @access  Private (Faculty)
router.delete('/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;

    const virtualClass = await VirtualClass.findOneAndUpdate(
      { _id: classId, instructor_id: req.user.id },
      { status: 'cancelled', is_active: false },
      { new: true }
    );

    if (!virtualClass) {
      return res.status(404).json({
        success: false,
        message: 'Virtual class not found or you do not have permission'
      });
    }

    res.json({
      success: true,
      message: 'Class cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling class'
    });
  }
});

export default router;
