/**
 * Role-based access control middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
    }

    // Special handling for teacher_pending users trying to access teacher routes
    if (req.user.role === 'teacher_pending' && roles.includes('teacher')) {
      return res.status(403).json({
        success: false,
        error: 'Your teacher account is pending approval. You cannot access teacher features yet.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

export default authorize;

