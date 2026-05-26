import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import axiosInstance from '../utils/axios';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'civil-engineering', label: 'Civil Engineering' },
  { value: 'license-exams', label: 'License Exams' },
  { value: 'tuition', label: 'Tuition' },
];

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, [activeCategory]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = activeCategory ? { category: activeCategory } : {};
      const response = await axiosInstance.get('/faqs', { params });
      if (response.data.success) {
        setFaqs(response.data.data);
      } else {
        setFaqs([]);
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs. Please try again later.');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
        Frequently Asked Questions
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Find answers about Civil Engineering, License Exams, and Tuition
      </p>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.value
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading FAQs...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchFAQs}
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No FAQs found for this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </h2>
                {openIndex === index ? (
                  <FiChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-700 dark:text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQs;
