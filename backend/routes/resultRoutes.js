import express from 'express';
import {
  getResults,
  getResult,
  createResult,
  updateResult,
  deleteResult,
  getResultsByStudent,
  getResultsByCourse,
  bulkAssignGrades
} from '../controllers/resultController.js';
import {
  validateResultCreation,
  validateResultUpdate,
  validateObjectId,
  validateSearchQuery
} from '../middleware/validation.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All result routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Result CRUD routes
router.get('/', validateSearchQuery, getResults);
router.get('/:id', validateObjectId, getResult);
router.post('/', validateResultCreation, createResult);
router.put('/:id', validateObjectId, validateResultUpdate, updateResult);
router.delete('/:id', validateObjectId, deleteResult);

// Specialized routes
router.get('/student/:studentId', validateObjectId, getResultsByStudent);
router.get('/course/:courseId', validateObjectId, getResultsByCourse);
router.post('/bulk', bulkAssignGrades);

export default router;