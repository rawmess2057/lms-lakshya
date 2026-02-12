import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import mongoose from 'mongoose';
import {
  sendRegistrationConfirmation,
  sendEmailVerification,
  sendPasswordReset,
  sendAdminNewUserNotification,
} from '../utils/emailService.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Normalize email (lowercase and trim)
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user exists
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    return res.status(400).json({
      success: false,
      error: 'User already exists with this email',
    });
  }

  // Handle role assignment
  let userRole = 'student';
  if (role === 'teacher') {
    // Create teacher with pending status - requires admin approval
    userRole = 'teacher_pending';
  } else if (role && role !== 'student') {
    // Only allow student or teacher signup
    return res.status(400).json({
      success: false,
      error: 'Invalid role. Please select Student or Teacher.',
    });
  }

  // Create user with isVerified = false
  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: userRole,
    isVerified: false,
  });

  if (user) {
    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Different response message for pending teachers
    const message = user.role === 'teacher_pending'
      ? 'Your request to become a teacher has been submitted. Please wait for admin approval. Please verify your email to continue.'
      : 'Account created successfully. Please check your email to verify your account before logging in.';

    // Send email verification email (non-blocking)
    sendEmailVerification(user, verificationToken)
      .then((result) => {
        if (result.success) {
          console.log(`✅ [REGISTRATION] Email verification email sent successfully to ${user.email}`);
        } else {
          console.error(`❌ [REGISTRATION] Failed to send verification email to ${user.email}: ${result.error}`);
        }
      })
      .catch((error) => {
        console.error(`❌ [REGISTRATION] Error sending verification email to ${user.email}:`, error);
      });

    // Send registration confirmation email (non-blocking)
    sendRegistrationConfirmation(user)
      .then((result) => {
        if (result.success) {
          console.log(`✅ [REGISTRATION] Registration confirmation email sent successfully to ${user.email}`);
        } else {
          console.error(`❌ [REGISTRATION] Failed to send confirmation email to ${user.email}: ${result.error}`);
        }
      })
      .catch((error) => {
        console.error(`❌ [REGISTRATION] Error sending registration confirmation email to ${user.email}:`, error);
      });

    // Send admin notification for new user registration (non-blocking)
    User.find({ role: 'admin', isActive: true })
      .select('email')
      .then((admins) => {
        if (admins.length === 0) {
          console.log('ℹ️  [REGISTRATION] No admin users found to notify');
          return;
        }
        console.log(`📧 [REGISTRATION] Notifying ${admins.length} admin(s) about new user registration`);

        admins.forEach((admin) => {
          sendAdminNewUserNotification(admin.email, user)
            .then((result) => {
              if (result.success) {
                console.log(`✅ [REGISTRATION] Admin notification sent successfully to ${admin.email}`);
              } else {
                console.error(`❌ [REGISTRATION] Failed to send admin notification to ${admin.email}: ${result.error}`);
              }
            })
            .catch((error) => {
              console.error(`❌ [REGISTRATION] Error sending admin notification to ${admin.email}:`, error);
            });
        });
      })
      .catch((error) => {
        console.error('❌ [REGISTRATION] Error fetching admin emails:', error);
      });

    // Do NOT return token - user must verify email first
    res.status(201).json({
      success: true,
      message,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid user data',
    });
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password, expectedRole } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email and password',
    });
  }

  // Normalize email (lowercase and trim)
  const normalizedEmail = email.toLowerCase().trim();

  // Enhanced debug logging for deployment troubleshooting
  console.log('=== [LOGIN DEBUG] Login Attempt ===');
  console.log('[LOGIN DEBUG] Timestamp:', new Date().toISOString());
  console.log('[LOGIN DEBUG] Environment:', process.env.NODE_ENV || 'not set');
  console.log('[LOGIN DEBUG] Email received:', email);
  console.log('[LOGIN DEBUG] Normalized email:', normalizedEmail);
  console.log('[LOGIN DEBUG] Password length:', password?.length);
  console.log('[LOGIN DEBUG] Expected role:', expectedRole || 'not specified');
  console.log('[LOGIN DEBUG] Database connected:', mongoose.connection.readyState === 1 ? 'YES' : 'NO');

  // Check for user
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    console.log('[LOGIN DEBUG] ❌ User not found for email:', normalizedEmail);
    console.log('[LOGIN DEBUG] Possible causes:');
    console.log('[LOGIN DEBUG]   1. User does not exist in database');
    console.log('[LOGIN DEBUG]   2. Database connection issue');
    console.log('[LOGIN DEBUG]   3. Wrong database (checking local instead of production)');
    console.log('[LOGIN DEBUG]   4. Email case sensitivity issue (should be handled by normalization)');
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  console.log('[LOGIN DEBUG] ✅ User found in database');
  console.log('[LOGIN DEBUG] User ID:', user._id);
  console.log('[LOGIN DEBUG] User email:', user.email);
  console.log('[LOGIN DEBUG] User role:', user.role);
  console.log('[LOGIN DEBUG] User isActive:', user.isActive);
  console.log('[LOGIN DEBUG] Password field exists:', !!user.password);
  console.log('[LOGIN DEBUG] Password hash length:', user.password?.length || 0);

  // Check if user is active
  if (!user.isActive) {
    console.log('[LOGIN DEBUG] ❌ User account is deactivated');
    return res.status(401).json({
      success: false,
      error: 'Account has been deactivated',
    });
  }

  // Check if password matches
  if (!user.password) {
    console.error('[LOGIN DEBUG] ❌ CRITICAL: Password field is missing for user:', normalizedEmail);
    console.error('[LOGIN DEBUG] This indicates a database schema issue or data corruption');
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  // Attempt password comparison
  let isMatch = false;
  try {
    isMatch = await user.matchPassword(password);
    console.log('[LOGIN DEBUG] Password comparison result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
  } catch (error) {
    console.error('[LOGIN DEBUG] ❌ ERROR during password comparison:', error.message);
    console.error('[LOGIN DEBUG] Possible causes:');
    console.error('[LOGIN DEBUG]   1. bcrypt version mismatch');
    console.error('[LOGIN DEBUG]   2. Node.js version incompatibility');
    console.error('[LOGIN DEBUG]   3. Corrupted password hash in database');
    console.error('[LOGIN DEBUG] Error details:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error. Please contact support.',
    });
  }

  if (!isMatch) {
    console.log('[LOGIN DEBUG] ❌ Password does not match');
    console.log('[LOGIN DEBUG] Possible causes:');
    console.log('[LOGIN DEBUG]   1. Wrong password entered');
    console.log('[LOGIN DEBUG]   2. Password hash was created with different bcrypt version');
    console.log('[LOGIN DEBUG]   3. Password was not properly hashed when user was created');
    console.log('[LOGIN DEBUG]   4. Database sync issue (using wrong database)');
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  // Check if email is verified (backward compatibility: treat undefined/null as verified)
  if (user.isVerified === false) {
    console.log('[LOGIN DEBUG] ❌ User email is not verified');
    return res.status(403).json({
      success: false,
      error: 'Please verify your email to continue.',
    });
  }

  // Role-based validation: Check if user is logging in through the correct portal
  if (expectedRole) {
    const normalizedExpectedRole = expectedRole.toLowerCase().trim();
    const userRole = user.role.toLowerCase();

    console.log('[LOGIN DEBUG] Expected role:', normalizedExpectedRole, 'User role:', userRole);

    // Handle role validation with special cases
    if (normalizedExpectedRole === 'student') {
      // Students should only login through student portal
      // Admins can also login through student portal
      if (userRole !== 'student' && userRole !== 'admin') {
        console.log('[LOGIN DEBUG] Role validation failed: Teacher trying to login through student portal');
        return res.status(403).json({
          success: false,
          error: 'This account is registered as a teacher. Please use the teacher login portal.',
        });
      }
      console.log('[LOGIN DEBUG] Role validation passed: Student or Admin can login through student portal');
    } else if (normalizedExpectedRole === 'teacher') {
      // Teachers and teacher_pending should login through teacher portal
      // Admins can also login through teacher portal
      if (userRole === 'student') {
        console.log('[LOGIN DEBUG] Role validation failed: Student trying to login through teacher portal');
        return res.status(403).json({
          success: false,
          error: 'This account is registered as a student. Please use the student login portal.',
        });
      }
      // Allow teacher, teacher_pending, and admin roles
      console.log('[LOGIN DEBUG] Role validation passed: Teacher, Teacher_Pending, or Admin can login through teacher portal');
    }
    // If expectedRole is admin or not specified, allow all roles (backward compatibility)
  }

  // Session Management: Limit to 2 concurrent sessions per user
  const MAX_CONCURRENT_SESSIONS = 2;
  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = req.ip || req.connection.remoteAddress || '';
  // Fallback for missing deviceId
  const deviceId = req.body.deviceId || crypto.createHash('md5').update(userAgent + ipAddress).digest('hex');

  // Ensure activeSessions is initialized
  if (!user.activeSessions) {
    user.activeSessions = [];
  }

  // ---------------------------------------------------------
  // 1. AGGRESSIVE CLEANUP: Remove stale/expired sessions FIRST
  // ---------------------------------------------------------
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const initialCount = user.activeSessions.length;

  user.activeSessions = user.activeSessions.filter(session => {
    const isExpired = session.lastActivity && new Date(session.lastActivity).getTime() < sevenDaysAgo;
    const isInvalid = !session.token || !session.deviceId; // Strict integrity check
    return !isExpired && !isInvalid;
  });

  // If we cleaned up anything, save immediately to ensure DB is clean
  if (user.activeSessions.length < initialCount) {
    console.log(`[LOGIN CLEANUP] Removed ${initialCount - user.activeSessions.length} stale/invalid sessions for ${user.email}`);
    try {
      await user.save({ validateBeforeSave: false });
    } catch (e) {
      console.error('[LOGIN CLEANUP ERROR]', e);
      // If save fails, we continue with the in-memory filtered array
      // ensuring we don't block the user, even if DB update failed temporarily
    }
  }

  // ---------------------------------------------------------
  // 2. CHECK DEVICE LIMIT
  // ---------------------------------------------------------
  // Check if THIS device is already logged in
  const existingSessionIndex = user.activeSessions.findIndex(s => s.deviceId === deviceId);

  // If this is a NEW device (not in DB) AND we are at/over limit
  if (existingSessionIndex === -1 && user.activeSessions.length >= MAX_CONCURRENT_SESSIONS) {
    // Admin bypass
    if (user.role !== 'admin') {
      console.log(`[LOGIN BLOCK] User ${user.email} attempted login from 3rd device. Blocked.`);
      return res.status(403).json({
        success: false,
        error: 'You are already logged in on two devices. Please log out from another device first.',
      });
    }
  }

  // ---------------------------------------------------------
  // 3. CREATE / UPDATE SESSION
  // ---------------------------------------------------------
  const token = generateToken(user._id);
  const tokenSignature = token.split('.')[2] || token;

  const newSession = {
    token: tokenSignature,
    deviceId: deviceId,
    createdAt: new Date(),
    lastActivity: new Date(),
    userAgent: userAgent.substring(0, 200),
    ipAddress: ipAddress.substring(0, 50),
  };

  if (existingSessionIndex !== -1) {
    // Update existing session
    console.log(`[LOGIN DEBUG] Updating session for device: ${deviceId}`);
    user.activeSessions[existingSessionIndex] = newSession;
  } else {
    // Add new session
    console.log(`[LOGIN DEBUG] Adding new session for device: ${deviceId}`);
    user.activeSessions.push(newSession);
  }

  // Force strict save
  user.markModified('activeSessions');

  try {
    await user.save({ validateBeforeSave: false });
    console.log(`[LOGIN SUCCESS] User ${user.email} logged in. Active sessions: ${user.activeSessions.length}`);
  } catch (saveError) {
    console.error('[LOGIN ERROR] Failed to save session:', saveError);
    return res.status(500).json({
      success: false,
      error: 'Login failed due to server error',
    });
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    },
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Check if user is still active (in case they were blocked while logged in)
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      error: 'Your account has been blocked. Please contact administrator.',
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
export const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    bio: req.body.bio,
  };

  // Teacher specific fields
  if (req.user.role === 'teacher') {
    fieldsToUpdate.specialization = req.body.specialization;
    fieldsToUpdate.experience = req.body.experience;
  }

  // Handle email update - normalize and check for uniqueness
  if (req.body.email) {
    const normalizedEmail = req.body.email.toLowerCase().trim();

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email is already taken',
      });
    }

    fieldsToUpdate.email = normalizedEmail;
  }

  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      error: 'Password is incorrect',
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  const token = generateToken(user._id);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    },
  });
});

