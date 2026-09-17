import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Stethoscope, 
  Calendar, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User,
  ShieldCheck,
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
  const [loginModalOpen, setLoginModalOpen] = useState(false);

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

  // Prevent background scrolling (hero section bleed) when sidebar menu or login modal is open
  useEffect(() => {
    if (mobileMenuOpen || loginModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, loginModalOpen]);

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-xs">
      
      {/* Main Navbar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Text Logo on Extreme Left */}
        <div 
          onClick={() => {
            if (!isStaffOrAdminOrDoctor) setCurrentTab('home');
          }}
          className="flex items-center cursor-pointer group shrink-0"
        >
          <span className="font-outfit font-extrabold text-2xl sm:text-3xl bg-linear-to-r from-[#0B1F3A] via-[#0D2B4E] to-[#0D9488] bg-clip-text text-transparent tracking-tight">
            Jansevaarogyam
          </span>
        </div>

        {/* Doctor, Admin & Staff Panel Header: Brand Logo on Left, Language Toggle & Logout on Right */}
        {isStaffOrAdminOrDoctor ? (
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Hindi / English Language Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-[11px] font-heading font-extrabold shadow-inner shrink-0">
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-[2px] rounded-full transition-all cursor-pointer ${
                  language === 'hi' 
                    ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-[2px] rounded-full transition-all cursor-pointer ${
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
              className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 font-extrabold px-3 py-[3px] rounded-full text-[11px] flex items-center gap-1 transition cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                  <span>{language === 'en' ? 'Logging out...' : 'लॉग आउट...'}</span>
                </>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Logout' : 'लॉग आउट'}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Navigation Links - Centered, Compact Padding, Dark Navy Active Color, Teal Hover */}
            <nav className="hidden lg:flex items-center justify-center gap-1.5 flex-1 mx-2">
              <button
                onClick={() => setCurrentTab('home')}
                className={`px-2.5 py-1 text-xs transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'home' 
                    ? 'text-[#0B1F3A] font-black text-sm' 
                    : 'text-slate-600 hover:text-[#0D9488] font-bold'
                }`}
              >
                <span>{language === 'en' ? 'Home' : 'मुख्य पृष्ठ'}</span>
              </button>

              {/* About Us (Single Direct Button) */}
              <button
                onClick={() => setCurrentTab('about')}
                className={`px-2.5 py-1 text-xs transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'about' 
                    ? 'text-[#0B1F3A] font-black text-sm' 
                    : 'text-slate-600 hover:text-[#0D9488] font-bold'
                }`}
              >
                <span>{language === 'en' ? 'About Us' : 'हमारे बारे में'}</span>
              </button>

              {/* Specialties with Hover Dropdown */}
              <div className="relative" onMouseEnter={() => setOpenDropdown('specialties')} onMouseLeave={() => setOpenDropdown(null)}>
                <button
                  onClick={() => { setSelectedSpecialtyFilter('all'); setCurrentTab('specialties'); setOpenDropdown(null); }}
                  className={`px-2.5 py-1 text-xs transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    currentTab === 'specialties' 
                      ? 'text-[#0B1F3A] font-black text-sm' 
                      : 'text-slate-600 hover:text-[#0D9488] font-bold'
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
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#0D9488] text-xs font-bold text-slate-800 flex items-center justify-between transition cursor-pointer group"
                      >
                        <span className="truncate group-hover:text-[#0D9488] transition-colors">{language === 'en' ? sp.nameEn : (sp.nameHi || sp.nameEn)}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0D9488] transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Locations & Facilities with Hover Dropdown */}
              <div className="relative" onMouseEnter={() => setOpenDropdown('locations')} onMouseLeave={() => setOpenDropdown(null)}>
                <button
                  onClick={() => { setActiveBranchId('all'); setCurrentTab('locations'); setOpenDropdown(null); }}
                  className={`px-2.5 py-1 text-xs transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    currentTab === 'locations' 
                      ? 'text-[#0B1F3A] font-black text-sm' 
                      : 'text-slate-600 hover:text-[#0D9488] font-bold'
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
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#0D9488] text-xs font-bold text-slate-800 flex items-center justify-between transition cursor-pointer group"
                        >
                          <span className="truncate group-hover:text-[#0D9488] transition-colors">{language === 'en' ? c.name : branchNameHi}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0D9488] transition-colors shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Jansevarogyam Care Services */}
              <div className="relative" onMouseEnter={() => setOpenDropdown('services')} onMouseLeave={() => setOpenDropdown(null)}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'services' ? null : 'services')}
                  className={`px-2.5 py-1 text-xs transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    ['pharmacy', 'diagnostics', 'laboratory'].includes(currentTab)
                      ? 'text-[#0B1F3A] font-black text-sm'
                      : 'text-slate-600 hover:text-[#0D9488] font-bold'
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
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#0D9488] text-xs font-bold text-slate-800 flex items-center justify-between transition cursor-pointer group"
                      >
                        <span className="truncate group-hover:text-[#0D9488] transition-colors">{label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0D9488] transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Refer & Earn Tab */}
              <button
                onClick={() => setCurrentTab('referrals')}
                className={`px-2.5 py-1 text-xs transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  currentTab === 'referrals' 
                    ? 'text-[#0B1F3A] font-black text-sm' 
                    : 'text-slate-600 hover:text-[#0D9488] font-bold'
                }`}
              >
                <span>{language === 'en' ? 'Refer & Earn' : 'रेफर करें और कमाएं'}</span>
              </button>

              {/* My Dashboard (only when Patient logged in) */}
              {Boolean(currentUser && activeRole === 'PATIENT') && (
                <button
                  onClick={() => setCurrentTab('patient-dashboard')}
                  className={`px-2.5 py-1 text-xs transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    currentTab === 'patient-dashboard' 
                      ? 'text-[#0B1F3A] font-black text-sm' 
                      : 'text-slate-600 hover:text-[#0D9488] font-bold'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>{language === 'en' ? 'My Dashboard' : 'मेरा डैशबोर्ड'}</span>
                </button>
              )}
            </nav>

            {/* Extreme Right Controls: Language Selector + Login as Button */}
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              {/* Language Toggle Control (Desktop & Tablet) */}
              <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-[11px] font-heading font-extrabold shadow-inner shrink-0">
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-[2px] rounded-full transition-all cursor-pointer ${
                    language === 'hi' 
                      ? 'bg-[#0D9488] text-white shadow-xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="हिन्दी में वेबसाइट देखें"
                >
                  हिंदी
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-[2px] rounded-full transition-all cursor-pointer ${
                    language === 'en' 
                      ? 'bg-[#0B1F3A] text-white shadow-xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="View website in English"
                >
                  English
                </button>
              </div>

              {/* Desktop Auth Section: "Login as" Button opens Popup Modal */}
              {(currentUser || isAdminAuthenticated) ? (
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="hidden lg:flex shrink-0 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 font-extrabold px-3 py-[3px] rounded-full text-[11px] items-center gap-1 transition cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      <span>{language === 'en' ? 'Logging out...' : 'लॉग आउट...'}</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Logout' : 'लॉग आउट'}</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="hidden lg:block shrink-0">
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="bg-linear-to-r from-[#0B1F3A] to-[#0D9488] hover:opacity-95 text-white font-extrabold px-3.5 py-[3px] rounded-full text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-102"
                  >
                    <User className="w-3.5 h-3.5 text-white" />
                    <span>{language === 'en' ? 'Login as' : 'लॉगइन करें'}</span>
                  </button>
                </div>
              )}

              {/* Mobile/Tablet ONLY Menu Toggle Button (Hidden on Desktop via lg:hidden) */}
              <div className="lg:hidden flex items-center gap-2 shrink-0 relative group">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-xl text-slate-800 hover:text-[#0D9488] hover:bg-teal-50/80 transition-all cursor-pointer flex items-center justify-center"
                  title={language === 'en' ? 'Menu' : 'मेनू'}
                  aria-label="Open Menu"
                >
                  <Menu className="w-6.5 h-6.5 text-[#0B1F3A] hover:text-[#0D9488] transition-colors" />
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      {/* SIDEBAR DRAWER (Rendered via React Portal to document.body) */}
      {mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-99999 flex justify-end animate-in fade-in duration-150 font-sans">
          {/* Opaque Backdrop Overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          />

          {/* Clean Sidebar Panel with Original Jansevaarogyam Theme */}
          <aside className="relative w-full max-w-sm sm:max-w-md h-full bg-white text-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 border-l border-slate-200">
            
            {/* Drawer Top Header: Brand Text Logo on Left (No green icon box) + Close (X) on Right */}
            <div className="p-5 sm:p-6 flex items-center justify-between shrink-0 border-b border-slate-100">
              <div 
                onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
                className="flex items-center cursor-pointer group"
              >
                <span className="font-outfit font-extrabold text-2xl bg-linear-to-r from-[#0B1F3A] via-[#0D2B4E] to-[#0D9488] bg-clip-text text-transparent tracking-tight block leading-none">
                  Jansevaarogyam
                </span>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Close Menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Main Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

              {/* Language Toggle Bar inside Drawer */}
              <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-2xl border border-slate-200 text-xs font-heading font-extrabold shadow-xs max-w-xs mx-auto">
                <span className="text-slate-500 font-bold px-2">{language === 'en' ? 'Language:' : 'भाषा:'}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLanguage('hi')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      language === 'hi' 
                        ? 'bg-[#0D9488] text-white shadow-xs font-bold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      language === 'en' 
                        ? 'bg-[#0B1F3A] text-white shadow-xs font-bold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* User Profile Section (If Logged In) */}
              {currentUser && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs max-w-xs mx-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0B2545] text-white font-bold text-base flex items-center justify-center shadow-xs">
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
                      </div>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Active Session" />
                </div>
              )}

              {/* Main Navigation Links - Centered Clean Jansevaarogyam Style */}
              <div className="space-y-3 text-center py-2">
                {[
                  { id: 'home', labelEn: 'Home', labelHi: 'मुख्य पृष्ठ' },
                  { id: 'about', labelEn: 'About Us', labelHi: 'हमारे बारे में' },
                  { id: 'specialties', labelEn: 'Specialties', labelHi: 'विशेषज्ञताएँ' },
                  { id: 'locations', labelEn: 'Locations & Facilities', labelHi: 'शाखाएँ एवं सुविधाएं' },
                  { id: 'referrals', labelEn: 'Refer & Earn', labelHi: 'रेफर करें और कमाएं' },
                ].map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setCurrentTab(item.id); setMobileMenuOpen(false); }}
                      className={`block w-full py-2.5 text-center font-bold text-base transition-all cursor-pointer ${
                        isActive
                          ? 'text-[#0D9488] font-black text-lg scale-105'
                          : 'text-slate-700 hover:text-[#0D9488]'
                      }`}
                    >
                      {language === 'en' ? item.labelEn : item.labelHi}
                    </button>
                  );
                })}

                {/* My Dashboard (If Patient Logged In) */}
                {Boolean(currentUser && activeRole === 'PATIENT') && (
                  <button
                    onClick={() => { setCurrentTab('patient-dashboard'); setMobileMenuOpen(false); }}
                    className={`block w-full py-2.5 text-center font-bold text-base transition-all cursor-pointer ${
                      currentTab === 'patient-dashboard'
                        ? 'text-[#0D9488] font-black text-lg scale-105'
                        : 'text-slate-700 hover:text-[#0D9488]'
                    }`}
                  >
                    {language === 'en' ? 'My Dashboard' : 'मेरा डैशबोर्ड'}
                  </button>
                )}
              </div>

              {/* Primary Green Pill CTA Button */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openBookingModal();
                  }}
                  className="w-full max-w-xs bg-linear-to-r from-[#10B981] to-[#0D9488] hover:opacity-95 text-white font-extrabold py-3.5 px-6 rounded-full text-sm shadow-md transition-all hover:scale-105 cursor-pointer text-center"
                >
                  {language === 'en' ? 'Book Appointment' : 'अपॉइंटमेंट बुक करें'}
                </button>
              </div>

            </div>

            {/* Bottom Actions Footer Block: Single "Login as" button */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 shrink-0 space-y-3">
              {(currentUser || isAdminAuthenticated) ? (
                <button
                  onClick={async () => {
                    await handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                  className="w-full max-w-xs mx-auto bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                <div className="max-w-xs mx-auto">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLoginModalOpen(true);
                    }}
                    className="w-full bg-[#0B1F3A] hover:bg-[#071527] text-white py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-102"
                  >
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'en' ? 'Login as' : 'लॉगिन करें'}</span>
                  </button>
                </div>
              )}

              <div className="text-center text-[11px] text-slate-400 font-medium pt-1">
                Jansevaarogyam Healthcare Network
              </div>
            </div>

          </aside>
        </div>,
        document.body
      )}

      {/* POPUP MODAL FOR "LOGIN AS": Doctor, Staff, Admin */}
      {loginModalOpen && createPortal(
        <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={() => setLoginModalOpen(false)} 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 border border-slate-100 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-outfit font-extrabold text-xl text-[#0B1F3A]">
                  {language === 'en' ? 'Login as' : 'लॉगिन करें'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'en' ? 'Select your portal to continue' : 'जारी रखने के लिए अपना पोर्टल चुनें'}
                </p>
              </div>
              <button 
                onClick={() => setLoginModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Options */}
            <div className="space-y-3">
              
              {/* Option 1: Doctor */}
              <button
                onClick={() => {
                  setLoginModalOpen(false);
                  openStaffAuthModal();
                }}
                className="w-full p-3.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-left flex items-center justify-between transition cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {language === 'en' ? 'Doctor' : 'डॉक्टर (Doctor)'}
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      {language === 'en' ? 'Doctor OPD Portal Login' : 'डॉक्टर ओपीडी पोर्टल लॉगिन'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 2: Staff */}
              <button
                onClick={() => {
                  setLoginModalOpen(false);
                  openStaffAuthModal();
                }}
                className="w-full p-3.5 rounded-2xl bg-purple-50/80 hover:bg-purple-100 border border-purple-200 text-left flex items-center justify-between transition cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {language === 'en' ? 'Staff' : 'स्टाफ (Staff)'}
                    </h4>
                    <p className="text-[11px] text-purple-800 font-medium">
                      {language === 'en' ? 'Desk Staff Portal Login' : 'डेस्क स्टाफ पोर्टल लॉगिन'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 3: Admin */}
              <button
                onClick={() => {
                  setLoginModalOpen(false);
                  openAdminAuthModal();
                }}
                className="w-full p-3.5 rounded-2xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200 text-left flex items-center justify-between transition cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {language === 'en' ? 'Admin' : 'एडमिन (Admin)'}
                    </h4>
                    <p className="text-[11px] text-amber-800 font-medium">
                      {language === 'en' ? 'Hospital Control Panel' : 'अस्पताल कंट्रोल पैनल'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </div>
        </div>,
        document.body
      )}

    </header>
  );
};
