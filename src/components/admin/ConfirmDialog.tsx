import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, Loader2, X, ShieldAlert } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  itemTitle?: string;
  itemCategory?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = 'Are you sure you want to proceed? This action is irreversible.',
  itemTitle,
  itemCategory,
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Backdrop overlay dismiss handler */}
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#0D0D0D] border border-red-500/35 shadow-[0_0_50px_rgba(239,68,68,0.15)] z-10 space-y-5">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        {/* Header with Icon & Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isDanger
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              }`}
            >
              {isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold">
                  CONFIRM ACTION
                </span>
              </div>
              <h3
                id="confirm-dialog-title"
                className="font-display text-lg font-bold text-white leading-snug mt-0.5"
              >
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[#777777] hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Identification Card (if item title provided) */}
        {itemTitle && (
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase text-[#777777] block font-medium">
                Target Item
              </span>
              <p className="text-xs font-semibold text-white truncate mt-0.5">
                {itemTitle}
              </p>
            </div>
            {itemCategory && (
              <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] text-[10px] font-mono font-bold uppercase">
                {itemCategory}
              </span>
            )}
          </div>
        )}

        {/* Description / Warning notice */}
        <p className="text-xs text-[#AAAAAA] leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-semibold text-[#CCCCCC] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onConfirm()}
            className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 cursor-pointer ${
              isDanger
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 active:bg-red-700'
                : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-black'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
