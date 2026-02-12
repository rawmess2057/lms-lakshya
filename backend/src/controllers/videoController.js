import asyncHandler from '../middleware/asyncHandler.js';
import Video from '../models/Video.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import { generateVideoToken } from '../middleware/videoProtection.js';
import {
  uploadVideoToBunny,
  deleteVideoFromBunny,
  isBunnyStreamEnabled
} from '../services/bunnyStreamService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validate Bunny Stream video ID format
 * @param {String} videoId - Video ID to validate
 * @returns {Boolean} True if valid ID format
 */
const isValidBunnyVideoId = (videoId) => {
  if (!videoId || typeof videoId !== 'string') {
    return false;
  }
  // Bunny Stream accepts various ID formats - validate length and basic format
  const trimmedId = videoId.trim();
  // Allow UUID format or alphanumeric strings (Bunny Stream accepts various formats)

  return trimmedId.length >= 10 && trimmedId.length <= 100;
};

// --- GOOGLE DRIVE VIDEO SUPPORT ---
// Helper to detect and transform Google Drive URLs
const processVideoUrl = (url) => {
  if (!url) return { url: '', source: 'external' }; // Default

  let processedUrl = url;
  let source = 'external';

  // Google Drive Detection
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([-0-9a-zA-Z_]+)/;
  const driveMatch = url.match(driveRegex);

  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    source = 'drive';
    // Convert to preview URL regardless of input format
    processedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    source = 'youtube';
  } else if (url.includes('vimeo.com')) {
    source = 'vimeo';
  }

  return { url: processedUrl, source };
};

/**
 * @desc    Get videos for a course
 * @route   GET /api/videos/course/:courseId
 * @access  Public (but video URLs filtered based on enrollment)
 */
export const getCourseVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ course: req.params.courseId, isActive: true })
    .sort({ order: 1 });

  // Check enrollment status to filter video URLs
  let isEnrolled = false;
  let isOwner = false;
  let isAdmin = false;

  if (req.user) {
    const course = await Course.findById(req.params.courseId);
    if (course) {
      isEnrolled = course.studentsEnrolled.some(
        (studentId) => studentId.toString() === req.user._id.toString()
      );
      const teacherId = course.teacher._id ? course.teacher._id.toString() : course.teacher.toString();
      isOwner = teacherId === req.user._id.toString() && req.user.role === 'teacher';
      isAdmin = req.user.role === 'admin';
    }
  }

  // Filter video URLs - only show URLs for enrolled students, owners, admins, or preview videos
  // Note: Bunny Stream videos do NOT expose videoUrl - frontend will use bunnyVideoId to generate iframe embed
  const filteredVideos = videos.map((video) => {
    const videoObj = video.toObject();

    // For Bunny Stream videos, do NOT set videoUrl (security: frontend generates iframe from bunnyVideoId)
    // Only set videoUrl for non-Bunny videos (YouTube, Vimeo, direct URLs)
    if (video.bunnyVideoId) {
      // Remove videoUrl for Bunny videos - frontend will use bunnyVideoId
      delete videoObj.videoUrl;
    }

    // Hide video URL if user is not enrolled, not owner, not admin, and video is not a preview
    if (!isEnrolled && !isOwner && !isAdmin && !video.isPreview) {
      delete videoObj.videoUrl;
    }
    return videoObj;
  });

  res.json({
    success: true,
    count: filteredVideos.length,
    data: filteredVideos,
  });
});

/**
 * @desc    Get single video
 * @route   GET /api/videos/:id
 * @access  Private/Student (if enrolled)
 */
