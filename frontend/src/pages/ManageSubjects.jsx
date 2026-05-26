import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiBook, FiSearch, FiEdit, FiTrash2, FiPlus, FiX, FiCheck, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchCategories();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axiosInstance.get('/subjects');
      setSubjects(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('category', formData.category);
      if (imageFile) {
        fd.append('image', imageFile);
      }
      await axiosInstance.post('/subjects', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Subject created successfully');
      setShowCreateForm(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create subject');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject._id);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      image: subject.image || '',
      category: subject.category?._id || subject.category || '',
    });
    setImageFile(null);
    setImagePreview(subject.image || '');
    setShowCreateForm(false);
  };

  const handleUpdate = async (subjectId) => {
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('category', formData.category);
      if (imageFile) {
        fd.append('image', imageFile);
      }
      await axiosInstance.put(`/subjects/${subjectId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Subject updated successfully');
      setEditingSubject(null);
      resetForm();
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update subject');
    }
  };

  const handleDelete = async (subjectId, subjectName) => {
    if (!window.confirm(`Are you sure you want to delete subject "${subjectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/subjects/${subjectId}`);
      toast.success('Subject deleted successfully');
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete subject');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingSubject(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', image: '', category: '' });
    setImageFile(null);
    setImagePreview('');
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = searchTerm === '' ||
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Subjects</h1>
        <div className="flex space-x-2">
          {!showCreateForm && !editingSubject && (
            <button
              onClick={() => {
                setShowCreateForm(true);
                resetForm();
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus />
              <span>Add Subject</span>
            </button>
          )}
          <Link to="/admin/dashboard" className="btn-outline">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingSubject) && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {editingSubject ? 'Edit Subject' : 'Create New Subject'}
          </h2>
          <form onSubmit={editingSubject ? (e) => { e.preventDefault(); handleUpdate(editingSubject); } : handleCreate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder="Enter subject name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  required
                  className="input-field w-full"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="input-field w-full"
                  rows="4"
                  placeholder="Enter subject description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image
                </label>
                <div className="flex items-center space-x-4">
                  <label className="btn-outline cursor-pointer flex items-center space-x-2">
                    <FiUpload />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                  {imagePreview && (
                    <div className="relative w-20 h-20 rounded overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Upload an image (optional). JPG, PNG, GIF, WEBP accepted.</p>
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="btn-primary flex items-center space-x-2">
                  <FiCheck />
                  <span>{editingSubject ? 'Update' : 'Create'} Subject</span>
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
          Search Subjects
        </label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or description..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Subjects List */}
      {filteredSubjects.length === 0 ? (
        <div className="card text-center py-12">
          <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No subjects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <div key={subject._id} className="card overflow-hidden">
              <div className="h-32 bg-gray-100 dark:bg-gray-700 mb-4 rounded-t-lg -mx-6 -mt-6 flex items-center justify-center overflow-hidden">
                {subject.image ? (
                  <img src={subject.image} alt={subject.name} className="w-full h-full object-cover" />
                ) : (
                  <FiBook className="w-12 h-12 text-primary-300" />
                )}
              </div>
              <div className="flex items-start justify-between mb-4">
                <FiBook className="w-5 h-5 text-gray-400 flex-shrink-0" />
                {editingSubject === subject._id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdate(subject._id)}
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
                      onClick={() => handleEdit(subject)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                      title="Edit"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(subject._id, subject.name)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {editingSubject === subject._id ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      className="input-field w-full"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <textarea
                      className="input-field w-full"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="btn-outline cursor-pointer flex items-center space-x-2 text-sm">
                      <FiUpload />
                      <span>{imageFile ? 'Change File' : 'Choose File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                    {imagePreview && (
                      <div className="mt-2 w-full h-24 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div>
                    <select
                      className="input-field w-full"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {subject.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {subject.description || 'No description available'}
                  </p>
                  <p className="text-sm font-medium text-primary-600 mb-2">
                    Category: {subject.category?.name || 'Uncategorized'}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Created: {new Date(subject.createdAt).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Total: {filteredSubjects.length} subject(s)
      </div>
    </div>
  );
};

export default ManageSubjects;
