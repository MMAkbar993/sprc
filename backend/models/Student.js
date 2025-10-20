import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  student_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  program: {
    type: String,
    required: true,
    trim: true
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  advisor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  admission_date: {
    type: Date,
    required: true
  },
  expected_graduation: {
    type: Date
  },
  cgpa: {
    type: Number,
    default: 0.00,
    min: 0.00,
    max: 4.00
  }
}, {
  timestamps: true
});

// Indexes for better performance (student_id and user_id already have unique: true which creates indexes)
studentSchema.index({ department: 1 });
studentSchema.index({ batch: 1 });

export default mongoose.model('Student', studentSchema);
