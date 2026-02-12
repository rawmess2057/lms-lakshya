import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import useScrollAnimation from '../hooks/useScrollAnimation';

const HighlightsCarousel = () => {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    fetchHighlights();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchHighlights, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHighlights = async () => {
    try {
      const response = await axiosInstance.get('/highlights');
      // Handle both response.data.data and response.data as fallback
      const highlightsData = response?.data?.data || response?.data || [];
      // Filter out invalid items and ensure we have valid highlights with titles
      const validHighlights = Array.isArray(highlightsData)
        ? highlightsData.filter(item => item && item._id && item.title)
        : [];
      setHighlights(validHighlights);
    } catch (error) {
      console.error('Failed to fetch highlights:', error);
      setHighlights([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    const container = document.getElementById('highlights-carousel');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('highlights-carousel');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleClick = (highlight) => {
    if (highlight.link) {
      if (highlight.link.startsWith('http')) {
        window.open(highlight.link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = highlight.link;
      }
    }
  };

  // CRITICAL: Do not render anything if loading, no highlights, or highlights array is invalid
  if (loading || !Array.isArray(highlights) || highlights.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="py-12 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-8 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Featured Highlights
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our latest updates, achievements, and special announcements
          </p>
        </div>

        <div className="relative">
          {/* Scroll Buttons */}
          {highlights.length > 3 && (
            <>
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-700"
                aria-label="Scroll left"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-700"
                aria-label="Scroll right"
              >
                <FiArrowRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </>
          )}

          {/* Carousel Container */}
          <div
            id="highlights-carousel"
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {highlights.map((highlight, index) => (
              <div
                key={highlight._id}
                onClick={() => handleClick(highlight)}
                className={`flex-shrink-0 w-64 md:w-72 snap-start group cursor-pointer transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {/* Circular Card */}
                <div className="relative w-64 md:w-72 h-64 md:h-72 rounded-full bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-100 dark:from-primary-900 dark:via-primary-800 dark:to-secondary-900 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-4 border-white dark:border-gray-700">
                  {/* Image or Icon */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    {highlight.image ? (
                      <img
                        src={highlight.image}
                        alt={highlight.title}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : highlight.icon ? (
                      <img
                        src={highlight.icon}
                        alt={highlight.title}
                        className="w-32 h-32 object-contain"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary-700 dark:text-primary-300">
                          {highlight.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Overlay with Title */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6 rounded-full">
                    <div className="text-white">
                      <h3 className="text-lg font-bold mb-1 line-clamp-2 group-hover:text-primary-200 transition-colors">
                        {highlight.title}
                      </h3>
                      {highlight.link && (
                        <div className="flex items-center text-sm text-white/80 group-hover:text-white transition-colors">
                          <span>Learn more</span>
                          <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/10 transition-all duration-300 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default HighlightsCarousel;

