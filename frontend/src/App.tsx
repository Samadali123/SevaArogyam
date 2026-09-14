import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AUTH_TOKEN_KEY } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OtpAuthModal } from './components/OtpAuthModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { StaffAuthModal } from './components/StaffAuthModal';
import { BookingWizardModal } from './components/booking/BookingWizardModal';
import { DoctorProfileModal } from './components/DoctorProfileModal';
import { PublicPortal } from './pages/PublicPortal';
import { AboutUs } from './pages/AboutUs';
import { Specialties } from './pages/Specialties';
import { LocationsFacilities } from './pages/LocationsFacilities';
import { TelemedicineRoom } from './pages/TelemedicineRoom';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorConsole } from './pages/DoctorConsole';
import { AdminDashboard } from './pages/AdminDashboard';
import { ArticleDetail } from './pages/ArticleDetail';
import { TermsConditions } from './pages/TermsConditions';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { DeskStaffPortal } from './pages/DeskStaffPortal';
import { ServiceCatalog } from './pages/ServiceCatalog';
import { Referrals } from './pages/Referrals';
import { ResetPassword } from './pages/ResetPassword';

const getTabFromPath = (path: string): string => {
  const cleanPath = path.toLowerCase().replace(/\/$/, '');
  if (cleanPath === '/adminp' || cleanPath === '/admin') return 'admin';
  if (cleanPath === '/doctor' || cleanPath === '/doctor-console') return 'doctor-console';
  if (cleanPath === '/support' || cleanPath === '/desk-staff') return 'desk-staff-dashboard';
  if (cleanPath === '/about') return 'about';
  if (cleanPath === '/specialties') return 'specialties';
  if (cleanPath === '/locations') return 'locations';
  if (cleanPath === '/telemedicine') return 'telemedicine';
  if (cleanPath === '/doctors') return 'doctors';
  if (cleanPath === '/patient-dashboard') return 'patient-dashboard';
  if (cleanPath === '/terms') return 'terms';
  if (cleanPath === '/privacy') return 'privacy';
  if (cleanPath === '/pharmacy') return 'pharmacy';
  if (cleanPath === '/diagnostics') return 'diagnostics';
  if (cleanPath === '/laboratory') return 'laboratory';
  if (cleanPath === '/referrals') return 'referrals';
  if (cleanPath.startsWith('/reset-password/')) return 'reset-password';
  return 'home';
};

