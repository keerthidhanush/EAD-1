import express from 'express';
import {
  adminLogin,
  adminRegister,
  studentLogin,
  updateStudentProfile,
  validateToken,
  logout,
  getCurrentUser
} from '../controllers/authController.js';
import {
  validateAdminLogin,
  validateAdminRegistration,
  validateStudentLogin,
  validateStudentUpdate
} from '../middleware/validation.js';
import { authenticate, requireAdmin, requireStudent } from '../middleware/auth.js';

const router = express.Router();

// Admin authentication routes
router.post('/admin/login', validateAdminLogin, adminLogin);
router.post('/admin/register', authenticate, requireAdmin, validateAdminRegistration, adminRegister);

// Student authentication routes
router.post('/student/login', validateStudentLogin, studentLogin);
router.put('/student/profile', authenticate, requireStudent, validateStudentUpdate, updateStudentProfile);

// Common authentication routes
router.get('/validate', authenticate, validateToken);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);

export default router;