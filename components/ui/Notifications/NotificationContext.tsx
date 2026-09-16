import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
// Demo mode: no Supabase client needed — notifications are simulated via polling

// ── Types ──────────────────────────────────────────────────────────────────────
export type NotificationType = 'TRIP_ASSIGNED' | 'TRIP_ACCEPTED' | 'TRIP_START' | 'TRIP_END' | 'TRIP_CANCELLED' | 'ALERT' | 'DRIVER_ADDED' | 'TRUCK_ADDED' | 'STOPPAGE' | 'GPS_OFF';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  tripId?: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  activeTripId: string | null;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const MAX_NOTIFICATIONS = 50;

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Maps a trip status string coming from the database into a notification payload.
 * Returns null if the status change is not interesting enough to notify about.
 */
function mapTripStatusToNotification(
  newStatus: string,
  tripId: string,
  locationInfo?: any,
  requestInfo?: any
): Omit<AppNotification, 'id' | 'timestamp' | 'read'> | null {
  const driverName = locationInfo?.driver?.full_name
    || locationInfo?.driver?.username
    || 'A driver';
  const vehicleName = locationInfo?.truck?.truck_name || 'a vehicle';
  const assignerName = requestInfo?.requested_by || requestInfo?.requestedBy || 'a manager';

  const statusKey = (newStatus || '').trim().toLowerCase();

  switch (statusKey) {
    case 'assigned':
      return {
        type: 'TRIP_ASSIGNED',
        title: 'Trip Assigned',
        message: `Trip assigned to ${driverName} with ${vehicleName} by ${assignerName}.`,
        tripId,
      };
    case 'accepted':
    case 'trip is pending':
      return {
        type: 'TRIP_ACCEPTED',
        title: 'Trip Accepted',
        message: `${driverName} accepted the trip.`,
        tripId,
      };
    case 'in motion':
    case 'in transit':
    case 'started':
    case 'trip in progress':
      return {
        type: 'TRIP_START',
        title: 'Trip Started',
        message: `${driverName} has started the trip.`,
        tripId,
      };
    case 'completed':
      return {
        type: 'TRIP_END',
        title: 'Trip Completed',
        message: `${driverName} has completed the trip.`,
        tripId,
      };
    case 'cancelled':
      return {
        type: 'TRIP_CANCELLED',
        title: 'Trip Cancelled',
        message: `Trip with ${vehicleName} has been cancelled.`,
        tripId,
      };
    default:
      return null;
  }
}

/**
 * Parses a log message from the driver app and returns a notification if relevant.
 */
function parseLogMessage(
  message: string
): Omit<AppNotification, 'id' | 'timestamp' | 'read'> | null {
  if (!message) return null;

  // Detect trip acceptance (case-insensitive and flexible whitespace)
  const tripAcceptMatch = message.match(/\[DRIVER APP\]\s*TripAccept\s+opened\s+tripId\s*=\s*([a-fA-F0-9-]+)/i);
  if (tripAcceptMatch) {
    return {
      type: 'TRIP_ACCEPTED',
      title: 'Trip Accepted',
      message: `Driver has accepted the trip assignment.`,
      tripId: tripAcceptMatch[1],
    };
  }

  // Detect trip start from GPS first row cached (case-insensitive and flexible whitespace)
  const tripStartMatch = message.match(/\[DRIVER APP\].*first\s+row\s+cached.*\(trip=([a-fA-F0-9-]+)\)/i);
  if (tripStartMatch) {
    return {
      type: 'TRIP_START',
      title: 'GPS Tracking Started',
      message: `Driver GPS tracking is now active for trip.`,
      tripId: tripStartMatch[1],
    };
  }

  return null;
}

