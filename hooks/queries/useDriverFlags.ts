import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchJson } from './keys';

// ── Types ─────────────────────────────────────────────────────────────────────

export type FlagCode = 0 | 1;

export interface DriverFlag {
    id: string;
    trip_id: string;
    driver_id: string;
    leg: number;
    code: FlagCode;
    duration: number | null; // float4 — use Math.round() before display
    lat: number;
    long: number;           // NB: column is 'long', not 'lng'
    created_at: string;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Fetches driver flags (stoppage and GPS-off events) for a trip.
 */
export function useDriverFlags(tripId: string | null, isLive = false) {
    const isEnabled = Boolean(tripId);

    const query = useQuery<DriverFlag[]>({
        queryKey: queryKeys.tripFlags(tripId ?? ''),
        enabled: isEnabled,
        staleTime: 60000,
        refetchInterval: isLive ? 15000 : false,
        queryFn: async () => {
            const params = new URLSearchParams({ trip_id: tripId! });
            return await fetchJson<DriverFlag[]>(
                `/api/auth/trip-history/flags?${params.toString()}`,
                { cache: 'no-store' }
            );
        },
    });

    return {
        flags: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error ? (query.error as Error).message : null,
        refetch: query.refetch,
    };
}

