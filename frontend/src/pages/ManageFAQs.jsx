import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiSearch, FiEdit, FiTrash2, FiPlus, FiX, FiCheck, FiToggleLeft, FiToggleRight, FiHelpCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'civil-engineering',
    isPublished: true,
    order: 0,
  });

  const categories = [
    { value: 'civil-engineering', label: 'Civil Engineering' },
    { value: 'license-exams', label: 'License Exams' },
    { value: 'tuition', label: 'Tuition' },
  ];

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to access this page.');
        setFaqs([]);
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get('/admin/faqs');

      if (response.data) {
        if (response.data.success === false) {
          throw new Error(response.data.error || 'Failed to fetch FAQs');
        }
        setFaqs(response.data.data || []);
      } else {
        setFaqs([]);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Authentication required. Please login again.');
        } else if (error.response.status === 403) {
          toast.error('You do not have permission to access this resource.');
        } else {
          const errorMsg = error.response.data?.error || error.response.data?.message || `Server error (${error.response.status})`;
          toast.error(errorMsg);
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(error.message || 'Failed to fetch FAQs');
      }
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }
    try {
      await axiosInstance.post('/admin/faqs', formData);
      toast.success('FAQ created successfully');
      setShowCreateForm(false);
      resetForm();
      fetchFAQs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create FAQ');
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq._id);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'civil-engineering',
      isPublished: faq.isPublished !== undefined ? faq.isPublished : true,
      order: faq.order || 0,
    });
    setShowCreateForm(false);
  };

  const handleUpdate = async (faqId) => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }
    try {
      await axiosInstance.put(`/admin/faqs/${faqId}`, formData);
      toast.success('FAQ updated successfully');
      setEditingFaq(null);
      resetForm();
      fetchFAQs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update FAQ');
    }
  };

  const handleDelete = async (faqId, question) => {
    if (!window.confirm(`Are you sure you want to delete FAQ "${question}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/admin/faqs/${faqId}`);
      toast.success('FAQ deleted successfully');
      fetchFAQs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete FAQ');
    }
  };

  const handleToggle = async (faqId) => {
    try {
      await axiosInstance.put(`/admin/faqs/${faqId}/toggle`);
      toast.success('FAQ status updated');
      fetchFAQs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to toggle FAQ');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingFaq(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'civil-engineering',
      isPublished: true,
      order: 0,
    });
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedFaqs = [...filteredFaqs].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const getCategoryLabel = (value) => {
    const cat = categories.find((c) => c.value === value);
    return cat ? cat.label : value;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage FAQs</h1>
        <div className="flex space-x-2">
          {!showCreateForm && !editingFaq && (
            <button
              onClick={() => {
                setShowCreateForm(true);
                resetForm();
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus />
              <span>Add FAQ</span>
            </button>
          )}
          <Link to="/admin/dashboard" className="btn-outline">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {(showCreateForm || editingFaq) && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
          </h2>
          <form onSubmit={editingFaq ? (e) => { e.preventDefault(); handleUpdate(editingFaq); } : handleCreate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder="Enter the question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer *
                </label>
                <textarea
                  required
                  rows="5"
                  className="input-field w-full"
                  placeholder="Enter the answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
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
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Publish this FAQ
                </label>
              </div>

              <div className="flex space-x-2">
                <button type="submit" className="btn-primary flex items-center space-x-2">
                  <FiCheck />
                  <span>{editingFaq ? 'Update' : 'Create'} FAQ</span>
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

      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search FAQs
        </label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by question, answer, or category..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {sortedFaqs.length === 0 ? (
        <div className="card text-center py-12">
          <FiHelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No FAQs found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedFaqs.map((faq) => (
            <div key={faq._id} className={`card ${!faq.isPublished ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </h3>
                  {!faq.isPublished && (
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded flex-shrink-0">
                      Unpublished
                    </span>
                  )}
                </div>
                {editingFaq === faq._id ? (
                  <div className="flex space-x-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleUpdate(faq._id)}
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
                  <div className="flex space-x-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleToggle(faq._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                      title={faq.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {faq.isPublished ? (
                        <FiToggleRight className="w-5 h-5" />
                      ) : (
                        <FiToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                      title="Edit"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id, faq.question)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs rounded mb-2">
                {getCategoryLabel(faq.category)}
              </span>

              {editingFaq === faq._id ? (
                <div className="space-y-4 mt-4">
                  <div>
                    <input
                      type="text"
                      className="input-field w-full"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    />
                  </div>
                  <div>
                    <textarea
                      rows="4"
                      className="input-field w-full"
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    />
                  </div>
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
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2 line-clamp-3">
                  {faq.answer}
                </p>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                Order: {faq.order} | Created: {new Date(faq.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Total: {sortedFaqs.length} FAQ(s)
      </div>
    </div>
  );
};

export default ManageFAQs;