export const getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate('course');

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Check if user is enrolled or is the course owner (if authenticated)
  if (req.user) {
    const course = await Course.findById(video.course._id);
    const isEnrolled = course.studentsEnrolled.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );
    // Handle both populated and non-populated teacher field
    const teacherId = course.teacher._id ? course.teacher._id.toString() : course.teacher.toString();
    const isOwner = teacherId === req.user._id.toString() && req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';

    // Admins can access all videos, owners can access their course videos, enrolled students can access videos
    if (!isEnrolled && !isOwner && !isAdmin && !video.isPreview) {
      return res.status(403).json({
        success: false,
        error: 'You must be enrolled in this course to access this video',
      });
    }
  } else if (!video.isPreview) {
    return res.status(401).json({
      success: false,
      error: 'Please login and enroll to access this video',
    });
  }

  // For Bunny Stream videos, do NOT expose videoUrl (security: frontend generates iframe from bunnyVideoId)
  // Only include videoUrl for non-Bunny videos (YouTube, Vimeo, direct URLs)
  const videoData = video.toObject();

  // Remove videoUrl for Bunny videos - frontend will use bunnyVideoId to generate iframe embed
  if (video.bunnyVideoId) {
    delete videoData.videoUrl;
  }

  // Generate stream token for video access
  let streamToken = null;
  if (req.user && !video.isPreview) {
    streamToken = generateVideoToken(video._id.toString(), req.user._id.toString());
  }

  if (streamToken) {
    videoData.streamToken = streamToken;
  }

  res.json({
    success: true,
    data: videoData,
  });
});

/**
 * @desc    Get video stream token
 * @route   GET /api/videos/:id/stream-token
 * @access  Private/Student (if enrolled)
 */
export const getVideoStreamToken = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate('course');

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Check if user is enrolled or is the course owner (if authenticated)
  if (req.user) {
    const course = await Course.findById(video.course._id);
    const isEnrolled = course.studentsEnrolled.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );
    const teacherId = course.teacher._id ? course.teacher._id.toString() : course.teacher.toString();
    const isOwner = teacherId === req.user._id.toString() && req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';

    // Admins can access all videos, owners can access their course videos, enrolled students can access videos
    if (!isEnrolled && !isOwner && !isAdmin && !video.isPreview) {
      return res.status(403).json({
        success: false,
        error: 'You must be enrolled in this course to access this video',
      });
    }

    // Generate stream token
    const streamToken = generateVideoToken(video._id.toString(), req.user._id.toString());

    res.json({
      success: true,
      data: {
        streamToken,
        expiresIn: 3600, // 1 hour in seconds
      },
    });
  } else if (!video.isPreview) {
    return res.status(401).json({
      success: false,
      error: 'Please login and enroll to access this video',
    });
  } else {
    // Preview videos don't need tokens
    res.json({
      success: true,
      data: {
        streamToken: null,
        expiresIn: 0,
      },
    });
  }
});

/**
 * @desc    Create video
 * @route   POST /api/videos
 * @access  Private/Teacher
 */
