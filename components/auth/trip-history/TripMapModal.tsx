'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { X, Route, Loader2, MapPin, AlertCircle, Timer, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripCoordinates } from '@/hooks/queries/useTripCoordinates';
import { useDriverFlags, type DriverFlag } from '@/hooks/queries/useDriverFlags';

// ── Types ────────────────────────────────────────────────────────────────────

interface LatLng {
    lat: number;
    lng: number;
    createdAt?: string;
    batteryLevel?: number | null;
}

interface LegCoordinates {
    leg: number;
    coordinates: LatLng[];
}

interface TripMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string | null;
    tripLabel?: string; // e.g. "Manila → Cebu"
    initialLeg?: number | null;
    tripStartPoint?: LatLng | null;
    tripEndPoint?: LatLng | null;
    /** Only live (in-progress) trips need polling for new GPS points. */
    isLive?: boolean;
}

interface TripSegment {
    id: number;
    startCoord: LatLng;
    endCoord: LatLng;
    startTime: string;
    endTime: string;
    durationSec: number;
    distanceKm: number;
    points: [number, number][];
    avgSpeedKmh: number;
    color: string;
    /** Index range in the original coords array [startIdx, endIdx) */
    coordStartIdx: number;
    coordEndIdx: number;
    /** Battery level at the first and last coordinate of this segment. */
    startBattery: number | null;
    endBattery: number | null;
}

interface GpsGap {
    fromCoord: LatLng;
    toCoord: LatLng;
    gapSec: number;
    distanceKm: number;
    midLat: number;
    midLng: number;
}

interface HeatChunk {
    points: [number, number][];
    color: string;
    startSegmentIdx: number;
    endSegmentIdx: number;
    durationSec: number;
    startTime?: string;
    endTime?: string;
}

interface HeatComputeResult {
    chunks: HeatChunk[];
    renderedPoints: [number, number][];
}

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'e520b867332a41708a3ac5a694477ae5';
const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;
const PAUSE_THRESHOLD_SEC = 60;
const GPS_LOSS_GAP_SEC = 120;
const GPS_LOSS_DISTANCE_KM = 0.5;
const MAX_POINTS_WITH_SEGMENTS = 1200;
const MAX_RENDER_POINTS = 800;

// ── Utility Functions ────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getSegmentSpeedColor(speedKmh: number): string {
    if (speedKmh > 60) return '#22c55e';
    if (speedKmh > 30) return '#a3e635';
    if (speedKmh > 15) return '#eab308';
    return '#f97316';
}