const MainContent: React.FC = () => {
  const { activeRole, currentUser, switchRole, language, isAdminAuthenticated, openAdminAuthModal, openStaffAuthModal } = useApp();

  const [currentTab, setCurrentTabState] = useState<string>(() => {
    return getTabFromPath(window.location.pathname);
  });

  const handleSetCurrentTab = (tab: string, pushHistory = true) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const redirectToHomeForLogin = (openLogin: () => void) => {
      setCurrentTabState('home');
      if (window.location.pathname !== '/') window.history.replaceState({}, '', '/');
      openLogin();
    };

    if (tab === 'admin' && !isAdminAuthenticated) {
      redirectToHomeForLogin(openAdminAuthModal);
      return;
    }
    const isDoc = currentUser?.role === 'DOCTOR' || activeRole === 'DOCTOR';
    const isStaff = currentUser?.role === 'DESK_STAFF' || (currentUser?.role as string) === 'STAFF' || activeRole === 'DESK_STAFF';

    if (tab === 'doctor-console' && !isDoc) {
      redirectToHomeForLogin(openStaffAuthModal);
      return;
    }
    if (tab === 'desk-staff-dashboard' && !isStaff) {
      redirectToHomeForLogin(openStaffAuthModal);
      return;
    }

    setCurrentTabState(tab);
    let newPath = '/';
    if (tab === 'admin') {
      newPath = '/admin';
      if (activeRole !== 'ADMIN') {
        switchRole('ADMIN');
      }
    } else if (tab === 'about') {
      newPath = '/about';
    } else if (tab === 'specialties') {
      newPath = '/specialties';
    } else if (tab === 'locations') {
      newPath = '/locations';
    } else if (tab === 'telemedicine') {
      newPath = '/telemedicine';
    } else if (tab === 'doctors') {
      newPath = '/doctors';
    } else if (tab === 'patient-dashboard') {
      newPath = '/patient-dashboard';
    } else if (tab === 'doctor-console') {
      newPath = '/doctor';
    } else if (tab === 'desk-staff-dashboard') {
      newPath = '/support';
    } else if (tab === 'terms') {
      newPath = '/terms';
    } else if (tab === 'privacy') {
      newPath = '/privacy';
    } else if (['pharmacy', 'diagnostics', 'laboratory', 'referrals'].includes(tab)) {
      newPath = '/' + tab;
    } else if (tab === 'reset-password') {
      newPath = window.location.pathname; // Preserve token
    } else {
      newPath = '/';
    }

    if (pushHistory && window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  };

  // Synchronize role when initially loaded at /admin, /doctor, /support, /patient-dashboard
  useEffect(() => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    const isDoc = currentUser?.role === 'DOCTOR';
    const isStaff = currentUser?.role === 'DESK_STAFF' || (currentUser?.role as string) === 'STAFF';

    if (path === '/adminp' || path === '/admin') {
      if (!isAdminAuthenticated) {
        setCurrentTabState('home');
        if (window.location.pathname !== '/') window.history.replaceState({}, '', '/');
      } else {
        switchRole('ADMIN');
      }
    } else if (path === '/doctor' || path === '/doctor-console') {
      if (!isDoc && !localStorage.getItem(AUTH_TOKEN_KEY)) {
        setCurrentTabState('home');
        if (window.location.pathname !== '/') window.history.replaceState({}, '', '/');
      } else {
        setCurrentTabState('doctor-console');
      }
    } else if (path === '/support' || path === '/desk-staff') {
      if (!isStaff && !localStorage.getItem(AUTH_TOKEN_KEY)) {
        setCurrentTabState('home');
        if (window.location.pathname !== '/') window.history.replaceState({}, '', '/');
      } else {
        setCurrentTabState('desk-staff-dashboard');
      }
    } else if (path === '/patient-dashboard') {
      if (!currentUser && !localStorage.getItem(AUTH_TOKEN_KEY)) {
        setCurrentTabState('home');
        if (window.location.pathname !== '/') window.history.replaceState({}, '', '/');
      }
    }
  }, [isAdminAuthenticated, currentUser, activeRole]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Listen for browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPath(window.location.pathname);
      handleSetCurrentTab(tab, false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser?.role, isAdminAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#10B981] selection:text-slate-950 overflow-x-hidden w-full max-w-full">
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} setCurrentTab={handleSetCurrentTab} />

      {/* Main View Router */}
      <main className="grow w-full max-w-full overflow-x-hidden">
        {currentTab === 'home' && <PublicPortal onNavigate={handleSetCurrentTab} />}
        {currentTab === 'about' && <AboutUs onNavigate={handleSetCurrentTab} />}
        {currentTab === 'specialties' && <Specialties />}
        {currentTab === 'locations' && <LocationsFacilities />}
        {currentTab === 'doctors' && <PublicPortal onNavigate={handleSetCurrentTab} />}
        {currentTab === 'telemedicine' && <TelemedicineRoom />}
        {currentTab === 'patient-dashboard' && <PatientDashboard onNavigate={handleSetCurrentTab} />}
        {currentTab === 'doctor-console' && <DoctorConsole onNavigate={handleSetCurrentTab} />}
        {currentTab === 'desk-staff-dashboard' && <DeskStaffPortal />}
        {currentTab === 'admin' && isAdminAuthenticated && <AdminDashboard />}
        {currentTab === 'article-detail' && <ArticleDetail onBack={() => handleSetCurrentTab('home')} />}
        {currentTab === 'terms' && <TermsConditions onBack={() => handleSetCurrentTab('home')} />}
        {currentTab === 'privacy' && <PrivacyPolicy onBack={() => handleSetCurrentTab('home')} />}
        {currentTab === 'pharmacy' && <ServiceCatalog kind="pharmacy" />}
        {currentTab === 'diagnostics' && <ServiceCatalog kind="diagnostics" />}
        {currentTab === 'laboratory' && <ServiceCatalog kind="laboratory" />}
        {currentTab === 'referrals' && <Referrals />}
        {currentTab === 'reset-password' && <ResetPassword onNavigate={handleSetCurrentTab} />}
      </main>

      {/* Footer */}
      <Footer setCurrentTab={handleSetCurrentTab} />

      {/* Global Modals */}
      <OtpAuthModal />
      <AdminAuthModal />
      <StaffAuthModal />
      <BookingWizardModal />
      <DoctorProfileModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
