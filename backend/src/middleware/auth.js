import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/User.js';

/**
 * Optional authentication - set req.user if token is present and valid, but don't fail if not
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.userId).select('-password');
      // Only set user if they are active (blocked users are treated as not authenticated)
      if (user && user.isActive) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (error) {
      // If token is invalid, just continue without setting req.user
      req.user = null;
    }
  }

  next();
});

/**
 * Protect routes - verify JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if user is active (blocked users cannot access protected routes)
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been blocked. Please contact administrator.',
      });
    }

    // Strict Session Check: The token used must exist in activeSessions
    if (req.user.activeSessions && req.user.activeSessions.length > 0) {
      const tokenSignature = token.split('.')[2] || token;
      const sessionIndex = req.user.activeSessions.findIndex(
        (s) => s.token === tokenSignature || s.token === token
      );

      if (sessionIndex === -1) {
        // Token is valid JWT but Session not found in DB (remotely logged out)
        return res.status(401).json({
          success: false,
          error: 'Session expired or logged out from another device',
        });
      }

      // Update activity
      req.user.activeSessions[sessionIndex].lastActivity = new Date();
      // Optimization: trigger save without waiting, but use updateOne/findOneAndUpdate to be atomic if possible
      // (Using save() on document here is fine since we have the doc)
      User.findByIdAndUpdate(
        req.user._id,
        { $set: { [`activeSessions.${sessionIndex}.lastActivity`]: new Date() } },
        { new: false }
      ).catch((err) => console.error('Error updating session activity:', err));
    } else if (req.user.activeSessions && req.user.activeSessions.length === 0) {
      // If user has NO active sessions but provided a valid JWT, it means they were cleared out.
      return res.status(401).json({
        success: false,
        error: 'Session expired or logged out from another device',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
});

export default protect;
export { optionalAuth };

