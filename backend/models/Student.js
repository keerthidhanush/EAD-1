import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  studentId: {
    type: String, required: true, unique: true, uppercase: true, trim: true,
    match: [/^S\d{5}$/, 'Student ID must be in format S12345']
  },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, default: 'student', enum: ['student'] },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  enrollmentDate: { type: Date, default: Date.now }
}, { timestamps: true });

studentSchema.index({ studentId: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ name: 1 });

studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (BCRYPT_RE.test(this.password)) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

studentSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

studentSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

export default mongoose.model('Student', studentSchema);
