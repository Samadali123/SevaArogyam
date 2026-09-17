import React, { useState } from 'react';
import { X, Lock, User, AlertCircle, CheckCircle2, Stethoscope, Users, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, getApiErrorMessage } from '../services/api';

export const StaffAuthModal: React.FC = () => {
  const { isStaffAuthModalOpen, closeStaffAuthModal, loginWithEmailAndPassword, language } = useApp();

  const [loginType, setLoginType] = useState<'DOCTOR' | 'STAFF'>('DOCTOR');
  const [view, setView] = useState<'LOGIN' | 'FORGOT_PASSWORD'>('LOGIN');
  const [emailOrLoginId, setEmailOrLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  if (!isStaffAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginWithEmailAndPassword(emailOrLoginId, password);
      setLoading(false);
      if (res.success) {
        closeStaffAuthModal();
        resetForm();
        const destination = res.user?.role === 'DOCTOR' ? '/doctor' : '/support';
        window.location.assign(destination);
      } else {
        setError(res.message || 'Login failed. Please check your email and password.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(getApiErrorMessage(err, 'Login failed. Please check your email and password.'));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setLoading(false);
      setMessage(language === 'en'
        ? `Password reset link sent to ${forgotEmail}. If you don't see it in your inbox, please check your Spam / Junk folder.`
        : `पासवर्ड रीसेट लिंक ${forgotEmail} पर भेजा गया। यदि यह इनबॉक्स में न मिले, तो कृपया अपना Spam / Junk फोल्डर चेक करें।`);
    } catch (err: any) {
      setLoading(false);
      setError(getApiErrorMessage(err, 'Unable to send the reset link. Please try again.'));
    }
  };

  const resetForm = () => {
    setView('LOGIN');
    setLoginType('DOCTOR');
    setEmailOrLoginId('');
    setPassword('');
    setForgotEmail('');
    setError('');
    setMessage('');
  };

  const isDoctor = loginType === 'DOCTOR';
  const headerLabel = isDoctor 
    ? (language === 'en' ? 'Doctor Portal' : 'डॉक्टर पोर्टल')
    : (language === 'en' ? 'Staff Portal' : 'स्टाफ पोर्टल');
  const headerTitle = isDoctor ? 'JANSEVAAROGYAM Doctor Login' : 'JANSEVAAROGYAM Staff Login';

  const themePrimaryBg = isDoctor ? 'bg-gradient-to-r from-[#0B7A56] to-[#0F9D6D] hover:opacity-95' : 'bg-gradient-to-r from-[#5B5588] to-[#6E6B9E] hover:opacity-95';
  const themeRing = isDoctor ? 'focus:ring-[#0F9D6D] focus:border-[#0F9D6D]' : 'focus:ring-[#6E6B9E] focus:border-[#6E6B9E]';
  const themeLink = isDoctor ? 'text-[#0F9D6D] hover:text-[#0B7A56]' : 'text-[#5B5588] hover:text-[#6E6B9E]';
  const headerGradient = isDoctor 
    ? 'bg-gradient-to-r from-[#0B3D2E] via-[#0A2E22] to-[#0B3D2E]' 
    : 'bg-gradient-to-r from-[#5B5588] via-[#6E6B9E] to-[#5B5588]';
  const badgeColor = 'bg-[rgba(255,255,255,0.15)] text-white border border-white/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100/80 max-h-[92vh] my-auto flex flex-col">
        {/* Header - Role Dynamic Brand Gradient */}
        <div className={`${headerGradient} text-white p-6 flex items-center justify-between relative transition-colors duration-300`}>
          <div>
            <span className={`${badgeColor} text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md`}>
              {headerLabel}
            </span>
            <h3 className="font-heading font-extrabold text-xl tracking-tight text-white mt-1.5">{headerTitle}</h3>
          </div>
          <button 
            onClick={() => { closeStaffAuthModal(); resetForm(); }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Bar: Doctor / Staff */}
        <div className="px-6 pt-5">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => { setLoginType('DOCTOR'); setError(''); setMessage(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                isDoctor
                  ? 'bg-gradient-to-r from-[#0B7A56] to-[#0F9D6D] text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{language === 'en' ? 'Doctor' : 'डॉक्टर'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setLoginType('STAFF'); setError(''); setMessage(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                !isDoctor
                  ? 'bg-gradient-to-r from-[#5B5588] to-[#6E6B9E] text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{language === 'en' ? 'Staff' : 'स्टाफ'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {view === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                  {language === 'en' ? 'Email Address or Login ID' : 'ईमेल आईडी या लॉगिन आईडी'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={emailOrLoginId}
                    onChange={(e) => setEmailOrLoginId(e.target.value)}
                    placeholder={isDoctor ? "dr.name@jansevaarogyam.com" : "staff-login-id or email"}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 ${themeRing} transition`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                  {language === 'en' ? 'Password' : 'पासवर्ड'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 ${themeRing} transition`}
                    required
                  />
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setView('FORGOT_PASSWORD'); setError(''); setMessage(''); }}
                  className={`text-xs font-bold ${themeLink} hover:underline cursor-pointer transition`}
                >
                  {language === 'en' ? 'Forgot Password?' : 'पासवर्ड भूल गए?'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${themePrimaryBg} text-white font-heading font-extrabold py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{language === 'en' ? 'Authenticating...' : 'सत्यापित हो रहा है...'}</span>
                  </>
                ) : (
                  <span>{language === 'en' ? `Log Into ${isDoctor ? 'Doctor' : 'Staff'} Portal` : `${isDoctor ? 'डॉक्टर' : 'स्टाफ'} पोर्टल में लॉगिन करें`}</span>
                )}
              </button>
            </form>
          )}

          {view === 'FORGOT_PASSWORD' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
              <div>
                <p className="text-slate-500 mb-4 text-xs leading-relaxed font-medium">
                  {language === 'en' 
                    ? 'Enter your registered email address below. We will send you a secure link to reset your password.'
                    : 'अपना पंजीकृत ईमेल दर्ज करें। हम आपको पासवर्ड रीसेट लिंक भेजेंगे।'}
                </p>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                  {language === 'en' ? 'Registered Email Address' : 'पंजीकृत ईमेल आईडी'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 ${themeRing} transition`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${themePrimaryBg} text-white font-heading font-extrabold py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{language === 'en' ? 'Sending Reset Link...' : 'लिंक भेजा जा रहा है...'}</span>
                  </>
                ) : (
                  <span>{language === 'en' ? 'Send Reset Link' : 'रीसेट लिंक भेजें'}</span>
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setView('LOGIN'); setError(''); setMessage(''); }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  ← {language === 'en' ? 'Back to Login' : 'लॉगिन पर वापस'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

