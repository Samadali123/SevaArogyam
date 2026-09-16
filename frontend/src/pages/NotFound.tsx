import React from 'react';
import { useApp } from '../context/AppContext';
import { FiHome, FiGrid, FiCalendar, FiPhoneCall, FiArrowLeft } from 'react-icons/fi';

interface NotFoundProps {
  onNavigate?: (tab: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigate }) => {
  const { language, openBookingModal } = useApp();
  const isHi = language === 'hi';

  const handleGo = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-900 text-white relative overflow-hidden px-4 py-16 font-sans">
      {/* Background Lighting Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        {/* Hero 404 Typography */}
        <div className="space-y-3">
          <h1 className="text-7xl sm:text-9xl font-heading font-black tracking-tight bg-gradient-to-r from-emerald-400 via-sky-200 to-teal-300 bg-clip-text text-transparent leading-none">
            404
          </h1>
          <h2 className="text-2xl sm:text-4xl font-heading font-bold text-white">
            {isHi ? 'क्षमा करें! यह पृष्ठ उपलब्ध नहीं है' : 'Oops! Page Not Found'}
          </h2>
          <p className="text-sm sm:text-base text-sky-100/80 max-w-lg mx-auto font-medium leading-relaxed">
            {isHi
              ? 'आप जिस पृष्ठ की तलाश कर रहे हैं, वह स्थानांतरित कर दिया गया है या हटा दिया गया है। आप नीचे दिए गए विकल्पों से मुख्य पृष्ठ पर जा सकते हैं।'
              : 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
          </p>
        </div>

        {/* Quick Links Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-center">
          <button
            onClick={() => handleGo('home')}
            className="p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition group cursor-pointer flex flex-col items-center text-center justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
              <FiHome className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{isHi ? 'मुख्य पृष्ठ' : 'Home Portal'}</h3>
              <p className="text-xs text-sky-200/70 mt-1">{isHi ? 'सेवा सदन के मुख्य पृष्ठ पर जाएं' : 'Return to main homepage'}</p>
            </div>
          </button>

          <button
            onClick={() => handleGo('specialties')}
            className="p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition group cursor-pointer flex flex-col items-center text-center justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
              <FiGrid className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{isHi ? 'विशेषज्ञताएँ' : 'Specialties'}</h3>
              <p className="text-xs text-sky-200/70 mt-1">{isHi ? 'सभी 8 सुपर-स्पेशलिटी विभाग देखें' : 'Browse all clinical departments'}</p>
            </div>
          </button>

          <button
            onClick={() => openBookingModal()}
            className="p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition group cursor-pointer flex flex-col items-center text-center justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
              <FiCalendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{isHi ? 'टोकन बुक करें' : 'Book Appointment'}</h3>
              <p className="text-xs text-sky-200/70 mt-1">{isHi ? 'सारंगपुर, राजगढ़, शुजालपुर ओपीडी' : 'Instant live queue OPD token'}</p>
            </div>
          </button>
        </div>

        {/* Primary Action & Contact Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => handleGo('home')}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xl transition cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>{isHi ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to Home'}</span>
          </button>

          <a
            href="tel:+917382723000"
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 border border-white/15 transition cursor-pointer"
          >
            <FiPhoneCall className="w-4 h-4 text-emerald-400" />
            <span>{isHi ? 'हेल्पलाइन: +91 73827 23000' : 'Helpline: +91 73827 23000'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
