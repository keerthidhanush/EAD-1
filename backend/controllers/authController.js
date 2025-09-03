import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';


// Admin login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log('Admin login attempt:', { email });

  const admin = await Admin.findOne({ email, isActive: true }).select('+password');
  console.log('Found admin:', !!admin);

  if (!admin) {
    return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
  }

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) {
    return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
  }

  await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

  const token = generateToken({ id: admin._id, email: admin.email, role: 'admin' });

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        lastLogin: new Date(),
      },
    },
  });
});

// Student login
export const studentLogin = asyncHandler(async (req, res) => {
  const { studentId, password } = req.body;

  const student = await Student.findOne({ studentId, isActive: true }).select('+password');
  if (!student) {
    return res.status(401).json({ status: 'error', message: 'Invalid student ID or password' });
  }

  const ok = await bcrypt.compare(password, student.password);
  if (!ok) {
    return res.status(401).json({ status: 'error', message: 'Invalid student ID or password' });
  }

  await student.updateLastLogin();

  const token = generateToken({ id: student._id, studentId: student.studentId, role: 'student' });

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      token,
      user: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        role: student.role,
        lastLogin: student.lastLogin,
      },
    },
  });
});
// Admin register (optional)
export const adminRegister = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({ status: 'error', message: 'Admin with this email already exists' });
  }

  const admin = await Admin.create({ email, password, name, role: 'admin', isActive: true });
  const token = generateToken({ id: admin._id, email: admin.email, role: 'admin' });

  res.status(201).json({
    status: 'success',
    message: 'Admin registered successfully',
    data: {
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' },
    },
  });
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const studentId = req.user._id;

  const updateData = {};
  
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (password) updateData.password = password;

  const student = await Student.findByIdAndUpdate(
    studentId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!student) {
    return res.status(404).json({
      status: 'error',
      message: 'Student not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: student
    }
  });
});

// Token validation
export const validateToken = asyncHandler(async (req, res) => {
  // If we reach here, the token is valid (middleware already verified it)
  res.status(200).json({
    status: 'success',
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

// Logout (client-side token removal, but we can track it server-side if needed)
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// Get current user profile
export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});