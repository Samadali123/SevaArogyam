import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Copy, Check, Eye, EyeOff, UserCheck } from 'lucide-react';

interface CredentialsDispatchedModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    name: string;
    email: string;
    loginId: string;
    password: string;
    role: 'DOCTOR' | 'DESK_STAFF';
    phone?: string;
    specializationOrBranch?: string;
  } | null;
}

export const CredentialsDispatchedModal: React.FC<CredentialsDispatchedModalProps> = ({
  isOpen,
  onClose,
  credentials
}) => {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  if (!isOpen || !credentials) return null;

  const handleCopy = () => {
    const text = `SEVASADAN HOSPITAL LOGIN CREDENTIALS
Name: ${credentials.name}
Role: ${credentials.role === 'DOCTOR' ? 'Doctor Specialist' : 'Desk Staff / Reception'}
Recipient Email: ${credentials.email}
Login ID / Username: ${credentials.loginId}
Protected Password: ${credentials.password}
Portal Access Link: https://jansevaarogyam.in/login`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Top Header: Email Dispatcher Banner */}
        <div className="bg-linear from-[#0B2545] via-[#0F4C81] to-emerald-950 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md">
                <Mail className="w-6 h-6 text-emerald-300 animate-pulse" />
              </div>
              <div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/30">
                  Email Dispatcher Active
                </span>
                <h3 className="font-extrabold text-xl text-white tracking-tight mt-0.5">
                  Welcome Email Dispatched!
                </h3>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Dispatch Notice Badge */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950">
              <p className="font-bold text-sm text-emerald-900">
                Credentials Email Sent to <span className="underline">{credentials.email}</span>
              </p>
              <p className="mt-1 text-slate-600 font-medium">
                An encrypted welcome email containing the member's unique Login ID and initial Protected Password has been sent over SMTP to their mailbox.
              </p>
            </div>
          </div>

          {/* Credentials Card Display */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {credentials.role === 'DOCTOR' ? 'Doctor Specialist' : 'Hospital Desk Staff'}
                </span>
              </div>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-md font-bold border border-emerald-500/30">
                Account Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Full Name</span>
                <span className="font-bold text-sm text-white">{credentials.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Target Email</span>
                <span className="font-bold text-xs text-emerald-400 truncate block">{credentials.email}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
              
              {/* Login ID */}
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Generated Login ID</span>
                <span className="font-mono font-black text-sm text-emerald-300 tracking-wider block mt-0.5">
                  {credentials.loginId}
                </span>
              </div>

              {/* Protected Password */}
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Protected Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="font-mono font-black text-sm text-amber-300 tracking-wider block mt-0.5">
                  {showPassword ? credentials.password : '••••••••••••'}
                </span>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleCopy}
              className="w-full bg-[#0F4C81] hover:bg-[#0B2545] text-white py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied Credentials to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Credentials to Clipboard</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 px-4 rounded-xl text-xs font-extrabold transition cursor-pointer"
            >
              Done & Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
