const IntellectualProperty = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        Intellectual Property & Content Protection
      </h1>

      {/* Digital Content Protection Policy */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Digital Content Protection Policy
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          All learning resources available on Lakshya Academy are protected assets created for enrolled learners only.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          Permitted Use
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
          <li>Access is granted strictly for individual educational use.</li>
          <li>Content may only be viewed within the Lakshya Academy platform.</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          Strictly Prohibited
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
          <li>Copying, forwarding, reselling, or sharing course materials in any form</li>
          <li>Screen recording, screenshots, or downloading lectures without written approval</li>
          <li>Uploading content to cloud storage, social media, or third-party platforms</li>
          <li>Reproducing material for commercial or non-commercial purposes</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          Enforcement
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Any breach may result in immediate account termination, permanent access removal, and further legal measures if required.
        </p>
      </section>

      {/* Intellectual Property & Ownership Policy */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Intellectual Property & Ownership Policy
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          All educational content published on Lakshya Academy remains the <strong>exclusive intellectual property of its respective instructors</strong>.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          Rights Reserved
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
          <li>Instructors retain full ownership and copyright</li>
          <li>No licence is granted to reuse, distribute, or modify content</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          Platform Disclaimer
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Lakshya Academy does not certify, endorse, or guarantee the accuracy of instructional content and assumes no responsibility for academic outcomes.
        </p>

        <p className="text-gray-700 dark:text-gray-300">
          Use of Lakshya Academy branding, logos, or identity without prior written authorisation is prohibited.
        </p>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-300 dark:border-gray-700 mt-12 pt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          © Lakshya Academy - Knowledge Protected. Learning Respected.
        </p>
      </div>
    </div>
  );
};

export default IntellectualProperty;

