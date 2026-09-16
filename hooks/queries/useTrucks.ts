import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { TruckRecord } from '@/types/types';
import { queryKeys, fetchJson } from './keys';

interface TrucksPage {
  data: TruckRecord[];
  total: number;
}

interface UseTrucksParams {
  page: number;
  limit: number;
  q?: string;
}

// Paged fleet roster. Results are cached per (page, limit, q) combination so
// flipping back to a previously viewed page is instant and costs no egress.
export function useTrucks({ page, limit, q }: UseTrucksParams) {
  return useQuery({
    queryKey: queryKeys.trucks({ page, limit, q: q || '' }),
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (q) params.append('q', q);
      return fetchJson<TrucksPage>(`/api/auth/view-vehicles/view-vehicles?${params.toString()}`);
    },
    placeholderData: keepPreviousData,
  });
}

interface FleetStats {
  total: number;
  active: number;
  idle: number;
  maintenance: number;
  inMotion: number;
}

export function useFleetStats() {
  return useQuery({
    queryKey: queryKeys.fleetStats(),
    queryFn: () => fetchJson<FleetStats>('/api/auth/view-vehicles/fleet-stats'),
  });
}
