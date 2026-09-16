import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCheck, Play, CircleCheck, Ban, Truck, Info, X, OctagonMinus, WifiOff, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications, type AppNotification, type NotificationType } from './NotificationContext';

// ── Config ─────────────────────────────────────────────────────────────────────
const MAX_VISIBLE_TOASTS = 3;
const TOAST_DURATION_MS = 5000;

const TOAST_STYLES: Record<NotificationType, { icon: React.ReactNode; border: string; iconBg: string; iconColor: string }> = {
  TRIP_ASSIGNED: {
    icon: <Truck className="w-4 h-4" />,
    border: 'border-l-blue-500',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  TRIP_ACCEPTED: {
    icon: <CheckCheck className="w-4 h-4" />,
    border: 'border-l-emerald-500',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  TRIP_START: {
    icon: <Play className="w-4 h-4" />,
    border: 'border-l-green-500',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  TRIP_END: {
    icon: <CircleCheck className="w-4 h-4" />,
    border: 'border-l-slate-500',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
  },
  TRIP_CANCELLED: {
    icon: <Ban className="w-4 h-4" />,
    border: 'border-l-red-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  ALERT: {
    icon: <Info className="w-4 h-4" />,
    border: 'border-l-amber-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  DRIVER_ADDED: {
    icon: <UserPlus className="w-4 h-4" />,
    border: 'border-l-violet-500',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  TRUCK_ADDED: {
    icon: <Truck className="w-4 h-4" />,
    border: 'border-l-teal-500',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  STOPPAGE: {
    icon: <OctagonMinus className="w-4 h-4" />,
    border: 'border-l-red-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  GPS_OFF: {
    icon: <WifiOff className="w-4 h-4" />,
    border: 'border-l-orange-500',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
};

// ── Single toast ───────────────────────────────────────────────────────────────
const SingleToast = React.forwardRef<
  HTMLDivElement,
  {
    notification: AppNotification;
    onDismiss: (id: string) => void;
  }
>(({ notification, onDismiss }, ref) => {
  const style = TOAST_STYLES[notification.type] || TOAST_STYLES.ALERT;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notification.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      className={cn(
        'flex items-start gap-3 px-4 py-3 bg-white rounded-xl shadow-lg shadow-slate-300/40 border border-slate-200 border-l-4 w-[340px] pointer-events-auto',
        style.border
      )}
    >
      <div className={cn('shrink-0 w-8 h-8 rounded-full flex items-center justify-center', style.iconBg, style.iconColor)}>
        {style.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{notification.message}</p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
});

SingleToast.displayName = 'SingleToast';

// ── Toast Container ────────────────────────────────────────────────────────────
export const NotificationToasts = () => {
  const { notifications } = useNotifications();
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const seenRef = useRef<Set<string>>(new Set());

  // Watch for new notifications and add them to visible queue
  useEffect(() => {
    if (notifications.length === 0) return;
    const latest = notifications[0];
    if (!seenRef.current.has(latest.id)) {
      seenRef.current.add(latest.id);
      setVisibleIds((prev) => [latest.id, ...prev].slice(0, MAX_VISIBLE_TOASTS));
    }
  }, [notifications]);

  const dismiss = useCallback((id: string) => {
    setVisibleIds((prev) => prev.filter((v) => v !== id));
  }, []);

  const visibleNotifications = visibleIds
    .map((id) => notifications.find((n) => n.id === id))
    .filter(Boolean) as AppNotification[];

  return (
    <div className="fixed top-6 right-6 z-[70] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((n) => (
          <SingleToast key={n.id} notification={n} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};
