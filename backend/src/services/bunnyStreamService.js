/**
 * Bunny Stream Service
 * Handles video upload, retrieval, and deletion from Bunny Stream using REST API
 * Documentation: https://docs.bunny.net/reference/bunny-stream-api-overview
 */

import axios from 'axios';

/**
 * Check if Bunny Stream is enabled and configured
 */
export const isBunnyStreamEnabled = () => {
  return (
    process.env.BUNNY_STREAM_ENABLED === 'true' &&
    process.env.BUNNY_STREAM_API_KEY &&
    process.env.BUNNY_STREAM_LIBRARY_ID &&
    process.env.BUNNY_STREAM_HOSTNAME
  );
};

/**
 * Get Bunny Stream API base URL
 */
const getBunnyApiUrl = () => {
  return `https://video.bunnycdn.com/library/${process.env.BUNNY_STREAM_LIBRARY_ID}`;
};

/**
 * Get Bunny Stream API headers
 */
const getBunnyHeaders = () => {
  return {
    'AccessKey': process.env.BUNNY_STREAM_API_KEY,
    'Content-Type': 'application/json',
  };
};

/**
 * Upload video to Bunny Stream
 * @param {Buffer} videoBuffer - Video file buffer
 * @param {String} videoTitle - Title for the video
 * @returns {Promise<Object>} Video object with videoId and metadata (NO direct URLs)
 */
export const uploadVideoToBunny = async (videoBuffer, videoTitle) => {
  if (!isBunnyStreamEnabled()) {
    throw new Error('Bunny Stream is not enabled or not properly configured');
  }

  try {
    // Step 1: Create video in Bunny Stream
    const createResponse = await axios.post(
      `${getBunnyApiUrl()}/videos`,
      {
        title: videoTitle || 'Untitled Video',
      },
      {
        headers: getBunnyHeaders(),
      }
    );

    const videoId = createResponse.data.guid;
    console.log(`✅ Created video in Bunny Stream: ${videoId}`);

    // Step 2: Upload video file
    // Bunny Stream accepts direct file upload via PUT request
    await axios.put(
      `${getBunnyApiUrl()}/videos/${videoId}`,
      videoBuffer,
      {
        headers: {
          'AccessKey': process.env.BUNNY_STREAM_API_KEY,
          'Content-Type': 'application/octet-stream',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 300000, // 5 minutes timeout for large files
      }
    );

    console.log(`✅ Uploaded video file to Bunny Stream: ${videoId}`);

    // Step 3: Get video details to return (metadata only, no direct URLs)
    const videoDetails = await getVideoFromBunny(videoId);

    return {
      videoId: videoId,
      thumbnailUrl: videoDetails.thumbnailUrl,
      status: videoDetails.status,
      duration: videoDetails.duration || 0,
    };
  } catch (error) {
    console.error('Bunny Stream upload error:', error.response?.data || error.message);
    throw new Error(`Failed to upload video to Bunny Stream: ${error.response?.data?.Message || error.message}`);
  }
};

/**
 * Get video details from Bunny Stream
 * @param {String} videoId - Bunny Stream video GUID
 * @returns {Promise<Object>} Video metadata (NO direct video URLs for security)
 */
export const getVideoFromBunny = async (videoId) => {
  if (!isBunnyStreamEnabled()) {
    throw new Error('Bunny Stream is not enabled');
  }

  try {
    const response = await axios.get(
      `${getBunnyApiUrl()}/videos/${videoId}`,
      {
        headers: getBunnyHeaders(),
      }
    );

    const video = response.data;
    const hostname = process.env.BUNNY_STREAM_HOSTNAME;

    // Return only metadata - NO direct video URLs for security
    // Frontend will generate iframe embed URL using videoId
    return {
      videoId: video.guid,
      thumbnailUrl: video.thumbnailFileName 
        ? `https://${hostname}/${videoId}/${video.thumbnailFileName}`
        : null,
      status: video.status || 'Processing',
      duration: video.length || 0,
    };
  } catch (error) {
    console.error('Bunny Stream get video error:', error.response?.data || error.message);
    throw new Error(`Failed to get video from Bunny Stream: ${error.response?.data?.Message || error.message}`);
  }
};

/**
 * Delete video from Bunny Stream
 * @param {String} videoId - Bunny Stream video GUID
 */
export const deleteVideoFromBunny = async (videoId) => {
  if (!isBunnyStreamEnabled()) {
    return; // Silently return if not enabled
  }

  try {
    await axios.delete(
      `${getBunnyApiUrl()}/videos/${videoId}`,
      {
        headers: getBunnyHeaders(),
      }
    );
    console.log(`✅ Deleted video from Bunny Stream: ${videoId}`);
  } catch (error) {
    console.error('Bunny Stream delete error:', error.response?.data || error.message);
    // Don't throw - deletion failure shouldn't block video removal from DB
  }
};

/**
 * TODO: Token Authentication for Bunny Stream
 * 
 * Future enhancement: Generate secure tokens for video access
 * This will allow time-limited, user-specific access to videos
 * 
 * Structure placeholder:
 * - generateVideoToken(videoId, userId, expiresIn) - Generate JWT-like token
 * - validateVideoToken(token) - Validate and extract token data
 * - Token should include: videoId, userId, expiration timestamp
 * 
 * Implementation will be added when token authentication is required
 */

export default {
  uploadVideoToBunny,
  getVideoFromBunny,
  deleteVideoFromBunny,
  isBunnyStreamEnabled,
};
