import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  isLoading = false,
}: ConfirmationModalProps) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[10000]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[10001] p-4 pointer-events-none">

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden pointer-events-auto border border-slate-100"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${isDestructive ? 'bg-rose-50' : 'bg-blue-50'}`}>
                    <AlertTriangle className={`w-5 h-5 ${isDestructive ? 'text-rose-500' : 'text-blue-500'}`} />
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="bg-slate-50 p-4 cursor-pointer flex gap-3 justify-end items-center">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 cursor-pointer text-sm font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50 transition-colors"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-5 py-2 cursor-pointer rounded-lg text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 ${isDestructive
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                    }`}
                >
                  {isLoading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-3 h-3" />
                    </motion.div>
                  )}
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
