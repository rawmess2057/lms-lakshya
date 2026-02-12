import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiUsers, FiAward, FiVideo, FiCheckCircle, FiPlay } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import IntroVideoPlayer from '../components/IntroVideoPlayer';
import CostComparison from '../components/CostComparison';
import CounsellingForm from '../components/CounsellingForm';
import FAQsPreview from '../components/FAQsPreview';
import useScrollAnimation from '../hooks/useScrollAnimation';

const LandingPage = () => {
  const [introVideo, setIntroVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Scroll animations for sections
  const [heroRef, heroVisible] = useScrollAnimation({ threshold: 0.1 });
  const [featuresRef, featuresVisible] = useScrollAnimation({ threshold: 0.1 });
  const [howItWorksRef, howItWorksVisible] = useScrollAnimation({ threshold: 0.1 });
  const [counsellingRef, counsellingVisible] = useScrollAnimation({ threshold: 0.1 });
  const [ctaRef, ctaVisible] = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    fetchIntroVideo();
  }, []);

  const fetchIntroVideo = async () => {
    try {
      const response = await axiosInstance.get('/intro-videos/global');
      if (response.data.data) {
        setIntroVideo(response.data.data);
      } else {
        // Always show a default video if none exists in database
        setIntroVideo({
          title: 'Welcome to Multan Academy - Platform Introduction',
          description: 'Learn how to navigate and use Multan Academy. This video will guide you through all the features including course browsing, enrollment, video watching, quizzes, assignments, and certificate generation.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Default playable video
        });
      }
    } catch (error) {
      // If API fails, still show a default video
      setIntroVideo({
        title: 'Welcome to Multan Academy - Platform Introduction',
        description: 'Learn how to navigate and use our online learning platform. This video will guide you through all the features including course browsing, enrollment, video watching, quizzes, assignments, and certificate generation.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Default playable video
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section ref={heroRef} className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white py-20 md:py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-700 ease-out ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {/* Title with staggered animation */}
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-100"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s'
              }}
            >
              Multan Academy
            </h1>

            {/* Description with staggered animation */}
            <p 
              className="text-lg md:text-xl mb-4 text-primary-100 font-medium"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(15px)',
                transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s'
              }}
            >
              Empowering students and educators through high-quality online education.
            </p>
            <p 
              className="text-base md:text-lg mb-8 text-primary-100 max-w-2xl mx-auto"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(15px)',
                transition: 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s'
              }}
            >
              We focus on skilled-based learning, practical knowledge, and academic excellence to help learners succeed in today's digital world.
            </p>

            {/* Primary CTA Buttons with staggered animation */}
            <div 
              className="flex flex-wrap justify-center gap-4 mb-6"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s ease-out 0.8s, transform 0.8s ease-out 0.8s'
              }}
            >
              <Link 
                to="/signup" 
                className="group relative px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 transform"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Get Started</span>
                  <FiCheckCircle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
              </Link>
              <Link 
                to="/courses" 
                className="group relative px-8 py-4 border-2 border-white text-white font-semibold rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white hover:text-primary-600 transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl transform"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <FiBook className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Browse Courses</span>
                </span>
              </Link>
              <Link 
                to="/intro-video/global" 
                className="group relative px-8 py-4 border-2 border-white text-white font-semibold rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white hover:text-primary-600 transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl transform flex items-center space-x-2"
              >
                <FiPlay className="w-5 h-5 transition-transform duration-300 group-hover:scale-125" />
                <span>Watch Intro</span>
              </Link>
            </div>

            {/* Login Buttons - Highlighted with enhanced animations */}
            <div 
              className="flex flex-wrap justify-center items-center gap-4 mt-8"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s ease-out 1s, transform 0.8s ease-out 1s'
              }}
            >
              <div className="text-primary-100 text-sm font-medium hidden sm:block">Already have an account?</div>
              <Link 
                to="/login/student" 
                className="group relative px-6 py-3 bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-lg text-white font-bold text-sm transition-all duration-300 ease-out hover:bg-white hover:text-primary-600 hover:border-white hover:scale-110 hover:shadow-2xl transform hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <FiUsers className="w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                  <span>Student Login</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
              </Link>
              <span className="text-primary-100 text-xl font-bold hidden sm:block">|</span>
              <Link 
                to="/login/teacher" 
                className="group relative px-6 py-3 bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-lg text-white font-bold text-sm transition-all duration-300 ease-out hover:bg-white hover:text-primary-600 hover:border-white hover:scale-110 hover:shadow-2xl transform hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <FiBook className="w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                  <span>Teacher Login</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Intro Video Section - Always Visible */}
      <section className="py-16 bg-white dark:bg-gray-800 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-4">
              <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full text-sm font-semibold mb-4">
                Free Preview
              </span>
            </div>
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              {introVideo?.title || 'Platform Introduction'}
            </h2>
            {introVideo?.description && (
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                {introVideo.description}
              </p>
            )}
            {loading ? (
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-video flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Loading intro video...</div>
              </div>
            ) : (
              <>
                <IntroVideoPlayer
                  videoUrl={introVideo?.videoUrl}
                  bunnyVideoId={introVideo?.bunnyVideoId}
                  title={introVideo?.title}
                  description={introVideo?.description}
                  showInfo={false}
                  autoPlay={false}
                />
                <div className="text-center mt-4">
                  <Link
                    to={`/intro-video/global`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors"
                  >
                    Watch Full Video <FiPlay className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white transition-all duration-500 ${featuresVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`card text-center transition-all duration-500 ${featuresVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: featuresVisible ? '0ms' : '0ms' }}>
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-200 hover:scale-110">
                <FiVideo className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Video Lectures
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access high-quality video lectures from expert teachers
              </p>
            </div>
            <div className={`card text-center transition-all duration-500 ${featuresVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: featuresVisible ? '100ms' : '0ms' }}>
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-200 hover:scale-110">
                <FiBook className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Interactive Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Engage with quizzes, assignments, and track your progress
              </p>
            </div>
            <div className={`card text-center transition-all duration-500 ${featuresVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: featuresVisible ? '200ms' : '0ms' }}>
              <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-200 hover:scale-110">
                <FiAward className="w-8 h-8 text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Certificates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Earn certificates upon course completion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Comparison Section */}
      <CostComparison />


      {/* How It Works */}
      <section ref={howItWorksRef} className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white transition-all duration-500 ${howItWorksVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className={`text-center transition-all duration-500 ${howItWorksVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: howItWorksVisible ? '0ms' : '0ms' }}>
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Sign Up</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create your free account
                </p>
              </div>
              <div className={`text-center transition-all duration-500 ${howItWorksVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: howItWorksVisible ? '100ms' : '0ms' }}>
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Browse Courses</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore our course catalog
                </p>
              </div>
              <div className={`text-center transition-all duration-500 ${howItWorksVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: howItWorksVisible ? '200ms' : '0ms' }}>
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Enroll & Learn</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Purchase and start learning
                </p>
              </div>
              <div className={`text-center transition-all duration-500 ${howItWorksVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: howItWorksVisible ? '300ms' : '0ms' }}>
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Get Certified</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete and earn certificates
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Preview Section */}
      <FAQsPreview />

      {/* Free Counselling Section */}
      <section ref={counsellingRef} className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className={`transition-all duration-500 ${counsellingVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  Get Expert Guidance
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Not sure which course is right for you? Our expert counsellors are here to help you make the best decision for your learning journey.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FiCheckCircle className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Personalized course recommendations based on your goals
                    </span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Free consultation with our education experts
                    </span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Guidance on career paths and skill development
                    </span>
                  </li>
                </ul>
              </div>
              <div className={`transition-all duration-500 ${counsellingVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`} style={{ transitionDelay: counsellingVisible ? '200ms' : '0ms' }}>
                <CounsellingForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-16 bg-primary-600 text-white">
        <div className={`container mx-auto px-4 text-center transition-all duration-500 ${ctaVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of students already learning on our platform
          </p>
          <Link to="/signup" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

