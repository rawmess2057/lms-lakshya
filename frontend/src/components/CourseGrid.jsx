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

      const coursesData = response?.data?.data || response?.data || [];

      const validCourses = Array.isArray(coursesData)
        ? coursesData.filter(item => {
          const isValid = item && item._id && item.title && item.title.trim() !== '';
          if (!isValid && item) {
            console.log('Filtered out invalid course:', item);
          }
          return isValid;
        })
        : [];

      setCourses(validCourses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900 dark:via-primary-950 dark:to-primary-900">
      <div className="container mx-auto px-4">
        <div className={`flex flex-col md:flex-row justify-between items-center mb-12 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Explore Our Courses
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Start your learning journey today</p>
          </div>
          <Link to="/courses" className="btn-primary mt-4 md:mt-0">
            View All Courses
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <Link
              key={course._id}
              to={`/courses/${course._id}`}
              className="group glass-card rounded-2xl overflow-hidden flex flex-col h-full"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                transition: `opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms`
              }}
            >
              <div className="relative w-full h-48 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-800 dark:to-primary-900 overflow-hidden">
                <CourseThumbnail
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <FiBook className="w-16 h-16 text-primary-400 dark:text-primary-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                    </div>
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="flex flex-col flex-grow p-5">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-secondary-400 transition-colors duration-200">
                  {course.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {course.description || 'No description available'}
                </p>

                {course.duration && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    Duration: {course.duration} {course.duration === 1 ? 'hour' : 'hours'}
                  </p>
                )}

                <div className="mt-auto pt-4 border-t border-white/20 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-primary-600 dark:text-secondary-400 font-bold text-lg">
                      <span>{course.price ? course.price.toLocaleString() : '0'}</span>
                      <span className="text-sm font-normal">NPR</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-200">
                      <FiUser className="w-4 h-4" />
                      <span className="truncate max-w-[100px]">{course.teacher?.name || 'Instructor'}</span>
                    </div>
                  </div>
                </div>
              </div>

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
