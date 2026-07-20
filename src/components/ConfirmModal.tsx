import React from 'react';
import { AlertTriangle, Trash2, Info, CheckCircle2, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  type = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      btnBg: 'bg-rose-600 hover:bg-rose-500 text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-[#f38020]/15 text-[#f38020] border-[#f38020]/30',
      btnBg: 'bg-[#f38020] hover:bg-[#e56f10] text-black font-bold',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      btnBg: 'bg-blue-600 hover:bg-blue-500 text-white',
    },
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    },
  }[type];

  const IconComponent = typeStyles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-sm bg-[#151924] border border-[#272f45] rounded-md shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded border ${typeStyles.iconBg}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{message}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#272f45] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#272f45]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#272f45] hover:bg-[#323a52] rounded transition-colors"
          >
            {cancelText}
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${typeStyles.btnBg}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};
