import { FiMessageCircle } from 'react-icons/fi';
import { useState } from 'react';

const WhatsAppButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const whatsappNumber = '923126341138';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pulse animation ring */}
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
      
      {/* Main button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center space-x-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-5 py-4 shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 active:scale-95 transform group"
        aria-label="Contact us on WhatsApp"
        title="Chat with us on WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <FiMessageCircle className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`} />
        {isHovered && (
          <span className="text-sm font-semibold whitespace-nowrap pr-2 animate-fade-in">
            Chat with us
          </span>
        )}
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 pointer-events-none"></div>
      </a>
    </div>
  );
};

export default WhatsAppButton;