/**
 * @desc    Forgot password - send reset token via email
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an email address',
    });
  }

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // Get user with reset password fields
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+resetPasswordToken +resetPasswordExpire'
  );

  // Always return success message (security: don't reveal if user exists)
  const successMessage = 'If an account with that email exists, a password reset link has been sent.';

  if (!user) {
    // Still return success to prevent email enumeration
    return res.json({
      success: true,
      message: successMessage,
    });
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    // Send email
    console.log(`📧 [FORGOT PASSWORD] Sending password reset email to ${normalizedEmail}`);
    const emailResult = await sendPasswordReset(user, resetToken);

    if (!emailResult.success) {
      console.error(`❌ [FORGOT PASSWORD] Email sending failed: ${emailResult.error}`);

      // Reset token fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      // Still return success to prevent email enumeration, but log the error
      console.warn(`⚠️  [FORGOT PASSWORD] Password reset email failed but returning success to user`);
    } else {
      console.log(`✅ [FORGOT PASSWORD] Password reset email sent successfully to ${normalizedEmail}`);
    }

    res.json({
      success: true,
      message: successMessage,
    });
  } catch (error) {
    console.error(`❌ [FORGOT PASSWORD] Unexpected error sending password reset email to ${normalizedEmail}:`, error);

    // Reset token fields if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    // Still return success to prevent email enumeration
    console.warn(`⚠️  [FORGOT PASSWORD] Password reset email error but returning success to user`);
    res.json({
      success: true,
      message: successMessage,
    });
  }
});

/**
 * @desc    Verify email using token
 * @route   GET /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;

  if (!token) {
    return res.redirect(`${clientUrl}/verification-failed?error=missing_token`);
  }

  // Hash the verification token from URL to compare with DB
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Get user with verification token and check if token hasn't expired
  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpire');

  if (!user) {
    return res.redirect(`${clientUrl}/verification-failed?error=invalid_token`);
  }

  // Check if already verified
  if (user.isVerified === true) {
    return res.redirect(`${clientUrl}/email-verified`);
  }

  // Verify email
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.redirect(`${clientUrl}/email-verified`);
});

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an email address',
    });
  }

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // Find user
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Check if already verified
  if (user.isVerified) {
    return res.status(400).json({
      success: false,
      error: 'Email is already verified',
    });
  }

  // Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    // Send email
    const result = await sendEmailVerification(user, verificationToken);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully.',
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Email could not be sent',
      });
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @desc    Reset password using token
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
/**
 * @desc    Logout user - Remove current session
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token || !req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized',
    });
  }

  try {
    // Remove current session from user's active sessions
    const tokenSignature = token.split('.')[2] || token;
    const user = await User.findById(req.user._id);

    if (user && user.activeSessions) {
      const initialLength = user.activeSessions.length;

      user.activeSessions = user.activeSessions.filter(
        (session) => session.token !== tokenSignature && session.token !== token
      );

      if (user.activeSessions.length < initialLength) {
        user.markModified('activeSessions');
        await user.save({ validateBeforeSave: false });
        console.log(`[LOGOUT] Removed session for ${user.email}. Remaining sessions: ${user.activeSessions.length}`);
      } else {
        console.warn(`[LOGOUT] Warning: Session token not found in activeSessions for ${user.email}`);
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[LOGOUT ERROR]', error);
    // Still return success even if session removal fails to avoid client stuck
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resettoken } = req.params;

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a password with at least 6 characters',
    });
  }

  // Hash the reset token from URL to compare with DB
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resettoken)
    .digest('hex');

  // Get user with reset token and check if token hasn't expired
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired reset token',
    });
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // ---------------------------------------------------------
  // SESSION MANAGEMENT (Fix for "deviceId required" error)
  // ---------------------------------------------------------

  // 1. Get Device ID (Fallback if not provided in body, though it should be)
  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = req.ip || req.connection.remoteAddress || '';
  const deviceId = req.body.deviceId || crypto.createHash('md5').update(userAgent + ipAddress).digest('hex');

  // 2. Initialize activeSessions
  if (!user.activeSessions) {
    user.activeSessions = [];
  }

  // 3. Clean up STALE/INVALID sessions (Critical: removes sessions missing deviceId)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  user.activeSessions = user.activeSessions.filter(session => {
    const isExpired = session.lastActivity && new Date(session.lastActivity).getTime() < sevenDaysAgo;
    const isInvalid = !session.token || !session.deviceId; // Remove legacy sessions
    return !isExpired && !isInvalid;
  });

  // 4. Generate Token
  const token = generateToken(user._id);
  const tokenSignature = token.split('.')[2] || token;

  // 5. Add New Session IF limit allows (Strict Mode: Block if full? Or Recycle?)
  // For Reset Password, we want to allow login. We can recycle the oldest session if full.
  // OR just strict block. But blocking after password reset is bad UX.
  // Let's replace the oldest session if full, OR just add it and rely on next login to clean up?
  // No, must respect MAX_CONCURRENT_SESSIONS = 2.
  // Strategy: If full, remove the oldest session to make room for this new critical login.
  if (user.activeSessions.length >= 2) {
    // Sort by lastActivity ascending (oldest first) and remove first
    user.activeSessions.sort((a, b) => new Date(a.lastActivity) - new Date(b.lastActivity));
    user.activeSessions.shift(); // Remove oldest
  }

  user.activeSessions.push({
    token: tokenSignature,
    deviceId: deviceId,
    createdAt: new Date(),
    lastActivity: new Date(),
    userAgent: userAgent.substring(0, 200),
    ipAddress: ipAddress.substring(0, 50),
  });

  user.markModified('activeSessions');

  try {
    await user.save(); // Now safe because invalid sessions are removed
  } catch (error) {
    console.error('[RESET PASSWORD ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Password reset processed but login failed. Please login manually.',
    });
  }

  res.json({
    success: true,
    message: 'Password reset successful',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    },
  });
});

