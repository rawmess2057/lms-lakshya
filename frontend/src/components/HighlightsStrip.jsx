import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { FiArrowRight } from 'react-icons/fi';
import useScrollAnimation from '../hooks/useScrollAnimation';

const HighlightsStrip = () => {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    fetchHighlights();
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
      // Silently fail - don't show highlights if API fails
      console.error('Failed to fetch highlights:', error);
      setHighlights([]);
    } finally {
      setLoading(false);
    }
  };

  // CRITICAL: Do not render anything if loading, no highlights, or highlights array is invalid
  if (loading || !Array.isArray(highlights) || highlights.length === 0) {
    return null;
  }

  const handleClick = (highlight) => {
    if (highlight.link) {
      // If link is external (starts with http), open in new tab
      if (highlight.link.startsWith('http')) {
        window.open(highlight.link, '_blank', 'noopener,noreferrer');
      } else {
        // Internal link - use React Router
        window.location.href = highlight.link;
      }
    }
  };

  return (
    <section ref={ref} className={`py-6 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-200 dark:border-primary-800 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center overflow-x-auto scrollbar-hide pb-2 scroll-smooth snap-x snap-mandatory">
          <div className="flex space-x-4 min-w-max">
            {highlights.map((highlight, index) => (
              <div
                key={highlight._id}
                onClick={() => handleClick(highlight)}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105 hover:-translate-y-1 snap-start group ${
                  highlight.link ? 'cursor-pointer' : ''
                } min-w-[200px] flex-shrink-0`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 0.3s ease-out ${index * 50}ms, transform 0.3s ease-out ${index * 50}ms`
                }}
              >
                {highlight.image ? (
                  <img
                    src={highlight.image}
                    alt={highlight.title}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : highlight.icon ? (
                  <img
                    src={highlight.icon}
                    alt={highlight.title}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                      {highlight.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {highlight.title}
                  </p>
                </div>
                {highlight.link && (
                  <FiArrowRight className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default HighlightsStrip;