export const createVideo = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.body.course);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  // Make sure user is course owner or admin
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to add videos to this course',
    });
  }

  // Check if teacher is blocked (if teacher is creating, not admin)
  if (req.user.role === 'teacher' && !req.user.isActive) {
    return res.status(403).json({
      success: false,
      error: 'Your account has been blocked. You cannot upload course content.',
    });
  }

  let videoUrl = req.body.videoUrl || '';
  let bunnyVideoId = req.body.bunnyVideoId || null;

  // Validate bunnyVideoId format if provided
  if (bunnyVideoId && !isValidBunnyVideoId(bunnyVideoId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Bunny video ID format. Expected UUID format (e.g., 12345678-1234-1234-1234-123456789abc)',
    });
  }

  // --- GOOGLE DRIVE VIDEO SUPPORT ---
  // Helper to detect and transform Google Drive URLs
  const processVideoUrl = (url) => {
    if (!url) return { url: '', source: 'external' }; // Default

    let processedUrl = url;
    let source = 'external';

    // Google Drive Detection
    const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([-0-9a-zA-Z_]+)/;
    const driveMatch = url.match(driveRegex);

    if (driveMatch && driveMatch[1]) {
      const fileId = driveMatch[1];
      source = 'drive';
      // Convert to preview URL regardless of input format
      processedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      source = 'youtube';
    } else if (url.includes('vimeo.com')) {
      source = 'vimeo';
    }

    return { url: processedUrl, source };
  };

  let videoSource = 'external';

  // Process videoUrl if provided and not using Bunny
  if (videoUrl && !bunnyVideoId) {
    const processed = processVideoUrl(videoUrl);
    videoUrl = processed.url;
    videoSource = processed.source;
  }

  if (bunnyVideoId) {
    videoSource = 'bunny';
  }


  // If bunnyVideoId is provided from request body, clear videoUrl (security: don't store URLs for Bunny videos)
  if (bunnyVideoId && req.body.bunnyVideoId) {
    videoUrl = '';
  }

  // Handle video upload - Bunny Stream or local file
  if (req.file) {
    // Check if Bunny Stream is enabled
    if (isBunnyStreamEnabled()) {
      try {
        // Read file buffer
        const videoBuffer = fs.readFileSync(req.file.path);

        // Upload to Bunny Stream (returns only videoId, no videoUrl for security)
        const bunnyResult = await uploadVideoToBunny(videoBuffer, req.body.title || 'Untitled Video');

        // Store only bunnyVideoId - do NOT store videoUrl for Bunny videos
        bunnyVideoId = bunnyResult.videoId;
        videoUrl = ''; // Clear videoUrl for Bunny videos

        // Delete local file after successful upload
        fs.unlinkSync(req.file.path);
      } catch (error) {
        // If Bunny Stream fails, fall back to local storage
        console.error('Bunny Stream upload failed, using local storage:', error.message);
        videoUrl = `/uploads/videos/${req.file.filename}`;
        bunnyVideoId = null;

        // If error is critical, return error
        if (error.message.includes('not enabled') || error.message.includes('not properly configured')) {
          return res.status(500).json({
            success: false,
            error: 'Video storage service is not properly configured. Please contact administrator.',
          });
        }
      }
    } else {
      // Bunny Stream not enabled, use local storage
      videoUrl = `/uploads/videos/${req.file.filename}`;
      bunnyVideoId = null;
    }
  } else if (!req.body.videoUrl && !req.body.bunnyVideoId) {
    // No file, no URL, and no Bunny video ID provided
    return res.status(400).json({
      success: false,
      error: 'Please provide either a video file, video URL, or Bunny video ID',
    });
  }

  // Final validation: Ensure either videoUrl or bunnyVideoId is set
  if (!videoUrl && !bunnyVideoId) {
    return res.status(400).json({
      success: false,
      error: 'Either video URL or Bunny video ID must be provided',
    });
  }

  // Create video record
  const video = await Video.create({
    ...req.body,
    videoUrl: videoUrl || '', // Ensure it's at least an empty string for database
    bunnyVideoId,
    videoSource,
  });

  res.status(201).json({
    success: true,
    data: video,
  });
});

/**
 * @desc    Update video
 * @route   PUT /api/videos/:id
 * @access  Private/Teacher
 */
export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate('course');

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Make sure user is course owner or admin
  if (video.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this video',
    });
  }

  let videoUrl = req.body.videoUrl !== undefined ? req.body.videoUrl : video.videoUrl;
  let bunnyVideoId = req.body.bunnyVideoId !== undefined ? req.body.bunnyVideoId : video.bunnyVideoId;

  // Validate bunnyVideoId format if provided
  if (bunnyVideoId && !isValidBunnyVideoId(bunnyVideoId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Bunny video ID format. Expected UUID format (e.g., 12345678-1234-1234-1234-123456789abc)',
    });
  }

  // Handle new file upload
  if (req.file) {
    // Delete old video from Bunny Stream if exists
    if (video.bunnyVideoId && isBunnyStreamEnabled()) {
      try {
        await deleteVideoFromBunny(video.bunnyVideoId);
      } catch (error) {
        console.error('Failed to delete old video from Bunny Stream:', error);
      }
    }

    // Upload new video
    if (isBunnyStreamEnabled()) {
      try {
        const videoBuffer = fs.readFileSync(req.file.path);
        const bunnyResult = await uploadVideoToBunny(videoBuffer, req.body.title || video.title);

        // Store only bunnyVideoId - do NOT store videoUrl for Bunny videos
        bunnyVideoId = bunnyResult.videoId;
        videoUrl = ''; // Clear videoUrl for Bunny videos

        // Delete local file
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Bunny Stream upload failed, using local storage:', error.message);
        videoUrl = `/uploads/videos/${req.file.filename}`;
        bunnyVideoId = null;
      }
    } else {
      videoUrl = `/uploads/videos/${req.file.filename}`;
      bunnyVideoId = null;
    }
  } else {
    // If updating bunnyVideoId from request body, clear videoUrl
    if (req.body.bunnyVideoId && req.body.bunnyVideoId !== video.bunnyVideoId) {
      videoUrl = '';
    }
    // If updating videoUrl from request body, clear bunnyVideoId
    if (req.body.videoUrl && req.body.videoUrl !== video.videoUrl) {
      bunnyVideoId = null;
    }
  }

  // Final validation: Ensure either videoUrl or bunnyVideoId is set
  if (!videoUrl && !bunnyVideoId) {
    return res.status(400).json({
      success: false,
      error: 'Either video URL or Bunny video ID must be provided',
    });
  }

  let videoSource = video.videoSource || 'external';

  // Recalculate source if videoUrl is present and not using Bunny
  if (videoUrl && !bunnyVideoId) {
    const processed = processVideoUrl(videoUrl);
    videoUrl = processed.url;
    videoSource = processed.source;
  }
  if (bunnyVideoId) {
    videoSource = 'bunny';
  }

  // Update video
  const updatedVideo = await Video.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      videoUrl: videoUrl || '', // Ensure it's at least an empty string for database
      bunnyVideoId,
      videoSource,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.json({
    success: true,
    data: updatedVideo,
  });
});

