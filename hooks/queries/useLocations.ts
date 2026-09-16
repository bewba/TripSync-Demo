import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchJson } from './keys';

// Saved logistics locations. Cached and shared between the locations page and
// the trip planner location picker.
export function useLocations() {
  return useQuery({
    queryKey: queryKeys.locations(),
    queryFn: () => fetchJson<any[]>('/api/auth/locations/get-locations'),
  });
}
