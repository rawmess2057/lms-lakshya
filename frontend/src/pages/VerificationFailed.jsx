import { Link, useSearchParams } from 'react-router-dom';
import { FiAlertCircle } from 'react-icons/fi';

const VerificationFailed = () => {
    const [searchParams] = useSearchParams();
    const reason = searchParams.get('reason');

    let message = "We couldn't verify your email. The link may be invalid or expired.";
    if (reason === 'missing_token') {
        message = "Verification token is missing. Please click the link in your email.";
    } else if (reason === 'invalid_token') {
        message = "The verification link is invalid or has expired.";
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex justify-center mb-6">
                    <FiAlertCircle className="text-6xl text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Verification Failed
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {message}
                </p>
                <div className="space-y-4">
                    <Link
                        to="/login"
                        className="block w-full text-center btn-primary py-2 rounded"
                    >
                        Go to Login
                    </Link>
                    <Link
                        to="/contact-us"
                        className="block w-full text-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerificationFailed;
