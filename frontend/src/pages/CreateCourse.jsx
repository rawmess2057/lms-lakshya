import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiSave, FiX, FiArrowLeft, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [creating, setCreating] = useState(false);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    subject: '',
    category: '',
    level: 'beginner',
    duration: 0,
    thumbnail: '',
    demoVideo: '',
    isPublished: false,
  });

  useEffect(() => {
    fetchSubjects();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.category) {
      const filtered = subjects.filter(sub =>
        (sub.category?._id === formData.category) ||
        (sub.category === formData.category)
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects([]);
    }
  }, [formData.category, subjects]);

  const fetchSubjects = async () => {
    try {
      const response = await axiosInstance.get('/subjects');
      setSubjects(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load subjects');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => {
      const updates = { ...prev, [name]: type === 'checkbox' ? checked : value };

      if (name === 'category') {
        updates.subject = '';
      }
      return updates;
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a course title');
      return;
    }
    if (!formData.subject) {
      toast.error('Please select a subject');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a course description');
      return;
    }

    setCreating(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('price', formData.price);
      fd.append('subject', formData.subject);
      fd.append('category', formData.category);
      fd.append('level', formData.level);
      fd.append('duration', formData.duration);
      fd.append('demoVideo', formData.demoVideo);
      fd.append('isPublished', formData.isPublished);
      if (thumbnailFile) {
        fd.append('thumbnail', thumbnailFile);
      }
      const response = await axiosInstance.post('/courses', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Course created successfully!');
      navigate(`/teacher/courses/${response.data.data._id}/edit`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/teacher/dashboard"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FiArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Course
          </h1>
        </div>
      </div>

      <form onSubmit={handleCreateCourse} className="max-w-4xl">
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            Course Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Enter course title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field w-full"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="input-field w-full"
                required
              >
                <option value="">Select Subject</option>
                {filteredSubjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              {formData.category && filteredSubjects.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No subjects available for this category.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="input-field w-full"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="input-field w-full"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (hours) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                step="0.5"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thumbnail
              </label>
              <div className="flex items-center space-x-4">
                <label className="btn-outline cursor-pointer flex items-center space-x-2">
                  <FiUpload />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </label>
                {thumbnailPreview && (
                  <div className="relative w-20 h-20 rounded overflow-hidden">
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Optional: Upload a thumbnail image for your course. JPG, PNG, GIF, WEBP accepted.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Demo Video URL
              </label>
              <input
                type="url"
                name="demoVideo"
                value={formData.demoVideo}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://www.youtube.com/watch?v=... or video URL"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Optional: Add a free demo/preview video URL for your course (YouTube, Vimeo, or direct video link)
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input-field w-full"
              rows="6"
              placeholder="Enter a detailed description of your course"
              required
            />
          </div>

          <div className="mt-6 flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              id="isPublished"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Publish course immediately
            </label>
          </div>

          <div className="mt-8 flex justify-end space-x-2">
            <Link
              to="/teacher/dashboard"
              className="btn-outline flex items-center space-x-2"
            >
              <FiX />
              <span>Cancel</span>
            </Link>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary flex items-center space-x-2"
            >
              <FiSave />
              <span>{creating ? 'Creating...' : 'Create Course'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;
