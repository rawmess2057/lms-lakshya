import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiBook, FiSearch, FiArrowLeft, FiGrid, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for hierarchical navigation
  // We use IDs for logic and Names for display
  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get('categoryId') || null);
  const [selectedCategoryName, setSelectedCategoryName] = useState(searchParams.get('categoryName') || '');

  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get('subject') || null);
  const [selectedSubjectName, setSelectedSubjectName] = useState(searchParams.get('subjectName') || '');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    level: searchParams.get('level') || '',
  });

  useEffect(() => {
    // Initial data fetch
    const initFetch = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchSubjects()]);
      setLoading(false);
    };
    initFetch();
  }, []);

  useEffect(() => {
    // Sync state with URL params on mount/update
    const catId = searchParams.get('categoryId');
    const catName = searchParams.get('categoryName');
    const subId = searchParams.get('subject');
    const subName = searchParams.get('subjectName');

    if (catId !== selectedCategoryId) setSelectedCategoryId(catId);
    if (catName !== selectedCategoryName) setSelectedCategoryName(catName);

    if (subId !== selectedSubjectId) setSelectedSubjectId(subId);
    if (subName !== selectedSubjectName) setSelectedSubjectName(subName);

    // If we have selected a subject, fetch courses for it
    if (subId) {
      fetchCourses(catId, subId);
    } else {
      setCourses([]);
    }
  }, [searchParams]);

  const updateUrlParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const fetchCourses = async (categoryId, subjectId) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);

      // Use IDs for filtering
      if (subjectId) params.append('subject', subjectId);
      if (categoryId) params.append('category', categoryId);

      if (filters.level) params.append('level', filters.level);

      const response = await axiosInstance.get(`/courses?${params.toString()}`);
      setCourses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching courses", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axiosInstance.get('/subjects');
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error("Error fetching subjects", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  // Handlers for Navigation
  const handleCategorySelect = (categoryId, categoryName) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    updateUrlParams({
      categoryId: categoryId,
      categoryName: categoryName,
      subject: null,
      subjectName: null
    });
  };

  const handleSubjectSelect = (subjectId, subjectName) => {
    setSelectedSubjectId(subjectId);
    setSelectedSubjectName(subjectName);
    updateUrlParams({ subject: subjectId, subjectName: subjectName });
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedCategoryName('');
    setSelectedSubjectId(null);
    setSelectedSubjectName('');
    setCourses([]);
    updateUrlParams({ categoryId: null, categoryName: null, subject: null, subjectName: null });
  };

  const handleBackToSubjects = () => {
    setSelectedSubjectId(null);
    setSelectedSubjectName('');
    setCourses([]);
    updateUrlParams({ subject: null, subjectName: null });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      return newFilters;
    });
  };

  // Effect to refetch courses when filters change (only if subject is selected)
  useEffect(() => {
    if (selectedSubjectId) {
      fetchCourses(selectedCategoryId, selectedSubjectId);
    }
  }, [filters, selectedSubjectId]);


  // Helper to filter subjects by selected category ID
  // subject.category is now populated object { _id, name } from backend
  // But strictly speaking we just look at the ID
  const filteredSubjects = selectedCategoryId
    ? subjects.filter(
      (sub) => sub.category?._id === selectedCategoryId || sub.category === selectedCategoryId
    )
    : subjects;

  // --- RENDER HELPERS ---

  if (loading && !courses.length && !categories.length && !subjects.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // View: 1. CATEGORIES LIST
  if (!selectedCategoryId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Select a Category
        </h1>

        {categories.length === 0 ? (
          <div className="text-center text-gray-500">No categories found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category._id}
                onClick={() => handleCategorySelect(category._id, category.name)}
                className="card hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center p-0 overflow-hidden text-center group h-64"
              >
                {category.image ? (
                  <div className="w-full h-full relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                      <h3 className="text-2xl font-bold text-white drop-shadow-md">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-white/90 mt-2 text-sm line-clamp-2 drop-shadow-md">{category.description}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full p-8 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform duration-300">
                      {category.name ? category.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-gray-500 mt-2 text-sm line-clamp-2">{category.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // View: 2. SUBJECTS LIST
  if (selectedCategoryId && !selectedSubjectId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={handleBackToCategories}
          className="flex items-center text-primary-600 mb-6 hover:underline"
        >
          <FiArrowLeft className="mr-2" /> Back to Categories
        </button>

        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          {selectedCategoryName || 'Subjects'}
        </h1>
        <p className="text-gray-500 mb-8">Select a subject to view courses</p>

        {filteredSubjects.length === 0 ? (
          <div className="text-center py-12 card">
            <p className="text-gray-600 mb-4">No subjects found in this category.</p>
            <button onClick={handleBackToCategories} className="btn-primary">
              Browse other categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <div
                key={subject._id}
                onClick={() => handleSubjectSelect(subject._id, subject.name)}
                className="card hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center p-0 overflow-hidden text-center group h-64"
              >
                {subject.image ? (
                  <div className="w-full h-full relative">
                    <img
                      src={subject.image}
                      alt={subject.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {subject.name}
                      </h3>
                      {subject.description && (
                        <p className="text-gray-200 text-sm line-clamp-2">{subject.description}</p>
                      )}

                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full p-8 flex flex-col items-center justify-center">
                    <FiGrid className="w-12 h-12 text-primary-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {subject.name}
                    </h3>
                    {subject.description && (
                      <p className="text-gray-500 mt-2 text-sm line-clamp-2">{subject.description}</p>
                    )}
                    <span className="mt-4 text-sm text-primary-600 font-medium">View Courses &rarr;</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // View: 3. COURSES LIST
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <button
            onClick={handleBackToSubjects}
            className="flex items-center text-primary-600 mb-2 hover:underline"
          >
            <FiArrowLeft className="mr-2" /> Back to {selectedCategoryName} Subjects
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {selectedSubjectName || 'Courses'}
          </h1>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Courses
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="input-field pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Level
            </label>
            <select
              className="input-field"
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">No courses found for this subject.</p>
          <button onClick={() => handleFilterChange('search', '')} className="text-primary-600 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course._id}
              to={`/courses/${course._id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <FiBook className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {course.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-primary-600 font-bold">{course.price ? course.price.toLocaleString() : '0'} PKR</span>
                <span className="text-sm text-gray-500">
                  {course.level}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
