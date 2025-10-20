import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Submission from '../models/Submission.js';

const router = express.Router();

// Grade Point mapping
const gradePoints = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D': 1.0, 'F': 0.0
};

// Function to calculate letter grade from percentage
const calculateLetterGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D';
  return 'F';
};

// ========== FACULTY ROUTES ==========

// @route   POST /api/grades
// @desc    Enter final grade for a student in a course (Faculty)
// @access  Private (Faculty)
router.post('/', [
  authenticateToken,
  requireRole('faculty'),
  body('student_id').notEmpty().withMessage('Student ID is required'),
  body('course_id').notEmpty().withMessage('Course ID is required'),
  body('marks_obtained').isFloat({ min: 0 }).withMessage('Marks must be a positive number'),
  body('total_marks').isFloat({ min: 1 }).withMessage('Total marks must be at least 1')
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

    const { student_id, course_id, marks_obtained, total_marks, semester, exam_type, remarks } = req.body;
    const facultyId = req.user.id;

    // Verify course and faculty authorization
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
        message: 'You are not authorized to enter grades for this course. This course is assigned to another instructor.'
      });
    }

    // If no instructor assigned, assign this faculty member
    if (!course.instructor_id) {
      course.instructor_id = facultyId;
      await course.save();
    }

    // Calculate percentage and letter grade
    const percentage = (marks_obtained / total_marks) * 100;
    const letter_grade = calculateLetterGrade(percentage);
    const grade_point = gradePoints[letter_grade];

    // Get course credits
    const credits = course.credits;

    // Create or update grade
    const grade = await Grade.findOneAndUpdate(
      {
        student_id,
        course_id,
        semester: semester || `Semester ${course.semester}`,
        exam_type: exam_type || 'final'
      },
      {
        marks_obtained,
        total_marks,
        percentage: percentage.toFixed(2),
        letter_grade,
        grade_point,
        credits,
        graded_by: facultyId,
        remarks: remarks || '',
        graded_at: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );

    // Update student's CGPA
    await updateStudentCGPA(student_id);

    res.status(201).json({
      success: true,
      message: 'Grade entered successfully',
      data: { grade }
    });

  } catch (error) {
    console.error('Enter grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while entering grade'
    });
  }
});

// @route   GET /api/grades/course/:courseId
// @desc    Get all grades for a course (Faculty)
// @access  Private (Faculty)
router.get('/course/:courseId', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { semester } = req.query;

    const query = { course_id: courseId };
    if (semester) {
      query.semester = semester;
    }

    const grades = await Grade.find(query)
      .populate({
        path: 'student_id',
        populate: {
          path: 'user_id',
          select: 'name email'
        }
      })
      .sort({ 'student_id.student_id': 1 })
      .lean();

    res.json({
      success: true,
      data: { grades }
    });

  } catch (error) {
    console.error('Get course grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching grades'
    });
  }
});

// @route   PUT /api/grades/:id
// @desc    Update grade (Faculty/Admin)
// @access  Private (Faculty/Admin)
router.put('/:id', authenticateToken, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { marks_obtained, total_marks, remarks } = req.body;

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Update marks and recalculate
    if (marks_obtained !== undefined) grade.marks_obtained = marks_obtained;
    if (total_marks !== undefined) grade.total_marks = total_marks;
    if (remarks !== undefined) grade.remarks = remarks;

    // Recalculate
    const percentage = (grade.marks_obtained / grade.total_marks) * 100;
    grade.percentage = percentage.toFixed(2);
    grade.letter_grade = calculateLetterGrade(percentage);
    grade.grade_point = gradePoints[grade.letter_grade];
    grade.graded_at = new Date();

    await grade.save();

    // Update student's CGPA
    await updateStudentCGPA(grade.student_id);

    res.json({
      success: true,
      message: 'Grade updated successfully',
      data: { grade }
    });

  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating grade'
    });
  }
});

// ========== STUDENT ROUTES ==========

// @route   GET /api/grades/my-grades
// @desc    Get student's own grades (Student)
// @access  Private (Student)
router.get('/my-grades', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester } = req.query;

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
    if (semester) {
      query.semester = semester;
    }

    const grades = await Grade.find(query)
      .populate('course_id', 'code name credits')
      .sort({ semester: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { grades }
    });

  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching grades'
    });
  }
});

// @route   GET /api/grades/my-grades/summary
// @desc    Get grade summary with CGPA/SGPA (Student)
// @access  Private (Student)
router.get('/my-grades/summary', authenticateToken, requireRole('student'), async (req, res) => {
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

    // Get all grades
    const allGrades = await Grade.find({ student_id: student._id })
      .populate('course_id', 'code name credits')
      .lean();

    // Calculate semester-wise GPA
    const semesterMap = {};
    allGrades.forEach(grade => {
      if (!semesterMap[grade.semester]) {
        semesterMap[grade.semester] = [];
      }
      semesterMap[grade.semester].push(grade);
    });

    const semesterSummary = Object.keys(semesterMap).map(semester => {
      const grades = semesterMap[semester];
      const sgpa = calculateGPA(grades);
      const totalCredits = grades.reduce((sum, g) => sum + (g.credits || 0), 0);
      
      return {
        semester,
        grades,
        sgpa: sgpa.toFixed(2),
        totalCredits,
        coursesCompleted: grades.length
      };
    }).sort((a, b) => a.semester.localeCompare(b.semester));

    // Calculate overall CGPA
    const cgpa = calculateGPA(allGrades);

    // Calculate total credits
    const totalCredits = allGrades.reduce((sum, g) => sum + (g.credits || 0), 0);

    res.json({
      success: true,
      data: {
        cgpa: cgpa.toFixed(2),
        totalCredits,
        totalCourses: allGrades.length,
        semesterSummary
      }
    });

  } catch (error) {
    console.error('Get grade summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching grade summary'
    });
  }
});

// ========== ADMIN ROUTES ==========

// @route   GET /api/grades/student/:studentId
// @desc    Get grades for a specific student (Admin)
// @access  Private (Admin)
router.get('/student/:studentId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { studentId } = req.params;

    const grades = await Grade.find({ student_id: studentId })
      .populate('course_id', 'code name credits')
      .populate('graded_by', 'name')
      .sort({ semester: -1 })
      .lean();

    res.json({
      success: true,
      data: { grades }
    });

  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student grades'
    });
  }
});

// ========== HELPER FUNCTIONS ==========

// Calculate GPA for a set of grades
const calculateGPA = (grades) => {
  if (grades.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  grades.forEach(grade => {
    const credits = grade.credits || 3; // Default 3 credits if not specified
    totalPoints += grade.grade_point * credits;
    totalCredits += credits;
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
};

// Update student's CGPA
const updateStudentCGPA = async (studentId) => {
  try {
    const allGrades = await Grade.find({ student_id: studentId }).lean();
    const cgpa = calculateGPA(allGrades);

    await Student.findByIdAndUpdate(studentId, { cgpa: cgpa.toFixed(2) });
  } catch (error) {
    console.error('Update CGPA error:', error);
  }
};

export default router;
