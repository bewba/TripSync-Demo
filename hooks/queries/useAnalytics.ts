import { useQuery } from '@tanstack/react-query';
import type { AnalyticsEntry } from '@/lib/analyticsHelpers';
import { queryKeys, fetchJson } from './keys';

interface UseAnalyticsParams {
  from: string;
  to: string;
  driverId?: string;
  truckId?: string;
  enabled?: boolean;
}

// Completed-trip analytics for the selected range/filters. Cached per filter
// combination so toggling between presets you've already viewed is free.
export function useAnalytics({ from, to, driverId, truckId, enabled = true }: UseAnalyticsParams) {
  return useQuery({
    queryKey: queryKeys.analytics({ from, to, driverId: driverId || 'all', truckId: truckId || 'all' }),
    queryFn: () => {
      const params = new URLSearchParams({ from, to });
      if (driverId && driverId !== 'all') params.append('driverId', driverId);
      if (truckId && truckId !== 'all') params.append('truckId', truckId);
      return fetchJson<AnalyticsEntry[]>(`/api/auth/analytics/analytics?${params}`);
    },
    enabled: enabled && !!from && !!to,
  });
}
