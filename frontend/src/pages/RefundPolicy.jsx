const RefundPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        Refund & Access Management Policy
      </h1>

      {/* Refund Consideration */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Refund Consideration
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Refund requests submitted before course access may be reviewed</li>
          <li>Requests after course access are assessed individually and not guaranteed</li>
        </ul>
      </section>

      {/* Non-Refundable Situations */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Non-Refundable Situations
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Change of personal preference</li>
          <li>Inability to complete the course</li>
          <li>Dissatisfaction after content access</li>
        </ul>
      </section>

      {/* Review Timeline */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Review Timeline
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Approved refunds, if any, will be processed to the original payment source within a defined review period.
        </p>
      </section>

      {/* Course Pause Option */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Course Pause Option
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          In exceptional circumstances, learners may request temporary access suspension subject to approval.
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

export default RefundPolicy;

