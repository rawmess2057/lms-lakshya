import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiUser, FiLogOut, FiMenu, FiX, FiInstagram, FiFacebook } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import WhatsAppButton from './WhatsAppButton';

const Layout = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [socialMedia, setSocialMedia] = useState({
    instagram: '',
    facebook: '',
    tiktok: '',
  });

  useEffect(() => {
    fetchSocialMedia();
  }, []);

  const fetchSocialMedia = async () => {
    try {
      const response = await axiosInstance.get('/social-media');
      if (response.data.data) {
        setSocialMedia(response.data.data);
      }
    } catch (error) {
      // Silently fail - social media is optional
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-primary-800 shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Lakshya Academy
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 group px-2"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                to="/courses"
                className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 group px-2"
              >
                Courses
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                to="/about-us"
                className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 group px-2"
              >
                About Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                to="/contact-us"
                className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 group px-2"
              >
                Contact Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                to="/faqs"
                className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 group px-2"
              >
                FAQs
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 group px-2"
                  >
                    Dashboard
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 ease-out group-hover:w-full"></span>
                  </Link>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <FiUser className="text-gray-700 dark:text-gray-300 transition-transform duration-150 hover:scale-110" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {user?.name}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-105"
                    >
                      <FiLogOut className="transition-transform duration-150" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 group px-2"
                  >
                    Login
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 ease-out group-hover:w-full"></span>
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FiSun className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform duration-300 hover:rotate-180" />
                ) : (
                  <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform duration-300 hover:rotate-12" />
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 active:scale-95"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6 transition-transform duration-200 rotate-90" />
              ) : (
                <FiMenu className="w-6 h-6 transition-transform duration-200" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-4 pb-4 animate-slide-up">
              <Link
                to="/"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/courses"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link
                to="/about-us"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/contact-us"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
              <Link
                to="/faqs"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQs
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <FiUser />
                    <span>{user?.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <button
                onClick={toggleDarkMode}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
              >
                {darkMode ? <FiSun /> : <FiMoon />}
                <span>Toggle Theme</span>
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-800 to-gray-900 dark:from-primary-950 dark:to-primary-900 text-white border-t border-gray-700 dark:border-primary-700 mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* About Section */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-bold mb-4 text-white">Lakshya Academy</h3>
              <p className="text-gray-300 leading-relaxed">
                Empowering students and teachers with the best online learning experience.
              </p>
            </div>

            {/* Quick Links Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/courses" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    Courses
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about-us" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact-us" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/faqs" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/data-policy" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/terms-and-conditions" 
                    className="text-gray-300 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-300 mb-1">Email</p>
                  <a 
                    href="mailto:lakshyaacademi@gmail.com" 
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200 inline-block hover:underline"
                  >
                    lakshyaacademi@gmail.com
                  </a>
                </div>
                <div>
                  <p className="text-gray-300 mb-1">WhatsApp</p>
                  <a 
                    href="https://wa.me/9779846828659" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 transition-colors duration-200 inline-block hover:underline"
                  >
                    +977 9846828659
                  </a>
                </div>
                {(socialMedia.instagram || socialMedia.facebook || socialMedia.tiktok) && (
                  <div className="pt-2">
                    <h4 className="text-sm font-semibold mb-3 text-gray-300">Follow Us</h4>
                    <div className="flex space-x-4">
                      {socialMedia.instagram && (
                        <a
                          href={socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-pink-500 transition-all duration-300 hover:scale-110 transform"
                          aria-label="Instagram"
                        >
                          <FiInstagram className="w-6 h-6" />
                        </a>
                      )}
                      {socialMedia.facebook && (
                        <a
                          href={socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-500 transition-all duration-300 hover:scale-110 transform"
                          aria-label="Facebook"
                        >
                          <FiFacebook className="w-6 h-6" />
                        </a>
                      )}
                      {socialMedia.tiktok && (
                        <a
                          href={socialMedia.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-black dark:hover:text-white transition-all duration-300 hover:scale-110 transform"
                          aria-label="TikTok"
                        >
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Copyright Section */}
          <div className="border-t border-gray-700 dark:border-primary-700 mt-10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Lakshya Academy. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs">
                Empowering education through technology
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

