import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiSearch, FiEdit, FiTrash2, FiPlus, FiX, FiCheck, FiToggleLeft, FiToggleRight, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageHighlights = () => {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    icon: '',
    image: '',
    link: '',
    isEnabled: true,
    order: 0,
    category: '',
  });

  const categories = [
    { value: '', label: 'None' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'result', label: 'Result' },
    { value: 'event', label: 'Event' },
    { value: 'update', label: 'Update' },
  ];

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to access this page.');
        setHighlights([]);
        setLoading(false);
        return;
      }
      
      const response = await axiosInstance.get('/admin/highlights');
      console.log('Highlights API response:', response);
      
      if (response.data) {
        if (response.data.success === false) {
          throw new Error(response.data.error || 'Failed to fetch highlights');
        }
        setHighlights(response.data.data || []);
      } else {
        setHighlights([]);
      }
    } catch (error) {
      console.error('Error fetching highlights:', error);
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
          toast.error('Unable to load highlights. Please check if you are logged in as admin.');
        } else {
          const errorMsg = error.response.data?.error || error.response.data?.message || `Server error (${error.response.status})`;
          toast.error(errorMsg);
        }
      } else if (error.request) {
        // Request made but no response received
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        toast.error(error.message || 'Failed to fetch highlights');
      }
      setHighlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      await axiosInstance.post('/admin/highlights', formData);
      toast.success('Highlight created successfully');
      setShowCreateForm(false);
      resetForm();
      fetchHighlights();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create highlight');
    }
  };

  const handleEdit = (highlight) => {
    setEditingHighlight(highlight._id);
    setFormData({
      title: highlight.title || '',
      icon: highlight.icon || '',
      image: highlight.image || '',
      link: highlight.link || '',
      isEnabled: highlight.isEnabled !== undefined ? highlight.isEnabled : true,
      order: highlight.order || 0,
      category: highlight.category || '',
    });
    setShowCreateForm(false);
  };

  const handleUpdate = async (highlightId) => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      await axiosInstance.put(`/admin/highlights/${highlightId}`, formData);
      toast.success('Highlight updated successfully');
      setEditingHighlight(null);
      resetForm();
      fetchHighlights();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update highlight');
    }
  };

  const handleDelete = async (highlightId, highlightTitle) => {
    if (!window.confirm(`Are you sure you want to delete highlight "${highlightTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/admin/highlights/${highlightId}`);
      toast.success('Highlight deleted successfully');
      fetchHighlights();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete highlight');
    }
  };

  const handleToggle = async (highlightId) => {
    try {
      await axiosInstance.put(`/admin/highlights/${highlightId}/toggle`);
      toast.success('Highlight status updated');
      fetchHighlights();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to toggle highlight');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingHighlight(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      icon: '',
      image: '',
      link: '',
      isEnabled: true,
      order: 0,
      category: '',
    });
  };

  const filteredHighlights = highlights.filter((highlight) => {
    const matchesSearch = searchTerm === '' || 
      highlight.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Sort by order, then by creation date
  const sortedHighlights = [...filteredHighlights].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading highlights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Highlights</h1>
        <div className="flex space-x-2">
          {!showCreateForm && !editingHighlight && (
            <button
              onClick={() => {
                setShowCreateForm(true);
                resetForm();
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus />
              <span>Add Highlight</span>
            </button>
          )}
          <Link to="/admin/dashboard" className="btn-outline">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingHighlight) && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {editingHighlight ? 'Edit Highlight' : 'Create New Highlight'}
          </h2>
          <form onSubmit={editingHighlight ? (e) => { e.preventDefault(); handleUpdate(editingHighlight); } : handleCreate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder="Enter highlight title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon URL
                  </label>
                  <input
                    type="url"
                    className="input-field w-full"
                    placeholder="https://example.com/icon.png"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    className="input-field w-full"
                    placeholder="https://example.com/image.png"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link URL (optional)
                </label>
                <input
                  type="url"
                  className="input-field w-full"
                  placeholder="https://example.com or /courses"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    className="input-field w-full"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field w-full"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="isEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Enable this highlight
                </label>
              </div>

              <div className="flex space-x-2">
                <button type="submit" className="btn-primary flex items-center space-x-2">
                  <FiCheck />
                  <span>{editingHighlight ? 'Update' : 'Create'} Highlight</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-outline flex items-center space-x-2"
                >
                  <FiX />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search Highlights
        </label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Highlights List */}
      {sortedHighlights.length === 0 ? (
        <div className="card text-center py-12">
          <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No highlights found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedHighlights.map((highlight) => (
            <div key={highlight._id} className={`card ${!highlight.isEnabled ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {highlight.image ? (
                    <img
                      src={highlight.image}
                      alt={highlight.title}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : highlight.icon ? (
                    <img
                      src={highlight.icon}
                      alt={highlight.title}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                        {highlight.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {!highlight.isEnabled && (
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                      Disabled
                    </span>
                  )}
                </div>
                {editingHighlight === highlight._id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdate(highlight._id)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                      title="Save"
                    >
                      <FiCheck className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      title="Cancel"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggle(highlight._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                      title={highlight.isEnabled ? 'Disable' : 'Enable'}
                    >
                      {highlight.isEnabled ? (
                        <FiToggleRight className="w-5 h-5" />
                      ) : (
                        <FiToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(highlight)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                      title="Edit"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(highlight._id, highlight.title)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {editingHighlight === highlight._id ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      className="input-field w-full"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="url"
                      className="input-field w-full text-xs"
                      placeholder="Icon URL"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    />
                    <input
                      type="url"
                      className="input-field w-full text-xs"
                      placeholder="Image URL"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>
                  <input
                    type="url"
                    className="input-field w-full text-xs"
                    placeholder="Link URL"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                  <div className="flex items-center justify-between">
                    <select
                      className="input-field text-xs"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      className="input-field w-20 text-xs"
                      placeholder="Order"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {highlight.title}
                  </h3>
                  {highlight.category && (
                    <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs rounded mb-2">
                      {highlight.category}
                    </span>
                  )}
                  {highlight.link && (
                    <p className="text-sm text-primary-600 dark:text-primary-400 mb-2 truncate">
                      Link: {highlight.link}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Order: {highlight.order} | Created: {new Date(highlight.createdAt).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Total: {sortedHighlights.length} highlight(s)
      </div>
    </div>
  );
};

export default ManageHighlights;

