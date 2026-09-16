import { useQuery } from '@tanstack/react-query';
import { fetchJson } from './keys';

export interface ActiveDriverLocation {
    tripId: string;
    driverName: string;
    lat: number;
    lng: number;
    lastUpdate: string;
    batteryLevel: number | null;
    speed?: number;
    heading?: number;
    truckName?: string;
    plateNumber?: string;
    origin?: string;
    destination?: string;
    isStopped?: boolean;
    stoppedForSeconds?: number;
    stoppedAt?: number;
    isOnline?: boolean;
}

export function useActiveDriversLocations() {
    return useQuery({
        queryKey: ['activeDriversLocations'],
        queryFn: () => fetchJson<ActiveDriverLocation[]>('/api/auth/active-drivers/locations'),
        refetchInterval: 2500, // Fast polling for real-time live simulation
    });
}
