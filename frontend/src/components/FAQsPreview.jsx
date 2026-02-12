import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiHelpCircle } from 'react-icons/fi';
import useScrollAnimation from '../hooks/useScrollAnimation';

const FAQsPreview = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Extract first 6 FAQs from the main FAQs page
  const faqs = [
    {
      question: 'What is MDCAT?',
      answer: (
        <div>
          <p className="mb-2">MDCAT (Medical and Dental College Admission Test) is a standardized entrance exam in Pakistan for students who want admission to:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>MBBS</li>
            <li>BDS</li>
            <li>DPT</li>
            <li>Pharm-D (in many provinces)</li>
            <li>Other allied health sciences</li>
          </ul>
          <p className="mt-2">It is conducted under PMDC (Pakistan Medical & Dental Council) through provincial testing bodies.</p>
        </div>
      ),
    },
    {
      question: 'What is MDCAT test?',
      answer: (
        <div>
          <p className="mb-2">The MDCAT test is a multiple-choice (MCQs) based exam designed to evaluate a student's knowledge in science subjects required for medical education.</p>
          <p className="mb-2 font-semibold">Subjects included:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
            <li>Biology</li>
            <li>Chemistry</li>
            <li>Physics</li>
            <li>English</li>
            <li>Logical Reasoning</li>
          </ul>
          <p className="font-semibold">Total marks:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>200 marks</li>
            <li>No negative marking (as per recent policies)</li>
          </ul>
        </div>
      ),
    },
    {
      question: 'How to calculate MDCAT aggregate?',
      answer: (
        <div>
          <p className="mb-2">MDCAT aggregate is calculated by combining:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
            <li>MDCAT score</li>
            <li>FSc (Pre-Medical) or equivalent marks</li>
            <li>Matric marks</li>
          </ul>
          <p className="mb-2 font-semibold">Common formula (may vary by province):</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>MDCAT: 50%</li>
            <li>FSc: 40%</li>
            <li>Matric: 10%</li>
          </ul>
        </div>
      ),
    },
    {
      question: 'How to apply for MDCAT test?',
      answer: (
        <div>
          <p className="mb-2 font-semibold">Step-by-step process:</p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Visit official MDCAT portal (PMDC / provincial authority)</li>
            <li>Create an online account</li>
            <li>Fill application form</li>
            <li>Upload required documents</li>
            <li>Pay test fee via bank / online challan</li>
            <li>Download roll number slip</li>
            <li>Appear in the test</li>
          </ol>
        </div>
      ),
    },
    {
      question: 'How to prepare for MDCAT?',
      answer: (
        <div>
          <p className="mb-2 font-semibold">Best preparation strategy:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Study FSc syllabus thoroughly</li>
            <li>Use MDCAT preparation books</li>
            <li>Practice MCQs daily</li>
            <li>Take mock tests</li>
            <li>Focus more on Biology (highest weightage)</li>
            <li>Revise weak topics regularly</li>
          </ul>
          <p className="mt-2">Time management and consistency are key.</p>
        </div>
      ),
    },
    {
      question: 'Is calculator allowed in MDCAT?',
      answer: (
        <div>
          <p>No, calculators are NOT allowed in MDCAT.</p>
        </div>
      ),
    },
  ];

  return (
    <section ref={ref} className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
            <FiHelpCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about MDCAT and our platform
          </p>
        </div>

        <div className={`max-w-4xl mx-auto transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <FiChevronUp className="w-5 h-5 text-primary-600 dark:text-primary-400 transition-transform" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all" />
                    )}
                  </div>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 text-gray-700 dark:text-gray-300 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/faqs"
              className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors group"
            >
              <span>View All FAQs</span>
              <FiChevronDown className="w-4 h-4 transform rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQsPreview;

