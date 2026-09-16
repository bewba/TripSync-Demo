// components/PrintableTripMapStatic.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { PrintableTripMap } from './PrintableTripMap';

interface LatLng {
    lat: number;
    lng: number;
    createdAt?: string;
}

interface DriverFlag {
    id: string;
    lat: number;
    long: number;
    code: number;
    duration?: number;
}

interface PrintableTripMapStaticProps {
    coordinates: LatLng[];
    flags?: DriverFlag[];
    width?: number;
    height?: number;
    /** Falls back to NEXT_PUBLIC_GEOAPIFY_API_KEY if not provided. */
    apiKey?: string;
    /** Geoapify style id, e.g. 'osm-bright', 'osm-carto', 'klokantech-basic', 'positron', 'toner'. */
    mapStyle?: string;
}

// Max route points to include in the polyline payload.
// POST has no URL length limit, so we can safely use many more points.
const MAX_ROUTE_POINTS = 1000;
// Max driver flag banners to overlay (purely HTML on top of the image).
const MAX_FLAG_MARKERS = 20;

function getSegmentSpeedColorHex(speedKmh: number): string {
    if (speedKmh > 60) return '16a34a';
    if (speedKmh > 30) return '84cc16';
    if (speedKmh > 15) return 'eab308';
    return 'ea580c';
}

function downsample(coords: LatLng[], maxPoints: number): LatLng[] {
    if (coords.length <= maxPoints) return coords;
    const sampled: LatLng[] = [coords[0]];
    const lastIndex = coords.length - 1;
    const step = (coords.length - 2) / Math.max(maxPoints - 2, 1);
    for (let i = 1; i < maxPoints - 1; i += 1) {
        const idx = Math.min(lastIndex - 1, Math.max(1, Math.round(i * step)));
        sampled.push(coords[idx]);
    }
    sampled.push(coords[lastIndex]);
    return sampled;
}

// ── Web-Mercator projection ──────────────────────────────────────────────────
// The map is driven with an explicit center + zoom (instead of letting
// Geoapify auto-fit) so we can project each lat/lng onto the rendered image
// ourselves and place real HTML overlays on top: green/red dots for start/end
// and floating banners for driver flags — matching the TripMapModal look.
//
// Geoapify renders vector static maps with MapLibre GL, which uses 512px tiles
// (its `zoom` is 512-based: worldSize = 512 * 2^zoom). The projection below MUST
// use the same tile size, otherwise every overlay is pulled toward the center.
const TILE = 512;
const ZOOM_MAX = 18;
const FIT_PADDING = 48; // px breathing room around the route

function mercatorX(lng: number): number {
    return TILE * (0.5 + lng / 360);
}
function mercatorY(lat: number): number {
    const siny = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);
    return TILE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI));
}

interface Bounds { minLat: number; maxLat: number; minLng: number; maxLng: number; }

interface MapView {
    centerLat: number;
    centerLng: number;
    zoom: number;
    project: (lat: number, lng: number) => { xPct: number; yPct: number };
}

// Drops implausible GPS fixes (null-island, NaN, out-of-range, or far-flung
// statistical outliers) before they're used to compute the map's bounds.
// A single bad ping can otherwise blow the lat/lng span out so far that
// zoom collapses toward its floor and the real route shrinks to an
// invisible sliver off in a corner of the frame — the map then "renders"
// (no fetch error) but shows what looks like an empty tile.
function filterOutliers<T extends { lat: number; lng?: number; long?: number }>(points: T[]): T[] {
    const getLng = (p: T) => (p.lng ?? p.long) as number;

    const valid = points.filter((p) => {
        const lng = getLng(p);
        return (
            Number.isFinite(p.lat) &&
            Number.isFinite(lng) &&
            Math.abs(p.lat) <= 90 &&
            Math.abs(lng) <= 180 &&
            !(p.lat === 0 && lng === 0) // classic "null island" glitch fix
        );
    });

    // Not enough points to compute meaningful percentiles — just return
    // whatever passed the basic sanity check.
    if (valid.length < 4) return valid;

    const lats = valid.map((p) => p.lat).slice().sort((a, b) => a - b);
    const lngs = valid.map(getLng).slice().sort((a, b) => a - b);
    const pct = (arr: number[], p: number) => arr[Math.min(arr.length - 1, Math.floor(arr.length * p))];

    const loLat = pct(lats, 0.01);
    const hiLat = pct(lats, 0.99);
    const loLng = pct(lngs, 0.01);
    const hiLng = pct(lngs, 0.99);

    const filtered = valid.filter((p) => {
        const lng = getLng(p);
        return p.lat >= loLat && p.lat <= hiLat && lng >= loLng && lng <= hiLng;
    });

    // Safety net: never let filtering wipe out the trip entirely.
    return filtered.length > 0 ? filtered : valid;
}

