import type { NextApiRequest, NextApiResponse } from 'next';
import { demoStore } from '@/lib/demoStore';
import { getTomTomDistance } from '@/lib/services/tomtom';

/**
 * Fetch a road-following route from the OSRM public API (no API key required).
 * Returns [lat, lng] waypoints snapped to actual roads, or null on failure.
 */
async function getOsrmRoute(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): Promise<{ distanceKm: number; durationMin: number; waypoints: [number, number][] } | null> {
  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.routes?.length) return null;

    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map(
      (c: [number, number]) => [
        parseFloat(c[1].toFixed(6)),
        parseFloat(c[0].toFixed(6)),
      ]
    );

    return {
      distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
      durationMin: Math.round(route.duration / 60),
      waypoints: coords,
    };
  } catch {
    return null;
  }
}

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

    // ── 1. TomTom (primary — road-accurate, real-time traffic) ──────
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
        console.warn('[Distance API] TomTom failed, trying OSRM:', tomtomErr);
      }
    }

    // ── 2. OSRM public API (secondary — road-accurate, free, no key) ─
    const osrmResult = await getOsrmRoute(safeLat1, safeLon1, safeLat2, safeLon2);
    if (osrmResult) {
      const h = Math.floor(osrmResult.durationMin / 60);
      const m = osrmResult.durationMin % 60;
      return res.status(200).json({
        distance: {
          distanceKm: osrmResult.distanceKm,
          timeString: h > 0 ? `${h}h ${m}m` : `${m}m`,
          waypoints: osrmResult.waypoints,
        },
      });
    }

    // ── 3. Local haversine estimate (last-resort, straight-line approx) ─
    console.warn('[Distance API] All routing APIs failed – using haversine fallback.');
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