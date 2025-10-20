import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semester: {
    type: String,
    required: true,
    trim: true
  },
  exam_type: {
    type: String,
    enum: ['midterm', 'final', 'quiz', 'assignment'],
    default: 'final'
  },
  marks_obtained: {
    type: Number,
    required: true,
    min: 0
  },
  total_marks: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  letter_grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
  },
  grade_point: {
    type: Number,
    min: 0,
    max: 4
  },
  credits: {
    type: Number,
    default: 3
  },
  remarks: {
    type: String,
    trim: true
  },
  graded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  graded_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique grade per student per course per semester
gradeSchema.index({ student_id: 1, course_id: 1, semester: 1, exam_type: 1 }, { unique: true });

// Indexes for better performance
gradeSchema.index({ student_id: 1 });
gradeSchema.index({ course_id: 1 });
gradeSchema.index({ graded_by: 1 });
gradeSchema.index({ semester: 1 });

export default mongoose.model('Grade', gradeSchema);
