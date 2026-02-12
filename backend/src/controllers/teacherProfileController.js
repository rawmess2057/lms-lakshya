import asyncHandler from '../middleware/asyncHandler.js';
import TeacherProfile from '../models/TeacherProfile.js';
import User from '../models/User.js';
import { logAdminActivity } from '../utils/activityLogger.js';

/**
 * @desc    Get all featured teacher profiles
 * @route   GET /api/teacher-profiles
 * @access  Public
 */
export const getTeacherProfiles = asyncHandler(async (req, res) => {
  const { featured } = req.query;

  let query = { isActive: true };
  if (featured === 'true') {
    query.isFeatured = true;
  }

  const profiles = await TeacherProfile.find(query)
    .populate('user', 'name email profilePicture')
    .sort({ displayOrder: 1, createdAt: -1 });

  res.json({
    success: true,
    data: profiles,
  });
});

/**
 * @desc    Get single teacher profile
 * @route   GET /api/teacher-profiles/:id
 * @access  Public
 */
export const getTeacherProfile = asyncHandler(async (req, res) => {
  const profile = await TeacherProfile.findById(req.params.id).populate(
    'user',
    'name email profilePicture'
  );

  if (!profile || !profile.isActive) {
    return res.status(404).json({
      success: false,
      error: 'Teacher profile not found',
    });
  }

  res.json({
    success: true,
    data: profile,
  });
});

/**
 * @desc    Get all teacher profiles (Admin)
 * @route   GET /api/teacher-profiles/admin
 * @access  Private/Admin
 */
export const getAllTeacherProfiles = asyncHandler(async (req, res) => {
  const profiles = await TeacherProfile.find()
    .populate('user', 'name email role')
    .sort({ displayOrder: 1, createdAt: -1 });

  res.json({
    success: true,
    data: profiles,
  });
});

/**
 * @desc    Create teacher profile
 * @route   POST /api/teacher-profiles/admin
 * @access  Private/Admin
 */
export const createTeacherProfile = asyncHandler(async (req, res) => {
  const {
    userId,
    name,
    email,
    specialization,
    experience,
    bio,
    qualifications,
    achievements,
    profilePicture,
    socialLinks,
    isFeatured,
    displayOrder,
  } = req.body;

  // Validate required fields
  if (!name || !email || !specialization || experience === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Please provide name, email, specialization, and experience',
    });
  }

  // If userId provided, verify user exists
  let user = null;
  if (userId) {
    user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
  }

  const profile = await TeacherProfile.create({
    user: userId || null,
    name,
    email,
    specialization,
    experience,
    bio: bio || '',
    qualifications: qualifications || '',
    achievements: achievements || '',
    profilePicture: profilePicture || '',
    socialLinks: socialLinks || {},
    isFeatured: isFeatured !== undefined ? isFeatured : true,
    displayOrder: displayOrder || 0,
    isActive: true,
  });

  // Log admin activity
  await logAdminActivity({
    adminId: req.user._id,
    action: 'Created teacher profile',
    resourceType: 'teacher_profile',
    resourceId: profile._id,
    details: `Created teacher profile for ${name}`,
    ipAddress: req.ip || req.connection.remoteAddress,
  });

  res.status(201).json({
    success: true,
    data: profile,
  });
});

/**
 * @desc    Update teacher profile
 * @route   PUT /api/teacher-profiles/admin/:id
 * @access  Private/Admin
 */
export const updateTeacherProfile = asyncHandler(async (req, res) => {
  const profile = await TeacherProfile.findById(req.params.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Teacher profile not found',
    });
  }

  const {
    userId,
    name,
    email,
    specialization,
    experience,
    bio,
    qualifications,
    achievements,
    profilePicture,
    socialLinks,
    isFeatured,
    displayOrder,
    isActive,
  } = req.body;

  // Update fields
  if (userId !== undefined) profile.user = userId || null;
  if (name) profile.name = name;
  if (email) profile.email = email;
  if (specialization) profile.specialization = specialization;
  if (experience !== undefined) profile.experience = experience;
  if (bio !== undefined) profile.bio = bio;
  if (qualifications !== undefined) profile.qualifications = qualifications;
  if (achievements !== undefined) profile.achievements = achievements;
  if (profilePicture !== undefined) profile.profilePicture = profilePicture;
  if (socialLinks) profile.socialLinks = { ...profile.socialLinks, ...socialLinks };
  if (isFeatured !== undefined) profile.isFeatured = isFeatured;
  if (displayOrder !== undefined) profile.displayOrder = displayOrder;
  if (isActive !== undefined) profile.isActive = isActive;

  await profile.save();

  // Log admin activity
  await logAdminActivity({
    adminId: req.user._id,
    action: 'Updated teacher profile',
    resourceType: 'teacher_profile',
    resourceId: profile._id,
    details: `Updated teacher profile for ${profile.name}`,
    ipAddress: req.ip || req.connection.remoteAddress,
  });

  res.json({
    success: true,
    data: profile,
  });
});

/**
 * @desc    Delete teacher profile
 * @route   DELETE /api/teacher-profiles/admin/:id
 * @access  Private/Admin
 */
export const deleteTeacherProfile = asyncHandler(async (req, res) => {
  const profile = await TeacherProfile.findById(req.params.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Teacher profile not found',
    });
  }

  // Log admin activity
  await logAdminActivity({
    adminId: req.user._id,
    action: 'Deleted teacher profile',
    resourceType: 'teacher_profile',
    resourceId: profile._id,
    details: `Deleted teacher profile for ${profile.name}`,
    ipAddress: req.ip || req.connection.remoteAddress,
  });

  await profile.deleteOne();

  res.json({
    success: true,
    message: 'Teacher profile deleted successfully',
  });
});

