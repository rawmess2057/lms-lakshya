import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
import ActivityLog from '../models/ActivityLog.js';
import Payment from '../models/Payment.js';
import { logAdminActivity } from '../utils/activityLogger.js';
import {
  sendTeacherApprovalNotification,
  sendTeacherRejectionNotification,
} from '../utils/emailService.js';

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getStats = asyncHandler(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalTeachers = await User.countDocuments({ role: 'teacher' });
  const pendingTeacherRequests = await User.countDocuments({ role: 'teacher_pending' });
  const totalCourses = await Course.countDocuments();
  const totalSubjects = await Subject.countDocuments();
  const publishedCourses = await Course.countDocuments({ isPublished: true });
  const enrolledStudents = await User.countDocuments({ enrolledCourses: { $exists: true, $ne: [] } });
  const pendingPayments = await Payment.countDocuments({ status: 'pending' });

  res.json({
    success: true,
    data: {
      totalStudents,
      totalTeachers,
      pendingTeacherRequests,
      totalCourses,
      totalSubjects,
      publishedCourses,
      enrolledStudents,
      pendingPayments,
    },
  });
});

/**
 * @desc    Get activity logs
 * @route   GET /api/admin/activity-logs
 * @access  Private/Admin
 */
export const getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const logs = await ActivityLog.find()
    .populate('admin', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ActivityLog.countDocuments();

  res.json({
    success: true,
    count: logs.length,
    total,
    data: logs,
  });
});

/**
 * @desc    Create activity log
 * @route   POST /api/admin/activity-logs
 * @access  Private/Admin
 */
export const createActivityLog = asyncHandler(async (req, res) => {
  const { action, resourceType, resourceId, details } = req.body;

  const log = await ActivityLog.create({
    admin: req.user._id,
    action,
    resourceType,
    resourceId,
    details,
    ipAddress: req.ip || req.connection.remoteAddress,
  });

  res.status(201).json({
    success: true,
    data: log,
  });
});

/**
 * @desc    Get teacher requests (pending teachers)
 * @route   GET /api/admin/teacher-requests
 * @access  Private/Admin
 */
export const getTeacherRequests = asyncHandler(async (req, res) => {
  const { status = 'pending' } = req.query;

  let query = { role: 'teacher_pending' };
  if (status === 'all') {
    query = { role: { $in: ['teacher_pending', 'teacher'] } };
  }

  const teachers = await User.find(query)
    .select('name email role isActive createdAt')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: teachers.length,
    data: teachers,
  });
});

/**
 * @desc    Approve teacher request
 * @route   PUT /api/admin/teacher-requests/:id/approve
 * @access  Private/Admin
 */
export const approveTeacherRequest = asyncHandler(async (req, res) => {
  const teacher = await User.findById(req.params.id);

  if (!teacher) {
    return res.status(404).json({
      success: false,
      error: 'Teacher not found',
    });
  }

  if (teacher.role !== 'teacher_pending') {
    return res.status(400).json({
      success: false,
      error: 'This user is not a pending teacher',
    });
  }

  // Update role to teacher and ensure account is active
  teacher.role = 'teacher';
  teacher.isActive = true; // Ensure approved teachers are active
  await teacher.save();

  // Log admin activity
  await logAdminActivity({
    adminId: req.user._id,
    action: 'Approved teacher request',
    resourceType: 'user',
    resourceId: teacher._id,
    details: `Approved teacher request for ${teacher.name} (${teacher.email})`,
    ipAddress: req.ip || req.connection.remoteAddress,
  });

  // Send approval email notification (non-blocking)
  sendTeacherApprovalNotification(teacher)
    .then((result) => {
      if (result.success) {
        console.log(`✅ [ADMIN] Teacher approval email sent successfully to ${teacher.email}`);
      } else {
        console.error(`❌ [ADMIN] Failed to send teacher approval email to ${teacher.email}: ${result.error}`);
      }
    })
    .catch((error) => {
      console.error(`❌ [ADMIN] Error sending teacher approval email to ${teacher.email}:`, error);
    });

  res.json({
    success: true,
    message: 'Teacher request approved successfully',
    data: {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
    },
  });
});

/**
 * @desc    Reject teacher request
 * @route   PUT /api/admin/teacher-requests/:id/reject
 * @access  Private/Admin
 */
export const rejectTeacherRequest = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const teacher = await User.findById(req.params.id);

  if (!teacher) {
    return res.status(404).json({
      success: false,
      error: 'Teacher not found',
    });
  }

  if (teacher.role !== 'teacher_pending') {
    return res.status(400).json({
      success: false,
      error: 'This user is not a pending teacher',
    });
  }

  // Keep as teacher_pending but optionally disable account
  // Or convert to student role based on business logic
  // For now, we'll keep as teacher_pending but can disable
  if (req.body.disableAccount) {
    teacher.isActive = false;
    await teacher.save();
  }

  // Log admin activity
  await logAdminActivity({
    adminId: req.user._id,
    action: 'Rejected teacher request',
    resourceType: 'user',
    resourceId: teacher._id,
    details: `Rejected teacher request for ${teacher.name} (${teacher.email}). Reason: ${reason || 'Not specified'}`,
    ipAddress: req.ip || req.connection.remoteAddress,
  });

  // Send rejection email notification (non-blocking)
  sendTeacherRejectionNotification(teacher, reason)
    .then((result) => {
      if (result.success) {
        console.log(`✅ [ADMIN] Teacher rejection email sent successfully to ${teacher.email}`);
      } else {
        console.error(`❌ [ADMIN] Failed to send teacher rejection email to ${teacher.email}: ${result.error}`);
      }
    })
    .catch((error) => {
      console.error(`❌ [ADMIN] Error sending teacher rejection email to ${teacher.email}:`, error);
    });

  res.json({
    success: true,
    message: 'Teacher request rejected',
    data: {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
      isActive: teacher.isActive,
    },
  });
});

