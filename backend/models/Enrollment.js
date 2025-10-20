import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
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
  enrollment_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Compound index to ensure unique enrollment per student per course per semester
enrollmentSchema.index({ student_id: 1, course_id: 1, semester: 1 }, { unique: true });

// Indexes for better performance
enrollmentSchema.index({ student_id: 1 });
enrollmentSchema.index({ course_id: 1 });
enrollmentSchema.index({ status: 1 });

export default mongoose.model('Enrollment', enrollmentSchema);
