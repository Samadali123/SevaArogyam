import React, { useState } from 'react';
import { X, Lock, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { api, getApiErrorMessage } from '../services/api';
import { useApp } from '../context/AppContext';

export const ResetPassword: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { setSessionFromAuth, language } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [targetPortalLabel, setTargetPortalLabel] = useState('your portal');
  const [isOpen, setIsOpen] = useState(true);

  // Extract token from URL (e.g. /reset-password/abcdef123456)
  const token = window.location.pathname.split('/').pop() || '';

  if (!isOpen) return null;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(language === 'en' ? 'Passwords do not match' : 'पासवर्ड मेल नहीं खाते');
      return;
    }
    
    if (newPassword.length < 8) {
      setError(language === 'en' ? 'Password must be at least 8 characters long' : 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        newPassword,
        confirmPassword,
      });
      setLoading(false);
      setSuccess(true);

      const resData = response.data;
      const user = resData?.user || resData?.data?.user;
      const accessToken = resData?.accessToken || resData?.token || resData?.data?.accessToken;

      let targetTab = 'home';
      let portalLabel = 'Home Page';

      if (user && accessToken) {
        setSessionFromAuth(user, accessToken);

        const userRole = user.role;
        if (userRole === 'DOCTOR') {
          targetTab = 'doctor-console';
          portalLabel = 'Doctor Portal';
        } else if (userRole === 'STAFF' || userRole === 'DESK_STAFF') {
          targetTab = 'desk-staff-dashboard';
          portalLabel = 'Desk Staff Portal';
        } else if (userRole === 'ADMIN') {
          targetTab = 'admin';
          portalLabel = 'Admin Portal';
        } else if (userRole === 'PATIENT') {
          targetTab = 'patient-dashboard';
          portalLabel = 'Patient Dashboard';
        }
      }

      setTargetPortalLabel(portalLabel);

      setTimeout(() => {
        setIsOpen(false);
        if (user && user.role === 'ADMIN') {
          window.location.href = '/admin';
        } else if (user && user.role === 'DOCTOR') {
          window.location.href = '/doctor';
        } else if (user && (user.role === 'STAFF' || user.role === 'DESK_STAFF')) {
          window.location.href = '/support';
        } else {
          onNavigate(targetTab);
        }
      }, 1800);
    } catch (err: any) {
      setLoading(false);
      setError(getApiErrorMessage(err, 'Failed to reset password. The link might be invalid or expired.'));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    window.history.replaceState({}, '', '/');
    onNavigate('home');
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200/80 relative animate-fade-in">
        
        {/* Header: Deep Navy Security Banner */}
        <div className="bg-linear-to-r from-[#0B2545] via-[#0F4C81] to-[#0A365C] text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-500/30">
                  {language === 'en' ? 'Account Security' : 'खाता सुरक्षा'}
                </span>
                <h3 className="font-extrabold text-lg text-white tracking-tight mt-0.5">
                  {language === 'en' ? 'Reset Password' : 'पासवर्ड रीसेट करें'}
                </h3>
              </div>
            </div>

            <button 
              onClick={handleClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {success ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-3 animate-fade-in text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {language === 'en' ? 'Password Reset Successfully' : 'पासवर्ड सफलतापूर्वक रीसेट हो गया'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'en' 
                    ? `Logging you into ${targetPortalLabel}...` 
                    : `${targetPortalLabel} में लॉगिन हो रहे हैं...`}
                </p>
              </div>
              <p className="text-xs font-bold text-emerald-600 animate-pulse">
                {language === 'en' ? `Redirecting to ${targetPortalLabel}...` : `रीडायरेक्ट हो रहे हैं...`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {language === 'en' 
                  ? 'Please enter your new password below. Ensure it is at least 8 characters long.' 
                  : 'कृपया नीचे अपना नया पासवर्ड दर्ज करें। सुनिश्चित करें कि यह कम से कम 8 अक्षरों का हो।'}
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'New Password' : 'नया पासवर्ड'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'Confirm Password' : 'पासवर्ड की पुष्टि करें'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F4C81] hover:bg-[#0B2545] text-white font-bold py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{language === 'en' ? 'Reset Password' : 'पासवर्ड रीसेट करें'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">
              {language === 'en' ? 'Protected by Hospital SSL Encryption' : 'एसएसएल एन्क्रिप्शन द्वारा सुरक्षित'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
