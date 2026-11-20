import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';

export interface LegCoordinates {
  leg: number;
  coordinates: { lat: number; lng: number; createdAt?: string }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { trip_id, since } = req.query;

  if (!trip_id || Array.isArray(trip_id)) {
    return res.status(400).json({ error: 'trip_id is required and must be a string' });
  }

  try {
    const legs = demoStore.getTripCoordinates(trip_id);
    const isLive = demoStore.isTripLive(trip_id);

    // Find the latest coordinate timestamp and battery level
    let latest: string | null = null;
    let latestBattery: number | null = null;
    if (legs.length > 0) {
      const allCoords = legs.flatMap((l: any) => l.coordinates);
      const timestamps = allCoords.map((c: any) => c.createdAt).filter(Boolean);
      if (timestamps.length > 0) {
        latest = timestamps.sort().pop() ?? null;
      }
      const lastCoord = allCoords[allCoords.length - 1];
      if (lastCoord && typeof lastCoord.batteryLevel === 'number') {
        latestBattery = lastCoord.batteryLevel;
      }
    }

    // For live simulated trips, return the full traveled slice so interpolated
    // live position & progress stay exact without duplicating points on poll.
    if (!isLive && since && typeof since === 'string') {
      const filteredLegs = legs.map((leg: any) => ({
        ...leg,
        coordinates: leg.coordinates.filter(
          (c: any) => c.createdAt && c.createdAt > since
        ),
      })).filter((leg: any) => leg.coordinates.length > 0);

      if (filteredLegs.length === 0) {
        return res.status(200).json({ legs: [], latest: since, incremental: true, latestBattery });
      }

      return res.status(200).json({ legs: filteredLegs, latest, incremental: true, latestBattery });
    }

    if (legs.length === 0) {
      return res.status(200).json({ legs: [], latest: null, incremental: false, latestBattery: null });
    }

    return res.status(200).json({ legs, latest, incremental: false, latestBattery });
  } catch (error: any) {
    console.error('[coordinates] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}