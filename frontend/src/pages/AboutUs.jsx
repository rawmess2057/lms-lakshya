const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white text-center">
        About Us
      </h1>

      <div className="space-y-8">
        {/* Mission */}
        <section>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Multan Academy
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
            Empowering students and educators through high-quality online education.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            We focus on skilled-based learning, practical knowledge, and academic excellence to help learners succeed in today's digital world.
          </p>
        </section>

        {/* Vision */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Our Vision
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            To become a leading online educational platform that provides accessible, high-quality learning experiences for students across Pakistan and beyond. We aim to bridge the gap between traditional education and modern digital learning, making education more accessible and effective for everyone.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Our Values
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Excellence:</strong> We are committed to delivering the highest quality educational content and learning experiences.</li>
            <li><strong>Accessibility:</strong> We believe education should be accessible to all, regardless of location or background.</li>
            <li><strong>Innovation:</strong> We continuously adapt and improve our platform to meet the evolving needs of learners.</li>
            <li><strong>Integrity:</strong> We maintain the highest standards of academic integrity and ethical practices.</li>
            <li><strong>Student Success:</strong> Our primary focus is on helping students achieve their academic and career goals.</li>
          </ul>
        </section>

        {/* What We Offer */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Comprehensive Courses
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                A wide range of courses covering various subjects, designed by experienced educators and industry experts.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Interactive Learning
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Engaging video lectures, quizzes, assignments, and interactive content to enhance your learning experience.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Progress Tracking
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Monitor your learning progress with detailed analytics and track your performance throughout your courses.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Certificates
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Earn certificates upon course completion to showcase your achievements and enhance your credentials.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-primary-50 dark:bg-primary-900 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Get in Touch
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Have questions or need support? We're here to help!
          </p>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p>
              📧 Email: <a href="mailto:multanacademi@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline">multanacademi@gmail.com</a>
            </p>
            <p>
              📱 WhatsApp: <a href="https://wa.me/923126341138" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">+92 312 634 1138</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;

