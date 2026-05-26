const PaymentPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        Payments & Transactions Policy
      </h1>

      <p className="text-gray-700 dark:text-gray-300 mb-8">
        Lakshya Academy accepts payments <strong>only through officially authorised channels</strong>.
      </p>

      {/* Payment Rules */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Payment Rules
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Payments must be completed via the official website or approved payment methods</li>
          <li>Transactions made through personal accounts or unofficial links are strictly discouraged</li>
        </ul>
      </section>

      {/* User Caution */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          User Caution
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Always verify payment requests</li>
          <li>Lakshya Academy is not responsible for losses caused by third-party or fraudulent transactions</li>
        </ul>
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

export default PaymentPolicy;

