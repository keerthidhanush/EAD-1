import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{2,4}\d{3}$/, 'Course code must be in format like CS101, MATH201']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  credits: {
    type: Number,
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot exceed 6'],
    default: 3
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxEnrollment: {
    type: Number,
    min: [1, 'Maximum enrollment must be at least 1'],
    default: 50
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
courseSchema.index({ code: 1 });
courseSchema.index({ title: 1 });
courseSchema.index({ department: 1 });

// Virtual for registrations count
courseSchema.virtual('enrollmentCount', {
  ref: 'Registration',
  localField: '_id',
  foreignField: 'courseId',
  count: true
});

// Virtual for registrations
courseSchema.virtual('registrations', {
  ref: 'Registration',
  localField: '_id',
  foreignField: 'courseId'
});

// Check if course is full
courseSchema.methods.isFull = async function() {
  const Registration = mongoose.model('Registration');
  const enrollmentCount = await Registration.countDocuments({ courseId: this._id });
  return enrollmentCount >= this.maxEnrollment;
};

// Get enrolled students
courseSchema.methods.getEnrolledStudents = async function() {
  const Registration = mongoose.model('Registration');
  return await Registration.find({ courseId: this._id }).populate('studentId');
};

const Course = mongoose.model('Course', courseSchema);

export default Course;