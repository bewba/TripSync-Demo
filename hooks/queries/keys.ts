// Centralised query keys so caches can be shared and invalidated consistently.
export const queryKeys = {
  trucks: (params: Record<string, unknown> = {}) => ['trucks', params] as const,
  fleetStats: () => ['fleet-stats'] as const,
  trips: (params: Record<string, unknown> = {}) => ['trips', params] as const,
  tripDetail: (id: string | number) => ['trip-detail', String(id)] as const,
  tripCoordinates: (id: string | number) => ['trip-coordinates', String(id)] as const,
  tripFlags: (id: string | number) => ['trip-flags', String(id)] as const,
  users: () => ['users'] as const,
  drivers: (params: Record<string, unknown> = {}) => ['drivers', params] as const,
  locations: () => ['locations'] as const,
  analytics: (params: Record<string, unknown> = {}) => ['analytics', params] as const,
};

// Small typed JSON fetcher shared by all query hooks.
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const message =
      res.status >= 500
        ? 'Database connection failed or server is down. Please try again later.'
        : 'Failed to fetch data from the server.';
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
