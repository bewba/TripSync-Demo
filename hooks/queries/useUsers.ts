import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchJson } from './keys';

export interface UserRecord {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
}

// Full user directory. Cached so revisiting the page within the stale window
// reuses data instead of re-querying PostgREST.
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users(),
    queryFn: () => fetchJson<UserRecord[]>('/api/auth/view-users/get-users'),
  });
}