function computeMapView(bounds: Bounds, width: number, height: number): MapView {
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLng = (bounds.minLng + bounds.maxLng) / 2;

    // Fractional zoom at which the padded route fits the frame (matches Geoapify,
    // which accepts fractional zoom values).
    const spanX = Math.max(Math.abs(mercatorX(bounds.maxLng) - mercatorX(bounds.minLng)), 1e-6);
    const spanY = Math.max(Math.abs(mercatorY(bounds.minLat) - mercatorY(bounds.maxLat)), 1e-6);

    const availW = Math.max(width - FIT_PADDING * 2, 1);
    const availH = Math.max(height - FIT_PADDING * 2, 1);

    let zoom = Math.min(Math.log2(availW / spanX), Math.log2(availH / spanY));
    if (!Number.isFinite(zoom)) zoom = ZOOM_MAX;
    zoom = Math.max(1, Math.min(zoom, ZOOM_MAX));

    const scale = Math.pow(2, zoom);
    const centerPxX = mercatorX(centerLng) * scale;
    const centerPxY = mercatorY(centerLat) * scale;

    const project = (lat: number, lng: number) => {
        const px = mercatorX(lng) * scale - centerPxX + width / 2;
        const py = mercatorY(lat) * scale - centerPxY + height / 2;
        return { xPct: (px / width) * 100, yPct: (py / height) * 100 };
    };

    return { centerLat, centerLng, zoom, project };
}

function formatFlagMinutes(duration?: number): string {
    if (duration == null) return '';
    const m = Math.round(duration);
    return m > 0 ? `${m}m` : '';
}

// ── Flag glyphs (match TripMapModal) ─────────────────────────────────────────
const StopGlyph: React.FC = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const GpsOffGlyph: React.FC = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
);

