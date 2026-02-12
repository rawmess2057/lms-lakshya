import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
      question: 'How to calculate MDCAT aggregate (example)?',
      answer: (
        <div>
          <p className="mb-2 font-semibold">Example:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
            <li>MDCAT marks: 150/200</li>
            <li>FSc marks: 900/1100</li>
            <li>Matric marks: 950/1100</li>
          </ul>
          <p className="mb-2 font-semibold">Calculation:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>MDCAT: (150/200) × 50 = 37.5</li>
            <li>FSc: (900/1100) × 40 = 32.7</li>
            <li>Matric: (950/1100) × 10 = 8.6</li>
          </ul>
          <p className="mt-2 font-semibold">Total Aggregate = 78.8%</p>
        </div>
      ),
    },
    {
      question: 'Is MDCAT necessary for D-Pharmacy?',
      answer: (
        <div>
          <p className="mb-2">It depends on the university and province.</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Public universities: Usually YES</li>
            <li>Private universities: Sometimes NO</li>
          </ul>
          <p className="mt-2">Some universities allow admission on FSc merit only, while others require MDCAT.</p>
          <p className="mt-2">Always check the official admission policy of the university.</p>
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
      question: 'How to apply for MDCAT?',
      answer: (
        <div>
          <p className="mb-2">You apply online only through the official website announced each year by PMDC or provincial testing agencies (like UHS, KMU, etc.).</p>
          <p className="font-semibold">No manual applications are accepted.</p>
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
    {
      question: 'Is domicile required for MDCAT?',
      answer: (
        <div>
          <p className="mb-2">Yes, domicile is required, but not at the time of MDCAT test.</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>MDCAT test done ke liye domicile zaroori nahi hota</li>
            <li>Admission ke time (public medical colleges) domicile mandatory hota hai</li>
            <li>Private colleges mein kabhi kabhi domicile required nahi hota</li>
          </ul>
          <p className="mt-2">Domicile se provincial quota decide hota hai</p>
        </div>
      ),
    },
    {
      question: 'How to check MDCAT result?',
      answer: (
        <div>
          <p className="mb-2 font-semibold">Step-by-step:</p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Visit the official MDCAT result website (PMDC / testing authority)</li>
            <li>Click on "MDCAT Result"</li>
            <li>Enter:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>Roll number OR</li>
                <li>CNIC/B-Form</li>
              </ul>
            </li>
            <li>Click Search</li>
            <li>Download or print your result</li>
          </ol>
        </div>
      ),
    },
    {
      question: 'Is MDCAT necessary for BDS?',
      answer: (
        <div>
          <p className="mb-2">Yes, MDCAT is mandatory for BDS in Pakistan.</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Public dental colleges → MDCAT compulsory</li>
            <li>Private dental colleges → Mostly required</li>
            <li>Without MDCAT, BDS admission is not possible in recognized colleges</li>
          </ul>
        </div>
      ),
    },
    {
      question: 'How to find aggregate for MDCAT?',
      answer: (
        <div>
          <p className="mb-2">MDCAT aggregate is calculated using:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
            <li>MDCAT marks</li>
            <li>FSc (Pre-Medical) marks</li>
            <li>Matric marks</li>
          </ul>
          <p className="font-semibold">Common weightage:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>MDCAT → 50%</li>
            <li>FSc → 40%</li>
            <li>Matric → 10%</li>
          </ul>
        </div>
      ),
    },
    {
      question: 'What is MDCAT in Pakistan?',
      answer: (
        <div>
          <p className="mb-2">In Pakistan, MDCAT is the national-level medical entrance exam conducted under PMDC for admission in:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>MBBS</li>
            <li>BDS</li>
            <li>DPT</li>
            <li>Allied health sciences</li>
          </ul>
          <p className="mt-2">It ensures merit-based and transparent admissions.</p>
        </div>
      ),
    },
    {
      question: 'What is NUMS MDCAT?',
      answer: (
        <div>
          <p className="mb-2">NUMS MDCAT is the entrance test conducted by:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
            <li>National University of Medical Sciences (NUMS)</li>
          </ul>
          <p className="mb-2">It is required for admission in:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Armed Forces medical colleges</li>
            <li>NUMS-affiliated institutions</li>
          </ul>
          <p className="mt-2">It is separate from PMDC MDCAT, and students may appear in both tests.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        Frequently Asked Questions (FAQs)
      </h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
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
    </div>
  );
};

export default FAQs;

