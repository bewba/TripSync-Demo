import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { Trip } from '@/types/types';
import { queryKeys, fetchJson } from './keys';

interface TripsPage {
  trips: Trip[];
  total: number;
}

interface UseTripsParams {
  page: number;
  limit: number;
  searchQuery?: string;
  status?: string;
}

// Paged trip history list. Cached per filter combination to avoid refetching
// when paging back and forth or reopening the page within the stale window.
export function useTrips({ page, limit, searchQuery, status }: UseTripsParams) {
  return useQuery({
    queryKey: queryKeys.trips({ page, limit, searchQuery: searchQuery || '', status: status || 'All' }),
    queryFn: () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(searchQuery && { searchQuery }),
        ...(status && status !== 'All' && { status }),
      });
      return fetchJson<TripsPage>(`/api/auth/trip-history/trip-history?${query}`);
    },
    placeholderData: keepPreviousData,
  });
}

// Detailed trip record for the preview modal. Only fetched when a trip id is set.
export function useTripDetail(tripId: string | null) {
  return useQuery({
    queryKey: queryKeys.tripDetail(tripId ?? ''),
    queryFn: () => fetchJson<any>(`/api/auth/trip-history/detail?id=${tripId}`),
    enabled: !!tripId,
  });
}
