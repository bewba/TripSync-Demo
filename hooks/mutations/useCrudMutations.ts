import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/queries/keys';

async function parseError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data?.message || data?.error || fallback;
  } catch {
    return fallback;
  }
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string | null | '' }) => {
      const res = await fetch('/api/auth/view-users/update-user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role }),
      });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to update user'));
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/auth/view-users/delete-user?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to remove user'));
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    },
  });
}

export function useUpdateVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, any> }) => {
      const res = await fetch('/api/auth/view-vehicles/update-vehicle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to update vehicle'));
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.fleetStats() });
    },
  });
}

export function useDeleteVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/auth/view-vehicles/delete-vehicle?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to delete vehicle'));
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.fleetStats() });
    },
  });
}

export function useAddLocationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, lat, long }: { name: string; lat: number; long: number }) => {
      const res = await fetch('/api/auth/locations/add-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, lat, long }),
      });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to save location'));
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations() });
    },
  });
}

export function useDeleteLocationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/auth/locations/delete-location?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to delete location'));
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations() });
    },
  });
}

export function useCreateDriverMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { firstName: string; lastName: string; password: string }) => {
      const res = await fetch('/api/auth/add-driver/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to create driver'));
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useCancelTripMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch('/api/auth/trip-history/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId }),
      });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to cancel trip'));
      return res.json().catch(() => ({}));
    },
    onSuccess: (_data, tripId) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tripDetail(tripId) });
      queryClient.invalidateQueries({ queryKey: ['active-drivers-locations'] });
    },
  });
}

export function useEndTripMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch('/api/auth/trip-history/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId }),
      });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to end trip'));
      return res.json().catch(() => ({}));
    },
    onSuccess: (_data, tripId) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tripDetail(tripId) });
      queryClient.invalidateQueries({ queryKey: ['active-drivers-locations'] });
    },
  });
}

