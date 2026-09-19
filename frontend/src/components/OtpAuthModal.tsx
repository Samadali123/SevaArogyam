import React, { useState } from 'react';
import { X, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getApiErrorMessage } from '../services/api';

export const OtpAuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, openAdminAuthModal, sendPatientOtp, loginWithPatientEmailOtp, language } = useApp();

  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'PROFILE'>('EMAIL');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [name, setName] = useState<string>('');
  


  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientEmail || !patientEmail.includes('@')) {
      setError(language === 'en' ? 'Please enter a valid email address' : 'कृपया वैध ईमेल दर्ज करें');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendPatientOtp(patientEmail);
      setLoading(false);
      setStep('OTP');
    } catch (err: any) {
      setLoading(false);
      setError(getApiErrorMessage(err, 'Unable to send the verification code. Please try again.'));
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError(language === 'en' ? 'Please enter the 6-digit OTP' : 'कृपया 6-अंकीय ओटीपी दर्ज करें');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await loginWithPatientEmailOtp(patientEmail, otp, undefined, name);
      setLoading(false);
      if (res.isNew && !name) {
        setStep('PROFILE');
      } else {
        closeAuthModal();
        resetForm();
        window.location.assign('/patient-dashboard');
      }
    } catch (err: any) {
      setLoading(false);
      setError(getApiErrorMessage(err, 'OTP is incorrect. Please try again.'));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await loginWithPatientEmailOtp(patientEmail, otp, undefined, name);
    setLoading(false);
    closeAuthModal();
    resetForm();
    window.location.assign('/patient-dashboard');
  };

  const resetForm = () => {
    setStep('EMAIL');
    setPatientEmail('');
    setOtp('');
    setName('');
    setError('');
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] my-auto flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0F4C81] text-white p-5 flex items-center justify-between relative">
          <div>
            <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {language === 'en' ? 'Passwordless Mobile Auth' : 'पासवर्ड-रहित मोबाइल साइन इन'}
            </span>
            <h3 className="font-extrabold text-xl tracking-tight mt-1">JANSEVAAROGYAM Portal</h3>
          </div>
          <button 
            onClick={() => { closeAuthModal(); resetForm(); }}
            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">



          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Email Input (Patient OTP) */}
          {step === 'EMAIL' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {language === 'en' ? 'Email Address' : 'ईमेल पता'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {language === 'en' 
                    ? 'We will send a 6-digit OTP for instant access.' 
                    : 'हम त्वरित पहुँच के लिए 6-अंकीय ओटीपी भेजेंगे।'}
                </p>
              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F4C81] hover:bg-[#0A365C] text-white font-bold py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{language === 'en' ? 'Get Verification Code' : 'ओटीपी प्राप्त करें'}</span>
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    openAdminAuthModal();
                  }}
                  className="text-xs font-bold text-[#0F4C81] hover:text-[#0B2545] underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'en' ? 'Hospital Administrator? Sign in with Admin Email' : 'अस्पताल प्रशासक? ईमेल आईडी से लॉगिन करें'}</span>
                </button>
              </div>
            </form>
          )}



          {/* STEP 2: OTP Entry */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800">
                  {language === 'en' ? 'Verify OTP Code' : 'ओटीपी कोड दर्ज करें'}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'en' ? 'Sent to' : 'पर भेजा गया:'} <strong className="text-slate-800">{patientEmail}</strong>
                </p>
                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[11px] p-2.5 rounded-xl font-medium text-center leading-tight">
                  📧 {language === 'en' 
                    ? "If you don't see the OTP in your inbox, please check your Spam / Junk folder."
                    : "यदि इनबॉक्स में ओटीपी न मिले, तो कृपया अपना Spam / Junk फोल्डर भी चेक करें।"}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center text-2xl font-mono tracking-widest py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white"
                  autoFocus
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10B981] hover:bg-emerald-600 text-slate-900 font-extrabold py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>{language === 'en' ? 'Verify & Continue' : 'सत्यापित करें और आगे बढ़ें'}</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: New Patient Quick Profile */}
          {step === 'PROFILE' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800">
                  {language === 'en' ? 'Welcome to SEVASADAN!' : 'सेवासदन में आपका स्वागत है!'}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'en' ? 'New Patient detected. Please enter your name.' : 'नया मरीज। कृपया अपना नाम दर्ज करें।'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {language === 'en' ? 'Full Name' : 'पूरा नाम'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Radheshyam Sharma"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F4C81] hover:bg-[#0A365C] text-white font-bold py-3 rounded-xl text-sm shadow-md transition"
              >
                {language === 'en' ? 'Complete Profile' : 'प्रोफाइल पूरा करें'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
