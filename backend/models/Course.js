import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  instructor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  prerequisites: [{
    type: String,
    trim: true,
    uppercase: true
  }],
  credit_hours: {
    type: String,
    trim: true
  },
  is_virtual: {
    type: Boolean,
    default: false
  },
  schedule: {
    days: [String],
    time: String,
    room: String
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance (code already has unique: true which creates an index)
courseSchema.index({ department_id: 1 });
courseSchema.index({ instructor_id: 1 });
courseSchema.index({ semester: 1 });

export default mongoose.model('Course', courseSchema);
