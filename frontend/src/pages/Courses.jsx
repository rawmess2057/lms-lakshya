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

  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get('categoryId') || null);
  const [selectedCategoryName, setSelectedCategoryName] = useState(searchParams.get('categoryName') || '');

  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get('subject') || null);
  const [selectedSubjectName, setSelectedSubjectName] = useState(searchParams.get('subjectName') || '');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    level: searchParams.get('level') || '',
  });

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchSubjects()]);
      setLoading(false);
    };
    initFetch();
  }, []);

  useEffect(() => {
    const catId = searchParams.get('categoryId');
    const catName = searchParams.get('categoryName');
    const subId = searchParams.get('subject');
    const subName = searchParams.get('subjectName');

    if (catId !== selectedCategoryId) setSelectedCategoryId(catId);
    if (catName !== selectedCategoryName) setSelectedCategoryName(catName);

    if (subId !== selectedSubjectId) setSelectedSubjectId(subId);
    if (subName !== selectedSubjectName) setSelectedSubjectName(subName);

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

  useEffect(() => {
    if (selectedSubjectId) {
      fetchCourses(selectedCategoryId, selectedSubjectId);
    }
  }, [filters, selectedSubjectId]);


  const filteredSubjects = selectedCategoryId
    ? subjects.filter(
      (sub) => sub.category?._id === selectedCategoryId || sub.category === selectedCategoryId
    )
    : subjects;

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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900 dark:via-primary-950 dark:to-primary-900">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Explore Categories
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Choose a category to discover subjects and courses tailored for you
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center max-w-md mx-auto">
              <p className="text-gray-500 dark:text-gray-400">No categories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => handleCategorySelect(category._id, category.name)}
                  className="glass-card rounded-2xl cursor-pointer flex flex-col items-center justify-center p-0 overflow-hidden text-center group h-64"
                >
                  {category.image ? (
                    <div className="w-full h-full relative">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/40 to-transparent flex flex-col items-center justify-end p-6">
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-white/80 text-sm line-clamp-2 drop-shadow-md">{category.description}</p>
                        )}
                        <span className="mt-3 text-secondary-300 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                          Browse Subjects &rarr;
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full p-8 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20">
                        <span className="text-2xl font-bold text-white">
                          {category.name ? category.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{category.description}</p>
                      )}
                      <span className="mt-4 text-primary-600 dark:text-secondary-400 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                        Browse Subjects &rarr;
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // View: 2. SUBJECTS LIST
  if (selectedCategoryId && !selectedSubjectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900 dark:via-primary-950 dark:to-primary-900">
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={handleBackToCategories}
            className="group glass-card-static rounded-full px-5 py-2.5 flex items-center gap-2 text-primary-600 dark:text-secondary-400 hover:border-secondary-500/40 transition-all duration-300 mb-8"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Categories</span>
          </button>

          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedCategoryName || 'Subjects'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Select a subject to view courses</p>
          </div>

          {filteredSubjects.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center max-w-md mx-auto">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No subjects found in this category.</p>
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
                  className="glass-card rounded-2xl cursor-pointer flex flex-col items-center justify-center p-0 overflow-hidden text-center group h-64"
                >
                  {subject.image ? (
                    <div className="w-full h-full relative">
                      <img
                        src={subject.image}
                        alt={subject.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/40 to-transparent flex flex-col justify-end p-6">
                        <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                          {subject.name}
                        </h3>
                        {subject.description && (
                          <p className="text-white/80 text-sm line-clamp-2 drop-shadow-md">{subject.description}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full p-8 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                        <FiGrid className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {subject.name}
                      </h3>
                      {subject.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{subject.description}</p>
                      )}
                      <span className="mt-4 text-primary-600 dark:text-secondary-400 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                        View Courses &rarr;
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // View: 3. COURSES LIST
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900 dark:via-primary-950 dark:to-primary-900">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <button
              onClick={handleBackToSubjects}
              className="group glass-card-static rounded-full px-5 py-2.5 flex items-center gap-2 text-primary-600 dark:text-secondary-400 hover:border-secondary-500/40 transition-all duration-300 mb-4"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to {selectedCategoryName} Subjects</span>
            </button>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {selectedSubjectName || 'Courses'}
            </h1>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="glass-card-static rounded-2xl p-6 mb-8">
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
          <div className="glass-card rounded-2xl text-center py-16 px-8 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiBook className="w-10 h-10 text-primary-500 dark:text-secondary-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No courses found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">Try adjusting your search or filters</p>
            <button onClick={() => handleFilterChange('search', '')} className="btn-primary">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="glass-card rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-800 dark:to-primary-900 flex items-center justify-center overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <FiBook className="w-16 h-16 text-primary-400 dark:text-primary-500" />
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/20 dark:border-white/5">
                    <span className="text-primary-600 dark:text-secondary-400 font-bold text-lg">
                      {course.price ? course.price.toLocaleString() : '0'} <span className="text-sm font-normal">NPR</span>
                    </span>
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary-500/10 dark:bg-secondary-500/10 text-primary-600 dark:text-secondary-400">
                      {course.level}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
