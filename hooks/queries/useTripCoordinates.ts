import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, fetchJson } from './keys';

export interface LegCoordinates {
  leg: number;
  coordinates: { lat: number; lng: number; createdAt?: string; batteryLevel?: number | null }[];
}

export interface CoordsResponse {
  legs: LegCoordinates[];
  latest: string | null;
  incremental: boolean;
  latestBattery: number | null;
}

// Merge newly-arrived (incremental) legs into the previously cached legs,
// appending coordinates per leg and keeping legs sorted.
function mergeLegs(prev: LegCoordinates[], incoming: LegCoordinates[]): LegCoordinates[] {
  if (!incoming.length) return prev;
  if (!prev.length) return incoming;
  const prevByLeg = new Map(prev.map((leg) => [leg.leg, leg]));
  const incomingByLeg = new Map(incoming.map((leg) => [leg.leg, leg.coordinates]));

  const merged = prev.map((leg) => {
    const nextCoordinates = incomingByLeg.get(leg.leg);
    if (!nextCoordinates?.length) return leg;
    incomingByLeg.delete(leg.leg);
    return {
      leg: leg.leg,
      coordinates: leg.coordinates.concat(nextCoordinates),
    };
  });

  incomingByLeg.forEach((coordinates, leg) => {
    merged.push({ leg, coordinates });
  });

  return merged.sort((a, b) => a.leg - b.leg);
}

interface UseTripCoordinatesOptions {
  enabled?: boolean;
  /** Polling interval in ms. Pass false to disable polling. */
  pollMs?: number | false;
}

// Live trip route coordinates.
// Egress savings:
//  - After the first load, each poll sends `since` and only fetches NEW points,
//    then merges them into the cache instead of re-downloading the whole route.
//  - Polling defaults to 15s (was 5s) and can be disabled (e.g. completed trips).
export function useTripCoordinates(
  tripId: string | null,
  { enabled = true, pollMs = 15000 }: UseTripCoordinatesOptions = {}
) {
  const queryClient = useQueryClient();
  const isEnabled = enabled && !!tripId;

  return useQuery<CoordsResponse>({
    queryKey: queryKeys.tripCoordinates(tripId ?? ''),
    enabled: isEnabled,
    refetchInterval: pollMs === false ? false : pollMs,
    staleTime: 150000,

    // 2. CRITICAL: Turn off structural sharing. 
    // You are already manually merging legs with `mergeLegs()`. 
    // TanStack doesn't need to waste CPU deeply diffing thousands of GPS points.
    structuralSharing: false,

    // 3. Keep your UI responsive while polling in the background
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const key = queryKeys.tripCoordinates(tripId!);
      const prev = queryClient.getQueryData<CoordsResponse>(key);
      const since = prev?.latest ?? null;

      const params = new URLSearchParams({ trip_id: tripId! });
      if (since) params.append('since', since);

      const res = await fetchJson<CoordsResponse>(
        `/api/auth/trip-history/coordinates?${params.toString()}`,
        { cache: 'no-store' }
      );

      if (since && res.incremental) {
        if (prev && res.legs.length === 0 && (res.latest ?? since) === prev.latest) {
          return prev;
        }

        const legs = mergeLegs(prev?.legs ?? [], res.legs);
        if (prev && legs === prev.legs && (res.latest ?? since) === prev.latest) {
          return prev;
        }

        return {
          legs,
          latest: res.latest ?? since,
          incremental: true,
          latestBattery: res.latestBattery ?? prev?.latestBattery ?? null,
        };
      }
      return res;
    },
  });
}
