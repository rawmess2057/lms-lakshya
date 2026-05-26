const TermsAndConditions = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        Terms & Conditions
      </h1>

      {/* 1. Platform Usage */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          1. Platform Usage
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Access is granted solely for educational purposes</li>
          <li>Users must not misuse, disrupt, or interfere with platform services</li>
          <li>Any attempt to bypass security or usage restrictions is prohibited</li>
        </ul>
      </section>

      {/* 2. User Accounts */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          2. User Accounts
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
          <li>One account per user is permitted</li>
          <li>Sharing login credentials is strictly forbidden</li>
          <li>Each account is limited to a maximum of 2 active devices concurrently</li>
          <li>Lakshya Academy reserves the right to suspend accounts involved in misuse</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300">
          Users are responsible for all activity conducted through their account.
        </p>
      </section>

      {/* 3. Course Access & Content */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          3. Course Access & Content
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
          <li>Course access is limited to the registered user only</li>
          <li>Content may not be copied, recorded, or distributed</li>
          <li>Any unauthorised use constitutes a breach of terms</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300">
          All materials remain the intellectual property of the respective instructors.
        </p>
      </section>

      {/* 4. Payments & Fees */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          4. Payments & Fees
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Payments must be made through authorised channels only</li>
          <li>All fees are subject to the terms stated at the time of purchase</li>
          <li>Lakshya Academy is not liable for payments made through unofficial sources</li>
        </ul>
      </section>

      {/* 5. Refunds & Access Control */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          5. Refunds & Access Control
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Refunds are not guaranteed and are assessed individually</li>
          <li>Access may be revoked if terms are violated</li>
          <li>Course pauses may be granted under exceptional circumstances</li>
        </ul>
      </section>

      {/* 6. Limitation of Liability */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          6. Limitation of Liability
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Lakshya Academy shall not be held liable for:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Academic outcomes or exam results</li>
          <li>Technical interruptions beyond reasonable control</li>
          <li>Decisions made based on provided educational content</li>
        </ul>
      </section>

      {/* 7. Termination of Access */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          7. Termination of Access
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          We reserve the right to suspend or permanently terminate accounts without prior notice in cases of policy violation or misuse.
        </p>
      </section>

      {/* 8. Governing Authority */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          8. Governing Authority
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          These Terms & Conditions shall be governed and interpreted in accordance with applicable laws and platform regulations.
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

export default TermsAndConditions;