/**
 * @desc    Delete video
 * @route   DELETE /api/videos/:id
 * @access  Private/Teacher
 */
export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate('course');

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Make sure user is course owner or admin
  if (video.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this video',
    });
  }

  // Delete from Bunny Stream if exists
  if (video.bunnyVideoId && isBunnyStreamEnabled()) {
    try {
      await deleteVideoFromBunny(video.bunnyVideoId);
    } catch (error) {
      console.error('Failed to delete video from Bunny Stream:', error);
      // Continue with database deletion even if Bunny Stream deletion fails
    }
  }

  // Delete local file if exists (not from Bunny Stream)
  if (video.videoUrl && video.videoUrl.startsWith('/uploads/') && !video.bunnyVideoId) {
    try {
      const filePath = path.join(__dirname, '..', '..', video.videoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Failed to delete local video file:', error);
    }
  }

  await video.deleteOne();

  res.json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Update video progress
 * @route   PUT /api/videos/:id/progress
 * @access  Private/Student
 */
export const updateVideoProgress = asyncHandler(async (req, res) => {
  const { progress, completed } = req.body;
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Check enrollment - teachers and admins don't need to track progress
  const course = await Course.findById(video.course);
  const teacherId = course.teacher._id ? course.teacher._id.toString() : course.teacher.toString();
  const isOwner = teacherId === req.user._id.toString() && req.user.role === 'teacher';
  const isAdmin = req.user.role === 'admin';

  // If user is teacher (owner) or admin, skip progress tracking
  if (isOwner || isAdmin) {
    return res.json({
      success: true,
      message: 'Progress tracking skipped for course owner/admin',
      data: {},
    });
  }

  // For students, check enrollment
  if (!course.studentsEnrolled.includes(req.user._id)) {
    return res.status(403).json({
      success: false,
      error: 'You must be enrolled in this course',
    });
  }

  // Update or create progress
  let courseProgress = await Progress.findOne({
    student: req.user._id,
    course: video.course,
  });

  if (!courseProgress) {
    courseProgress = await Progress.create({
      student: req.user._id,
      course: video.course,
      videosWatched: [],
    });
  }

  // Update video progress
  const videoIndex = courseProgress.videosWatched.findIndex(
    (v) => v.video.toString() === video._id.toString()
  );

  if (videoIndex >= 0) {
    courseProgress.videosWatched[videoIndex].progress = progress || 0;
    courseProgress.videosWatched[videoIndex].completed = completed || false;
    if (completed) {
      courseProgress.videosWatched[videoIndex].watchedAt = new Date();
    }
  } else {
    courseProgress.videosWatched.push({
      video: video._id,
      progress: progress || 0,
      completed: completed || false,
      watchedAt: completed ? new Date() : null,
    });
  }

  // Calculate completion percentage
  const totalVideos = await Video.countDocuments({ course: video.course, isActive: true });
  const completedVideos = courseProgress.videosWatched.filter((v) => v.completed).length;
  courseProgress.completionPercentage = Math.round((completedVideos / totalVideos) * 100);
  courseProgress.lastAccessed = new Date();

  await courseProgress.save();

  res.json({
    success: true,
    data: courseProgress,
  });
});

