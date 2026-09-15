import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, 
  Stethoscope, 
  ShieldAlert, 
  Calendar, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User,
  ShieldCheck,
  Home,
  Info,
  Award,
  Share2,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    currentUser, 
    activeRole, 
    language,
    setLanguage,
    openAuthModal,
    openAdminAuthModal,
    openStaffAuthModal,
    isAdminAuthenticated, 
    isLoggingOut,
    logout,
    openBookingModal,
    setActiveBranchId,
    clinics,
    specialties,
    setSelectedSpecialtyFilter
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isStaffOrAdminOrDoctor = Boolean(
    (currentUser && (
      currentUser.role === 'DOCTOR' || 
      currentUser.role === 'ADMIN' || 
      currentUser.role === 'DESK_STAFF'
    )) || (
      isAdminAuthenticated
    )
  );

  const handleLogout = async () => {
    await logout();
    setCurrentTab('home');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  };

  // Prevent background scrolling (hero section bleed) when sidebar menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-xs">
      
      {/* Top Banner: Emergency Helpline (Only shown for Public/Patients) */}
      {!isStaffOrAdminOrDoctor && (
        <div className="hidden sm:block bg-linear-to-r from-[#0A2540] via-[#0F2C59] to-[#0284C7] text-white text-xs py-1.5 px-3 border-b border-white/10">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-2">
            
            {/* Emergency & Branches */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 font-semibold bg-rose-500/20 text-rose-200 px-2.5 py-0.5 rounded-full border border-rose-400/30">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
                <span>{language === 'en' ? '24x7 Emergency Line:' : '24x7 हेल्पलाइन:'}</span>
                <a href="tel:1800-7382-723" className="font-extrabold underline text-white hover:text-sky-200">
                  1800-SEVA-CLINIC (1800-7382-723)
                </a>
              </span>

              <span className="hidden lg:flex items-center gap-2 text-sky-100/90 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>NABH Accredited Healthcare Network • Sarangpur • Shujalpur • Rajgarh</span>
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            if (!isStaffOrAdminOrDoctor) setCurrentTab('home');
          }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#0284C7] via-[#0F2C59] to-[#0A2540] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all glow-teal">
            <Stethoscope className="w-5.5 h-5.5 text-sky-300" />
          </div>
          <span className="font-outfit font-extrabold text-2xl bg-linear-to-r from-[#0A2540] via-[#0F2C59] to-[#0284C7] bg-clip-text text-transparent tracking-tight">
            JansevaArogyam
          </span>
        </div>

        {/* Doctor, Admin & Staff Panel Header: Brand Logo on Left, Language Toggle & Logout on Right */}
        {isStaffOrAdminOrDoctor ? (
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            {/* Hindi / English Language Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-heading font-extrabold shadow-inner shrink-0">
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'hi' 
                    ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'en' 
                    ? 'bg-[#0F4C81] text-white shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                  <span>{language === 'en' ? 'Logging out...' : 'लॉग आउट हो रहा है...'}</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>{language === 'en' ? 'Logout' : 'लॉग आउट'}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Navigation Links - Segmented Pill Bar for Patients/Public */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
              <button
                onClick={() => setCurrentTab('home')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'home' 
                    ? 'bg-linear-to-r from-[#0F4C81] to-[#0B2545] text-white shadow-md' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/90'
                }`}
              >
                <span>{language === 'en' ? 'Home' : 'मुख्य पृष्ठ'}</span>
              </button>

              {/* About Us (Single Direct Button) */}
              <button
                onClick={() => setCurrentTab('about')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'about' 
                    ? 'bg-linear-to-r from-[#0F4C81] to-[#0B2545] text-white shadow-md' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/90'
                }`}
              >
                <span>{language === 'en' ? 'About Us' : 'हमारे बारे में'}</span>
              </button>

              {/* Specialties with Hover Dropdown */}
              <div className="relative" onMouseEnter={() => setOpenDropdown('specialties')} onMouseLeave={() => setOpenDropdown(null)}>
                <button
                  onClick={() => { setSelectedSpecialtyFilter('all'); setCurrentTab('specialties'); setOpenDropdown(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentTab === 'specialties' 
                      ? 'bg-linear-to-r from-[#0F4C81] to-[#0B2545] text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/90'
                  }`}
                >
                  <span>{language === 'en' ? 'Specialties' : 'विशेषज्ञताएँ'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform opacity-70 ${openDropdown === 'specialties' ? 'rotate-180' : ''}`} />
                </button>

                {/* Hover Menu */}
                <div className={`${openDropdown === 'specialties' ? 'block' : 'hidden'} absolute top-full left-0 pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-150`}>
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-slate-200/90 space-y-1 max-h-72 overflow-y-auto">
                    {specialties.map(sp => (
                      <button
                        key={sp.id}
                        onClick={() => { setSelectedSpecialtyFilter(sp.category || sp.id); setCurrentTab('specialties'); setOpenDropdown(null); }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 text-xs font-bold text-slate-800 flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="truncate">{language === 'en' ? sp.nameEn : (sp.nameHi || sp.nameEn)}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Locations & Facilities with Hover Dropdown */}
              <div className="relative" onMouseEnter={() => setOpenDropdown('locations')} onMouseLeave={() => setOpenDropdown(null)}>
                <button
                  onClick={() => { setActiveBranchId('all'); setCurrentTab('locations'); setOpenDropdown(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentTab === 'locations' 
                      ? 'bg-linear-to-r from-[#0F4C81] to-[#0B2545] text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/90'
                  }`}
                >
                  <span>{language === 'en' ? 'Locations & Facilities' : 'शाखाएँ एवं सुविधाएं'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform opacity-70 ${openDropdown === 'locations' ? 'rotate-180' : ''}`} />
                </button>

                {/* Hover Menu */}
                <div className={`${openDropdown === 'locations' ? 'block' : 'hidden'} absolute top-full left-0 pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-150`}>
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-slate-200/90 space-y-1 max-h-72 overflow-y-auto">
                    {clinics.map(c => {
                      const branchNameHi = c.nameHi || (c.id === 'rajgarh' || c.name.toLowerCase().includes('rajgarh') ? 'राजगढ़ शाखा' : (c.id === 'sarangpur' || c.name.toLowerCase().includes('sarangpur') ? 'सारंगपुर शाखा' : (c.id === 'shujalpur' || c.name.toLowerCase().includes('shujalpur') ? 'शुजालपुर शाखा' : c.name.replace(/Branch/i, 'शाखा'))));
                      return (
                        <button
                          key={c.id}
                          onClick={() => { setActiveBranchId(c.id); setCurrentTab('locations'); setOpenDropdown(null); }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 hover:text-[#0F4C81] text-xs font-bold text-slate-800 flex items-center justify-between transition cursor-pointer"
                        >
                          <span className="truncate">{language === 'en' ? c.name : branchNameHi}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* JansevaArogyam Care Services */}
              <div className="relative" onMouseEnter={() => setOpenDropdown('services')} onMouseLeave={() => setOpenDropdown(null)}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'services' ? null : 'services')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    ['pharmacy', 'diagnostics', 'laboratory'].includes(currentTab)
                      ? 'bg-linear-to-r from-[#0F4C81] to-[#0B2545] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/90'
                  }`}
                >
                  <span>{language === 'en' ? 'Care Services' : 'देखभाल सेवाएं'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform opacity-70 ${openDropdown === 'services' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`${openDropdown === 'services' ? 'block' : 'hidden'} absolute top-full left-0 pt-2 w-52 z-50 animate-in fade-in slide-in-from-top-2 duration-150`}>
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-slate-200/90 space-y-1">
                    {[
                      ['pharmacy', language === 'en' ? 'Pharmacy' : 'फार्मेसी'],
                      ['diagnostics', language === 'en' ? 'Diagnostics' : 'डायग्नोस्टिक्स'],
                      ['laboratory', language === 'en' ? 'Laboratory' : 'प्रयोगशाला']
                    ].map(([tab, label]) => (
                      <button 
                        key={tab} 
                        onClick={() => { setCurrentTab(tab); setOpenDropdown(null); }} 
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 hover:text-[#0F4C81] text-xs font-bold text-slate-800 flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="truncate">{label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Refer & Earn Tab (Added right before My Dashboard) */}
              <button
                onClick={() => setCurrentTab('referrals')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'referrals' 
                    ? 'bg-linear-to-r from-[#0F4C81] to-[#0B2545] text-white shadow-md' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/90'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'en' ? 'Refer & Earn' : 'रेफर करें और कमाएं'}</span>
              </button>

              {/* My Dashboard (when Patient logged in) */}
              {activeRole === 'PATIENT' && (
                <button
                  onClick={() => setCurrentTab('patient-dashboard')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentTab === 'patient-dashboard' 
                      ? 'bg-linear-to-r from-[#0F4C81] to-[#0B2545] text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/90'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'My Dashboard' : 'मेरा डैशबोर्ड'}</span>
                </button>
              )}
            </nav>

            {/* Language Toggle Control (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 text-xs font-heading font-extrabold shadow-inner shrink-0">
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  language === 'hi' 
                    ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="हिन्दी में वेबसाइट देखें"
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  language === 'en' 
                    ? 'bg-[#0F4C81] text-white shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="View website in English"
              >
                English
              </button>
            </div>

            {/* Desktop Auth Section (Direct Logout when logged in, or Login dropdown when guest) */}
            {(currentUser || isAdminAuthenticated) ? (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="hidden lg:flex shrink-0 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 font-extrabold px-4 py-2 rounded-xl text-xs items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                    <span>{language === 'en' ? 'Logging out...' : 'लॉग आउट हो रहा है...'}</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>{language === 'en' ? 'Logout' : 'लॉग आउट'}</span>
                  </>
                )}
              </button>
            ) : (
              <div className="hidden lg:relative lg:block shrink-0" onMouseEnter={() => setOpenDropdown('login')} onMouseLeave={() => setOpenDropdown(null)}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'login' ? null : 'login')}
                  className="bg-linear-to-r from-[#0F4C81] to-[#0B2545] hover:opacity-95 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <User className="w-4 h-4 text-emerald-300" />
                  <span>{language === 'en' ? 'Login' : 'लॉगिन'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-emerald-300 transition-transform ${openDropdown === 'login' ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <div className={`${openDropdown === 'login' ? 'block' : 'hidden'} absolute top-full right-0 pt-2 w-56 z-50 animate-in fade-in slide-in-from-top-2 duration-150`}>
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-slate-200/90 space-y-1">
                    
                    {/* Option 1: Patient */}
                    <button
                      onClick={() => {
                        setOpenDropdown(null);
                        openAuthModal();
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-sky-50 text-xs font-extrabold text-slate-800 flex items-center justify-between transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-[#0F4C81] group-hover:bg-[#0F4C81] group-hover:text-white transition">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span>{language === 'en' ? 'Patient' : 'मरीज़'}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0F4C81]" />
                    </button>

                    {/* Option 2: Doctor & Staff */}
                    <button
                      onClick={() => {
                        setOpenDropdown(null);
                        openStaffAuthModal();
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-emerald-50 text-xs font-extrabold text-slate-800 flex items-center justify-between transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                          <Stethoscope className="w-3.5 h-3.5" />
                        </div>
                        <span>{language === 'en' ? 'Doctor & Staff' : 'डॉक्टर एवं स्टाफ'}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                    </button>

                    {/* Option 3: Admin */}
                    <button
                      onClick={() => {
                        setOpenDropdown(null);
                        openAdminAuthModal();
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-amber-50 text-xs font-extrabold text-slate-800 flex items-center justify-between transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <span>{language === 'en' ? 'Admin' : 'प्रशासक (एडमिन)'}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                    </button>

                  </div>
                </div>
              </div>
            )}

            {/* Mobile Header Controls: Language Toggle + Mobile Menu Toggle */}
            <div className="flex items-center gap-2 shrink-0 lg:hidden">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-heading font-extrabold shadow-inner">
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    language === 'hi' 
                      ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    language === 'en' 
                      ? 'bg-[#0F4C81] text-white shadow-xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Eng
                </button>
              </div>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="bg-linear-to-r from-[#0F4C81] to-[#0B2545] hover:opacity-95 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-md transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
              >
                <Menu className="w-4 h-4 text-emerald-300" />
                <span>{language === 'en' ? 'Menu' : 'मेनू'}</span>
              </button>
            </div>
          </>
        )}

      </div>

      {/* REALISTIC HIGH-END HOSPITAL SIDEBAR DRAWER (Rendered via React Portal to document.body) */}
      {mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-99999 flex justify-end animate-in fade-in duration-150">
          {/* Opaque Backdrop Blur Overlay (Locks scroll & completely covers viewport) */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" 
          />

          {/* Realistic Clean Sidebar Panel */}
          <aside className="relative w-full max-w-sm sm:max-w-md h-full bg-white text-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 border-l border-slate-200">
            
            {/* Realistic Top Header: Deep Navy Hospital Branding */}
            <div className="bg-[#0B2545] text-white p-5 flex items-center justify-between shadow-md shrink-0">
              <div 
                onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                  <Stethoscope className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <span className="font-black text-lg text-white tracking-tight block leading-tight">
                    JansevaArogyam
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold tracking-wider uppercase block">
                    Multi-Specialty Hospital
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Close Menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Main Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* Realistic User Profile Section (If Logged In) */}
              {currentUser && (
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0F4C81] text-white font-bold text-base flex items-center justify-center shadow-xs">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                        {currentUser.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {activeRole || 'Patient'}
                        </span>
                        {currentUser.phone && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {currentUser.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Active Session" />
                </div>
              )}

              {/* Main Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-2">
                  {language === 'en' ? 'Main Menu' : 'मुख्य मेनू'}
                </p>

                {[
                  { id: 'home', labelEn: 'Home', labelHi: 'मुख्य पृष्ठ', icon: Home },
                  { id: 'about', labelEn: 'About Us', labelHi: 'हमारे बारे में', icon: Info },
                  { id: 'specialties', labelEn: 'Specialties', labelHi: 'विशेषज्ञताएँ', icon: Award },
                  { id: 'locations', labelEn: 'Locations & Facilities', labelHi: 'शाखाएँ एवं सुविधाएं', icon: Building2 },
                  { id: 'referrals', labelEn: 'Refer & Earn', labelHi: 'रेफर करें और कमाएं', icon: Share2 },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setCurrentTab(item.id); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-3.5 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-sky-50 text-[#0F4C81] border-l-4 border-[#0F4C81] shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F4C81]' : 'text-slate-400'}`} />
                        <span>{language === 'en' ? item.labelEn : item.labelHi}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-[#0F4C81] translate-x-1' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Realistic Primary Callout: Book OPD Appointment */}
              <div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openBookingModal();
                  }}
                  className="w-full bg-linear-to-r from-[#0F4C81] to-[#0B2545] hover:from-[#0B2545] hover:to-[#081B33] text-white p-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span>{language === 'en' ? 'Book OPD Appointment' : 'ओपीडी अपॉइंटमेंट बुक करें'}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                </button>
              </div>

              {/* Realistic Portal Shortcuts Section */}
              <div className="pt-3 space-y-2 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1">
                  {language === 'en' ? 'Hospital Portals' : 'अस्पताल पोर्टल'}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { 
                      setMobileMenuOpen(false); 
                      if (activeRole !== 'DOCTOR') {
                        openStaffAuthModal();
                      } else {
                        setCurrentTab('doctor-console');
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-center transition cursor-pointer"
                  >
                    <span className="block text-xs font-bold text-slate-800">Doctor</span>
                    <span className="block text-[10px] text-slate-500">Portal</span>
                  </button>
                  <button
                    onClick={() => { 
                      setMobileMenuOpen(false); 
                      if (activeRole !== 'DESK_STAFF') {
                        openStaffAuthModal();
                      } else {
                        setCurrentTab('desk-staff-dashboard');
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-center transition cursor-pointer"
                  >
                    <span className="block text-xs font-bold text-slate-800">Desk Staff</span>
                    <span className="block text-[10px] text-slate-500">Portal</span>
                  </button>
                  <button
                    onClick={() => { 
                      setMobileMenuOpen(false); 
                      if (!isAdminAuthenticated) {
                        openAdminAuthModal();
                      } else {
                        setCurrentTab('admin'); 
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-center transition cursor-pointer"
                  >
                    <span className="block text-xs font-bold text-slate-800">Admin</span>
                    <span className="block text-[10px] text-slate-500">Panel</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Actions & Footer Block */}
            <div className="p-5 border-t border-slate-200 bg-slate-50/80 space-y-3.5 shrink-0">
              {(currentUser || isAdminAuthenticated) ? (
                <button
                  onClick={async () => {
                    await handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                      <span>{language === 'en' ? 'Logging out...' : 'लॉग आउट हो रहा है...'}</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>{language === 'en' ? 'Logout' : 'लॉगआउट'}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full bg-[#0F4C81] hover:bg-[#0B2545] text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span>{language === 'en' ? 'OTP Login' : 'ओटीपी लॉगिन'}</span>
                </button>
              )}

              {/* 24x7 Helpline Info Badge */}
              <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                  <span>24x7 Helpline:</span>
                </span>
                <a href="tel:1800-7382-723" className="font-extrabold text-slate-900 hover:text-[#0F4C81] underline">
                  1800-SEVA-CLINIC
                </a>
              </div>

              <div className="text-center text-[11px] text-slate-400 font-medium">
                NABH Accredited • Sarangpur • Shujalpur • Rajgarh
              </div>
            </div>

          </aside>
        </div>,
        document.body
      )}

    </header>
  );
};
