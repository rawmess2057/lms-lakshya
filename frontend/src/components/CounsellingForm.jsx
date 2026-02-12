import { useState } from 'react';
import { FiUser, FiPhone, FiBook } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import toast from 'react-hot-toast';

const CounsellingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    institution: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const institutions = [
    'School',
    'College',
    'University',
    'Private Institution',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.institution) {
      newErrors.institution = 'Please select an institution';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Make sure we're using the correct endpoint
      const response = await axiosInstance.post('/counselling/submit', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Counselling submission response:', response);
      
      if (response.data) {
        if (response.data.success === false) {
          throw new Error(response.data.error || 'Failed to submit request');
        }
        toast.success(response.data.message || 'Counselling request submitted successfully! We will contact you soon.');
        // Reset form
        setFormData({
          name: '',
          phone: '',
          institution: '',
        });
        setErrors({});
      } else {
        throw new Error('No response from server');
      }
    } catch (error) {
      console.error('Counselling submission error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 404) {
          // Check if it's actually a route not found or empty response
          if (errorData?.error?.includes('Route not found') || errorData?.error?.includes('not found')) {
            console.error('Route not found error:', errorData);
            toast.error('Counselling service endpoint not found. Please contact support or try again later.');
          } else {
            toast.error('Unable to reach counselling service. Please try again later.');
          }
        } else if (status === 400) {
          toast.error(errorData?.error || 'Please check your form data and try again.');
        } else if (status === 401 || status === 403) {
          toast.error('Authentication error. Please refresh the page and try again.');
        } else if (status === 500) {
          toast.error('Server error. Please try again later or contact us directly.');
        } else {
          const errorMsg = errorData?.error || errorData?.message || `Failed to submit (${status})`;
          toast.error(errorMsg);
        }
      } else if (error.request) {
        // Request made but no response received
        console.error('No response received:', error.request);
        toast.error('Network error. Please check your internet connection and try again.');
      } else {
        // Something else happened
        console.error('Request setup error:', error.message);
        toast.error(error.message || 'Failed to submit request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Get Free Counselling Today
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Fill out the form below and our team will get in touch with you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input-field pl-10 ${errors.name ? 'border-red-500 error' : ''}`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 mt-1 animate-fade-in">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`input-field pl-10 ${errors.phone ? 'border-red-500 error' : ''}`}
              placeholder="Enter your phone number"
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1 animate-fade-in">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Institution *
          </label>
          <div className="relative">
            <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <select
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              className={`input-field pl-10 appearance-none ${errors.institution ? 'border-red-500 error' : ''}`}
            >
              <option value="">Select your institution</option>
              {institutions.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>
          {errors.institution && (
            <p className="text-xs text-red-500 mt-1 animate-fade-in">{errors.institution}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary w-full relative"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin-slow mr-2">⏳</span>
              Submitting...
            </span>
          ) : (
            'Get Started'
          )}
        </button>
      </form>
    </div>
  );
};

export default CounsellingForm;

