import { useEffect, useState } from 'react';
import { FiUser, FiAward, FiBook, FiLinkedin, FiTwitter, FiGlobe } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import useScrollAnimation from '../hooks/useScrollAnimation';

const TeachersSection = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    fetchTeachers();
    // Poll for updates every 30 seconds to make it dynamic
    const interval = setInterval(fetchTeachers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axiosInstance.get('/teacher-profiles?featured=true');
      // Handle both response.data.data and response.data as fallback
      const teachersData = response?.data?.data || response?.data || [];
      // Filter out invalid items and ensure we have valid teachers with required fields
      const validTeachers = Array.isArray(teachersData)
        ? teachersData.filter(item => item && item._id && item.name && item.specialization)
        : [];
      setTeachers(validTeachers);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // CRITICAL: Do not render anything if loading, no teachers, or teachers array is invalid
  if (loading || !Array.isArray(teachers) || teachers.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Meet Our Expert Teachers
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Learn from experienced educators dedicated to your success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teachers.map((teacher, index) => (
            <div
              key={teacher._id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                transition: `opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms`
              }}
            >
              {/* Profile Picture */}
              <div className="relative w-full h-64 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 overflow-hidden">
                {teacher.profilePicture ? (
                  <img
                    src={teacher.profilePicture}
                    alt={teacher.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiUser className="w-24 h-24 text-gray-400 dark:text-gray-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                  {teacher.name}
                </h3>
                
                <div className="flex items-center space-x-2 mb-3">
                  <FiBook className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {teacher.specialization}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <FiAward className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {teacher.experience} {teacher.experience === 1 ? 'Year' : 'Years'} Experience
                  </span>
                </div>

                {teacher.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {teacher.bio}
                  </p>
                )}

                {teacher.qualifications && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Education:</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                      {teacher.qualifications}
                    </p>
                  </div>
                )}

                {/* Social Links */}
                {(teacher.socialLinks?.linkedin || teacher.socialLinks?.twitter || teacher.socialLinks?.website) && (
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {teacher.socialLinks.linkedin && (
                      <a
                        href={teacher.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        aria-label="LinkedIn"
                      >
                        <FiLinkedin className="w-5 h-5" />
                      </a>
                    )}
                    {teacher.socialLinks.twitter && (
                      <a
                        href={teacher.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                        aria-label="Twitter"
                      >
                        <FiTwitter className="w-5 h-5" />
                      </a>
                    )}
                    {teacher.socialLinks.website && (
                      <a
                        href={teacher.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                        aria-label="Website"
                      >
                        <FiGlobe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeachersSection;