function downsampleCoordinates(coords: LatLng[], maxPoints: number): LatLng[] {
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

function generateSegments(coords: LatLng[]): TripSegment[] {
    if (coords.length < 2) return [];

    const segments: TripSegment[] = [];
    let segStart = 0;

    for (let i = 1; i <= coords.length; i++) {
        let isBoundary = i === coords.length;

        if (!isBoundary && coords[i].createdAt && coords[i - 1].createdAt) {
            const gap =
                (new Date(coords[i].createdAt!).getTime() - new Date(coords[i - 1].createdAt!).getTime()) / 1000;
            if (gap > PAUSE_THRESHOLD_SEC) isBoundary = true;
        }

        if (isBoundary && i > segStart + 1) {
            const segCoords = coords.slice(segStart, i);
            const startTime = segCoords[0].createdAt || '';
            const endTime = segCoords[segCoords.length - 1].createdAt || '';

            let totalDist = 0;
            const points: [number, number][] = [];
            for (let j = 0; j < segCoords.length; j++) {
                points.push([segCoords[j].lat, segCoords[j].lng]);
                if (j > 0) {
                    totalDist += haversineKm(
                        segCoords[j - 1].lat, segCoords[j - 1].lng,
                        segCoords[j].lat, segCoords[j].lng,
                    );
                }
            }

            const durationSec =
                startTime && endTime
                    ? (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
                    : 0;
            const avgSpeed = durationSec > 0 ? (totalDist / durationSec) * 3600 : 0;

            segments.push({
                id: segments.length + 1,
                startCoord: segCoords[0],
                endCoord: segCoords[segCoords.length - 1],
                startTime,
                endTime,
                durationSec,
                distanceKm: totalDist,
                coordStartIdx: segStart,
                coordEndIdx: i,
                points,
                avgSpeedKmh: avgSpeed,
                color: getSegmentSpeedColor(avgSpeed),
                startBattery: segCoords[0].batteryLevel ?? null,
                endBattery: segCoords[segCoords.length - 1].batteryLevel ?? null,
            });

            segStart = i;
        } else if (isBoundary) {
            segStart = i;
        }
    }

    return segments;
}

function detectGpsGaps(coords: LatLng[]): GpsGap[] {
    const gaps: GpsGap[] = [];
    for (let i = 0; i < coords.length - 1; i++) {
        const a = coords[i];
        const b = coords[i + 1];
        if (!a.createdAt || !b.createdAt) continue;
        const gapSec = (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) / 1000;
        const distKm = haversineKm(a.lat, a.lng, b.lat, b.lng);
        if (gapSec > GPS_LOSS_GAP_SEC && distKm > GPS_LOSS_DISTANCE_KM) {
            gaps.push({
                fromCoord: a,
                toCoord: b,
                gapSec,
                distanceKm: distKm,
                midLat: (a.lat + b.lat) / 2,
                midLng: (a.lng + b.lng) / 2,
            });
        }
    }
    return gaps;
}

function formatDuration(sec: number): string {
    if (sec <= 0) return '—';
    if (sec < 60) return `${Math.round(sec)}s`;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

function formatTime(iso: string): string {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
        return '—';
    }
}

// ── Battery Indicator ────────────────────────────────────────────────────────

function BatteryIndicator({ level, className }: { level: number; className?: string }) {
    const color =
        level > 60 ? '#22c55e'
            : level > 30 ? '#eab308'
                : '#ef4444';
    const fillWidth = Math.round((level / 100) * 13);

    return (
        <span className={`inline-flex items-center gap-1 ${className ?? ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
                <line x1="23" y1="13" x2="23" y2="11" />
                <rect x="3" y="8" width={fillWidth} height="8" rx="1"
                    fill={color} stroke="none" />
            </svg>
            <span style={{ color }} className="text-[11px] font-bold tabular-nums leading-none">
                {level}%
            </span>
        </span>
    );
}

// ── MapRenderer ──────────────────────────────────────────────────────────────

interface MapRendererProps {
    actualCoords: LatLng[];
    onRenderError?: () => void;
    onRenderReady?: () => void;
    tripStartPoint?: LatLng | null;
    tripEndPoint?: LatLng | null;
    fitKey: string;
    segments: TripSegment[];
    hoveredSegmentId: number | null;
    focusSegment: { id: number; key: number } | null;
    onSegmentHover?: (id: number | null) => void;
    /** Driver flags (stoppages / GPS-off events) to render as map markers. */
    flags?: DriverFlag[];
    hoveredFlagId?: string | null;
    focusFlag?: { id: string; key: number } | null;
    onFlagHover?: (id: string | null) => void;
}

function MapRenderer({
    actualCoords,
    onRenderError,
    onRenderReady,
    tripStartPoint,
    tripEndPoint,
    fitKey,
    segments,
    hoveredSegmentId,
    focusSegment,
    onSegmentHover,
    flags = [],
    hoveredFlagId,
    focusFlag,
    onFlagHover,
}: MapRendererProps) {
    const [isMapReady, setIsMapReady] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const layerGroupRef = useRef<any>(null);
    const highlightLayerRef = useRef<any>(null);
    const flagLayerRef = useRef<any>(null);
    const flagHighlightLayerRef = useRef<any>(null);
    const leafletRef = useRef<any>(null);
    const lastFitKeyRef = useRef<string>('');
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const heatWorkerRef = useRef<Worker | null>(null);
    const pendingWorkerJobRef = useRef<{
        id: number;
        resolve: (value: HeatComputeResult) => void;
        reject: (reason?: unknown) => void;
    } | null>(null);
    const workerJobIdRef = useRef(0);
    const lastFocusedKeyRef = useRef<number | null>(null);
    const lastFocusedFlagKeyRef = useRef<number | null>(null);

    // ── Pre-compute flag offsets ─────────────────────────────────────────────
    const displayFlags = useMemo(() => {
        const counts: Record<string, number> = {};
        return flags.filter(f => f.lat != null && f.long != null).map((f) => {
            const key = `${f.lat.toFixed(5)},${f.long.toFixed(5)}`;
            const idx = counts[key] || 0;
            counts[key] = idx + 1;
            const offsetDegree = 0.00003;
            return {
                ...f,
                displayLat: f.lat + (idx * offsetDegree),
                displayLong: f.long + (idx * offsetDegree)
            };
        });
    }, [flags]);

    // Store callbacks in refs so the heavy render effect doesn't re-run (and
    // rebuild every Leaflet layer) just because the parent passed new inline
    // function identities after a state change.
    const onSegmentHoverRef = useRef(onSegmentHover);
    const onFlagHoverRef = useRef(onFlagHover);
    const onRenderReadyRef = useRef(onRenderReady);
    const onRenderErrorRef = useRef(onRenderError);
    useEffect(() => { onSegmentHoverRef.current = onSegmentHover; });
    useEffect(() => { onFlagHoverRef.current = onFlagHover; });
    useEffect(() => { onRenderReadyRef.current = onRenderReady; });
    useEffect(() => { onRenderErrorRef.current = onRenderError; });

    const getDurationSeconds = (start?: string, end?: string) => {
        if (!start || !end) return null;
        const startMs = new Date(start).getTime();
        const endMs = new Date(end).getTime();
        if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) return null;
        return (endMs - startMs) / 1000;
    };

    const getSegmentColor = (ratio: number) => {
        // Strava-like heat scale: fast(cool) -> slow(hot)
        if (ratio < 0.25) return '#22c55e'; // green
        if (ratio < 0.5) return '#eab308';  // yellow
        if (ratio < 0.75) return '#f97316'; // orange
        return '#ef4444'; // red
    };

    const computeHeatChunksSync = (coords: LatLng[]): HeatComputeResult => {
        if (coords.length < 2) {
            return { chunks: [], renderedPoints: coords.map((p) => [p.lat, p.lng]) as [number, number][] };
        }

        const segmentDurations: number[] = [];
        for (let i = 0; i < coords.length - 1; i += 1) {
            const duration = getDurationSeconds(coords[i].createdAt, coords[i + 1].createdAt);
            if (duration != null) segmentDurations.push(duration);
        }
        const minDuration = segmentDurations.length ? Math.min(...segmentDurations) : 0;
        const maxDuration = segmentDurations.length ? Math.max(...segmentDurations) : 0;
        const durationRange = maxDuration - minDuration;

        const renderedPoints: [number, number][] = [];
        const chunks: HeatChunk[] = [];
        let currentChunkColor = '';
        let currentChunkPoints: [number, number][] = [];
        let currentChunkStartIdx = 0;
        let currentChunkDurationSec = 0;

        const flushChunk = (endSegmentIdx: number) => {
            if (currentChunkPoints.length < 2 || !currentChunkColor) return;
            chunks.push({
                points: [...currentChunkPoints],
                color: currentChunkColor,
                startSegmentIdx: currentChunkStartIdx,
                endSegmentIdx,
                durationSec: currentChunkDurationSec,
                startTime: coords[currentChunkStartIdx].createdAt,
                endTime: coords[endSegmentIdx + 1]?.createdAt || coords[endSegmentIdx]?.createdAt,
            });
        };

        for (let i = 0; i < coords.length - 1; i += 1) {
            const start = coords[i];
            const end = coords[i + 1];
            renderedPoints.push([start.lat, start.lng]);

            const durationSeconds = getDurationSeconds(start.createdAt, end.createdAt);
            const ratio = durationSeconds == null || durationRange <= 0
                ? 0.5
                : (durationSeconds - minDuration) / durationRange;
            const segmentColor = getSegmentColor(ratio);
            const normalizedDuration = durationSeconds ?? 0;

            if (!currentChunkColor) {
                currentChunkColor = segmentColor;
                currentChunkPoints = [[start.lat, start.lng], [end.lat, end.lng]];
                currentChunkStartIdx = i;
                currentChunkDurationSec = normalizedDuration;
                continue;
            }

            if (segmentColor === currentChunkColor) {
                currentChunkPoints.push([end.lat, end.lng]);
                currentChunkDurationSec += normalizedDuration;
            } else {
                flushChunk(i - 1);
                currentChunkColor = segmentColor;
                currentChunkPoints = [[start.lat, start.lng], [end.lat, end.lng]];
                currentChunkStartIdx = i;
                currentChunkDurationSec = normalizedDuration;
            }
        }

        flushChunk(coords.length - 2);
        const last = coords[coords.length - 1];
        renderedPoints.push([last.lat, last.lng]);
        return { chunks, renderedPoints };
    };

    const computeHeatChunks = (coords: LatLng[]) => {
        if (!heatWorkerRef.current) {
            return Promise.resolve(computeHeatChunksSync(coords));
        }

        return new Promise<HeatComputeResult>((resolve, reject) => {
            const nextId = workerJobIdRef.current + 1;
            workerJobIdRef.current = nextId;
            pendingWorkerJobRef.current = { id: nextId, resolve, reject };
            heatWorkerRef.current?.postMessage({ id: nextId, coords });
        });
    };

    // ── Init: create Leaflet map, worker, layers ─────────────────────────────
    useEffect(() => {
        if (!containerRef.current) return;

        let isMounted = true;

        (async () => {
            try {
                const L = (await import('leaflet')).default;
                if (!isMounted || !containerRef.current) return;

                leafletRef.current = L;

                // Fix default marker icon paths broken by webpack
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                });

                if (!mapRef.current) {
                    const map = L.map(containerRef.current, {
                        zoomControl: true,
                        attributionControl: true,
                        zoomAnimation: false,
                        fadeAnimation: false,
                        markerZoomAnimation: false,
                    });
                    mapRef.current = map;

                    L.tileLayer(TILE_URL, {
                        maxZoom: 19,
                        attribution: '&copy; OpenStreetMap contributors',
                    }).addTo(map);

                    layerGroupRef.current = L.layerGroup().addTo(map);
                    highlightLayerRef.current = L.layerGroup().addTo(map);
                    flagLayerRef.current = L.layerGroup().addTo(map);
                    flagHighlightLayerRef.current = L.layerGroup().addTo(map);

                    // ResizeObserver to handle panel open/close
                    if (containerRef.current) {
                        const observer = new ResizeObserver(() => {
                            if (mapRef.current) {
                                mapRef.current.invalidateSize({ animate: false });
                            }
                        });
                        observer.observe(containerRef.current);
                        resizeObserverRef.current = observer;
                    }

                    setIsMapReady(true); // Add this after map initialization

                    // Add Street View popup on map click
                    map.on('click', (e: any) => {
                        const { lat, lng } = e.latlng;
                        const popupContent = `
                            <div style="font-family: inherit; padding: 8px; min-width: 140px">
                                <p style="margin: 0 0 10px 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8">
                                    Map Location
                                </p>
                                <div style="margin-bottom: 12px">
                                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #1e293b">${lat.toFixed(5)}, ${lng.toFixed(5)}</p>
                                </div>
                                <a href="https://www.google.com/maps?q=${lat},${lng}&layer=c&cbll=${lat},${lng}" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   style="display: flex; align-items: center; justify-center: center; gap: 6px; background: #2563eb; color: white; text-align: center; padding: 8px 12px; border-radius: 10px; text-decoration: none; font-size: 11px; font-weight: 700; transition: background 0.2s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2)">
                                   View in Street View
                                </a>
                            </div>
                        `;

                        L.popup({
                            className: 'custom-map-popup',
                            maxWidth: 300,
                            offset: [0, -5]
                        })
                            .setLatLng(e.latlng)
                            .setContent(popupContent)
                            .openOn(map);
                    });
                }

                if (!heatWorkerRef.current) {
                    // AFTER — lazy import guard
                    if (typeof window === 'undefined') return;
                    const worker = new Worker(new URL('@/workers/tripHeat.worker.ts', import.meta.url));
                    worker.onmessage = (event: MessageEvent<{ id: number; result: HeatComputeResult }>) => {
                        const pending = pendingWorkerJobRef.current;
                        if (!pending || pending.id !== event.data.id) return;
                        pendingWorkerJobRef.current = null;
                        pending.resolve(event.data.result);
                    };
                    worker.onerror = () => {
                        const pending = pendingWorkerJobRef.current;
                        if (pending) {
                            pending.reject(new Error('Worker failed'));
                            pendingWorkerJobRef.current = null;
                        }
                        worker.terminate();
                        heatWorkerRef.current = null;
                    };
                    heatWorkerRef.current = worker;
                }
            } catch {
                onRenderErrorRef.current?.();
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    // ── Render: heat chunks + segment overlays + markers ─────────────────────
    useEffect(() => {
        if (!isMapReady || !mapRef.current || !layerGroupRef.current || actualCoords.length === 0) return;

        (async () => {
            try {
                const L = leafletRef.current ?? (await import('leaflet')).default;
                const map = mapRef.current;
                const group = layerGroupRef.current;
                if (!map || !group) return;

                const __mapStart = performance.now();
                console.log(`[TripMap] ▶ START mapping "${fitKey}" — ${actualCoords.length} points, ${segments.length} segments`);

                group.clearLayers();

                // ── Draw segments directly (or fallback if empty) ──
                if (segments.length > 0) {
                    for (const seg of segments) {
                        if (seg.points.length < 2) continue;

                        const line = L.polyline(seg.points, {
                            color: seg.color,
                            weight: 5,
                            opacity: 0.95,
                        }).addTo(group);

                        const tooltipHtml = `
                            <div style="font-family:Inter,system-ui,sans-serif;padding:6px 2px;min-width:150px">
                                <div style="font-weight:800;font-size:12px;color:#1e293b;margin-bottom:6px;letter-spacing:0.02em">
                                    Segment ${seg.id}
                                </div>
                                <div style="display:flex;gap:10px;align-items:baseline;margin-bottom:5px">
                                    <span style="font-size:16px;font-weight:800;color:${seg.color}">${formatDuration(seg.durationSec)}</span>
                                    <span style="font-size:11px;color:#94a3b8;font-weight:600">${seg.distanceKm.toFixed(1)} km</span>
                                </div>
                                <div style="font-size:11px;color:#64748b;font-weight:500;margin-bottom:3px">
                                    ${formatTime(seg.startTime)} → ${formatTime(seg.endTime)}
                                </div>
                                ${seg.avgSpeedKmh > 0 ? `<div style="font-size:10px;color:#94a3b8;font-weight:500">avg ${seg.avgSpeedKmh.toFixed(0)} km/h</div>` : ''}
                            </div>
                        `;

                        line.bindTooltip(tooltipHtml, {
                            sticky: true,
                            direction: 'top',
                            opacity: 0.97,
                        });

                        line.on('mouseover', () => { onSegmentHoverRef.current?.(seg.id); });
                        line.on('mouseout', () => { onSegmentHoverRef.current?.(null); });
                    }
                } else {
                    const fallbackPoints = actualCoords.map((p) => [p.lat, p.lng] as [number, number]);
                    L.polyline(fallbackPoints, {
                        color: '#3b82f6',
                        weight: 5,
                        opacity: 0.95,
                    }).addTo(group);
                }

                console.log(`[TripMap]   • route drawn (+${(performance.now() - __mapStart).toFixed(0)}ms)`);

                // ── GPS loss indicators ──────────────────────────────────
                const gpsGaps = detectGpsGaps(actualCoords);
                for (const gap of gpsGaps) {
                    // Dashed line between last-known and re-acquired position
                    L.polyline(
                        [[gap.fromCoord.lat, gap.fromCoord.lng], [gap.toCoord.lat, gap.toCoord.lng]],
                        {
                            color: '#94a3b8',
                            weight: 3,
                            opacity: 0.6,
                            dashArray: '8, 8',
                            interactive: false,
                        },
                    ).addTo(group);

                    // Warning marker at midpoint
                    const gapIcon = L.divIcon({
                        className: '',
                        html: `<div style="
                            display:flex;align-items:center;gap:4px;
                            background:rgba(255,255,255,0.95);backdrop-filter:blur(4px);
                            border:1.5px solid #f59e0b;border-radius:8px;
                            padding:3px 7px;box-shadow:0 2px 8px rgba(0,0,0,0.12);
                            font-family:Inter,system-ui,sans-serif;
                            white-space:nowrap;
                        ">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            <span style="font-size:9px;font-weight:700;color:#92400e;letter-spacing:0.03em">GPS LOST</span>
                            <span style="font-size:9px;font-weight:600;color:#b45309">${formatDuration(gap.gapSec)}</span>
                        </div>`,
                        iconSize: undefined,
                        iconAnchor: [0, 10],
                    });
                    const gapMarker = L.marker([gap.midLat, gap.midLng], {
                        icon: gapIcon,
                        interactive: true,
                        zIndexOffset: 200,
                    }).addTo(group);

                    gapMarker.bindTooltip(
                        `<div style="font-family:Inter,system-ui,sans-serif;padding:4px 2px">
                            <div style="font-weight:800;font-size:11px;color:#92400e;margin-bottom:4px">⚠ GPS Signal Lost</div>
                            <div style="font-size:11px;color:#64748b;font-weight:500">Duration: ${formatDuration(gap.gapSec)}</div>
                            <div style="font-size:11px;color:#64748b;font-weight:500">Jump: ${gap.distanceKm.toFixed(1)} km</div>
                        </div>`,
                        { direction: 'top', opacity: 0.97 },
                    );
                }

                console.log(`[TripMap]   • ${gpsGaps.length} GPS gap(s) drawn (+${(performance.now() - __mapStart).toFixed(0)}ms)`);

                // ── Segment boundary markers (skip first, start marker covers it) ──
                for (let i = 1; i < segments.length; i++) {
                    const seg = segments[i];
                    const markerIcon = L.divIcon({
                        className: '',
                        html: `<div style="
                            width:20px;height:20px;border-radius:50%;
                            background:white;
                            border:2.5px solid ${seg.color};
                            display:flex;align-items:center;justify-content:center;
                            font-size:9px;font-weight:800;color:${seg.color};
                            box-shadow:0 2px 6px rgba(0,0,0,0.15);
                            font-family:Inter,system-ui,sans-serif;
                        ">${seg.id}</div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                    });
                    L.marker([seg.startCoord.lat, seg.startCoord.lng], {
                        icon: markerIcon,
                        interactive: false,
                        zIndexOffset: 100,
                    }).addTo(group);
                }

                console.log(`[TripMap]   • segment markers drawn (+${(performance.now() - __mapStart).toFixed(0)}ms)`);

                // ── Start marker ─────────────────────────────────────────
                const lastCoord = actualCoords[actualCoords.length - 1];
                const pathBounds = L.latLngBounds(actualCoords.map((p) => [p.lat, p.lng] as [number, number]));

                const startPoint = actualCoords[0] ?? tripStartPoint;
                if (startPoint) {
                    const startIcon = L.divIcon({
                        className: '',
                        html: `<div style="width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                    });
                    const marker = L.marker([startPoint.lat, startPoint.lng], { icon: startIcon }).addTo(group);

                    const streetViewUrl = `https://www.google.com/maps?q=${startPoint.lat},${startPoint.lng}&layer=c&cbll=${startPoint.lat},${startPoint.lng}`;
                    marker.bindPopup(`
                        <div style="font-family: inherit; padding: 4px; min-width: 140px">
                            <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8">Start Point</p>
                            <a href="${streetViewUrl}" target="_blank" style="display: block; background: #22c55e; color: white; text-align: center; padding: 8px 12px; border-radius: 8px; text-decoration: none; font-size: 11px; font-weight: 700;">
                                Street View
                            </a>
                        </div>
                    `);
                }

                // ── End marker ───────────────────────────────────────────
                const endPoint = lastCoord ?? tripEndPoint;
                if (endPoint) {
                    const endIcon = L.divIcon({
                        className: '',
                        html: `<div style="width:12px;height:12px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                    });
                    const marker = L.marker([endPoint.lat, endPoint.lng], { icon: endIcon }).addTo(group);

                    const streetViewUrl = `https://www.google.com/maps?q=${endPoint.lat},${endPoint.lng}&layer=c&cbll=${endPoint.lat},${endPoint.lng}`;
                    marker.bindPopup(`
                        <div style="font-family: inherit; padding: 4px; min-width: 140px">
                            <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8">End Point</p>
                            <a href="${streetViewUrl}" target="_blank" style="display: block; background: #ef4444; color: white; text-align: center; padding: 8px 12px; border-radius: 8px; text-decoration: none; font-size: 11px; font-weight: 700;">
                                Street View
                            </a>
                        </div>
                    `);
                }

                // ── Fit bounds ───────────────────────────────────────────
                if (!mapRef.current) return;
                map.invalidateSize();
                if (lastFitKeyRef.current !== fitKey) {
                    map.fitBounds(pathBounds, {
                        padding: [28, 28],
                        animate: false,
                    });
                    lastFitKeyRef.current = fitKey;
                }
                console.log(`[TripMap]   • markers + bounds done (+${(performance.now() - __mapStart).toFixed(0)}ms)`);
                console.log(`[TripMap] ✔ FINISHED mapping "${fitKey}" in ${(performance.now() - __mapStart).toFixed(0)}ms`);
                onRenderReadyRef.current?.();
            } catch {
                onRenderErrorRef.current?.();
            }
        })();
    }, [isMapReady, actualCoords, tripStartPoint, tripEndPoint, fitKey, segments]);

    // ── Flag markers: render driver_flags as custom Leaflet markers ───────────
    useEffect(() => {
        const L = leafletRef.current;
        const flagLayer = flagLayerRef.current;
        if (!L || !flagLayer || !isMapReady) return;

        flagLayer.clearLayers();

        for (const flag of displayFlags) {
            const isStoppage = flag.code === 0;
            const durationRounded = flag.duration != null ? Math.round(flag.duration) : null;
            const durationLabel = durationRounded != null ? `${durationRounded}m` : '—';
            const durationText = durationRounded != null ? `${durationRounded} min` : 'unknown';

            const iconHtml = isStoppage
                // Code 0 – Stoppage: red octagon stop sign
                ? `<div style="
                        display:flex;align-items:center;gap:5px;
                        background:rgba(255,255,255,0.97);backdrop-filter:blur(4px);
                        border:1.5px solid #ef4444;border-radius:10px;
                        padding:4px 8px;box-shadow:0 3px 12px rgba(239,68,68,0.25);
                        font-family:Inter,system-ui,sans-serif;
                        white-space:nowrap;
                    ">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span style="font-size:9px;font-weight:800;color:#991b1b;letter-spacing:0.04em">STOPPED</span>
                        <span style="font-size:9px;font-weight:600;color:#ef4444">${durationLabel}</span>
                    </div>`
                // Code 1 – GPS Off: orange wifi-off sign
                : `<div style="
                        display:flex;align-items:center;gap:5px;
                        background:rgba(255,255,255,0.97);backdrop-filter:blur(4px);
                        border:1.5px solid #f97316;border-radius:10px;
                        padding:4px 8px;box-shadow:0 3px 12px rgba(249,115,22,0.25);
                        font-family:Inter,system-ui,sans-serif;
                        white-space:nowrap;
                    ">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="1" y1="1" x2="23" y2="23"/>
                            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
                            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
                            <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
                            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
                            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                            <line x1="12" y1="20" x2="12.01" y2="20"/>
                        </svg>
                        <span style="font-size:9px;font-weight:800;color:#c2410c;letter-spacing:0.04em">GPS OFF</span>
                        <span style="font-size:9px;font-weight:600;color:#f97316">${durationLabel}</span>
                    </div>`;

            const icon = L.divIcon({
                className: '',
                html: iconHtml,
                iconSize: undefined,
                iconAnchor: [0, 14],
            });

            const marker = L.marker([flag.displayLat, flag.displayLong], {
                icon,
                interactive: true,
                zIndexOffset: isStoppage ? 300 : 250,
            }).addTo(flagLayer);

            const tooltipLabel = isStoppage ? 'Stoppage' : 'GPS Off';
            const tooltipColor = isStoppage ? '#ef4444' : '#f97316';
            const tooltipBg = isStoppage ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)';
            const tooltipIconSvg = isStoppage
                ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${tooltipColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
                : `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${tooltipColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`;

            marker.bindTooltip(
                `<div style="font-family:Inter,system-ui,sans-serif;padding:4px 2px">
                    <div style="font-weight:800;font-size:11px;color:${tooltipColor};margin-bottom:4px;background:${tooltipBg};padding:3px 6px;border-radius:6px;display:inline-flex;align-items:center;gap:4px">
                        ${tooltipIconSvg} ${tooltipLabel}
                    </div>
                    <div style="font-size:11px;color:#64748b;font-weight:500;margin-top:4px">Duration: ${durationText}</div>
                    <div style="font-size:10px;color:#94a3b8;font-weight:400;margin-top:2px">${flag.lat.toFixed(5)}, ${flag.long.toFixed(5)}</div>
                </div>`,
                { direction: 'top', opacity: 0.97, offset: [20, 0] }
            );

            marker.on('mouseover', () => { onFlagHoverRef.current?.(flag.id); });
            marker.on('mouseout', () => { onFlagHoverRef.current?.(null); });
        }
    }, [displayFlags, isMapReady]);

    // ── Highlight: show glow overlay when a segment is hovered ───────────────
    useEffect(() => {
        const L = leafletRef.current;
        const highlight = highlightLayerRef.current;
        if (!L || !highlight) return;

        highlight.clearLayers();

        if (hoveredSegmentId == null) return;
        const seg = segments.find((s) => s.id === hoveredSegmentId);
        if (!seg || seg.points.length < 2) return;

        // Outer glow
        L.polyline(seg.points, {
            color: '#3b82f6',
            weight: 14,
            opacity: 0.25,
            lineCap: 'round',
            lineJoin: 'round',
            interactive: false,
        }).addTo(highlight);

        // Inner bright line
        L.polyline(seg.points, {
            color: '#3b82f6',
            weight: 5,
            opacity: 0.75,
            lineCap: 'round',
            lineJoin: 'round',
            interactive: false,
        }).addTo(highlight);
    }, [hoveredSegmentId, segments]);

    // ── Focus: zoom map to a segment when clicked in the panel ───────────────
    useEffect(() => {
        if (!focusSegment || !mapRef.current || !leafletRef.current) return;
        if (lastFocusedKeyRef.current === focusSegment.key) return;

        const L = leafletRef.current;
        const seg = segments.find((s) => s.id === focusSegment.id);
        if (!seg || seg.points.length < 2) return;

        lastFocusedKeyRef.current = focusSegment.key;

        mapRef.current.fitBounds(L.latLngBounds(seg.points), {
            padding: [50, 50],
            animate: true,
            duration: 0.4,
        });
    }, [focusSegment, segments]);

    // ── Highlight & Focus: Flags ─────────────────────────────────────────────
    useEffect(() => {
        const L = leafletRef.current;
        const highlight = flagHighlightLayerRef.current;
        if (!L || !highlight || !isMapReady) return;

        highlight.clearLayers();

        if (hoveredFlagId != null) {
            const flag = displayFlags.find((f) => f.id === hoveredFlagId);
            if (flag) {
                const color = flag.code === 0 ? '#ef4444' : '#f97316';
                L.circleMarker([flag.displayLat, flag.displayLong], {
                    radius: 20,
                    color: color,
                    weight: 0,
                    fillColor: color,
                    fillOpacity: 0.2,
                    interactive: false,
                }).addTo(highlight);
            }
        }
    }, [hoveredFlagId, displayFlags, isMapReady]);

    useEffect(() => {
        if (!focusFlag || !mapRef.current || !leafletRef.current) return;
        if (lastFocusedFlagKeyRef.current === focusFlag.key) return;

        const flag = displayFlags.find((f) => f.id === focusFlag.id);
        if (!flag) return;

        lastFocusedFlagKeyRef.current = focusFlag.key;

        mapRef.current.setView([flag.displayLat, flag.displayLong], 17, {
            animate: true,
            duration: 0.4,
        });
    }, [focusFlag, displayFlags]);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
            if (pendingWorkerJobRef.current) {
                pendingWorkerJobRef.current.reject(new Error('Worker disposed'));
                pendingWorkerJobRef.current = null;
            }
            if (heatWorkerRef.current) {
                heatWorkerRef.current.terminate();
                heatWorkerRef.current = null;
            }
            if (highlightLayerRef.current) {
                highlightLayerRef.current.clearLayers();
                highlightLayerRef.current = null;
            }
            if (flagLayerRef.current) {
                flagLayerRef.current.clearLayers();
                flagLayerRef.current = null;
            }
            if (flagHighlightLayerRef.current) {
                flagHighlightLayerRef.current.clearLayers();
                flagHighlightLayerRef.current = null;
            }
            if (mapRef.current) {
                const map = mapRef.current;
                mapRef.current = null;
                try {
                    map.stop();
                    map.off();
                    map.remove();
                } catch (e) {
                    console.error('Error removing Leaflet map:', e);
                }
            }
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full min-h-[380px]" />;
}

// ── Segment Panel ────────────────────────────────────────────────────────────

function SegmentPanel({
    segments,
    hoveredSegmentId,
    onHover,
    onClick,
    currentBattery,
    firstBattery,
    isLive,
    flags = [],
    onFlagHover,
    hoveredFlagId,
    onFlagClick,
}: {
    segments: TripSegment[];
    hoveredSegmentId: number | null;
    onHover: (id: number | null) => void;
    onClick: (id: number) => void;
    currentBattery?: number | null;
    firstBattery?: number | null;
    isLive?: boolean;
    flags?: DriverFlag[];
    onFlagHover?: (id: string | null) => void;
    hoveredFlagId?: string | null;
    onFlagClick?: (id: string) => void;
}) {
    const [activeTab, setActiveTab] = useState<'segments' | 'flags'>('segments');
    const totalDuration = segments.reduce((sum, s) => sum + s.durationSec, 0);
    const totalDistance = segments.reduce((sum, s) => sum + s.distanceKm, 0);

    // Auto-scroll to hovered card when hovering on map
    useEffect(() => {
        if (hoveredSegmentId != null && activeTab === 'segments') {
            const el = document.getElementById(`segment-card-${hoveredSegmentId}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [hoveredSegmentId]);

    return (
        <div className="w-80 h-full flex flex-col bg-white">
            {/* ── Summary header ────────────────────────────────────── */}
            <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white shrink-0">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex bg-slate-100 p-1 rounded-lg w-full">
                        <button
                            onClick={() => setActiveTab('segments')}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] rounded-md transition-all ${activeTab === 'segments'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Segments
                        </button>
                        <button
                            onClick={() => setActiveTab('flags')}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] rounded-md transition-all ${activeTab === 'flags'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Flags
                        </button>
                    </div>
                </div>
                {activeTab === 'segments' && (
                    <>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-600 min-w-[22px]">
                                {segments.length}
                            </span>
                            <span className="text-[11px] text-slate-500 font-semibold tabular-nums">
                                {formatDuration(totalDuration)}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium tabular-nums">
                                {totalDistance.toFixed(1)} km
                            </span>
                        </div>
                        {/* ── Live: current battery / Completed: first → final ── */}
                        {isLive
                            ? currentBattery != null && (
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Current Battery</span>
                                    <BatteryIndicator level={currentBattery} />
                                </div>
                            )
                            : (firstBattery != null || currentBattery != null) && (
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Battery</span>
                                    {firstBattery != null && <BatteryIndicator level={firstBattery} />}
                                    {firstBattery != null && currentBattery != null && firstBattery !== currentBattery && (
                                        <span className="text-[9px] text-slate-300">→</span>
                                    )}
                                    {currentBattery != null && currentBattery !== firstBattery && (
                                        <BatteryIndicator level={currentBattery} />
                                    )}
                                </div>
                            )
                        }
                    </>
                )}
                {activeTab === 'flags' && (
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-orange-50 text-[10px] font-bold text-orange-600 min-w-[22px]">
                            {flags.length}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold tabular-nums">
                            Total Flags
                        </span>
                    </div>
                )}
            </div>

            {/* ── Scrollable segment list ───────────────────────────── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                {activeTab === 'segments' ? (
                    segments.map((seg, idx) => (
                        <motion.div
                            key={seg.id}
                            id={`segment-card-${seg.id}`}
                            onMouseEnter={() => onHover(seg.id)}
                            onMouseLeave={() => onHover(null)}
                            onClick={() => onClick(seg.id)}
                            initial={false}
                            animate={{
                                backgroundColor:
                                    hoveredSegmentId === seg.id
                                        ? 'rgba(239, 246, 255, 0.9)'
                                        : 'rgba(255, 255, 255, 0)',
                            }}
                            transition={{ duration: 0.15 }}
                            className={`px-4 py-3 cursor-pointer border-l-[3px] transition-colors duration-150 ${hoveredSegmentId === seg.id
                                ? 'border-l-blue-500'
                                : 'border-l-transparent hover:border-l-slate-200'
                                } ${idx < segments.length - 1 ? 'border-b border-slate-50' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm"
                                        style={{ background: seg.color }}
                                    />
                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                        Seg {seg.id}
                                    </span>
                                </div>
                                <span className="text-[13px] font-extrabold text-slate-800 tabular-nums">
                                    {formatDuration(seg.durationSec)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pl-[18px]">
                                <span className="text-[10px] text-slate-400 font-medium tabular-nums">
                                    {formatTime(seg.startTime)} → {formatTime(seg.endTime)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium tabular-nums">
                                    {seg.distanceKm.toFixed(1)} km
                                </span>
                            </div>
                            {seg.avgSpeedKmh > 0 && (
                                <div className="pl-[18px] mt-0.5">
                                    <span className="text-[10px] text-slate-300 font-medium">
                                        avg {seg.avgSpeedKmh.toFixed(0)} km/h
                                    </span>
                                </div>
                            )}
                            {/* ── Battery per segment ─────────────────── */}
                            {(seg.startBattery != null || seg.endBattery != null) && (
                                <div className="pl-[18px] mt-1 flex items-center gap-1.5">
                                    <BatteryIndicator level={seg.startBattery ?? seg.endBattery!} />
                                    {seg.endBattery != null && seg.startBattery !== seg.endBattery && (
                                        <>
                                            <span className="text-[9px] text-slate-300">→</span>
                                            <BatteryIndicator level={seg.endBattery} />
                                        </>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))
                ) : (
                    flags.length === 0 ? (
                        <div className="px-4 py-8 text-center text-slate-400 text-[11px]">
                            No flags recorded for this trip.
                        </div>
                    ) : (
                        flags.map((flag, idx) => {
                            const isStoppage = flag.code === 0;
                            const durationRounded = flag.duration != null ? Math.round(flag.duration) : null;
                            const durationLabel = durationRounded != null ? `${durationRounded}m` : '—';

                            return (
                                <div
                                    key={flag.id || idx}
                                    onMouseEnter={() => onFlagHover?.(flag.id)}
                                    onMouseLeave={() => onFlagHover?.(null)}
                                    onClick={() => onFlagClick?.(flag.id)}
                                    className={`px-4 py-3 border-l-[3px] border-b border-slate-50 cursor-pointer transition-colors ${hoveredFlagId === flag.id
                                        ? (isStoppage ? 'border-l-red-500 bg-red-50/50' : 'border-l-orange-500 bg-orange-50/50')
                                        : 'border-l-transparent hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            {isStoppage ? (
                                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                            ) : (
                                                <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                                            )}
                                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                                {isStoppage ? 'Stoppage' : 'GPS Off'}
                                            </span>
                                        </div>
                                        <span className={`text-[13px] font-extrabold tabular-nums ${isStoppage ? 'text-red-500' : 'text-orange-500'}`}>
                                            {durationLabel}
                                        </span>
                                    </div>
                                    <div className="flex flex-col pl-[22px] gap-0.5">
                                        {flag.created_at && (
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {formatTime(flag.created_at)}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-slate-400 font-medium truncate">
                                            {flag.lat != null && flag.long != null 
                                                ? `${flag.lat.toFixed(5)}, ${flag.long.toFixed(5)}`
                                                : "Couldn't get coordinates"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )
                )}
            </div>
        </div>
    );
}

// SegmentStrip component for the horizontal strip of chips at the top of the map, allowing quick selection of segments without opening the side panel. It also auto-scrolls to keep the active chip in view when set from elsewhere (e.g. map hover).
function SegmentStrip({
    segments,
    activeSegmentId,
    onSelect,
}: {
    segments: TripSegment[];
    activeSegmentId: number | null;
    onSelect: (id: number) => void;
}) {
    // Keep the active chip in view if it gets set from elsewhere (e.g. map interaction)
    useEffect(() => {
        if (activeSegmentId == null) return;
        const el = document.getElementById(`segment-chip-${activeSegmentId}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [activeSegmentId]);

    return (
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden px-3 py-2.5 snap-x snap-mandatory scrollbar-hide bg-white">
            {segments.map((seg) => (
                <button
                    key={seg.id}
                    id={`segment-chip-${seg.id}`}
                    onClick={() => onSelect(seg.id)}
                    className={`snap-start shrink-0 w-[130px] rounded-xl border px-3 py-2 text-left transition-colors active:scale-[0.97] ${activeSegmentId === seg.id
                        ? 'border-blue-400 bg-blue-50/80'
                        : 'border-slate-100 bg-white'
                        }`}
                >
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Seg {seg.id}
                        </span>
                    </div>
                    <div className="text-[14px] font-extrabold text-slate-800 tabular-nums leading-tight">
                        {formatDuration(seg.durationSec)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold tabular-nums mt-0.5 truncate">
                        {seg.distanceKm.toFixed(1)} km
                        {seg.avgSpeedKmh > 0 ? ` • ${seg.avgSpeedKmh.toFixed(0)} km/h` : ''}
                    </div>
                    {/* ── Battery per chip ────────────────────────── */}
                    {(seg.startBattery != null || seg.endBattery != null) && (
                        <div className="mt-1">
                            <BatteryIndicator level={seg.endBattery ?? seg.startBattery!} />
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}

// ── Main Modal ───────────────────────────────────────────────────────────────

export function TripMapModal({
    isOpen,
    onClose,
    tripId,
    tripLabel,
    initialLeg = null,
    tripStartPoint = null,
    tripEndPoint = null,
    isLive = false,
}: TripMapModalProps) {
    console.log('isLive: - tripMapModal.tsx', isLive);
    const [activeLeg, setActiveLeg] = useState(0);
    const [isLoadingMap, setIsLoadingMap] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mapRenderFailed, setMapRenderFailed] = useState(false);
    const [hasRendered, setHasRendered] = useState(false);
    const appliedInitialLegRef = useRef(false);

    // ── Segment state ────────────────────────────────────────────────────────
    const [hoveredSegmentId, setHoveredSegmentId] = useState<number | null>(null);
    const [focusSegment, setFocusSegment] = useState<{ id: number; key: number } | null>(null);
    const [hoveredFlagId, setHoveredFlagId] = useState<string | null>(null);
    const [focusFlag, setFocusFlag] = useState<{ id: string; key: number } | null>(null);
    const [panelOpen, setPanelOpen] = useState(true);

    const handleFlagHover = useCallback((id: string | null) => {
        setHoveredFlagId(id);
    }, []);

    const handleFlagClick = useCallback((id: string) => {
        setFocusFlag({ id, key: Date.now() });
    }, []);

    // ── Coordinates via TanStack Query ───────────────────────────────────────
    // Egress savings: after the first load each poll sends `since` and only
    // fetches NEW points (merged into cache).
    // We only poll for LIVE trips, and only after the map has finished rendering —
    // a completed trip never gets new points, so repeated `since` queries are
    // pure waste (and the empty `since` query can be slow).
    const coordsQuery = useTripCoordinates(isOpen ? tripId : null, {
        enabled: isOpen && !!tripId,
        pollMs: isLive && hasRendered ? 15000 : false,
    });
    const legs = coordsQuery.data?.legs ?? [];
    const isLoadingCoords = coordsQuery.isLoading;

    // ── Driver flags (stoppages + GPS-off events) ─────────────────────────────
    const { flags } = useDriverFlags(isOpen ? tripId : null, isLive);


    // ── Reset view state when the modal opens for a (new) trip ────────────────
    useEffect(() => {
        if (!isOpen || !tripId) return;
        setActiveLeg(0);
        setIsLoadingMap(true);
        setError(null);
        setMapRenderFailed(false);
        setHasRendered(false);
        appliedInitialLegRef.current = false;
        setHoveredSegmentId(null);
        setFocusSegment(null);
        setHoveredFlagId(null);
        setFocusFlag(null);
    }, [isOpen, tripId]);

    // ── Reflect query state into map loading / error UI ───────────────────────
    useEffect(() => {
        if (!isOpen) return;
        if (coordsQuery.isError) {
            setError('Could not load route data for this trip.');
            setIsLoadingMap(false);
            return;
        }
        // If the initial load finished with no coordinates, stop the map spinner
        // so the "no coordinates yet" message can show.
        if (!coordsQuery.isLoading && legs.length === 0) {
            setIsLoadingMap(false);
            setHasRendered(true);
        }
    }, [isOpen, coordsQuery.isError, coordsQuery.isLoading, legs.length]);

    useEffect(() => {
        if (!isOpen || !legs.length || initialLeg == null || appliedInitialLegRef.current) return;
        const requestedLeg = Number(initialLeg);
        const legIdx = legs.findIndex((leg) => Number(leg.leg) === requestedLeg);
        if (legIdx >= 0) {
            setActiveLeg(legIdx);
            setIsLoadingMap(true);
            appliedInitialLegRef.current = true;
        }
    }, [isOpen, initialLeg, legs]);

    const currentLegCoords = legs[activeLeg]?.coordinates ?? [];
    const isLargeRoute = currentLegCoords.length > MAX_POINTS_WITH_SEGMENTS;
    const renderCoords = useMemo(
        () => downsampleCoordinates(currentLegCoords, MAX_RENDER_POINTS),
        [currentLegCoords.length] // 💡 Bind to length instead of the array reference itself
    );
    const isLoading = isLoadingCoords || isLoadingMap;

    // ── Derive battery readings ────────────────────────────────────────────────
    // firstBattery: first non-null reading across all legs (trip start)
    const firstBattery = useMemo(() => {
        for (const leg of legs) {
            for (const c of leg.coordinates) {
                if (c.batteryLevel != null) return c.batteryLevel;
            }
        }
        return null;
    }, [legs.length]);

    // currentBattery: last non-null reading in the active leg (most recent)
    const currentBattery = useMemo(() => {
        for (let i = currentLegCoords.length - 1; i >= 0; i--) {
            const b = currentLegCoords[i].batteryLevel;
            if (b != null) return b;
        }
        return null;
    }, [currentLegCoords.length]);

    // ── Compute segments from coordinates ────────────────────────────────────
    const segments = useMemo(() => {
        if (!renderCoords.length || !renderCoords[0]?.createdAt) return [];
        return generateSegments(renderCoords);
    }, [renderCoords.length]); // 💡 Bind to length or a primitive property

    const hasSegments = segments.length > 0;

    const handleSegmentHover = useCallback((id: number | null) => {
        setHoveredSegmentId(id);
    }, []);

    const handleSegmentClick = useCallback((id: number) => {
        setFocusSegment({ id, key: Date.now() });
    }, []);

    const handleMobileSegmentSelect = useCallback((id: number) => {
        setHoveredSegmentId(id);
        setFocusSegment({ id, key: Date.now() });
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                        className="fixed z-[10000] inset-0 flex items-center justify-center pointer-events-none p-4"
                    >
                        <div
                            className={`pointer-events-auto w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-[max-width] duration-300 ${hasSegments ? 'max-w-5xl' : 'max-w-2xl'
                                }`}
                            style={{ maxHeight: '90vh' }}
                            onClick={(e) => e.stopPropagation()}
                        >

                            {/* ── Header ─────────────────────────────────────────── */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Route className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Route Preview</p>
                                        {tripLabel && (
                                            <p className="text-sm font-semibold text-slate-700 leading-tight">{tripLabel}</p>
                                        )}
                                        {!isLoading && !error && (
                                            <motion.span
                                                key={currentLegCoords.length} // Re-animates every time the count changes
                                                initial={{ opacity: 0.5, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-[11px] text-slate-400 font-semibold mt-0.5"
                                            >
                                                Legs: {legs.length} • Points: {currentLegCoords.length}
                                                {hasSegments && ` • Segments: ${segments.length}`}
                                                {isLargeRoute && ' • Simplified for speed'}
                                            </motion.span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            {/* ── Leg tabs (only shown if >1 leg) ───────────────── */}
                            {legs.length > 1 && (
                                <div className="flex gap-2 px-5 pt-3 pb-1 overflow-x-auto scrollbar-hide">
                                    {legs.map((leg, idx) => (
                                        <button
                                            key={leg.leg}
                                            onClick={() => setActiveLeg(idx)}
                                            onMouseDown={() => setIsLoadingMap(true)}
                                            className={`px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeLeg === idx
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            Leg {leg.leg}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ── Content area: map + segment panel ───────────── */}
                            {/* ── Content area: map + segments ───────────── */}
                            <div className="flex flex-col md:flex-row shrink-0 md:h-[420px]">
                                {/* ── Map section ─────────────────────────────────── */}
                                <div className="relative flex-1 min-w-0 h-[300px] md:h-full">
                                    {isLoading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 gap-3">
                                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                {isLoadingCoords ? 'Loading coordinates...' : 'Mapping trip'}
                                            </span>
                                        </div>
                                    )}

                                    {error && !isLoading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-3">
                                            <AlertCircle className="w-6 h-6 text-slate-300" />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center px-8">
                                                {error}
                                            </span>
                                        </div>
                                    )}

                                    {!isLoadingCoords && !error && currentLegCoords.length === 0 && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-3">
                                            <MapPin className="w-6 h-6 text-slate-300" />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center px-8">
                                                Driver coordinates were not yet recorded.
                                                <br />
                                                <span className="text-[10px] lowercase font-medium opacity-70 italic">Waiting for tracking data...</span>
                                            </span>
                                        </div>
                                    )}

                                    {!isLoadingCoords && !error && !mapRenderFailed && currentLegCoords.length > 0 && (
                                        <MapRenderer
                                            key={`${tripId}-leg-${activeLeg}`}
                                            actualCoords={renderCoords}
                                            onRenderError={() => {
                                                setIsLoadingMap(false);
                                                setMapRenderFailed(true);
                                            }}
                                            onRenderReady={() => {
                                                setIsLoadingMap(false);
                                                setHasRendered(true);
                                            }}
                                            tripStartPoint={tripStartPoint}
                                            tripEndPoint={tripEndPoint}
                                            fitKey={`${tripId ?? 'trip'}-${activeLeg}`}
                                            segments={segments}
                                            hoveredSegmentId={hoveredSegmentId}
                                            focusSegment={focusSegment}
                                            onSegmentHover={handleSegmentHover}
                                            flags={flags}
                                            hoveredFlagId={hoveredFlagId}
                                            focusFlag={focusFlag}
                                            onFlagHover={handleFlagHover}
                                        />
                                    )}

                                    {!isLoadingCoords && !error && mapRenderFailed && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-3">
                                            <AlertCircle className="w-6 h-6 text-slate-300" />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center px-8">
                                                Map renderer failed to load. Please refresh and try again.
                                            </span>
                                        </div>
                                    )}

                                    {/* ── Panel toggle button (desktop only — strip is always visible on mobile) ── */}
                                    {hasSegments && !isLoading && !error && currentLegCoords.length > 0 && (
                                        <button
                                            onClick={() => setPanelOpen(!panelOpen)}
                                            className="hidden md:flex absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-slate-200/50 items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all hover:bg-white hover:shadow-xl active:scale-95"
                                            style={{ color: panelOpen ? '#94a3b8' : '#3b82f6' }}
                                        >
                                            <Timer className="w-3.5 h-3.5" />
                                            {panelOpen ? 'Hide' : `Segments (${segments.length})`}
                                            <ChevronRight
                                                className="w-3 h-3 transition-transform duration-200"
                                                style={{ transform: panelOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
                                            />
                                        </button>
                                    )}
                                </div>

                                {/* ── Mobile: horizontal scroll strip at the bottom ─────────────── */}
                                {hasSegments && !isLoading && !error && currentLegCoords.length > 0 && (
                                    <div className="md:hidden border-t border-slate-100 shrink-0">
                                        <SegmentStrip
                                            segments={segments}
                                            activeSegmentId={hoveredSegmentId}
                                            onSelect={handleMobileSegmentSelect}
                                        />
                                    </div>
                                )}

                                {/* ── Desktop: side panel ─────────────────────────────────────── */}
                                <AnimatePresence>
                                    {panelOpen && hasSegments && !isLoading && !error && currentLegCoords.length > 0 && (
                                        <motion.div
                                            key="segment-panel"
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: 320, opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                            className="hidden md:block shrink-0 overflow-hidden border-l border-slate-100"
                                        >
                                            <SegmentPanel
                                                segments={segments}
                                                hoveredSegmentId={hoveredSegmentId}
                                                onHover={handleSegmentHover}
                                                onClick={handleSegmentClick}
                                                currentBattery={currentBattery}
                                                firstBattery={firstBattery}
                                                isLive={isLive}
                                                flags={flags}
                                                onFlagHover={handleFlagHover}
                                                hoveredFlagId={hoveredFlagId}
                                                onFlagClick={handleFlagClick}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ── Legend ────────────────────────────────────────── */}
                            <div className="px-5 py-3 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-2 bg-slate-50/60">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-20 h-1 rounded-full"
                                        style={{ background: 'linear-gradient(90deg, #22c55e 0%, #eab308 35%, #f97316 65%, #ef4444 100%)' }}
                                    />
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        {isLargeRoute ? 'Route Simplified For Faster Rendering' : 'Segment Time (Fast → Slow)'}
                                    </span>
                                </div>
                                <div className="ml-auto flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow" />
                                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Start</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow" />
                                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">End</span>
                                    </div>
                                    {flags.some((f) => f.code === 0) && (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-sm bg-red-500 border-2 border-white shadow" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }} />
                                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Stoppage</span>
                                        </div>
                                    )}
                                    {flags.some((f) => f.code === 1) && (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-sm bg-orange-500 border-2 border-white shadow" />
                                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">GPS Off</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <style>{`
                                .leaflet-container,
                                .leaflet-container:focus,
                                .leaflet-container :focus,
                                .leaflet-interactive,
                                .leaflet-interactive:focus {
                                    outline: none !important;
                                    box-shadow: none !important;
                                }
                            `}</style>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}