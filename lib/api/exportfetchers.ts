import { fetchJson } from '@/hooks/queries/keys';
import type { CoordsResponse } from '@/hooks/queries/useTripCoordinates';
import type { DriverFlag } from '@/hooks/queries/useDriverFlags';

// One-off, non-hook fetch of full trip coordinates (no `since`, no cache merge —
// export needs the complete route in one shot).
export async function fetchTripCoordinatesOnce(tripId: string): Promise<CoordsResponse['legs']> {
    console.log('fetching coordinates');
    const params = new URLSearchParams({ trip_id: tripId });
    const res = await fetchJson<CoordsResponse>(
        `/api/auth/trip-history/coordinates?${params.toString()}`,
        { cache: 'no-store' }
    );
    return res.legs;
}

export async function fetchDriverFlagsOnce(tripId: string): Promise<DriverFlag[]> {
    const params = new URLSearchParams({ trip_id: tripId });
    try {
        const flags = await fetchJson<DriverFlag[]>(
            `/api/auth/trip-history/flags?${params.toString()}`,
            { cache: 'no-store' }
        );
        return flags || [];
    } catch (err) {
        console.warn(`[fetchDriverFlagsOnce] Failed to load flags for ${tripId}:`, err);
        return [];
    }
}