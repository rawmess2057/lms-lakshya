import axios from 'axios';

const API_URL = '/api/auth';

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

// Helper to get or create device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_uuid');
  if (!deviceId) {
    // Generate a robust unique ID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      deviceId = crypto.randomUUID();
    } else {
      // Fallback
      deviceId = 'dev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    }
    localStorage.setItem('device_uuid', deviceId);
  }
  return deviceId;
};

// Login user
const login = async (userData) => {
  const deviceId = getDeviceId();
  const response = await axios.post(`${API_URL}/login`, { ...userData, deviceId });
  return response.data;
};

// Get current user
const getMe = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/me`, config);
  return response.data;
};

// Update user details
const updateDetails = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}/updatedetails`, userData, config);
  return response.data;
};

// Update password
const updatePassword = async (passwordData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}/updatepassword`, passwordData, config);
  return response.data;
};

// Forgot password
const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgotpassword`, { email });
  return response.data;
};

// Reset password
const resetPassword = async (token, password) => {
  const deviceId = getDeviceId();
  const response = await axios.put(`${API_URL}/resetpassword/${token}`, { password, deviceId });
  return response.data;
};

// Resend verification email
const resendVerification = async (email) => {
  const response = await axios.post(`${API_URL}/resend-verification`, { email });
  return response.data;
};

// Logout user
const logout = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_URL}/logout`, {}, config);
  return response.data;
};

const authService = {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  resendVerification,
  logout,
};

export default authService;

