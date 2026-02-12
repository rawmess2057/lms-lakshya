import { useState, useEffect } from 'react';

/**
 * BunnyPlayer Component
 * Secure iframe embed for Bunny Stream videos
 * 
 * @param {string} videoId - Bunny Stream video GUID
 * @param {object} props - Additional props (className, style, etc.)
 */
const BunnyPlayer = ({ videoId, ...props }) => {
  const [libraryId, setLibraryId] = useState(null);
  const [error, setError] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Get library ID from environment variable
    const libId = import.meta.env.VITE_BUNNY_STREAM_LIBRARY_ID;
    
    if (!libId) {
      setError('Bunny Stream is not configured. Please contact administrator.');
      setIsConfigured(false);
      console.error('VITE_BUNNY_STREAM_LIBRARY_ID is not set in environment variables');
      return;
    }

    if (!videoId) {
      setError('Video ID is required');
      setIsConfigured(false);
      return;
    }

    // Validate videoId format - Bunny Stream IDs can be UUID or other formats
    // Allow UUID format or alphanumeric strings (Bunny Stream accepts various formats)
    const trimmedId = videoId.trim();
    if (trimmedId.length < 10 || trimmedId.length > 100) {
      setError('Invalid video ID format');
      setIsConfigured(false);
      return;
    }

    setLibraryId(libId);
    setIsConfigured(true);
    setError(null);
  }, [videoId]);

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg flex items-center justify-center aspect-video">
        <div className="text-center text-white p-4">
          <p className="text-red-400 mb-2">Error loading video</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!libraryId || !videoId) {
    return (
      <div className="bg-gray-900 rounded-lg flex items-center justify-center aspect-video">
        <div className="text-center text-white">
          <p className="text-gray-400">Loading video player...</p>
        </div>
      </div>
    );
  }

  // Generate secure iframe embed URL
  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;

  return (
    <div 
      className="relative w-full bg-black rounded-lg overflow-hidden"
      style={{ aspectRatio: '16/9' }}
      {...props}
    >
      <iframe
        src={embedUrl}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full border-0"
        title="Bunny Stream Video Player"
        loading="lazy"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default BunnyPlayer;

