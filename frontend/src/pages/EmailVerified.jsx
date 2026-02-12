import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

const EmailVerified = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <FiCheckCircle className="text-9xl text-green-500" />
                </div>
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mt-4">
                    Email Verified Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
                    Thank you for verifying your email. You can now log in to your account.
                </p>
                <Link
                    to="/login"
                    className="inline-flex items-center space-x-2 btn-primary"
                >
                    <span>Login Now</span>
                </Link>
            </div>
        </div>
    );
};

export default EmailVerified;
