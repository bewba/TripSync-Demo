import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Truck,
  Play,
  CircleCheck,
  Ban,
  MapPin,
  Info,
  UserPlus,
  OctagonMinus,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useNotifications, type AppNotification, type NotificationType } from './NotificationContext';
import { useCancelTripMutation } from '@/hooks/mutations';
import { fetchJson, queryKeys } from '@/hooks/queries/keys';

const TripDetailModal = dynamic(
  () => import('@/components/auth/trip-history/TripDetailModal').then(m => m.TripDetailModal),
  { ssr: false }
);

// ── Constants ──────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

// ── Icon / color mapping ───────────────────────────────────────────────────────
const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; accent: string; bg: string }> = {
  TRIP_ASSIGNED: {
    icon: <Truck className="w-4 h-4" />,
    accent: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  TRIP_ACCEPTED: {
    icon: <CheckCheck className="w-4 h-4" />,
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  TRIP_START: {
    icon: <Play className="w-4 h-4" />,
    accent: 'text-green-600',
    bg: 'bg-green-50',
  },
  TRIP_END: {
    icon: <CircleCheck className="w-4 h-4" />,
    accent: 'text-slate-600',
    bg: 'bg-slate-100',
  },
  TRIP_CANCELLED: {
    icon: <Ban className="w-4 h-4" />,
    accent: 'text-red-600',
    bg: 'bg-red-50',
  },
  ALERT: {
    icon: <Info className="w-4 h-4" />,
    accent: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  DRIVER_ADDED: {
    icon: <UserPlus className="w-4 h-4" />,
    accent: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  TRUCK_ADDED: {
    icon: <Truck className="w-4 h-4" />,
    accent: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  STOPPAGE: {
    icon: <OctagonMinus className="w-4 h-4" />,
    accent: 'text-red-600',
    bg: 'bg-red-50',
  },
  GPS_OFF: {
    icon: <WifiOff className="w-4 h-4" />,
    accent: 'text-orange-600',
    bg: 'bg-orange-50',
  },
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Single notification row ────────────────────────────────────────────────────
const NotificationRow = React.forwardRef<
  HTMLDivElement,
  {
    notification: AppNotification;
    onMarkRead: (id: string) => void;
    onSelectTrip: (tripId: string) => void;
  }
>(({ notification, onMarkRead, onSelectTrip }, ref) => {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.ALERT;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'flex items-start gap-3 px-4 py-3 border-b border-slate-100 transition-colors cursor-pointer hover:bg-slate-50/80',
        !notification.read && 'bg-blue-50/40'
      )}
      onClick={() => {
        onMarkRead(notification.id);
        if (notification.tripId) {
          onSelectTrip(notification.tripId);
        }
      }}
    >
      {/* Icon circle */}
      <div
        className={cn(
          'shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5',
          config.bg,
          config.accent
        )}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-semibold', !notification.read ? 'text-slate-900' : 'text-slate-600')}>
            {notification.title}
          </span>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{notification.message}</p>
        <span className="text-[11px] text-slate-400 mt-1 block">{timeAgo(notification.timestamp)}</span>
      </div>
    </motion.div>
  );
});

NotificationRow.displayName = 'NotificationRow';

// ── Pagination controls ────────────────────────────────────────────────────────
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  // Build page numbers to show
  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-slate-100">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-xs">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-7 h-7 rounded-lg text-xs font-medium transition-colors',
              p === currentPage
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export const NotificationBell = () => {
  const queryClient = useQueryClient();
  const cancelTripMutation = useCancelTripMutation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);

  // States for detailed modal view
  const [selectedTripDetails, setSelectedTripDetails] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const handleSelectTrip = async (tripId: string) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const detailData = await queryClient.fetchQuery({
        queryKey: queryKeys.tripDetail(tripId),
        queryFn: () => fetchJson<any>(`/api/auth/trip-history/detail?id=${tripId}`),
        staleTime: 5 * 60 * 1000,
      });
      setSelectedTripDetails(detailData);
    } catch (error: any) {
      console.error("Error fetching trip details:", error);
      alert(error.message || 'Could not load trip details.');
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCancelTrip = async (tripId: string) => {
    try {
      await cancelTripMutation.mutateAsync(tripId);

      // Refresh the detailed data
      const detailData = await queryClient.fetchQuery({
        queryKey: queryKeys.tripDetail(tripId),
        queryFn: () => fetchJson<any>(`/api/auth/trip-history/detail?id=${tripId}`),
      });
      setSelectedTripDetails(detailData);
    } catch (error: any) {
      console.error('Error cancelling trip:', error);
      alert(error.message || 'Could not cancel the trip. Please try again later.');
      throw error;
    }
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Reset to page 1 and mark all as read when panel opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      markAllAsRead();
    }
  }, [isOpen, markAllAsRead]);

  const totalPages = Math.max(1, Math.ceil(notifications.length / ITEMS_PER_PAGE));
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-[60]">
      {/* ── Bell button ─────────────────────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors',
          isOpen
            ? 'bg-slate-800 text-white shadow-slate-400/40'
            : 'bg-white text-slate-700 shadow-slate-300/60 hover:shadow-slate-400/60'
        )}
        aria-label="Toggle notifications"
        id="notification-bell"
      >
        <Bell className="w-6 h-6" />

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Notification Panel ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-[72px] right-0 w-[380px] max-h-[520px] bg-white rounded-2xl shadow-2xl shadow-slate-400/30 border border-slate-200 flex flex-col overflow-hidden"
            id="notification-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs font-medium text-slate-400">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Mark all as read"
                      aria-label="Mark all notifications as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={clearAll}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Clear all"
                      aria-label="Clear all notifications"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Close notification panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Bell className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs mt-1">Trip events will appear here</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedNotifications.map((n) => (
                    <NotificationRow 
                      key={n.id} 
                      notification={n} 
                      onMarkRead={markAsRead} 
                      onSelectTrip={handleSelectTrip}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <TripDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTripDetails(null);
        }}
        tripData={selectedTripDetails}
        isLoading={isDetailLoading}
        onCancelTrip={handleCancelTrip}
      />
    </div>
  );
};
