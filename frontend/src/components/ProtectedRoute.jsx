import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiAlertCircle } from 'react-icons/fi';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Special handling for teacher_pending users trying to access teacher routes
    if (user?.role === 'teacher_pending' && allowedRoles.includes('teacher')) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="card border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Your teacher account is pending approval
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your request to become a teacher has been submitted. Please wait for admin approval before you can access teacher features.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  You will be notified once your account is approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

