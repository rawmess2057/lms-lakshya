/**
 * Payment service
 * Note: Mock payments have been removed. All payments are now manual and require admin verification.
 */

/**
 * Generate transaction ID for manual payments
 */
export const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

/**
 * Verify payment (for future use with payment gateways)
 */
export const verifyPayment = async (transactionId) => {
  // Placeholder for future payment gateway integration
  return {
    success: false,
    verified: false,
    transactionId,
    message: 'Payment verification requires admin approval',
  };
};

export default {
  generateTransactionId,
  verifyPayment,
};

