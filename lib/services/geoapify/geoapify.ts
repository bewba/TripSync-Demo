import { getTomTomDistance } from '../tomtom';

export interface GeocodeResult {
    lat: number;
    lng: number;
    formatted: string;
}

/** Null object – use instead of null / undefined so callers can always destructure safely */
export const NULL_GEOCODE_RESULT: GeocodeResult = {
    lat: 0,
    lng: 0,
    formatted: '',
};

// ── Client-side helper (calls /api/geocode) ──────────────────────────

export interface FindAddressResult {
    data: GeocodeResult;
    error: string | null;
}

/**
 * Looks up an address string and returns the best-match coordinates,
 * or `NULL_GEOCODE_RESULT` when nothing is found / the query is too short.
 *
 * Safe to call from React components – it hits the Next.js API route,
 * NOT the Geoapify API directly (no key exposure).
 */
export async function findAddress(query: string): Promise<FindAddressResult> {
    if (!query || query.length <= 3) return { data: NULL_GEOCODE_RESULT, error: null };

    try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);

        if (!res.ok) {
            const body = await res.json().catch(() => null);
            const msg = body?.error || `Geocoding service error (${res.status})`;
            return { data: NULL_GEOCODE_RESULT, error: msg };
        }

        const data = await res.json();

        if (data && data.length > 0) {
            return {
                data: {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                    formatted: data[0].formatted ?? '',
                },
                error: null,
            };
        }

        return { data: NULL_GEOCODE_RESULT, error: 'No results found for this address' };
    } catch (err) {
        console.error('Geocoding failed:', err);
        return { data: NULL_GEOCODE_RESULT, error: 'Failed to connect to geocoding service' };
    }
}

// ── Server-side helpers (use GEOAPIFY_API_KEY directly) ──────────────

/** Standard routing result returned to the caller. */
export interface RouteResult {
    distanceKm: number;
    durationMin: number;
    source: string;
    routeCoords: [number, number][];
    snappedStart?: { lat: number; lon: number };
    snappedEnd?: { lat: number; lon: number };
    error?: never; // discriminant – a success result never has `error`
}

