import express from 'express';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentCourses,
  getStudentResults,
  getStudentStats,
  bulkCreateStudents
} from '../controllers/studentController.js';
import {
  validateStudentCreation,
  validateStudentUpdate,
  validateObjectId,
  validateSearchQuery
} from '../middleware/validation.js';
import { authenticate, requireAdmin, requireStudent, requireSelfAccess } from '../middleware/auth.js';

const router = express.Router();

// Student self-service routes
router.get('/me/courses', authenticate, requireStudent, getStudentCourses);
router.get('/me/results', authenticate, requireStudent, getStudentResults);

// Protected admin routes
router.use(authenticate);

// Admin-only routes
router.get('/', requireAdmin, validateSearchQuery, getStudents);
router.post('/', requireAdmin, validateStudentCreation, createStudent);
router.post('/bulk', requireAdmin, bulkCreateStudents);

// Routes that require admin or self-access
router.get('/:id', validateObjectId, requireSelfAccess, getStudent);
router.put('/:id', validateObjectId, requireSelfAccess, validateStudentUpdate, updateStudent);
router.get('/:id/stats', validateObjectId, requireSelfAccess, getStudentStats);

// Admin-only routes for student management
router.delete('/:id', requireAdmin, validateObjectId, deleteStudent);

export default router;