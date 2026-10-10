import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';
import { getTomTomDistance } from '@/lib/services/tomtom';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET' });
  }

  try {
    const { lat1, lon1, lat2, lon2, avoidTolls } = req.query;

    const pLat1 = parseFloat(lat1 as string);
    const pLon1 = parseFloat(lon1 as string);
    const pLat2 = parseFloat(lat2 as string);
    const pLon2 = parseFloat(lon2 as string);

    const safeLat1 = !isNaN(pLat1) && pLat1 !== 0 ? pLat1 : 14.5995;
    const safeLon1 = !isNaN(pLon1) && pLon1 !== 0 ? pLon1 : 120.9842;
    const safeLat2 = !isNaN(pLat2) && pLat2 !== 0 ? pLat2 : 14.5547;
    const safeLon2 = !isNaN(pLon2) && pLon2 !== 0 ? pLon2 : 121.0244;

    // Try TomTom API if key exists
    if (process.env.TOMTOM_API_KEY) {
      try {
        const tomtomResult = await getTomTomDistance(
          safeLat1.toString(),
          safeLon1.toString(),
          safeLat2.toString(),
          safeLon2.toString(),
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
      safeLat1,
      safeLon1,
      safeLat2,
      safeLon2
    );

    return res.status(200).json({ distance: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}