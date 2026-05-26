import express from 'express';
import {
  getStats,
  getActivityLogs,
  createActivityLog,
  getTeacherRequests,
  approveTeacherRequest,
  rejectTeacherRequest,
} from '../controllers/adminController.js';
import {
  getAdminConfig,
  updateAdminConfig,
} from '../controllers/adminConfigController.js';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import {
  getAllPayments,
  verifyPayment,
  rejectPayment,
} from '../controllers/paymentController.js';
import {
  approveCourse,
  rejectCourse,
} from '../controllers/courseController.js';
import {
  getAllHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  toggleHighlight,
} from '../controllers/highlightController.js';
import {
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  toggleFAQ,
} from '../controllers/faqController.js';
import upload from '../middleware/upload.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

// Session config route - accessible to all authenticated users
router.get('/session-config', protect, getAdminConfig);

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/activity-logs', getActivityLogs);
router.post('/activity-logs', createActivityLog);

// Admin config routes (full config - admin only)
router.get('/config', getAdminConfig);
router.put('/config', updateAdminConfig);

// Category management routes (admin only)
router.get('/categories', getAllCategories);
router.post('/categories', upload.single('image'), createCategory);
router.put('/categories/:id', upload.single('image'), updateCategory);
router.delete('/categories/:id', deleteCategory);

// Payment management routes (admin only)
router.get('/payments', getAllPayments);
router.put('/payments/:id/verify', verifyPayment);
router.put('/payments/:id/reject', rejectPayment);

// Course approval routes (admin only)
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', rejectCourse);

// Teacher request management routes (admin only)
router.get('/teacher-requests', getTeacherRequests);
router.put('/teacher-requests/:id/approve', approveTeacherRequest);
router.put('/teacher-requests/:id/reject', rejectTeacherRequest);

// Highlight management routes (admin only)
router.get('/highlights', getAllHighlights);
router.post('/highlights', createHighlight);
router.put('/highlights/:id', updateHighlight);
router.delete('/highlights/:id', deleteHighlight);
router.put('/highlights/:id/toggle', toggleHighlight);

// FAQ management routes (admin only)
router.get('/faqs', getAllFAQs);
router.post('/faqs', createFAQ);
router.put('/faqs/:id', updateFAQ);
router.delete('/faqs/:id', deleteFAQ);
router.put('/faqs/:id/toggle', toggleFAQ);

export default router;

