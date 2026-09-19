import React from 'react';
import { 
  Phone, 
  Smartphone,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { openBookingModal, setSelectedSpecialtyFilter, language, openAppDownloadModal } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 shadow-2xl font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 1. TOP SECTION: MOBILE APP DOWNLOAD & EMERGENCY HELPLINE BANNER */}
        <div className="bg-linear-to-r from-[#0B1F3A] via-[#0D2B4E] to-[#132D4D] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left: App Tagline & Store Badges */}
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#0D9488]/20 text-[#2DD4BF] border border-[#0D9488]/40 px-3 py-1 rounded-full text-[11px] font-heading font-extrabold uppercase tracking-widest">
              <Smartphone className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>{language === 'en' ? 'Official Health App' : 'आधिकारिक मोबाइल ऐप'}</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              {language === 'en' ? 'Download Our Healthcare App' : 'हमारा हेल्थकेयर ऐप डाउनलोड करें'}
            </h3>
            <p className="text-xs text-[#CBD5E1] font-medium leading-relaxed">
              {language === 'en'
                ? 'Book OPD tokens, consult senior doctors on video, track live queues, and download instant digital prescriptions on iOS & Android.'
                : 'ओपीडी टोकन बुक करें, वीडियो पर डॉक्टरों से सलाह लें, लाइव लाइन देखें और तुरंत डिजिटल पर्ची डाउनलोड करें।'}
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 font-sans">
              {/* Google Play Store Badge */}
              <button
                type="button"
                onClick={() => openAppDownloadModal('android')}
                className="bg-slate-950/80 hover:bg-slate-950 text-white px-4 py-2.5 rounded-xl flex items-center gap-3 transition border border-white/10 shadow-md group cursor-pointer"
              >
                <svg className="w-6 h-6 fill-current text-[#2DD4BF] group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L18.81,17.12L6.15,22.84C5.78,23 5.38,22.95 5.07,22.7L15.12,12.65L16.81,15.12M16.81,8.88L15.12,11.35L5.07,1.3C5.38,1.05 5.78,1 6.15,1.16L18.81,6.88L16.81,8.88M19.97,12L17.75,9.78L15.75,11.78L17.75,13.78L19.97,12Z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 uppercase font-extrabold leading-none">GET IT ON</p>
                  <p className="text-xs font-black text-white leading-tight">Google Play</p>
                </div>
              </button>

              {/* Apple App Store Badge */}
              <button
                type="button"
                onClick={() => openAppDownloadModal('ios')}
                className="bg-slate-950/80 hover:bg-slate-950 text-white px-4 py-2.5 rounded-xl flex items-center gap-3 transition border border-white/10 shadow-md group cursor-pointer"
              >
                <svg className="w-6 h-6 fill-current text-slate-100 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.09,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 uppercase font-extrabold leading-none">Download on the</p>
                  <p className="text-xs font-black text-white leading-tight">App Store</p>
                </div>
              </button>
            </div>
          </div>

          {/* Right: 24x7 Emergency & NABH Support Card */}
          <div className="bg-[#132D4D]/90 text-white p-5 rounded-2xl border border-white/10 shadow-xl space-y-3 shrink-0 max-w-sm font-sans">
            <div className="flex items-center justify-between gap-3">
              <span className="bg-[#C2410C]/20 text-orange-200 border border-[#C2410C]/40 text-[10px] font-heading font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-orange-300 animate-pulse" />
                <span>{language === 'en' ? '24x7 Emergency' : '24x7 एमर्जेंसी'}</span>
              </span>
              <span className="text-[10px] text-[#2DD4BF] font-heading font-bold bg-[#0D9488]/20 px-2 py-0.5 rounded-full border border-[#0D9488]/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#2DD4BF]" />
                <span>NABH Accredited</span>
              </span>
            </div>

            <div>
              <p className="text-[11px] text-slate-300 font-medium">{language === 'en' ? 'Toll-Free Emergency & Ambulance Desk:' : 'टोल-फ्री एमर्जेंसी एवं एम्बुलेंस सहायता:'}</p>
              <a href="tel:1800-7382-723" className="text-xl font-heading font-extrabold text-[#5EAAF0] hover:text-white transition block mt-0.5">
                1800-SEVA-CLINIC
              </a>
              <p className="text-[10px] text-slate-400 font-normal">Sarangpur • Shujalpur • Rajgarh Network</p>
            </div>

            <div className="pt-2 flex items-center gap-2 font-sans">
              <a
                href="tel:1800-7382-723"
                className="bg-linear-to-r from-[#10B981] to-[#0D9488] hover:opacity-95 text-white font-heading font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Call Helpline' : 'कॉल करें'}</span>
              </a>
              <button
                onClick={() => openBookingModal()}
                className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/80 text-white font-heading font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition border border-white/10 cursor-pointer"
              >
                <span>{language === 'en' ? 'Book Slot' : 'स्लॉट बुक करें'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* 2. MAIN 4-COLUMN CORPORATE FOOTER LINKS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs pb-8 font-sans">
          
          {/* Column 1: Company Overview */}
          <div className="space-y-3">
            <h4 className="font-heading font-extrabold text-white text-sm tracking-wide">{language === 'en' ? 'Overview' : 'अवलोकन'}</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>
                <button onClick={() => setCurrentTab('about')} className="hover:text-sky-300 transition cursor-pointer">{language === 'en' ? 'About Jansevarogyam' : 'जनसेवा आरोग्यम के बारे में'}</button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('locations')} className="hover:text-sky-300 transition cursor-pointer">{language === 'en' ? 'Hospital Branches' : 'अस्पताल शाखाएँ'}</button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('specialties')} className="hover:text-sky-300 transition cursor-pointer">{language === 'en' ? 'NABH Accreditation' : 'एनएबीएच मान्यता'}</button>
              </li>
            </ul>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-extrabold text-white text-sm tracking-wide">{language === 'en' ? 'Quick Links' : 'त्वरित लिंक्स'}</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>
                <button onClick={() => setCurrentTab('specialties')} className="hover:text-sky-300 transition cursor-pointer">{language === 'en' ? 'Find A Specialist Doctor' : 'विशेषज्ञ डॉक्टर खोजें'}</button>
              </li>
              <li>
                <button onClick={() => openBookingModal()} className="hover:text-sky-300 transition cursor-pointer">{language === 'en' ? 'Book Physical OPD Token' : 'ओपीडी टोकन बुक करें'}</button>
              </li>
              <li>
                <button onClick={() => openBookingModal(undefined, undefined, 'VIDEO')} className="hover:text-sky-300 transition cursor-pointer">{language === 'en' ? 'Book Video Consultation' : 'वीडियो परामर्श बुक करें'}</button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('pharmacy')} className="hover:text-sky-300 transition cursor-pointer">{language === 'en' ? '24/7 Pharmacy Services' : '24/7 फार्मेसी सेवाएं'}</button>
              </li>
            </ul>
          </div>

          {/* Column 3: Clinical Specialties */}
          <div className="space-y-3">
            <h4 className="font-heading font-extrabold text-white text-sm tracking-wide">{language === 'en' ? 'Our Specialties' : 'हमारी विशेषज्ञताएँ'}</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>
                <button onClick={() => { setSelectedSpecialtyFilter('Internal Medicine'); setCurrentTab('specialties'); }} className="hover:text-sky-300 transition cursor-pointer text-left">{language === 'en' ? 'General Medicine & Diabetes' : 'जनरल मेडिसिन एवं शुगर'}</button>
              </li>
              <li>
                <button onClick={() => { setSelectedSpecialtyFilter('Child Health'); setCurrentTab('specialties'); }} className="hover:text-sky-300 transition cursor-pointer text-left">{language === 'en' ? 'Pediatrics & Neonatology' : 'बाल रोग एवं नवजात शिशु देखभाल'}</button>
              </li>
              <li>
                <button onClick={() => { setSelectedSpecialtyFilter('Bone & Joint'); setCurrentTab('specialties'); }} className="hover:text-sky-300 transition cursor-pointer text-left">{language === 'en' ? 'Orthopedics & Joint Surgery' : 'हड्डी एवं जोड़ रोग'}</button>
              </li>
              <li>
                <button onClick={() => { setSelectedSpecialtyFilter('Skin & Hair'); setCurrentTab('specialties'); }} className="hover:text-sky-300 transition cursor-pointer text-left">{language === 'en' ? 'Dermatology & Skin Care' : 'त्वचा एवं सौंदर्य'}</button>
              </li>
              <li>
                <button onClick={() => { setSelectedSpecialtyFilter('Cardiovascular'); setCurrentTab('specialties'); }} className="hover:text-sky-300 transition cursor-pointer text-left">{language === 'en' ? 'Cardiology & Heart Care' : 'हृदय रोग विशेषज्ञ'}</button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Support */}
          <div className="space-y-3">
            <h4 className="font-heading font-extrabold text-white text-sm tracking-wide">{language === 'en' ? 'Legal & Support' : 'कानूनी एवं सहायता'}</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>
                <button onClick={() => setCurrentTab('terms')} className="hover:text-sky-300 transition cursor-pointer text-left">
                  {language === 'en' ? 'Terms & Conditions' : 'नियम एवं शर्तें'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('privacy')} className="hover:text-sky-300 transition cursor-pointer text-left">
                  {language === 'en' ? 'Privacy Policy' : 'गोपनीयता नीति'}
                </button>
              </li>
            </ul>

            <div className="pt-3 space-y-1">
              <p className="font-heading font-extrabold text-white text-xs">{language === 'en' ? 'Helpdesk Helpline' : 'हेल्पडेस्क हेल्पलाइन'}</p>
              <p className="text-xs font-mono text-[#5EAAF0] font-bold">1800-JANSEVA-CLINIC (7382-723)</p>
            </div>
          </div>

        </div>

        {/* 3. BOTTOM COPYRIGHT BAR */}
        <div className="text-xs text-slate-400 pt-3 font-sans text-left">
          <p>© 2026 Jansevarogyam Health Care Network. {language === 'en' ? 'All rights reserved.' : 'सर्वाधिकार सुरक्षित।'}</p>
        </div>

      </div>
    </footer>
  );
};

