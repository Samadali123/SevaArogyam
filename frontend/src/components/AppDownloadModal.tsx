import React from 'react';
import { useApp } from '../context/AppContext';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import { FaGooglePlay, FaApple } from 'react-icons/fa6';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform?: 'android' | 'ios' | 'both';
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose, platform = 'both' }) => {
  const { language } = useApp();

  if (!isOpen) return null;

  const isHi = language === 'hi';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden font-sans animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Background Accent */}
        <div className="bg-gradient-to-r from-[#0A2540] via-[#0F4C81] to-[#0B2545] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition cursor-pointer"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {isHi ? 'प्रगति पर है' : 'Development in Progress'}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {isHi ? 'सेवा सदन मोबाइल ऐप' : 'Sevasadan Arogyam Mobile App'}
          </h3>
          <p className="text-xs text-sky-200/90 font-medium mt-1">
            {isHi 
              ? 'एंड्रॉइड एवं आईओएस ऐप जल्द ही प्ले स्टोर और ऐप स्टोर पर उपलब्ध होगा।'
              : 'Our Android & iOS applications are coming soon to Google Play Store & Apple App Store.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Platforms Badges */}
          <div className="flex items-center justify-center gap-3">
            <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition ${
              platform === 'android' || platform === 'both'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <FaGooglePlay className="w-5 h-5 text-emerald-600" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-500">Google Play</p>
                <p className="text-xs font-black text-slate-800">{isHi ? 'एंड्रॉइड ऐप' : 'Android App'}</p>
              </div>
            </div>

            <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition ${
              platform === 'ios' || platform === 'both'
                ? 'bg-sky-50 border-sky-200 text-sky-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <FaApple className="w-5 h-5 text-slate-800" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-500">App Store</p>
                <p className="text-xs font-black text-slate-800">{isHi ? 'आईओएस ऐप' : 'iOS App'}</p>
              </div>
            </div>
          </div>

          {/* Highlights List */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{isHi ? 'लाइव ओपीडी टोकन ट्रैकिंग एवं लाइव कतार स्थिति' : 'Live OPD token queue tracking directly on your phone'}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{isHi ? 'व्हाट्सएप एवं ऐप पर 1-क्लिक डिजिटल पीडीएफ प्रिस्क्रिप्शन' : '1-Click digital PDF prescriptions & lab reports'}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{isHi ? 'आसान एचडी वीडियो टेलीमेडिसिन कंसल्टेशन' : 'Seamless HD video consultations with specialists'}</span>
            </div>
          </div>



          {/* Use Web App Button */}
          <button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer text-center"
          >
            {isHi ? 'अभी वेब पोर्टल पर जारी रखें' : 'Continue on Web Application'}
          </button>
        </div>
      </div>
    </div>
  );
};
