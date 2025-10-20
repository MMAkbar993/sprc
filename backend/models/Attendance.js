import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'absent'
  },
  marked_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remarks: {
    type: String,
    trim: true
  },
  session_type: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial', 'virtual'],
    default: 'lecture'
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per student per course per date
attendanceSchema.index({ student_id: 1, course_id: 1, date: 1 }, { unique: true });

// Index for faster queries
attendanceSchema.index({ course_id: 1, date: 1 });
attendanceSchema.index({ student_id: 1 });

// Method to calculate attendance percentage for a student in a course
attendanceSchema.statics.getAttendancePercentage = async function(studentId, courseId) {
  const total = await this.countDocuments({ student_id: studentId, course_id: courseId });
  const present = await this.countDocuments({ 
    student_id: studentId, 
    course_id: courseId, 
    status: { $in: ['present', 'late'] } 
  });
  
  if (total === 0) return 0;
  return ((present / total) * 100).toFixed(2);
};

export default mongoose.model('Attendance', attendanceSchema);