export const PrintableTripMapStatic: React.FC<PrintableTripMapStaticProps> = ({
    coordinates = [],
    flags = [],
    width = 700,
    height = 300,
    apiKey,
    mapStyle = 'osm-bright',
}) => {
    const [mapDataUrl, setMapDataUrl] = useState<string | null>(null);
    const [imgFailed, setImgFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const token = apiKey || process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    const hasEnoughData = coordinates.length >= 2;

    // Bounding box spans both the route and the flags so every marker stays
    // in view — but outliers are filtered out FIRST so a single bad GPS fix
    // (e.g. a null-island glitch or a signal-loss jump out over the bay)
    // can't blow the zoom/center out and hide the real route. This only
    // affects the bounds/zoom fit; the actual polyline still draws every
    // (downsampled) point, so real route data is never dropped visually.
    const bounds = useMemo<Bounds>(() => {
        const cleanCoords = filterOutliers(coordinates);
        const cleanFlags = filterOutliers(flags);

        let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
        const consider = (lat: number, lng: number) => {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
        };
        cleanCoords.forEach((p) => consider(p.lat, p.lng));
        cleanFlags.forEach((f) => consider(f.lat, f.long));
        if (!Number.isFinite(minLat)) { minLat = maxLat = 0; minLng = maxLng = 0; }
        return { minLat, maxLat, minLng, maxLng };
    }, [coordinates, flags]);

    const view = useMemo(
        () => (hasEnoughData ? computeMapView(bounds, width, height) : null),
        [bounds, width, height, hasEnoughData],
    );

    // Build the POST payload for the proxy API (no URL-length constraint).
    const postPayload = useMemo(() => {
        if (!hasEnoughData || !token || !view) return null;

        const sampled = downsample(coordinates, MAX_ROUTE_POINTS);

        // Merge consecutive same-color segments into chunks (keeps payload smaller).
        type Chunk = { color: string; points: [number, number][] }; // [lon, lat]
        const chunks: Chunk[] = [];

        for (let i = 0; i < sampled.length - 1; i++) {
            const p1 = sampled[i];
            const p2 = sampled[i + 1];

            let speed = 40;
            if (p1.createdAt && p2.createdAt) {
                const elapsedHrs = (new Date(p2.createdAt).getTime() - new Date(p1.createdAt).getTime()) / 3600000;
                if (elapsedHrs > 0) {
                    const dx = (p2.lng - p1.lng) * 111.32;
                    const dy = (p2.lat - p1.lat) * 110.57;
                    speed = Math.sqrt(dx * dx + dy * dy) / elapsedHrs;
                }
            }
            const color = getSegmentSpeedColorHex(speed);

            const last = chunks[chunks.length - 1];
            if (last && last.color === color) {
                last.points.push([p2.lng, p2.lat]);
            } else {
                chunks.push({ color, points: [[p1.lng, p1.lat], [p2.lng, p2.lat]] });
            }
        }

        const features = chunks.map((c) => ({
            type: 'Feature',
            properties: {
                linecolor: `#${c.color}`,
                linewidth: 4
            },
            geometry: {
                type: 'LineString',
                coordinates: c.points
            }
        }));

        return {
            style: mapStyle,
            width,
            height,
            scaleFactor: 2,
            center: { lon: view.centerLng, lat: view.centerLat },
            zoom: view.zoom,
            geojson: {
                type: 'FeatureCollection',
                features
            }
        };
    }, [coordinates, hasEnoughData, token, width, height, mapStyle, view]);

    // Fetch the map image via our server-side proxy (POST) and convert to a
    // data-URL so the print snapshot captures it even without network access.
    useEffect(() => {
        if (!postPayload || !hasEnoughData) return;

        let cancelled = false;
        setIsLoading(true);
        setImgFailed(false);
        setMapDataUrl(null);

        (async () => {
            try {
                const res = await fetch('/api/auth/trip-history/static-map', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(postPayload),
                });

                if (!res.ok) throw new Error(`Map fetch failed: ${res.status}`);

                const blob = await res.blob();
                if (cancelled) return;

                const reader = new FileReader();
                reader.onload = () => {
                    if (!cancelled) setMapDataUrl(reader.result as string);
                };
                reader.onerror = () => {
                    if (!cancelled) setImgFailed(true);
                };
                reader.readAsDataURL(blob);
            } catch (err) {
                console.error('[PrintableTripMapStatic] failed to fetch map:', err);
                if (!cancelled) setImgFailed(true);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [postPayload, hasEnoughData]);

    // Projected overlay positions (percentages of the rendered image).
    const overlays = useMemo(() => {
        if (!view || !hasEnoughData) return null;
        const start = view.project(coordinates[0].lat, coordinates[0].lng);
        const endCoord = coordinates[coordinates.length - 1];
        const end = view.project(endCoord.lat, endCoord.lng);
        const flagPts = flags.slice(0, MAX_FLAG_MARKERS).map((f) => ({
            ...f,
            ...view.project(f.lat, f.long),
        }));
        return { start, end, flagPts };
    }, [view, hasEnoughData, coordinates, flags]);

    // Fall back to the dependency-free SVG vector map if there is truly nothing to show.
    if (!hasEnoughData || imgFailed || (!postPayload && !isLoading)) {
        return <PrintableTripMap coordinates={coordinates} flags={flags} width={width} height={height} />;
    }

    return (
        <div className="relative bg-slate-50 rounded-2xl border border-slate-200 p-2 overflow-hidden break-inside-avoid">
            <div className="relative">
                {/* SVG fallback — always visible while tile is loading so layout is stable */}
                <div className={mapDataUrl && !isLoading ? 'hidden' : 'relative'}>
                    <PrintableTripMap coordinates={coordinates} flags={flags} width={width} height={height} />
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">
                                Loading map…
                            </span>
                        </div>
                    )}
                </div>

                {/*
                  * The <img> is ALWAYS in the DOM once a fetch starts (mapDataUrl may be
                  * an empty string while loading). This is critical: waitForImages() in
                  * DownloadTrips.tsx polls img.complete — if there is no <img> element
                  * the poller resolves immediately and the print fires before tiles arrive.
                  */}
                {postPayload && (
                    <img
                        src={mapDataUrl ?? ''}
                        alt="Trip route map"
                        width={width}
                        height={height}
                        className="w-full h-auto rounded-xl"
                        style={{ display: mapDataUrl && !isLoading ? 'block' : 'none' }}
                        onError={() => setImgFailed(true)}
                    />
                )}

                {/* HTML overlays projected onto the static tiles — only when map is loaded */}
                {overlays && mapDataUrl && !isLoading && (
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Start dot (green) */}
                        <span
                            className="absolute block w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow"
                            style={{ left: `${overlays.start.xPct}%`, top: `${overlays.start.yPct}%`, transform: 'translate(-50%, -50%)' }}
                        />
                        {/* End dot (red) */}
                        <span
                            className="absolute block w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow"
                            style={{ left: `${overlays.end.xPct}%`, top: `${overlays.end.yPct}%`, transform: 'translate(-50%, -50%)' }}
                        />

                        {/* Floating flag banners */}
                        {overlays.flagPts.map((f, idx) => {
                            const isStoppage = f.code === 0;
                            const durationLabel = formatFlagMinutes(f.duration);
                            return (
                                <div
                                    key={f.id || idx}
                                    className="absolute flex flex-col items-center"
                                    style={{ left: `${f.xPct}%`, top: `${f.yPct}%`, transform: 'translate(-50%, -100%)' }}
                                >
                                    <div
                                        className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] px-2 py-1"
                                        style={{
                                            background: 'rgba(255,255,255,0.97)',
                                            border: `1.5px solid ${isStoppage ? '#ef4444' : '#f97316'}`,
                                            boxShadow: `0 3px 12px ${isStoppage ? 'rgba(239,68,68,0.25)' : 'rgba(249,115,22,0.25)'}`,
                                        }}
                                    >
                                        {isStoppage ? <StopGlyph /> : <GpsOffGlyph />}
                                        <span
                                            className="text-[9px] font-extrabold tracking-wider"
                                            style={{ color: isStoppage ? '#991b1b' : '#c2410c' }}
                                        >
                                            {isStoppage ? 'STOPPED' : 'GPS OFF'}
                                        </span>
                                        {durationLabel && (
                                            <span
                                                className="text-[9px] font-semibold"
                                                style={{ color: isStoppage ? '#ef4444' : '#f97316' }}
                                            >
                                                {durationLabel}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className="block w-2 h-2 rounded-full border-2 border-white shadow mt-0.5"
                                        style={{ background: isStoppage ? '#ef4444' : '#f97316' }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-[9px] font-bold text-slate-500 tracking-wider uppercase bg-white/85 backdrop-blur-sm rounded-lg px-2 py-1">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Start</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> End</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Stoppage</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> GPS Off</div>
                </div>
                <div>Speed Index: <span className="text-green-600">Fast</span> → <span className="text-orange-600">Slow</span></div>
            </div>
        </div>
    );
};