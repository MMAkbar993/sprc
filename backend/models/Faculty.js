import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employee_id: {
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
  designation: {
    type: String,
    required: true,
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  joining_date: {
    type: Date,
    required: true
  },
  salary: {
    type: Number,
    min: 0
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance (employee_id and user_id already have unique: true which creates indexes)
facultySchema.index({ department: 1 });

export default mongoose.model('Faculty', facultySchema);
