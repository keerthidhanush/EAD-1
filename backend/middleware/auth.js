import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = verifyToken(token);
      
      // Find user based on role
      let user;
      if (decoded.role === 'admin') {
        user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'student') {
        user = await Student.findById(decoded.id).select('-password');
      }
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token or user not found.'
        });
      }
      
      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Authentication error.'
    });
  }
};

// Admin authorization middleware
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Student authorization middleware
export const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Student privileges required.'
    });
  }
  next();
};

// Self-access middleware (students can only access their own data)
export const requireSelfAccess = (req, res, next) => {
  const requestedStudentId = req.params.studentId || req.params.id;
  
  if (req.user.role === 'admin') {
    // Admins can access any student's data
    return next();
  }
  
  if (req.user.role === 'student' && req.user._id.toString() === requestedStudentId) {
    // Students can only access their own data
    return next();
  }
  
  return res.status(403).json({
    status: 'error',
    message: 'Access denied. You can only access your own data.'
  });
};

// Optional authentication (for public endpoints that can benefit from user context)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = verifyToken(token);
        
        let user;
        if (decoded.role === 'admin') {
          user = await Admin.findById(decoded.id).select('-password');
        } else if (decoded.role === 'student') {
          user = await Student.findById(decoded.id).select('-password');
        }
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (jwtError) {
        // Token is invalid, but we continue without user context
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};