import React, { useState } from 'react';
import { X, Mail, ShieldCheck, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, getApiErrorMessage } from '../services/api';

export const AdminAuthModal: React.FC = () => {
  const { 
    isAdminAuthModalOpen, 
    closeAdminAuthModal, 
    loginWithEmailAndPassword, 
    language 
  } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'FORGOT_PASSWORD'>('LOGIN');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isAdminAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(language === 'en' ? 'Please enter your admin email and password' : 'कृपया अपना एडमिन ईमेल और पासवर्ड दर्ज करें');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await loginWithEmailAndPassword(email, password);
      setLoading(false);
      if (res.success && res.user?.role === 'ADMIN') {
        closeAdminAuthModal();
        resetForm();
        window.location.assign('/admin');
      } else if (res.success && res.user?.role !== 'ADMIN') {
        setError(language === 'en' ? 'Unauthorized: This account is not an Admin account.' : 'अनधिकृत: यह खाता एडमिन खाता नहीं है।');
      } else {
        setError(res.message || (language === 'en' ? 'Invalid admin credentials' : 'अमान्य एडमिन क्रेडेंशियल'));
      }
    } catch (err: any) {
      setLoading(false);
      setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError(language === 'en' ? 'Please enter a valid email address' : 'कृपया एक वैध ईमेल पता दर्ज करें');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setLoading(false);
      setSuccessMsg(language === 'en' 
        ? `Password reset link sent to ${email}. If you don't see it in your inbox, please check your Spam / Junk folder.` 
        : `पासवर्ड रीसेट लिंक ${email} पर भेजा गया। यदि यह इनबॉक्स में न मिले, तो कृपया अपना Spam / Junk फोल्डर चेक करें।`);
    } catch (err: any) {
      setLoading(false);
      setError(getApiErrorMessage(err, 'Failed to send password reset link.'));
    }
  };

  const resetForm = () => {
    setMode('LOGIN');
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200/80 max-h-[92vh] my-auto flex flex-col">
        
        {/* Header: Orange Admin Brand Security Banner */}
        <div className="bg-gradient-to-r from-[#9A5B3C] via-[#B37046] to-[#9A5B3C] text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.15)] border border-white/30 flex items-center justify-center text-white shadow-sm backdrop-blur-md">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="bg-[rgba(255,255,255,0.15)] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/30 backdrop-blur-md">
                  {language === 'en' ? 'Admin Access Portal' : 'सुरक्षित एडमिन लॉगिन'}
                </span>
                <h3 className="font-extrabold text-lg text-white tracking-tight mt-0.5">
                  JANSEVAAROGYAM Central Hub
                </h3>
              </div>
            </div>

            <button 
              onClick={() => { closeAdminAuthModal(); resetForm(); }}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">

          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* MODE 1: Email + Password Login */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'Admin Email Address' : 'एडमिन ईमेल आईडी'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@jansevaarogyam.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {language === 'en' ? 'Password' : 'पासवर्ड'}
                  </label>
                  <button
                    type="button"
                    onClick={() => { setError(''); setSuccessMsg(''); setMode('FORGOT_PASSWORD'); }}
                    className="text-xs text-[#9A5B3C] font-extrabold hover:underline cursor-pointer"
                  >
                    {language === 'en' ? 'Forgot Password?' : 'पासवर्ड भूल गए?'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#9A5B3C] to-[#B37046] hover:opacity-95 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md shadow-[#9A5B3C]/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{language === 'en' ? 'Login to Admin Console' : 'एडमिन कंसोल में लॉगिन करें'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: Forgot Password */}
          {mode === 'FORGOT_PASSWORD' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-800">
                  {language === 'en' ? 'Reset Admin Password' : 'एडमिन पासवर्ड रीसेट करें'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 mb-3">
                  {language === 'en' 
                    ? 'Enter your registered email address and we will send you a password reset link.' 
                    : 'अपना पंजीकृत ईमेल आईडी दर्ज करें, हम आपको पासवर्ड रीसेट लिंक भेजेंगे।'}
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@jansevaarogyam.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] transition"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccessMsg(''); setMode('LOGIN'); }}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                >
                  {language === 'en' ? 'Back to Login' : 'लॉगिन पर वापस जाएं'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-gradient-to-r from-[#9A5B3C] to-[#B37046] hover:opacity-95 text-white font-extrabold py-3 rounded-xl text-xs shadow-md shadow-[#9A5B3C]/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span>{language === 'en' ? 'Send Reset Link' : 'रीसेट लिंक भेजें'}</span>
                  )}
                </button>
              </div>
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
