import React, { useState } from 'react';
import { Lock, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api, getApiErrorMessage } from '../services/api';
import { useApp } from '../context/AppContext';

export const ResetPassword: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { setSessionFromAuth } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [targetPortalLabel, setTargetPortalLabel] = useState('your portal');

  // Extract token from URL
  // We assume the URL is something like /reset-password/abcdef123456
  const token = window.location.pathname.split('/').pop() || '';

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
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
        onNavigate(targetTab);
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      setError(getApiErrorMessage(err, 'Failed to reset password. The link might be invalid or expired.'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 relative">
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]"></div>
      
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-5 flex items-center justify-between relative">
          <div>
            <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Account Security
            </span>
            <h3 className="font-extrabold text-xl tracking-tight mt-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Reset Password
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">Password Reset Successfully</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Your password has been updated. Logging you into {targetPortalLabel}...
                </p>
              </div>
              <p className="text-xs font-bold text-emerald-600 mt-4 animate-pulse">
                Redirecting to {targetPortalLabel}...
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                Please enter your new password below. Ensure it is at least 8 characters long.
              </p>
              
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
