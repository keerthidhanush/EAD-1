import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'dropped', 'completed'],
    default: 'active'
  },
  semester: {
    type: String,
    trim: true,
    maxlength: [20, 'Semester cannot exceed 20 characters']
  },
  academicYear: {
    type: String,
    trim: true,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Indexes for efficient queries
registrationSchema.index({ studentId: 1 });
registrationSchema.index({ courseId: 1 });
registrationSchema.index({ registrationDate: -1 });

// Virtual for student details
registrationSchema.virtual('student', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

// Virtual for course details
registrationSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to validate registration
registrationSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Check if student exists
      const Student = mongoose.model('Student');
      const student = await Student.findById(this.studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Check if course exists
      const Course = mongoose.model('Course');
      const course = await Course.findById(this.courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Check if course is full
      const isFull = await course.isFull();
      if (isFull) {
        throw new Error('Course is full');
      }

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Static method to get student's courses
registrationSchema.statics.getStudentCourses = function(studentId) {
  return this.find({ studentId, status: 'active' }).populate('courseId');
};

// Static method to get course's students
registrationSchema.statics.getCourseStudents = function(courseId) {
  return this.find({ courseId, status: 'active' }).populate('studentId');
};

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;