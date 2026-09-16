import { useQuery } from '@tanstack/react-query';
import type { Driver } from '@/types/types';
import { queryKeys, fetchJson } from './keys';

interface UseDriversParams {
  q?: string;
  limit?: number;
}

// Driver list, optionally filtered/limited (used by both the drivers page and
// the analytics driver picker). Cached per (q, limit) combination.
export function useDrivers({ q, limit }: UseDriversParams = {}) {
  return useQuery({
    queryKey: queryKeys.drivers({ q: q || '', limit: limit ?? null }),
    queryFn: () => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', String(limit));
      if (q) params.append('q', q);
      const qs = params.toString();
      return fetchJson<Driver[]>(`/api/auth/view-drivers/view-drivers${qs ? `?${qs}` : ''}`);
    },
  });
}