export interface RouteError {
    error: string;
    status?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────

function getApiKey(): string {
    const key = process.env.GEOAPIFY_API_KEY;
    if (!key) throw new Error('GEOAPIFY_API_KEY is not defined in .env.local');
    return key;
}

/** Validate that a value is a finite number within valid lat/lon ranges. */
function isValidCoord(val: string, type: 'lat' | 'lon'): boolean {
    const n = parseFloat(val);
    if (!Number.isFinite(n)) return false;
    if (type === 'lat') return n >= -90 && n <= 90;
    return n >= -180 && n <= 180;
}

/**
 * Haversine formula – straight-line distance between two coordinates.
 * Used as the last-resort fallback when the routing API is unavailable.
 * Multiplied by 1.35 to approximate road distance (industry heuristic).
 */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Snaps a coordinate to the nearest drivable road.
 *
 * Strategy (mirrors what Google Maps does internally):
 *  1. Try reverse-geocode with type=street to find the nearest named road.
 *  2. If that fails, fall back to a generic reverse-geocode (closest address).
 *  3. If everything fails, return the original coordinates untouched.
 */
async function snapToRoad(
    lat: string,
    lon: string,
    apiKey: string,
): Promise<{ lat: number; lon: number; snapped: boolean }> {
    const original = { lat: parseFloat(lat), lon: parseFloat(lon), snapped: false };

    // Attempt 1: Street-level snap
    try {
        const url = new URL('https://api.geoapify.com/v1/geocode/reverse');
        url.searchParams.set('lat', lat);
        url.searchParams.set('lon', lon);
        url.searchParams.set('type', 'street');
        url.searchParams.set('limit', '1');
        url.searchParams.set('apiKey', apiKey);

        const res = await fetch(url.toString());
        if (res.ok) {
            const data = await res.json();
            if (data.features?.length > 0) {
                const p = data.features[0].properties;
                return { lat: p.lat, lon: p.lon, snapped: true };
            }
        }
    } catch { /* fall through */ }

    // Attempt 2: Generic reverse-geocode (any address)
    try {
        const url = new URL('https://api.geoapify.com/v1/geocode/reverse');
        url.searchParams.set('lat', lat);
        url.searchParams.set('lon', lon);
        url.searchParams.set('limit', '1');
        url.searchParams.set('apiKey', apiKey);

        const res = await fetch(url.toString());
        if (res.ok) {
            const data = await res.json();
            if (data.features?.length > 0) {
                const p = data.features[0].properties;
                return { lat: p.lat, lon: p.lon, snapped: true };
            }
        }
    } catch { /* fall through */ }

    // Attempt 3: Return original coordinates
    console.warn(`[snapToRoad] Could not snap (${lat}, ${lon}) – using original.`);
    return original;
}

/**
 * Extract [lat, lng] polyline from GeoJSON geometry.
 * Geoapify returns coordinates as [lng, lat] (GeoJSON standard) – we flip them for Leaflet.
 */
function extractRouteCoords(geometry: any): [number, number][] {
    if (!geometry) return [];
    const { type, coordinates } = geometry;

    if (type === 'MultiLineString') {
        return coordinates.flat().map((c: number[]) => [c[1], c[0]] as [number, number]);
    }
    if (type === 'LineString') {
        return coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
    }
    return [];
}

/**
 * Attempt a single routing call and parse the result.
 * Returns the parsed RouteResult on success, or null on failure.
 */
/**
 * Attempt a single routing call for Heavy Trucks.
 */
async function tryRoute(
    startLat: number, startLon: number,
    endLat: number, endLon: number,
    mode: string, // This will now receive 'heavy_truck' from the caller
    type: string,
    apiKey: string,
): Promise<RouteResult | null> {
    const url = new URL('https://api.geoapify.com/v1/routing');
    url.searchParams.set('waypoints', `${startLat},${startLon}|${endLat},${endLon}`);

    // Using the requested mode (heavy_truck or truck) to ensure truck-legal paths
    url.searchParams.set('mode', mode);
    url.searchParams.set('type', type);
    url.searchParams.set('traffic', 'approximated');
    url.searchParams.set('apiKey', apiKey);

    try {
        const res = await fetch(url.toString());
        if (!res.ok) return null;

        const data = await res.json();
        if (!data.features?.length) return null;

        const feature = data.features[0];
        const props = feature.properties;
        console.log("time: ", Math.round(props.time / 60), "distance: ", props.distance)

        if (typeof props.distance !== 'number' || props.distance <= 0) return null;

        return {
            distanceKm: parseFloat((props.distance / 1000).toFixed(2)),
            durationMin: Math.round(props.time / 60),
            source: `geoapify_heavy_truck_${type}`, // Updated source name
            routeCoords: extractRouteCoords(feature.geometry),
        };
    } catch {
        return null;
    }
}

// ── Main Exported Function ───────────────────────────────────────────

/**
 * Calculate the driving distance between two coordinates.
 *
 * Routing strategy (mirrors Google Maps / industry best practices):
 *
 *  1. **Input validation** – reject obviously invalid coordinates early.
 *  2. **Snap to road** – move off-road pins to the nearest drivable point.
 *  3. **Primary route (balanced)** – optimises for a mix of distance + time.
 *  4. **Fallback route (short)** – pure shortest-distance; catches edge cases
 *     where the balanced router can't find a path.
 *  5. **Raw coordinates retry** – if snapping moved the point too far and
 *     broke routing, retry with the original un-snapped coordinates.
 *  6. **Haversine fallback** – straight-line × 1.35 road factor when
 *     the API is completely unreachable (network down, quota exhausted).
 */
/**
 * Calculate the driving distance between two coordinates for Heavy Trucks.
 * * Strategy:
 * 1. Input validation for PH coordinates.
 * 2. Snap to the nearest truck-accessible road.
 * 3. Primary routing using 'heavy_truck' mode (avoids narrow streets/barangay roads).
 * 4. Fallback to 'short' truck route if 'balanced' fails.
 * 5. Last resort: Haversine formula with a 1.45 road factor and 25km/h speed estimate.
 */
export async function getRouteDistance(
    lat1: string, lon1: string,
    lat2: string, lon2: string,
    avoidTolls: boolean = true, // Default to true as per user request
): Promise<RouteResult | RouteError> {

    // ── Step 1: Input validation ─────────────────────────────────────
    if (
        !isValidCoord(lat1, 'lat') || !isValidCoord(lon1, 'lon') ||
        !isValidCoord(lat2, 'lat') || !isValidCoord(lon2, 'lon')
    ) {
        return { error: 'Invalid coordinates provided', status: 400 };
    }

    // Reject zero-distance requests (same point)
    if (lat1 === lat2 && lon1 === lon2) {
        return {
            distanceKm: 0,
            durationMin: 0,
            source: 'same_point',
            routeCoords: [],
        };
    }

    const apiKey = getApiKey();

    // ── Step 2: Snap to nearest road ─────────────────────────────────
    let start: { lat: number; lon: number; snapped: boolean };
    let end: { lat: number; lon: number; snapped: boolean };
    try {
        [start, end] = await Promise.all([
            snapToRoad(lat1, lon1, apiKey),
            snapToRoad(lat2, lon2, apiKey),
        ]);
    } catch {
        // Snapping failed entirely – use raw coords
        start = { lat: parseFloat(lat1), lon: parseFloat(lon1), snapped: false };
        end = { lat: parseFloat(lat2), lon: parseFloat(lon2), snapped: false };
    }

    try {
        // ── Step 2.5: TomTom Primary Route ───────────────────────────
        // Try TomTom first as requested
        const tomtomResult = await getTomTomDistance(lat1, lon1, lat2, lon2, avoidTolls);
        if (tomtomResult) {
            return {
                ...tomtomResult,
                snappedStart: { lat: parseFloat(lat1), lon: parseFloat(lon1) },
                snappedEnd: { lat: parseFloat(lat2), lon: parseFloat(lon2) },
            };
        }

        // ── Step 3: Primary route (Heavy Truck / Balanced) ───────────
        // 'heavy_truck' mode avoids narrow roads and respects truck bans in PH cities
        let result = await tryRoute(start.lat, start.lon, end.lat, end.lon, 'heavy_truck', 'balanced', apiKey);
        if (result) {
            result.snappedStart = { lat: start.lat, lon: start.lon };
            result.snappedEnd = { lat: end.lat, lon: end.lon };
            return result;
        }

        // ── Step 4: Fallback route (Heavy Truck / Short) ─────────────
        result = await tryRoute(start.lat, start.lon, end.lat, end.lon, 'heavy_truck', 'short', apiKey);
        if (result) {
            result.snappedStart = { lat: start.lat, lon: start.lon };
            result.snappedEnd = { lat: end.lat, lon: end.lon };
            return result;
        }

        // ── Step 5: Fallback route (Standard Truck / Balanced) ───────
        result = await tryRoute(start.lat, start.lon, end.lat, end.lon, 'truck', 'balanced', apiKey);
        if (result) {
            result.snappedStart = { lat: start.lat, lon: start.lon };
            result.snappedEnd = { lat: end.lat, lon: end.lon };
            return result;
        }

        // ── Step 6: Fallback route (Delivery Truck) ──────────────────
        result = await tryRoute(start.lat, start.lon, end.lat, end.lon, 'delivery_truck', 'balanced', apiKey);
        if (result) {
            result.snappedStart = { lat: start.lat, lon: start.lon };
            result.snappedEnd = { lat: end.lat, lon: end.lon };
            return result;
        }

        // ── Step 7: Fallback route (Car - as road-based baseline) ─────
        // If all truck modes fail, use car routing as a baseline road distance
        // but apply the TRUCK_ROAD_FACTOR to stay conservative.
        result = await tryRoute(start.lat, start.lon, end.lat, end.lon, 'drive', 'balanced', apiKey);
        if (result) {
            const TRUCK_ROAD_FACTOR = 1.25; // Trucks take longer turns/detours than cars
            return {
                ...result,
                distanceKm: parseFloat((result.distanceKm * TRUCK_ROAD_FACTOR).toFixed(2)),
                source: result.source + '_car_baseline_adjusted',
                snappedStart: { lat: start.lat, lon: start.lon },
                snappedEnd: { lat: end.lat, lon: end.lon },
            };
        }

        // ── Step 8: Retry with raw (un-snapped) coordinates ──────────
        // If snapping moved the point to a road that is somehow blocked for trucks,
        // we retry with the raw pin location.
        if (start.snapped || end.snapped) {
            const rawLat1 = parseFloat(lat1), rawLon1 = parseFloat(lon1);
            const rawLat2 = parseFloat(lat2), rawLon2 = parseFloat(lon2);

            result = await tryRoute(rawLat1, rawLon1, rawLat2, rawLon2, 'truck', 'balanced', apiKey);
            if (result) {
                result.source += '_raw_fallback';
                return result;
            }
        }

        // ── Step 9: Truck-specific Haversine Fallback ────────────────
        // Used when API is unreachable or no truck path is found.
        console.warn('[getRouteDistance] All truck API attempts failed. Using heavy truck haversine fallback.');

        const straightLine = haversineKm(
            parseFloat(lat1), parseFloat(lon1),
            parseFloat(lat2), parseFloat(lon2),
        );

        // PH Truck Heuristics:
        // - ROAD_FACTOR 1.45: Trucks must take detours (truck lanes) that add ~45% distance.
        // - AVG_SPEED 25km/h: Accounts for PH congestion and heavy load limits.
        const TRUCK_ROAD_FACTOR = 1.45;
        const TRUCK_AVG_SPEED_KMH = 25;

        const estimatedDistance = straightLine * TRUCK_ROAD_FACTOR;

        return {
            distanceKm: parseFloat(estimatedDistance.toFixed(2)),
            durationMin: Math.round((estimatedDistance / TRUCK_AVG_SPEED_KMH) * 60),
            source: 'haversine_truck_fallback',
            routeCoords: [
                [parseFloat(lat1), parseFloat(lon1)],
                [parseFloat(lat2), parseFloat(lon2)],
            ],
        };

    } catch (err) {
        console.error('[getRouteDistance] Unexpected error:', err);
        return { error: 'Failed to connect to routing service' };
    }
}

export async function geocodeAddress(query: string) {
    const API_KEY = process.env.GEOAPIFY_API_KEY;

    if (!API_KEY) {
        throw new Error('GEOAPIFY_API_KEY is not defined in .env.local');
    }

    const url = new URL('https://api.geoapify.com/v1/geocode/search');
    url.searchParams.set('text', query);
    url.searchParams.set('filter', 'countrycode:ph');
    url.searchParams.set('apiKey', API_KEY);

    const res = await fetch(url.toString(), {
        method: 'GET',
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Geocoding API error');
    }

    if (data.features && data.features.length > 0) {
        // Return all features so the frontend can use the best match, or just return the first one.
        // For drop-in replacement with Nominatim, we'll return an array of {lat, lon}.
        return data.features.map((f: any) => ({
            lat: f.properties.lat,
            lon: f.properties.lon,
            formatted: f.properties.formatted,
        }));
    }

    return [];
}


export async function findRoute(lat1: number, lon1: number, lat2: number, lon2: number) {
    try {
        const res = await fetch(
            `/api/auth/distance?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`
        );

        if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.error || 'Failed to fetch route');
        }

        return await res.json();
    } catch (err) {
        console.error('Route lookup failed:', err);
        return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
}