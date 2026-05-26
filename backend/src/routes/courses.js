import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  getEnrolledCourses,
  enrollInCourse,
  getCourseStudents,
} from '../controllers/courseController.js';
import upload from '../middleware/upload.js';
import protect, { optionalAuth } from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

// Public routes (optionalAuth allows admin to see all courses)
router.get('/', optionalAuth, getCourses);
router.get('/:id', optionalAuth, getCourse);

// Protected routes - specific routes must come before parameterized routes
router.get('/teacher/my-courses', protect, authorize('teacher'), getMyCourses);
router.get('/student/my-courses', protect, authorize('student', 'admin'), getEnrolledCourses);
router.get('/:id/students', protect, authorize('teacher', 'admin'), getCourseStudents);
router.post('/:id/enroll', protect, authorize('student'), enrollInCourse);

// Teacher/Admin routes
router.post('/', protect, authorize('teacher', 'admin'), upload.single('thumbnail'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), upload.single('thumbnail'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);

export default router;