// ── Provider ───────────────────────────────────────────────────────────────────
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  // Track IDs of notifications we have already processed to prevent duplicates
  const processedRef = useRef<Set<string>>(new Set());
  // Session-only cleared IDs (not persisted to localStorage)
  const clearedIdsRef = useRef<Set<string>>(new Set());

  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const activeTripIdRef = useRef<string | null>(null);

  const updateActiveTripId = useCallback((id: string | null) => {
    setActiveTripId(id);
    activeTripIdRef.current = id;
  }, []);

  const addNotification = useCallback((
    partial: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { id?: string; timestamp?: Date }
  ) => {
    const notifId = partial.id || generateId();

    // Check if this notification has been cleared (session-only)
    if (clearedIdsRef.current.has(notifId)) return;

    // Build a dedup key from the core content
    const dedupKey = `${partial.type}_${partial.tripId || ''}_${partial.message}`;
    if (processedRef.current.has(dedupKey)) return;
    processedRef.current.add(dedupKey);

    // Trim the dedup set so it doesn't grow forever
    if (processedRef.current.size > MAX_NOTIFICATIONS * 2) {
      const arr = Array.from(processedRef.current);
      processedRef.current = new Set(arr.slice(arr.length - MAX_NOTIFICATIONS));
    }

    // Check if it is already in read list
    const savedRead = localStorage.getItem('read_notification_ids');
    const currentRead: string[] = savedRead ? JSON.parse(savedRead) : [];

    const newNotif: AppNotification = {
      ...partial,
      id: notifId,
      timestamp: partial.timestamp || new Date(),
      read: currentRead.includes(notifId),
    };

    setNotifications((prev) => {
      // Prevent duplicates by ID
      if (prev.some((n) => n.id === notifId)) return prev;
      return [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS);
    });
  }, []);

  // Pruning helper for localStorage to keep things light
  const pruneLocalStorageList = (key: string, maxItems: number = 500) => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const arr = JSON.parse(item);
        if (arr.length > maxItems) {
          localStorage.setItem(key, JSON.stringify(arr.slice(arr.length - maxItems)));
        }
      }
    } catch (e) {
      console.error("Prune error:", e);
    }
  };

  // ── Load initial notification history from demoStore via API ─────────────────
  useEffect(() => {
    const savedRead = localStorage.getItem('read_notification_ids');
    const initialRead: string[] = savedRead ? JSON.parse(savedRead) : [];
    setReadIds(initialRead);
    localStorage.removeItem('cleared_notification_ids');
    pruneLocalStorageList('read_notification_ids');

    const loadHistory = async () => {
      try {
        // Fetch recent trips from the demo API
        const res = await fetch('/api/auth/trip-history/trip-history?page=1&limit=10');
        if (!res.ok) return;
        const { trips = [] } = await res.json();

        const historyNotifications: AppNotification[] = [];
        const initialCleared = Array.from(clearedIdsRef.current);

        trips.forEach((trip: any) => {
          const driverName = trip.driver_name || 'A driver';
          const vehicleName = trip.vehicle_name || 'a vehicle';
          const fakeLocationInfo = { driver: { full_name: driverName }, truck: { truck_name: vehicleName } };

          // A. Assigned event for every trip
          const assignedNotif = mapTripStatusToNotification('assigned', trip.trip_id, fakeLocationInfo, {});
          if (assignedNotif) {
            const notifId = `status_${trip.trip_id}_assigned`;
            if (!initialCleared.includes(notifId)) {
              historyNotifications.push({
                ...assignedNotif, id: notifId,
                timestamp: new Date(trip.when || Date.now()),
                read: initialRead.includes(notifId),
              });
            }
          }

          // B. Current status event (if not Assigned)
          if ((trip.status || '').toLowerCase() !== 'assigned') {
            const statusNotif = mapTripStatusToNotification(trip.status, trip.trip_id, fakeLocationInfo, {});
            if (statusNotif) {
              const notifId = `status_${trip.trip_id}_${(trip.status || '').toLowerCase()}`;
              if (!initialCleared.includes(notifId)) {
                historyNotifications.push({
                  ...statusNotif, id: notifId,
                  timestamp: new Date(new Date(trip.when || Date.now()).getTime() + 1000),
                  read: initialRead.includes(notifId),
                });
              }
            }
          }
        });

        historyNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const seenKeys = new Set<string>();
        const unique = historyNotifications.filter((n) => {
          const key = `${n.type}_${n.tripId || ''}_${n.message}`;
          if (seenKeys.has(key)) return false;
          seenKeys.add(key);
          return true;
        });

        // Identify active trip
        const activeTrip = trips.find((t: any) =>
          !['completed', 'cancelled'].includes((t.status || '').trim().toLowerCase())
        );
        updateActiveTripId(activeTrip?.trip_id ?? null);

        setNotifications(unique.slice(0, MAX_NOTIFICATIONS));
      } catch (err) {
        console.error('Error loading notification history:', err);
      }
    };

    loadHistory();
  }, [updateActiveTripId]);


  // ── Actions ────────────────────────────────────────────────────────────────
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setReadIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem('read_notification_ids', JSON.stringify(next));
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      setReadIds((prevRead) => {
        const currentIds = updated.map((n) => n.id);
        const next = Array.from(new Set([...prevRead, ...currentIds]));
        localStorage.setItem('read_notification_ids', JSON.stringify(next));
        return next;
      });
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications((prev) => {
      // Mark all as read (persisted) so they don't re-appear as unread
      const currentIds = prev.map((n) => n.id);
      setReadIds((prevRead) => {
        const next = Array.from(new Set([...prevRead, ...currentIds]));
        localStorage.setItem('read_notification_ids', JSON.stringify(next));
        return next;
      });
      // Clear from view for this session only (not persisted)
      setClearedIds((prevCleared) => {
        const next = Array.from(new Set([...prevCleared, ...currentIds]));
        clearedIdsRef.current = new Set(next);
        return next;
      });
      return [];
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll, activeTripId }}>
      {children}
    </NotificationContext.Provider>
  );
};
