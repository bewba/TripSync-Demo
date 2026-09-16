import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  // Define styles and icons based on type
  const variants = {
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: <AlertCircle className="w-8 h-8 text-red-600" />
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-800",
      icon: <AlertCircle className="w-8 h-8 text-amber-600" />
    },
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <AlertCircle className="w-8 h-8 text-blue-600" />
    }
  };

  const currentVariant = variants[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={cn(
            "fixed top-8 right-8 z-50 flex items-center gap-5 px-8 py-5 rounded-2xl shadow-2xl border min-w-[500px]",
            currentVariant.container
          )}
        >
          {currentVariant.icon}
          <p className="flex-1 font-semibold text-lg">{message}</p>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
            <X className="w-6 h-6 opacity-70" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export function useToast() {
  // FIX: Added 'warning' | 'info' to the state type definition
  const [toastState, setToastState] = React.useState<{ 
    message: string; 
    type: 'success' | 'error' | 'warning' | 'info'; 
    isVisible: boolean 
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = React.useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    setToastState({ message, type, isVisible: true });
  }, []);

  const hideToast = React.useCallback(() => {
    setToastState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const ToastComponent = (
    <Toast 
      message={toastState.message} 
      type={toastState.type} 
      isVisible={toastState.isVisible} 
      onClose={hideToast} 
    />
  );

  return { showToast, ToastComponent };
}