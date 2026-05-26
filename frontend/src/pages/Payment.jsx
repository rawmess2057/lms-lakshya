import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiArrowLeft, FiCreditCard, FiUpload, FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Payment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('easypaisa'); // 'easypaisa', 'jazzcash', 'bank_transfer'
  const [manualTransactionId, setManualTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [paymentReferenceId, setPaymentReferenceId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCourse();
  }, [courseId, isAuthenticated, navigate]);

  const fetchCourse = async () => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}`);
      const courseData = response.data.data;
      setCourse(courseData);
      
      if (courseData.isEnrolled) {
        toast.error('You are already enrolled in this course');
        navigate(`/courses/${courseId}`);
        return;
      }

      // Check for pending payment
      try {
        const paymentsResponse = await axiosInstance.get('/payments');
        const payments = paymentsResponse.data.data || [];
        const pending = payments.find(
          (p) => (p.course?._id === courseId || p.course === courseId) && p.status === 'pending'
        );
        if (pending) {
          setPaymentReferenceId(pending.paymentReferenceId || '');
          toast('You have a pending payment for this course. Please wait for admin approval.', { icon: '⏳' });
        }
      } catch (error) {
        // Silently fail - payments check is optional
      }
    } catch (error) {
      // Don't show error if user is being redirected (401/403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        return;
      }
      // Only show error for server errors (500+) or if there's a specific error message
      if (error.response?.status >= 500 || error.response?.data?.error) {
        toast.error(error.response?.data?.error || 'Failed to load course. Please try again.');
      } else if (error.response?.status === 404) {
        toast.error('Course not found');
      } else if (!error.response) {
        // Network error - show a more helpful message
        toast.error('Network error. Please check your connection and try again.');
      }
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };


  const handleManualPayment = async (e) => {
    e.preventDefault();
    
    if (!manualTransactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    if (!receiptFile) {
      toast.error('Please upload payment receipt');
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('paymentMethod', paymentMethod);
      formData.append('manualTransactionId', manualTransactionId.trim());
      formData.append('receipt', receiptFile);

      const response = await axiosInstance.post('/payments/manual', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPaymentReferenceId(response.data.data.paymentReferenceId);
      toast.success('Payment submitted successfully! Your payment is under review.');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 3000);
    } catch (error) {
      if (error.response?.data?.paymentReferenceId) {
        setPaymentReferenceId(error.response.data.paymentReferenceId);
      }
      toast.error(error.response?.data?.error || 'Payment submission failed');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Payment Reference ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={() => navigate(`/courses/${courseId}`)}
        className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center space-x-2"
      >
        <FiArrowLeft />
        <span>Back to Course</span>
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Complete Payment</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Course Details</h2>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{course.description}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Payment Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Course Price</span>
              <span className="font-semibold text-gray-900 dark:text-white">{course.price ? course.price.toLocaleString() : '0'} PKR</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-lg font-bold text-primary-600">{course.price ? course.price.toLocaleString() : '0'} PKR</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Payment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('easypaisa')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                paymentMethod === 'easypaisa'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <FiCreditCard className="w-6 h-6 mb-2 mx-auto text-green-600" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">EasyPaisa</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Telenor Microfinance Bank</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('jazzcash')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                paymentMethod === 'jazzcash'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <FiCreditCard className="w-6 h-6 mb-2 mx-auto text-orange-600" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">JazzCash</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Jazz Mobile Account</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                paymentMethod === 'bank_transfer'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <FiCreditCard className="w-6 h-6 mb-2 mx-auto text-blue-600" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">Meezan Bank</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Bank Transfer</div>
            </button>
          </div>
        </div>

        {/* Manual Payment (EasyPaisa/JazzCash/Bank Transfer) */}
        {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash' || paymentMethod === 'bank_transfer') && (
          <form onSubmit={handleManualPayment}>
            {/* Payment Instructions */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                {paymentMethod === 'easypaisa' ? 'EasyPaisa Payment Instructions' : 
                 paymentMethod === 'jazzcash' ? 'JazzCash Payment Instructions' : 
                 'Bank Transfer Payment Instructions'}
              </h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <p>
                  <strong>Step 1:</strong> Transfer <strong>PKR {course.price ? course.price.toLocaleString() : '0'}</strong> to our account:
                </p>
                <div className="bg-white dark:bg-gray-800 p-3 rounded mt-2 font-mono text-xs space-y-1">
                  {paymentMethod === 'bank_transfer' ? (
                    <>
                      <div className="mb-2">
                        <strong className="text-gray-900 dark:text-white">Meezan Bank Account Details:</strong>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">Account Title: <strong>Muhammad Junaid Khan</strong></div>
                      <div className="text-gray-700 dark:text-gray-300">Account Number: <strong>05110103835105</strong></div>
                      <div className="text-gray-700 dark:text-gray-300">IBAN: <strong>PK87MEZN0005110103835105</strong></div>
                      <div className="text-gray-700 dark:text-gray-300">Branch: <strong>University Road, Multan</strong></div>
                    </>
                  ) : paymentMethod === 'jazzcash' ? (
                    <>
                      <div className="mb-2">
                        <strong className="text-gray-900 dark:text-white">JazzCash Account Details:</strong>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">Account Number: <strong>0300-6341138</strong></div>
                      <div className="text-gray-700 dark:text-gray-300">Account Title: <strong>Muhammad Junaid Khan</strong></div>
                      <div className="text-gray-700 dark:text-gray-300">IBAN: <strong>PK04JCMA3005923006341138</strong></div>
                    </>
                  ) : (
                    <>
                      <div className="mb-2">
                        <strong className="text-gray-900 dark:text-white">EasyPaisa / Telenor Microfinance Bank Account Details:</strong>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">Account Number: <strong>0312-6341138</strong></div>
                      <div className="text-gray-700 dark:text-gray-300">Account Title: <strong>Muhammad Junaid Khan</strong></div>
                      <div className="text-gray-700 dark:text-gray-300">IBAN: <strong>PK22TMFB0000000048302934</strong></div>
                    </>
                  )}
                </div>
                <p className="mt-3">
                  <strong>Step 2:</strong> Note down the transaction ID from your payment confirmation {paymentMethod === 'bank_transfer' ? 'slip or SMS' : 'SMS'}.
                </p>
                <p>
                  <strong>Step 3:</strong> Upload the payment receipt screenshot (image only, max 5MB) and enter the transaction ID below.
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 font-medium mt-2">
                  ⚠️ Important: Pay the exact amount and enter the correct transaction ID. Your payment will be reviewed by admin before enrollment.
                </p>
              </div>
            </div>

            {/* Payment Reference ID Display (if generated) */}
            {paymentReferenceId && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Payment Reference ID:</p>
                    <p className="text-lg font-mono text-green-700 dark:text-green-300">{paymentReferenceId}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Save this reference ID for your records. Your payment is under review.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(paymentReferenceId)}
                    className="p-2 hover:bg-green-100 dark:hover:bg-green-800 rounded"
                    title="Copy Reference ID"
                  >
                    {copied ? <FiCheck className="w-5 h-5 text-green-600" /> : <FiCopy className="w-5 h-5 text-green-600" />}
                  </button>
                </div>
              </div>
            )}

            {/* Transaction ID Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualTransactionId}
                onChange={(e) => setManualTransactionId(e.target.value)}
                placeholder="Enter transaction ID from SMS"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
                disabled={!!paymentReferenceId}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the transaction ID you received in your payment confirmation SMS
              </p>
            </div>

            {/* Receipt Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Receipt <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  id="receipt-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate file size (5MB)
                      const maxSize = 5 * 1024 * 1024;
                      if (file.size > maxSize) {
                        toast.error('File size must be less than 5MB');
                        e.target.value = '';
                        return;
                      }
                      // Validate file type
                      if (!file.type.startsWith('image/')) {
                        toast.error('Only image files are allowed');
                        e.target.value = '';
                        return;
                      }
                      setReceiptFile(file);
                    }
                  }}
                  className="hidden"
                  required
                  disabled={!!paymentReferenceId}
                />
                <label
                  htmlFor="receipt-upload"
                  className={`cursor-pointer ${paymentReferenceId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {receiptFile ? (
                    <div>
                      <FiCheck className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{receiptFile.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Click to change file (Image only, max 5MB)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <FiUpload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="text-primary-600 hover:text-primary-700">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Image only (JPG, PNG, GIF, WEBP - max 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
              {receiptFile && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    File size: {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing || !!paymentReferenceId}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiUpload />
              <span>
                {processing
                  ? 'Submitting...'
                  : paymentReferenceId
                  ? 'Payment Submitted (Under Review)'
                  : 'Submit Payment'}
              </span>
            </button>

            {/* Info Message */}
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>⏳ Please wait, payment is under review:</strong> After submission, your payment will be reviewed by an admin. You will be enrolled in the course once the payment is approved. This usually takes 24-48 hours. You can check the status in your dashboard.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Payment;

