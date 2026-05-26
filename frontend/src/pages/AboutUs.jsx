import { FiTarget, FiEye, FiAward, FiBookOpen, FiMonitor, FiBarChart2, FiUsers, FiMail, FiPhone, FiMapPin, FiStar, FiTrendingUp, FiHeart, FiShield, FiZap } from 'react-icons/fi';
import useScrollAnimation from '../hooks/useScrollAnimation';

const stats = [
  { icon: FiBookOpen, label: 'Courses', value: '100+' },
  { icon: FiUsers, label: 'Students', value: '10,000+' },
  { icon: FiAward, label: 'Certifications', value: '5,000+' },
  { icon: FiStar, label: 'Rating', value: '4.8/5' },
];

const values = [
  { icon: FiStar, title: 'Excellence', description: 'Delivering the highest quality educational content and learning experiences.' },
  { icon: FiHeart, title: 'Accessibility', description: 'Education should be accessible to all, regardless of location or background.' },
  { icon: FiTrendingUp, title: 'Innovation', description: 'Continuously adapting to meet the evolving needs of learners worldwide.' },
  { icon: FiShield, title: 'Integrity', description: 'Maintaining the highest standards of academic integrity and ethical practices.' },
  { icon: FiZap, title: 'Student Success', description: 'Our primary focus is on helping students achieve their academic and career goals.' },
];

const offerings = [
  { icon: FiBookOpen, title: 'Comprehensive Courses', description: 'A wide range of courses across subjects, designed by experienced educators and industry experts.' },
  { icon: FiMonitor, title: 'Interactive Learning', description: 'Engaging video lectures, quizzes, assignments, and interactive content for enriched learning.' },
  { icon: FiBarChart2, title: 'Progress Tracking', description: 'Monitor your learning journey with detailed analytics and performance insights.' },
  { icon: FiAward, title: 'Certificates', description: 'Earn recognized certificates upon completion to showcase your achievements.' },
];

const SectionWrapper = ({ children, className = '' }) => {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const AboutUs = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-secondary-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FiStar className="w-4 h-4" />
              Welcome to Lakshya Academy
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Shaping the Future of
              <span className="block text-secondary-300">Online Education</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Empowering students and educators through high-quality online education.
              We focus on skill-based learning, practical knowledge, and academic
              excellence to help learners succeed in today's digital world.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-10">
              <a href="/courses" className="inline-flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-primary-900 font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]">
                <FiBookOpen className="w-5 h-5" />
                Explore Courses
              </a>
              <a href="/contact-us" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm active:scale-[0.98]">
                <FiPhone className="w-5 h-5" />
                Contact Us
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-primary-900 to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 container mx-auto px-4 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <SectionWrapper key={index}>
              <div className="bg-white dark:bg-primary-800 rounded-xl shadow-lg p-6 text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-primary-600 dark:text-secondary-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <SectionWrapper>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Our Purpose
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full" />
            </div>
          </SectionWrapper>
          <div className="grid md:grid-cols-2 gap-8">
            <SectionWrapper>
              <div className="bg-white dark:bg-primary-800 rounded-2xl shadow-lg p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-primary-500">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center mb-6">
                  <FiTarget className="w-7 h-7 text-primary-600 dark:text-secondary-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Mission
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  To bridge the gap between traditional education and modern digital learning
                  by providing accessible, high-quality educational experiences that empower
                  learners to achieve their full potential.
                </p>
              </div>
            </SectionWrapper>
            <SectionWrapper>
              <div className="bg-white dark:bg-primary-800 rounded-2xl shadow-lg p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-secondary-500">
                <div className="w-14 h-14 bg-secondary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center mb-6">
                  <FiEye className="w-7 h-7 text-secondary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Vision
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  To become a leading online educational platform that provides accessible,
                  high-quality learning experiences for students across Pakistan and beyond.
                </p>
              </div>
            </SectionWrapper>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-primary-50 dark:bg-primary-800/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionWrapper>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Values
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full" />
                <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
                  The principles that guide everything we do at Lakshya Academy.
                </p>
              </div>
            </SectionWrapper>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <SectionWrapper key={index}>
                  <div className="group bg-white dark:bg-primary-800 rounded-xl shadow-md p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </SectionWrapper>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <SectionWrapper>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                What We Offer
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full" />
              <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
                Everything you need to succeed in your learning journey.
              </p>
            </div>
          </SectionWrapper>
          <div className="grid md:grid-cols-2 gap-6">
            {offerings.map((item, index) => (
              <SectionWrapper key={index}>
                <div className="group flex gap-5 bg-white dark:bg-primary-800 rounded-xl shadow-md p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-700 py-20">
        <div className="container mx-auto px-4">
          <SectionWrapper>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of students already learning with Lakshya Academy.
                Unlock your potential with expert-led courses and interactive content.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href="/register" className="inline-flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-primary-900 font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]">
                  <FiUsers className="w-5 h-5" />
                  Get Started Free
                </a>
                <a href="/courses" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-3 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  <FiBookOpen className="w-5 h-5" />
                  Browse Courses
                </a>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <SectionWrapper>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Get in Touch
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full" />
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Have questions or need support? We're here to help!
              </p>
            </div>
          </SectionWrapper>
          <SectionWrapper>
            <div className="bg-white dark:bg-primary-800 rounded-2xl shadow-lg p-8 md:p-10">
              <div className="grid sm:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiMail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
                  <a href="mailto:lakshyaacademi@gmail.com" className="text-primary-600 dark:text-secondary-400 hover:underline text-sm">
                    lakshyaacademi@gmail.com
                  </a>
                </div>
                <div className="text-center group">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiPhone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">WhatsApp</h3>
                  <a href="https://wa.me/9779846828659" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-secondary-400 hover:underline text-sm">
                    +977 9846828659
                  </a>
                </div>
                <div className="text-center group">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiMapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Location</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Pakistan
                  </p>
                </div>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Bottom Decorative Bar */}
      <div className="h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500" />
    </div>
  );
};

export default AboutUs;
