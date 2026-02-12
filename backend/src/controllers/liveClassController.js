import asyncHandler from '../middleware/asyncHandler.js';
import LiveClass from '../models/LiveClass.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

/**
 * @desc    Create live class
 * @route   POST /api/live-classes
 * @access  Private/Teacher/Admin
 */
export const createLiveClass = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.body.course);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // If teacher, verify they own the course
  if (req.user.role === 'teacher') {
    const teacherId = course.teacher._id
      ? course.teacher._id.toString()
      : course.teacher.toString();
    if (teacherId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create live class for this course',
      });
    }
    req.body.teacher = req.user._id;
  }

  // Auto-enroll all enrolled students
  if (course.studentsEnrolled && course.studentsEnrolled.length > 0) {
    req.body.enrolledStudents = course.studentsEnrolled;
  }

  const liveClass = await LiveClass.create(req.body);

  res.status(201).json({
    success: true,
    data: liveClass,
  });
});

/**
 * @desc    Get live classes for a course
 * @route   GET /api/live-classes/course/:courseId
 * @access  Public
 */
export const getCourseLiveClasses = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  const liveClasses = await LiveClass.find({
    course: req.params.courseId,
  })
    .populate('teacher', 'name email')
    .sort({ scheduledAt: 1 });

  res.json({
    success: true,
    count: liveClasses.length,
    data: liveClasses,
  });
});

/**
 * @desc    Get single live class
 * @route   GET /api/live-classes/:id
 * @access  Private
 */
export const getLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id)
    .populate('course', 'title description')
    .populate('teacher', 'name email')
    .populate('enrolledStudents', 'name email');

  if (!liveClass) {
    return res.status(404).json({
      success: false,
      error: 'Live class not found',
    });
  }

  // Check if user is enrolled (if student)
  let canJoin = false;
  if (req.user) {
    const isEnrolled = liveClass.enrolledStudents.some(
      (studentId) => studentId._id.toString() === req.user._id.toString()
    );
    const isTeacher = liveClass.teacher._id.toString() === req.user._id.toString() && req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';
    canJoin = isEnrolled || isTeacher || isAdmin;
  }

  res.json({
    success: true,
    data: {
      ...liveClass.toObject(),
      canJoin,
    },
  });
});

/**
 * @desc    Update live class
 * @route   PUT /api/live-classes/:id
 * @access  Private/Teacher/Admin
 */
export const updateLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);

  if (!liveClass) {
    return res.status(404).json({
      success: false,
      error: 'Live class not found',
    });
  }

  // If teacher, verify they own the live class
  if (req.user.role === 'teacher') {
    const teacherId = liveClass.teacher._id
      ? liveClass.teacher._id.toString()
      : liveClass.teacher.toString();
    if (teacherId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this live class',
      });
    }
  }

  const updatedLiveClass = await LiveClass.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('course', 'title')
    .populate('teacher', 'name email');

  res.json({
    success: true,
    data: updatedLiveClass,
  });
});

/**
 * @desc    Delete live class
 * @route   DELETE /api/live-classes/:id
 * @access  Private/Teacher/Admin
 */
export const deleteLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);

  if (!liveClass) {
    return res.status(404).json({
      success: false,
      error: 'Live class not found',
    });
  }

  // If teacher, verify they own the live class
  if (req.user.role === 'teacher') {
    const teacherId = liveClass.teacher._id
      ? liveClass.teacher._id.toString()
      : liveClass.teacher.toString();
    if (teacherId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this live class',
      });
    }
  }

  await liveClass.deleteOne();

  res.json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Join live class
 * @route   POST /api/live-classes/:id/join
 * @access  Private/Student
 */
export const joinLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id)
    .populate('course');

  if (!liveClass) {
    return res.status(404).json({
      success: false,
      error: 'Live class not found',
    });
  }

  // Check if user is enrolled in the course
  const course = await Course.findById(liveClass.course._id);
  const isEnrolled = course.studentsEnrolled.some(
    (studentId) => studentId.toString() === req.user._id.toString()
  );

  if (!isEnrolled && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'You must be enrolled in this course to join the live class',
    });
  }

  // Check if live class is scheduled or live
  if (liveClass.status !== 'scheduled' && liveClass.status !== 'live') {
    return res.status(400).json({
      success: false,
      error: 'Live class is not available',
    });
  }

  // Add student to enrolled list if not already there
  if (!liveClass.enrolledStudents.includes(req.user._id)) {
    liveClass.enrolledStudents.push(req.user._id);
  }

  // Track attendance - add or update attendance record
  if (!liveClass.attendance) {
    liveClass.attendance = [];
  }

  const existingAttendance = liveClass.attendance.find(
    (a) => {
      const studentId = a.student?._id ? a.student._id.toString() : a.student?.toString();
      return studentId === req.user._id.toString();
    }
  );

  if (existingAttendance) {
    // Update existing attendance - student rejoined
    existingAttendance.joinedAt = new Date();
    existingAttendance.leftAt = null;
    existingAttendance.status = 'present';
  } else {
    // Create new attendance record
    const isLate = new Date() > new Date(liveClass.scheduledAt);
    liveClass.attendance.push({
      student: req.user._id,
      joinedAt: new Date(),
      status: isLate ? 'late' : 'present',
    });
  }

  await liveClass.save();

  res.json({
    success: true,
    data: {
      meetingUrl: liveClass.meetingUrl,
      meetingId: liveClass.meetingId,
      meetingPassword: liveClass.meetingPassword,
      status: liveClass.status,
    },
  });
});

/**
 * @desc    Leave live class (track attendance duration)
 * @route   POST /api/live-classes/:id/leave
 * @access  Private/Student
 */
export const leaveLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);

  if (!liveClass) {
    return res.status(404).json({
      success: false,
      error: 'Live class not found',
    });
  }

  // Find and update attendance record
  if (liveClass.attendance && liveClass.attendance.length > 0) {
    const attendance = liveClass.attendance.find(
      (a) => {
        const studentId = a.student?._id ? a.student._id.toString() : a.student?.toString();
        return studentId === req.user._id.toString();
      }
    );

    if (attendance && !attendance.leftAt) {
      attendance.leftAt = new Date();
      // Calculate duration in minutes
      const joinedAt = new Date(attendance.joinedAt);
      const leftAt = new Date(attendance.leftAt);
      attendance.duration = Math.round((leftAt - joinedAt) / (1000 * 60)); // minutes

      // Check if student left early (before scheduled duration)
      const scheduledEnd = new Date(liveClass.scheduledAt);
      scheduledEnd.setMinutes(scheduledEnd.getMinutes() + liveClass.duration);
      
      if (leftAt < scheduledEnd) {
        attendance.status = 'left_early';
      }

      await liveClass.save();
    }
  }

  res.json({
    success: true,
    message: 'Attendance tracked successfully',
  });
});

