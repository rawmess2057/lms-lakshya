import { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize, FiInfo } from 'react-icons/fi';
import BunnyPlayer from './BunnyPlayer';
import { getVideoSource, getEmbedUrl } from '../utils/mediaHelpers';

/**
 * Enhanced Intro Video Player Component
 * User-friendly video player with better controls and interface
 * Supports: YouTube, Vimeo, direct video URLs, and Bunny Stream videos
 */
const IntroVideoPlayer = ({
  videoUrl,
  bunnyVideoId,
  title,
  description,
  showInfo = true,
  autoPlay = false
}) => {
  const [playing, setPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const playerRef = useRef(null);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleMute = () => {
    setMuted(!muted);
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat(e.target.value));
    }
  };

  const handleFullscreen = () => {
    if (!fullscreen) {
      const player = document.querySelector('.intro-video-container');
      if (player.requestFullscreen) {
        player.requestFullscreen();
      } else if (player.webkitRequestFullscreen) {
        player.webkitRequestFullscreen();
      } else if (player.mozRequestFullScreen) {
        player.mozRequestFullScreen();
      }
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      setFullscreen(false);
    }
  };

  // Use provided video URL or fallback to a default playable video
  // Supports: YouTube, Vimeo, direct MP4/WebM URLs, AWS S3, and Bunny Stream
  const displayUrl = videoUrl || 'https://www.youtube.com/watch?v=jNQXAC9IVRw'; // Default playable video
  const source = getVideoSource(displayUrl);
  const embedUrl = getEmbedUrl(displayUrl);

  return (
    <div className="intro-video-container bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
      {/* Video Player */}
      <div className="relative bg-black aspect-video">
        {/* Conditional rendering based on video source */}
        {(() => {
          // 1. Priority: Direct Bunny Video ID prop
          if (bunnyVideoId) {
            const bunnyLibraryId = import.meta.env.VITE_BUNNY_STREAM_LIBRARY_ID;
            if (!bunnyLibraryId) {
              if (videoUrl) {
                // Fallback to URL player if Bunny ID exists but env is missing
                // This falls through to the URL-based rendering below?
                // No, we need to return something here or let it fall through.
                // The cleanest way is to just let it proceed to URL logic if we want fallback,
                // BUT the original code showed a specific error message.
                // Let's preserve the error message if NO videoUrl is present, or fallback if present.
                // Actually, if we're here, we return nothing and let the next block run?
                // No, IIFE must return the element.
              } else {
                return (
                  <div className="bg-gray-900 rounded-lg flex items-center justify-center aspect-video">
                    <div className="text-center text-white p-6 max-w-md">
                      <p className="text-red-400 mb-2 font-semibold">Video Player Not Configured</p>
                      <p className="text-sm text-gray-400">
                        Bunny Stream is not configured.
                      </p>
                    </div>
                  </div>
                );
              }
            } else {
              return <BunnyPlayer videoId={bunnyVideoId} />;
            }
          }

          // 2. Google Drive Handling (iframe)
          if (source === 'drive') {
            return (
              <iframe
                src={embedUrl}
                className="w-full h-full absolute top-0 left-0 border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Course Preview"
              />
            );
          }

          // 3. Bunny Stream URL Handling (iframe)
          if (source === 'bunny') {
            return (
              <iframe
                src={embedUrl}
                className="w-full h-full absolute top-0 left-0 border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
                title="Bunny Stream Video"
              />
            );
          }

          // 4. Default / YouTube / Vimeo / Direct File (ReactPlayer)
          return (
            <ReactPlayer
              ref={playerRef}
              url={displayUrl}
              width="100%"
              height="100%"
              playing={playing}
              volume={volume}
              muted={muted}
              onProgress={handleProgress}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              config={{
                youtube: {
                  playerVars: {
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                  },
                },
                vimeo: {
                  playerOptions: {
                    controls: false,
                    responsive: true,
                  },
                },
              }}
            />
          );
        })()}

        {/* Custom Controls Overlay - Only show for ReactPlayer supported videos (YouTube, Direct) */}
        {!bunnyVideoId && source !== 'drive' && source !== 'bunny' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={played}
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${played * 100}%, #4b5563 ${played * 100}%, #4b5563 100%)`,
                }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-primary-400 transition-colors p-2 rounded-full hover:bg-white/10"
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  {playing ? (
                    <FiPause className="w-6 h-6" />
                  ) : (
                    <FiPlay className="w-6 h-6" />
                  )}
                </button>

                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMute}
                    className="text-white hover:text-primary-400 transition-colors p-2 rounded-full hover:bg-white/10"
                    aria-label={muted ? 'Unmute' : 'Mute'}
                  >
                    {muted ? (
                      <FiVolumeX className="w-5 h-5" />
                    ) : (
                      <FiVolume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Time Display */}
                <span className="text-white text-sm">
                  {Math.floor(played * 100)}%
                </span>
              </div>

              {/* Right Side Controls */}
              <div className="flex items-center space-x-2">
                {/* Fullscreen */}
                <button
                  onClick={handleFullscreen}
                  className="text-white hover:text-primary-400 transition-colors p-2 rounded-full hover:bg-white/10"
                  aria-label="Fullscreen"
                >
                  {fullscreen ? (
                    <FiMinimize className="w-5 h-5" />
                  ) : (
                    <FiMaximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Info Section */}
      {showInfo && (title || description) && (
        <div className="p-6 bg-white dark:bg-gray-800">
          {title && (
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Info Banner - Only show if no video URL is provided at all */}
      {!videoUrl && !displayUrl.includes('youtube.com') && !displayUrl.includes('vimeo.com') && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 m-4 rounded">
          <div className="flex items-start">
            <FiInfo className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This is a default video. To add your actual platform introduction video,
                upload it to YouTube, Vimeo, or your hosting service, then update it in the admin panel.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroVideoPlayer;

