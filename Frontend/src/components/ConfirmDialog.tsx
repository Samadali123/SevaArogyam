import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, confirmLabel = 'Yes, delete', onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><h2 className="font-black text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{message}</p></div>
          </div>
          <button onClick={onCancel} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" title="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">No, keep it</button>
          <button onClick={onConfirm} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};