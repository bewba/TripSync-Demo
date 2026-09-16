import { RouteResult } from './geoapify/geoapify';

function getTomTomApiKey(): string {
    const key = process.env.TOMTOM_API_KEY;
    if (!key) throw new Error('TOMTOM_API_KEY is not defined in .env.local');
    return key;
}

/**
 * Calculate routing distance using TomTom API.
 * 
 * Default parameters as requested:
 * traffic=true, travelMode=car, departAt=now
 * 
 * Optional: avoid=tollRoads
 */
export async function getTomTomDistance(
    lat1: string, lon1: string,
    lat2: string, lon2: string,
    avoidTolls: boolean = true
): Promise<RouteResult | null> {
    const apiKey = getTomTomApiKey();
    
    // Format: lat,lon:lat,lon
    const locations = `${lat1},${lon1}:${lat2},${lon2}`;
    const url = new URL(`https://api.tomtom.com/routing/1/calculateRoute/${locations}/json`);
    
    url.searchParams.set('key', apiKey);
    url.searchParams.set('traffic', 'true');
    url.searchParams.set('travelMode', 'car');
    url.searchParams.set('departAt', 'now');
    
    if (avoidTolls) {
        url.searchParams.set('avoid', 'tollRoads');
    }

    try {
        const res = await fetch(url.toString());
        if (!res.ok) {
            console.error('[TomTom] API error:', res.status, await res.text());
            return null;
        }

        const data = await res.json();
        if (!data.routes || data.routes.length === 0) return null;

        const route = data.routes[0];
        const summary = route.summary;

        // distance is in meters, travelTimeInSeconds is in seconds
        return {
            distanceKm: parseFloat((summary.lengthInMeters / 1000).toFixed(2)),
            durationMin: Math.round(summary.travelTimeInSeconds / 60),
            source: avoidTolls ? 'tomtom_car_avoid_tolls' : 'tomtom_car_allow_tolls',
            routeCoords: route.legs[0].points.map((p: any) => [p.latitude, p.longitude] as [number, number]),
        };
    } catch (error) {
        console.error('[TomTom] Fetch failed:', error);
        return null;
    }
}
