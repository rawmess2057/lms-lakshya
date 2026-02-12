import { useEffect, useState } from 'react';
import { FiUser, FiBook, FiAward, FiEdit, FiTrash2, FiPlus, FiX, FiLinkedin, FiTwitter, FiGlobe, FiCheck, FiXCircle } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import toast from 'react-hot-toast';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    specialization: '',
    experience: 0,
    bio: '',
    qualifications: '',
    achievements: '',
    profilePicture: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      website: '',
    },
    isFeatured: true,
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchTeachers();
    fetchUsers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to access this page.');
        setTeachers([]);
        setLoading(false);
        return;
      }
      
      const response = await axiosInstance.get('/teacher-profiles/admin/all');
      console.log('Teachers API response:', response);
      
      if (response.data) {
        if (response.data.success === false) {
          throw new Error(response.data.error || 'Failed to fetch teachers');
        }
        setTeachers(response.data.data || []);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          toast.error('Authentication required. Please login again.');
        } else if (error.response.status === 403) {
          toast.error('You do not have permission to access this resource.');
        } else if (error.response.status === 404) {
          toast.error('Unable to load teachers. Please check if you are logged in as admin.');
        } else {
          const errorMsg = error.response.data?.error || error.response.data?.message || `Server error (${error.response.status})`;
          toast.error(errorMsg);
        }
      } else if (error.request) {
        // Request made but no response received
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        toast.error(error.message || 'Failed to fetch teachers');
      }
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      // Filter for teachers and admins
      const teacherUsers = (response.data.data || []).filter(
        (user) => user.role === 'teacher' || user.role === 'admin'
      );
      setUsers(teacherUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setFormData({
        ...formData,
        socialLinks: {
          ...formData.socialLinks,
          [socialKey]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await axiosInstance.put(`/teacher-profiles/admin/${editingTeacher._id}`, formData);
        toast.success('Teacher profile updated successfully');
      } else {
        await axiosInstance.post('/teacher-profiles/admin', formData);
        toast.success('Teacher profile created successfully');
      }
      setShowModal(false);
      setEditingTeacher(null);
      resetForm();
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save teacher profile');
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      userId: teacher.user?._id || '',
      name: teacher.name || '',
      email: teacher.email || '',
      specialization: teacher.specialization || '',
      experience: teacher.experience || 0,
      bio: teacher.bio || '',
      qualifications: teacher.qualifications || '',
      achievements: teacher.achievements || '',
      profilePicture: teacher.profilePicture || '',
      socialLinks: {
        linkedin: teacher.socialLinks?.linkedin || '',
        twitter: teacher.socialLinks?.twitter || '',
        website: teacher.socialLinks?.website || '',
      },
      isFeatured: teacher.isFeatured !== undefined ? teacher.isFeatured : true,
      displayOrder: teacher.displayOrder || 0,
      isActive: teacher.isActive !== undefined ? teacher.isActive : true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher profile?')) {
      return;
    }
    try {
      await axiosInstance.delete(`/teacher-profiles/admin/${id}`);
      toast.success('Teacher profile deleted successfully');
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to delete teacher profile');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      name: '',
      email: '',
      specialization: '',
      experience: 0,
      bio: '',
      qualifications: '',
      achievements: '',
      profilePicture: '',
      socialLinks: {
        linkedin: '',
        twitter: '',
        website: '',
      },
      isFeatured: true,
      displayOrder: 0,
      isActive: true,
    });
  };

  const handleUserSelect = (userId) => {
    const selectedUser = users.find((u) => u._id === userId);
    if (selectedUser) {
      setFormData({
        ...formData,
        userId: selectedUser._id,
        name: selectedUser.name || formData.name,
        email: selectedUser.email || formData.email,
        profilePicture: selectedUser.profilePicture || formData.profilePicture,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Teachers</h1>
        <button onClick={() => { setShowModal(true); setEditingTeacher(null); resetForm(); }} className="btn-primary flex items-center space-x-2">
          <FiPlus className="w-5 h-5" />
          <span>Add Teacher</span>
        </button>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No teachers found.</p>
          <button 
            onClick={() => { setShowModal(true); setEditingTeacher(null); resetForm(); }} 
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Your First Teacher</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
          <div key={teacher._id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {teacher.profilePicture ? (
                  <img src={teacher.profilePicture} alt={teacher.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{teacher.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{teacher.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleEdit(teacher)} className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 rounded">
                  <FiEdit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(teacher._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <FiBook className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span className="text-gray-700 dark:text-gray-300">{teacher.specialization}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <FiAward className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                <span className="text-gray-700 dark:text-gray-300">{teacher.experience} Years</span>
              </div>
              <div className="flex items-center space-x-2">
                {teacher.isFeatured ? (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded flex items-center space-x-1">
                    <FiCheck className="w-3 h-3" />
                    <span>Featured</span>
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded">Not Featured</span>
                )}
                {teacher.isActive ? (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">Active</span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded flex items-center space-x-1">
                    <FiXCircle className="w-3 h-3" />
                    <span>Inactive</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingTeacher(null); resetForm(); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link to User (Optional)
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={(e) => handleUserSelect(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a user (optional)</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email}) - {user.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Mathematics, Physics"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  name="profilePicture"
                  value={formData.profilePicture}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  maxLength="500"
                  className="input-field"
                  placeholder="Brief biography..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Qualifications
                </label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  placeholder="e.g., PhD in Mathematics, M.Sc. Physics"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Achievements
                </label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleInputChange}
                  rows="2"
                  className="input-field"
                  placeholder="Notable achievements, awards, publications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Social Links
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FiLinkedin className="w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="socialLinks.linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleInputChange}
                      placeholder="LinkedIn URL"
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiTwitter className="w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="socialLinks.twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleInputChange}
                      placeholder="Twitter URL"
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiGlobe className="w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="socialLinks.website"
                      value={formData.socialLinks.website}
                      onChange={handleInputChange}
                      placeholder="Website URL"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingTeacher(null); resetForm(); }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTeacher ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;

