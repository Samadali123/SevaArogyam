import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  open, 
  title, 
  message, 
  confirmLabel = 'Yes, delete', 
  loading = false,
  onConfirm, 
  onCancel 
}) => {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 min-h-screen w-screen z-999999 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 relative z-10">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-rose-50 p-2 text-rose-600 shrink-0"><AlertTriangle className="h-5 w-5" /></div>
          <div><h2 className="font-black text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{message}</p></div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={loading} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 cursor-pointer disabled:opacity-50">No, keep it</button>
          <button onClick={onConfirm} disabled={loading} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
            <span>{loading ? 'Processing...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};