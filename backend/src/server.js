import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Load env vars - support .env.production for production deployments
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env';
dotenv.config({ path: envFile });
// Also load base .env if it exists (for shared variables)
dotenv.config();

// Enforce required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  console.error('   Please add JWT_SECRET to your .env or .env.production file.');
  process.exit(1);
}

// Connect to database
connectDB();

// Initialize email service (import to trigger transporter creation and logging)
import './utils/emailService.js';

// Initialize express app
const app = express();

// Trust proxy (required when behind Nginx/reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// General API limiter (more lenient - increased from 100 to 500)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (increased for video progress updates and normal usage)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for video progress updates (they're frequent but lightweight)
    // Check if the path matches /videos/:id/progress with PUT method
    const isVideoProgress = req.path.match(/\/videos\/[^/]+\/progress$/) && req.method === 'PUT';
    return isVideoProgress;
  },
});

// Stricter rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 login attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for email-related endpoints (password reset)
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 password reset requests per hour
  message: 'Too many password reset requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgotpassword', emailLimiter);

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL;
if (!frontendUrl && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  WARNING: FRONTEND_URL not set in environment variables. CORS may not work correctly in production.');
}

// In production, if FRONTEND_URL is not set, allow requests from same origin (when behind Nginx proxy)
// This works because Nginx serves both frontend and proxies /api to backend
app.use(
  cors({
    origin: frontendUrl || (process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173'),
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import subjectRoutes from './routes/subjects.js';
import categoryRoutes from './routes/categories.js';
import videoRoutes from './routes/videos.js';
import materialRoutes from './routes/materials.js';
import quizRoutes from './routes/quizzes.js';
import assignmentRoutes from './routes/assignments.js';
import certificateRoutes from './routes/certificates.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import introVideoRoutes from './routes/introVideos.js';
import liveClassRoutes from './routes/liveClasses.js';
import socialMediaRoutes from './routes/socialMedia.js';
import setupRoutes from './routes/setup.js';
import counsellingRoutes from './routes/counselling.js';
import highlightRoutes from './routes/highlights.js';
import teacherProfileRoutes from './routes/teacherProfiles.js';
import faqRoutes from './routes/faqs.js';
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/intro-videos', introVideoRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/counselling', counsellingRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/teacher-profiles', teacherProfileRoutes);
app.use('/api/faqs', faqRoutes);

// Error handler middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

