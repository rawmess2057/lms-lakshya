const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        Privacy Policy
      </h1>

      <p className="text-gray-700 dark:text-gray-300 mb-8">
        At Multan Academy, we are committed to safeguarding the privacy, confidentiality, and personal data of our users. This Privacy Policy explains how information is collected, used, and protected when you access our platform.
      </p>

      {/* 1. Information We Collect */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          1. Information We Collect
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We may collect the following information:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
          <li>Full name, email address, and contact details</li>
          <li>Login credentials and account activity</li>
          <li>Payment and transaction-related information</li>
          <li>Device, browser, and usage data for security purposes</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300">
          All data is collected lawfully and only when necessary to deliver our services.
        </p>
      </section>

      {/* 2. Use of Information */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          2. Use of Information
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Your information may be used to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
          <li>Provide access to courses and learning resources</li>
          <li>Manage user accounts and subscriptions</li>
          <li>Process payments securely</li>
          <li>Improve platform functionality and user experience</li>
          <li>Communicate updates, support responses, and important notices</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300">
          We do not sell, rent, or trade personal information to third parties.
        </p>
      </section>

      {/* 3. Data Protection & Security */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          3. Data Protection & Security
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
          <li>Industry-standard security measures are applied to protect user data</li>
          <li>Access to sensitive information is restricted and monitored</li>
          <li>Any suspected data breach is handled with immediate corrective action</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300">
          Despite best efforts, absolute security cannot be guaranteed.
        </p>
      </section>

      {/* 4. Third-Party Services */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          4. Third-Party Services
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Payment gateways and technical service providers may process limited user data strictly for operational purposes. These entities operate under their own privacy standards.
        </p>
      </section>

      {/* 5. Cookies & Tracking */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          5. Cookies & Tracking
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Multan Academy may use cookies to enhance functionality and analyse usage patterns. Users may manage cookie preferences via their browser settings.
        </p>
      </section>

      {/* 6. Policy Updates */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          6. Policy Updates
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          This Privacy Policy may be updated periodically. Continued use of the platform signifies acceptance of any revised terms.
        </p>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-300 dark:border-gray-700 mt-12 pt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          © Multan Academy - Knowledge Protected. Learning Respected.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

