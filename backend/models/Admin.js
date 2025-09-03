import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Detect an existing bcrypt hash ($2a/$2b/$2y)
const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  role: { type: String, default: 'admin', enum: ['admin'] },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

adminSchema.index({ email: 1 });

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  // If seeder or update already provided a bcrypt hash, don't hash again
  if (BCRYPT_RE.test(this.password)) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

adminSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

export default mongoose.model('Admin', adminSchema);
