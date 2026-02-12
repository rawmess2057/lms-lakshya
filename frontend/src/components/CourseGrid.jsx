import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiUser } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import useScrollAnimation from '../hooks/useScrollAnimation';
import CourseThumbnail from './CourseThumbnail';

const CourseGrid = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/courses?isPublished=true&limit=12');

      // Handle both response.data.data and response.data as fallback
      const coursesData = response?.data?.data || response?.data || [];

      // Debug: Log what we received (remove in production if needed)
      console.log('Courses API response:', {
        rawData: coursesData,
        dataLength: Array.isArray(coursesData) ? coursesData.length : 0,
        firstItem: Array.isArray(coursesData) && coursesData.length > 0 ? coursesData[0] : null
      });

      // Filter out invalid items and ensure we have valid courses with titles
      const validCourses = Array.isArray(coursesData)
        ? coursesData.filter(item => {
          const isValid = item && item._id && item.title && item.title.trim() !== '';
          if (!isValid && item) {
            console.log('Filtered out invalid course:', item);
          }
          return isValid;
        })
        : [];

      console.log('Valid courses after filtering:', validCourses.length);
      setCourses(validCourses);
    } catch (error) {
      // Log error for debugging
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // CRITICAL: Early return - Do not render ANY wrapper, section, or container if no valid courses
  // Check loading state first - component must not render while loading
  if (loading) {
    return null;
  }

  // Check if courses array exists and has valid items
  // Must check array type AND length to prevent rendering empty sections
  // If no valid courses, return null immediately - no section wrapper should be created
  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    return null;
  }

  // Only render section if we have valid courses with length > 0
  // At this point, courses array is guaranteed to have items
  return (
    <section ref={ref} className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className={`flex justify-between items-center mb-8 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Explore Our Courses
          </h2>
          <Link to="/courses" className="btn-outline">
            View All Courses
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <Link
              key={course._id}
              to={`/courses/${course._id}`}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 flex flex-col h-full"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                transition: `opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms`
              }}
            >
              {/* Thumbnail Container - Fixed Height */}
              <div className="relative w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                <CourseThumbnail
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <FiBook className="w-16 h-16 text-gray-400 dark:text-gray-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                    </div>
                  }
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content Container - Flex grow to fill space */}
              <div className="flex flex-col flex-grow p-5">
                {/* Title - No fixed height */}
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {course.description || 'No description available'}
                </p>

                {/* Duration - Show if exists */}
                {course.duration && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    Duration: {course.duration} {course.duration === 1 ? 'hour' : 'hours'}
                  </p>
                )}

                {/* Footer - Fixed at bottom */}
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 font-bold text-lg">
                      <span>{course.price ? course.price.toLocaleString() : '0'}</span>
                      <span className="text-sm font-normal">PKR</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-200">
                      <FiUser className="w-4 h-4" />
                      <span className="truncate max-w-[100px]">{course.teacher?.name || 'Instructor'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseGrid;

