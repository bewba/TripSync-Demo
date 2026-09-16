import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';
import { getTomTomDistance } from '@/lib/services/tomtom';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET' });
  }

  try {
    const { lat1, lon1, lat2, lon2, avoidTolls } = req.query;

    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return res.status(400).json({ error: 'Missing coordinates' });
    }

    // Try TomTom API if key exists
    if (process.env.TOMTOM_API_KEY) {
      try {
        const tomtomResult = await getTomTomDistance(
          lat1 as string,
          lon1 as string,
          lat2 as string,
          lon2 as string,
          avoidTolls === 'true'
        );

        if (tomtomResult) {
          return res.status(200).json({
            distance: {
              distanceKm: tomtomResult.distanceKm,
              timeString: `${Math.floor(tomtomResult.durationMin / 60)}h ${tomtomResult.durationMin % 60}m`,
              waypoints: tomtomResult.routeCoords,
            },
          });
        }
      } catch (tomtomErr) {
        console.warn('[Distance API] TomTom calculation fallback to demoStore:', tomtomErr);
      }
    }

    // Fallback to local high-precision calculator
    const result = demoStore.calculateRouteDistance(
      parseFloat(lat1 as string),
      parseFloat(lon1 as string),
      parseFloat(lat2 as string),
      parseFloat(lon2 as string)
    );

    return res.status(200).json({ distance: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}