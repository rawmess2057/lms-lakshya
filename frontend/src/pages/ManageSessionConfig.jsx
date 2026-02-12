import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiArrowLeft, FiClock, FiActivity, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageSessionConfig = () => {
  const [config, setConfig] = useState({
    sessionTimeoutMinutes: 30,
    inactivityTimeoutMinutes: 15,
    maxSessionDurationHours: 8,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axiosInstance.get('/admin/config');
      if (response.data.data) {
        setConfig({
          sessionTimeoutMinutes: response.data.data.sessionTimeoutMinutes || 30,
          inactivityTimeoutMinutes: response.data.data.inactivityTimeoutMinutes || 15,
          maxSessionDurationHours: response.data.data.maxSessionDurationHours || 8,
        });
      }
    } catch (error) {
      toast.error('Failed to load session configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig({
      ...config,
      [name]: parseInt(value) || 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axiosInstance.put('/admin/config', config);
      toast.success('Session configuration updated successfully!');
      // Reload page to apply new session settings
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update session configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/admin/dashboard"
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block flex items-center"
      >
        <FiArrowLeft className="mr-2" />
        Back to Dashboard
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Session Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Configure automatic logout settings for all users. Changes will apply to new sessions.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Session Timeout */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiClock className="inline mr-2" />
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                name="sessionTimeoutMinutes"
                value={config.sessionTimeoutMinutes}
                onChange={handleChange}
                min="5"
                max="480"
                required
                className="input-field w-full"
                placeholder="30"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum time a session can remain active (5-480 minutes / 8 hours max)
              </p>
            </div>

            {/* Inactivity Timeout */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiActivity className="inline mr-2" />
                Inactivity Timeout (minutes)
              </label>
              <input
                type="number"
                name="inactivityTimeoutMinutes"
                value={config.inactivityTimeoutMinutes}
                onChange={handleChange}
                min="1"
                max="120"
                required
                className="input-field w-full"
                placeholder="15"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Time of inactivity before automatic logout (1-120 minutes / 2 hours max)
              </p>
            </div>

            {/* Max Session Duration */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiClock className="inline mr-2" />
                Maximum Session Duration (hours)
              </label>
              <input
                type="number"
                name="maxSessionDurationHours"
                value={config.maxSessionDurationHours}
                onChange={handleChange}
                min="1"
                max="24"
                required
                className="input-field w-full"
                placeholder="8"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum total session duration regardless of activity (1-24 hours)
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• <strong>Inactivity Timeout:</strong> Users are logged out after this period of no activity</li>
                <li>• <strong>Max Session Duration:</strong> Users are logged out after this total time, even if active</li>
                <li>• <strong>Session Timeout:</strong> General session timeout limit</li>
                <li>• Changes apply to new sessions; current sessions use previous settings</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={fetchConfig}
                className="btn-outline flex-1"
                disabled={saving}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
                disabled={saving}
              >
                <FiSave className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageSessionConfig;

