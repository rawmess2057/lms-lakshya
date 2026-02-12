import { FiCheckCircle, FiX } from 'react-icons/fi';
import useScrollAnimation from '../hooks/useScrollAnimation';

const CostComparison = () => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });
  
  const comparisons = [
    {
      name: 'Multan Academy',
      price: '12,000',
      currency: 'PKR',
      isHighlighted: true,
      features: [
        'Online Learning Platform',
        'Expert Teachers',
        'Interactive Content',
        'Certificates',
        '24/7 Access',
        'Affordable Pricing',
      ],
    },
    {
      name: 'Other Online Platforms',
      price: '32,000',
      currency: 'PKR',
      isHighlighted: false,
      features: [
        'Online Learning',
        'Limited Access',
        'Basic Support',
      ],
    },
    {
      name: 'Physical Academies',
      price: '60,000',
      currency: 'PKR',
      isHighlighted: false,
      features: [
        'In-Person Classes',
        'Fixed Schedule',
        'Travel Required',
      ],
    },
  ];

  return (
    <section ref={ref} className="py-12 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            75% More Cost-Effective Learning
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Compare our affordable pricing with other learning options and see why Multan Academy is the smart choice
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {comparisons.map((comparison, index) => (
            <div
              key={index}
              className={`card relative transition-all duration-200 ${
                comparison.isHighlighted
                  ? 'ring-2 ring-primary-600 shadow-xl'
                  : ''
              }`}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible 
                  ? (comparison.isHighlighted ? 'scale(1.05) translateY(0)' : 'translateY(0)')
                  : 'translateY(30px) scale(0.95)',
                transition: `opacity 0.4s ease-out ${index * 100}ms, transform 0.4s ease-out ${index * 100}ms`
              }}
            >
              {comparison.isHighlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Best Value
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    comparison.isHighlighted
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {comparison.name}
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {comparison.price}
                  </span>
                  <span className="text-lg text-gray-600 dark:text-gray-400 ml-2">
                    {comparison.currency}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {comparison.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    {comparison.isHighlighted ? (
                      <FiCheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <FiX className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        comparison.isHighlighted
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-500 dark:text-gray-500'
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {comparison.isHighlighted && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`text-center mt-6 mb-0 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: isVisible ? '400ms' : '0ms' }}>
          <div className="inline-block bg-primary-100 dark:bg-primary-900 px-6 py-3 rounded-lg">
            <p className="text-primary-700 dark:text-primary-300 font-semibold">
              Save up to 72% compared to physical academies
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CostComparison;

