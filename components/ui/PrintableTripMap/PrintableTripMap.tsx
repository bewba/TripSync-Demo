// components/PrintableTripMap.tsx
import React, { useMemo } from 'react';

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

interface PrintableTripMapProps {
    coordinates: LatLng[];
    flags?: DriverFlag[];
    width?: number;
    height?: number;
}

// Emulate backend segment speed colors for print parity
function getPrintSpeedColor(speedKmh: number): string {
    if (speedKmh > 60) return '#16a34a'; // Darker Green for print contrast
    if (speedKmh > 30) return '#84cc16'; // Lime
    if (speedKmh > 15) return '#eab308'; // Yellow
    return '#ea580c'; // Orange-Red
}

// driver_flags.duration is stored in minutes (matches TripMapModal display).
function formatFlagMinutes(duration?: number): string {
    if (duration == null) return '';
    const m = Math.round(duration);
    return m > 0 ? `${m}m` : '';
}

export const PrintableTripMap: React.FC<PrintableTripMapProps> = ({
    coordinates = [],
    flags = [],
    width = 700,
    height = 300,
}) => {
    if (coordinates.length < 2) {
        return (
            <div className="w-full h-32 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium">
                Insufficient tracking data to plot vector path map.
            </div>
        );
    }

    // 1. Calculate the geographic bounding box
    const bounds = useMemo(() => {
        let minLat = Infinity, maxLat = -Infinity;
        let minLng = Infinity, maxLng = -Infinity;

        coordinates.forEach((pt) => {
            if (pt.lat < minLat) minLat = pt.lat;
            if (pt.lat > maxLat) maxLat = pt.lat;
            if (pt.lng < minLng) minLng = pt.lng;
            if (pt.lng > maxLng) maxLng = pt.lng;
        });

        // Handle single-point edges or edge anomalies
        const latDelta = maxLat - minLat || 0.01;
        const lngDelta = maxLng - minLng || 0.01;

        return { minLat, maxLat, minLng, maxLng, latDelta, lngDelta };
    }, [coordinates]);

    // 2. Aspect-ratio-preserving fit so the route isn't stretched to fill the
    //    frame. Longitude degrees are compressed by cos(lat) to approximate a
    //    proper map projection, then a single uniform scale fits the geometry
    //    inside the padded viewport and centers it.
    const projection = useMemo(() => {
        const PAD = 24;
        const centerLat = (bounds.minLat + bounds.maxLat) / 2;
        const cosLat = Math.max(Math.cos((centerLat * Math.PI) / 180), 0.01);

        const geoW = bounds.lngDelta * cosLat; // horizontal extent (adjusted)
        const geoH = bounds.latDelta;          // vertical extent

        const availW = Math.max(width - PAD * 2, 1);
        const availH = Math.max(height - PAD * 2, 1);
        const scale = Math.min(availW / geoW, availH / geoH);

        const drawW = geoW * scale;
        const drawH = geoH * scale;
        const offsetX = PAD + (availW - drawW) / 2;
        const offsetY = PAD + (availH - drawH) / 2;

        return { cosLat, scale, offsetX, offsetY };
    }, [bounds, width, height]);

    // 3. Coordinate translation helper functions (uniform scale, y inverted)
    const projectX = (lng: number) =>
        projection.offsetX + (lng - bounds.minLng) * projection.cosLat * projection.scale;
    const projectY = (lat: number) =>
        projection.offsetY + (bounds.maxLat - lat) * projection.scale;

    // 4. Segment mapping logic matched to speed telemetry
    const segments = useMemo(() => {
        const lines: { pathData: string; color: string }[] = [];

        for (let i = 0; i < coordinates.length - 1; i++) {
            const p1 = coordinates[i];
            const p2 = coordinates[i + 1];

            const x1 = projectX(p1.lng);
            const y1 = projectY(p1.lat);
            const x2 = projectX(p2.lng);
            const y2 = projectY(p2.lat);

            // Rough speed approximation matching backend behaviors
            let speed = 40;
            if (p1.createdAt && p2.createdAt) {
                const elapsedHrs = (new Date(p2.createdAt).getTime() - new Date(p1.createdAt).getTime()) / 3600000;
                if (elapsedHrs > 0) {
                    // Haversine fallback or linear vector velocity calculation
                    const dx = (p2.lng - p1.lng) * 111.32;
                    const dy = (p2.lat - p1.lat) * 110.57;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    speed = dist / elapsedHrs;
                }
            }

            lines.push({
                pathData: `M ${x1} ${y1} L ${x2} ${y2}`,
                color: getPrintSpeedColor(speed),
            });
        }
        return lines;
    }, [coordinates, bounds]);

    return (
        <div className="relative bg-slate-50 rounded-2xl border border-slate-200 p-2 overflow-hidden break-inside-avoid">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Render Grid/Scale context lines for professional document appeal */}
                <g stroke="#f1f5f9" strokeWidth="1">
                    <line x1="0" y1={height / 2} x2={width} y2={height / 2} />
                    <line x1={width / 2} y1="0" x2={width / 2} y2={height} />
                </g>

                {/* Telemetry Route Segments */}
                <g strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
                    {segments.map((seg, idx) => (
                        <path key={idx} d={seg.pathData} stroke={seg.color} fill="none" />
                    ))}
                </g>

                {/* Exception Flag Markers — floating banner above a point dot */}
                {flags.map((flag, idx) => {
                    const fx = projectX(flag.long);
                    const fy = projectY(flag.lat);
                    const isStoppage = flag.code === 0;
                    const color = isStoppage ? '#ef4444' : '#f97316';
                    const label = isStoppage ? 'STOPPED' : 'GPS OFF';
                    const durationLabel = formatFlagMinutes(flag.duration);
                    const text = durationLabel ? `${label} ${durationLabel}` : label;
                    const bannerW = text.length * 5.2 + 24;
                    const bannerH = 16;
                    const bannerTop = -28;

                    return (
                        <g key={flag.id || idx} transform={`translate(${fx}, ${fy})`}>
                            {/* Connector from point up to the banner */}
                            <line x1="0" y1={bannerTop + bannerH} x2="0" y2="-3" stroke={color} strokeWidth="1" />
                            {/* Floating banner */}
                            <g transform={`translate(0, ${bannerTop})`}>
                                <rect x={-bannerW / 2} y="0" width={bannerW} height={bannerH} rx="5"
                                    fill="#ffffff" stroke={color} strokeWidth="1.2" />
                                <circle cx={-bannerW / 2 + 9} cy={bannerH / 2} r="3.4" fill={color} />
                                <text x={-bannerW / 2 + 17} y={bannerH / 2 + 3} fontSize="8" fontWeight="800"
                                    letterSpacing="0.3" fill={color}>{text}</text>
                            </g>
                            {/* Point marker dot */}
                            <circle r="3.5" fill={color} stroke="#ffffff" strokeWidth="1.5" />
                        </g>
                    );
                })}

                {/* Start / End Markers */}
                {coordinates.length > 0 && (
                    <>
                        {/* Start Node */}
                        <g transform={`translate(${projectX(coordinates[0].lng)}, ${projectY(coordinates[0].lat)})`}>
                            <circle r="6" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
                        </g>
                        {/* End Node */}
                        <g transform={`translate(${projectX(coordinates[coordinates.length - 1].lng)}, ${projectY(coordinates[coordinates.length - 1].lat)})`}>
                            <circle r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                        </g>
                    </>
                )}
            </svg>

            {/* Map Context Legend bar embedded inside export window */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[9px] font-bold text-slate-400 tracking-wider uppercase">
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