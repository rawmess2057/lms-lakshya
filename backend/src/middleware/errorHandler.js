/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // In production, show generic error messages for security
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorMessage = isDevelopment 
    ? (error.message || 'Server Error')
    : (error.statusCode === 500 ? 'An internal server error occurred. Please try again later.' : error.message || 'An error occurred');

  res.status(error.statusCode || 500).json({
    success: false,
    error: errorMessage,
    ...(isDevelopment && { stack: err.stack }),
  });
};

export default errorHandler;

