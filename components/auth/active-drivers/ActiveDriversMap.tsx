'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ActiveDriverLocation } from '@/hooks/queries/useActiveDrivers';
import { Loader2, Maximize2 } from 'lucide-react';

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'e520b867332a41708a3ac5a694477ae5';
const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;

interface ActiveDriversMapProps {
    drivers: ActiveDriverLocation[];
    hoveredDriverId: string | null;
    selectedDriverId?: string | null;
    onSelectDriver?: (tripId: string) => void;
    onViewTripDetails?: (tripId: string) => void;
}

export default function ActiveDriversMap({
    drivers,
    hoveredDriverId,
    selectedDriverId,
    onSelectDriver,
    onViewTripDetails,
}: ActiveDriversMapProps) {
    const mapRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const layerGroupRef = useRef<any>(null);
    const markersRef = useRef<Map<string, any>>(new Map());
    // Tracks the last lat/lng where each marker was actually placed (for 10m threshold)
    const lastPlacedRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());
    // Tracks visual icon state to avoid calling setIcon on every 1-second tooltip tick
    const lastIconStateRef = useRef<Map<string, string>>(new Map());
    const hasFittedInitialBoundsRef = useRef(false);
    const lastFocusedDriverRef = useRef<string | null>(null);

    const [isMapReady, setIsMapReady] = useState(false);
    const [clockTick, setClockTick] = useState(0);

    // 1-second interval ticker for real-time second-by-second updates (e.g. stopped timer)
    useEffect(() => {
        const timer = setInterval(() => {
            setClockTick((t) => t + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!containerRef.current) return;
        let isMounted = true;

        (async () => {
            try {
                const L = (await import('leaflet')).default;
                if (!isMounted || !containerRef.current) return;

                if (!mapRef.current) {
                    const map = L.map(containerRef.current, {
                        zoomControl: true,
                        attributionControl: false,
                        preferCanvas: true,
                    }).setView([14.5995, 120.9842], 8);

                    mapRef.current = map;

                    L.tileLayer(TILE_URL, {
                        maxZoom: 19,
                        attribution: '&copy; OpenStreetMap contributors',
                    }).addTo(map);

                    layerGroupRef.current = L.layerGroup().addTo(map);

                    // Resize observer
                    const observer = new ResizeObserver(() => {
                        if (mapRef.current) {
                            mapRef.current.invalidateSize();
                        }
                    });
                    observer.observe(containerRef.current);

                    setIsMapReady(true);
                }
            } catch (err) {
                console.error('Failed to load map:', err);
            }
        })();

        return () => { isMounted = false; };
    }, []);

    // Manual Re-center / Fit All Fleet Bounds
    const handleFitAllFleet = useCallback(() => {
        if (!mapRef.current || drivers.length === 0) return;
        import('leaflet').then((LModule) => {
            const L = LModule.default;
            const bounds = L.latLngBounds(drivers.map((d) => [d.lat, d.lng] as [number, number]));
            mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 14, animate: true, duration: 0.6 });
        });
    }, [drivers]);

    // Render & Update Markers — snap to new position every 10 meters
    useEffect(() => {
        if (!isMapReady || !mapRef.current || !layerGroupRef.current) return;

        (async () => {
            const L = (await import('leaflet')).default;
            const map = mapRef.current;
            const group = layerGroupRef.current;

            if (drivers.length === 0) {
                group.clearLayers();
                markersRef.current.clear();
                lastPlacedRef.current.clear();
                return;
            }

            const currentTripIds = new Set(drivers.map((d) => d.tripId));

            // Clean up removed markers
            markersRef.current.forEach((marker, tripId) => {
                if (!currentTripIds.has(tripId)) {
                    group.removeLayer(marker);
                    markersRef.current.delete(tripId);
                    lastPlacedRef.current.delete(tripId);
                    lastIconStateRef.current.delete(tripId);
                }
            });

            // Initial Bounds Fitting: only run ONCE on initial load
            if (!hasFittedInitialBoundsRef.current && drivers.length > 0) {
                const bounds = L.latLngBounds(drivers.map((d) => [d.lat, d.lng] as [number, number]));
                map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14, animate: false });
                hasFittedInitialBoundsRef.current = true;
            }

            drivers.forEach((driver) => {
                const isHovered = driver.tripId === hoveredDriverId || driver.tripId === selectedDriverId;
                const isStopped = !!driver.isStopped;
                const isOffline = driver.isOnline === false;
                const stoppedDuration = isStopped && driver.stoppedAt
                    ? Math.max(0, Math.floor((Date.now() - driver.stoppedAt) / 1000))
                    : (driver.stoppedForSeconds ?? 0);
                const size = isHovered ? 40 : 28;
                const zIndex = isHovered ? 1000 : isOffline ? 40 : isStopped ? 500 : 100;

                // Color: gray if offline, red if stopped, blue if hovered/selected, green otherwise
                const bgColor = isOffline ? '#64748b' : isStopped ? '#ef4444' : isHovered ? '#3b82f6' : '#22c55e';

                const iconStateKey = `${isStopped ? 'stopped' : isOffline ? 'offline' : 'active'}_${isHovered ? 'hover' : 'idle'}_${size}`;

                const iconHtml = `
                    <div style="
                        width: ${size}px; height: ${size}px; 
                        background: ${bgColor}; 
                        border: 3px solid white; 
                        border-radius: 50%; 
                        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                        display: flex; align-items: center; justify-content: center;
                        transition: background 0.3s ease;
                        cursor: pointer;
                    ">
                        <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                `;

                const icon = L.divIcon({
                    className: '',
                    html: iconHtml,
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size],
                });

                const tooltipHtml = `
                    <div style="font-family: Inter, sans-serif; padding: 4px;">
                        <div style="font-weight: 800; font-size: 13px; color: #1e293b; margin-bottom: 2px;">
                            ${driver.driverName}
                        </div>
                        ${isOffline ? `
                            <div style="
                                display: inline-flex; align-items: center; gap: 4px;
                                background: #f1f5f9; color: #475569;
                                font-size: 10px; font-weight: 700;
                                padding: 2px 6px; border-radius: 4px;
                                margin-bottom: 4px;
                                border: 1px solid #cbd5e1;
                            ">
                                ● OFFLINE
                            </div>
                        ` : isStopped ? `
                            <div style="
                                display: inline-flex; align-items: center; gap: 4px;
                                background: #fef2f2; color: #dc2626;
                                font-size: 10px; font-weight: 700;
                                padding: 2px 6px; border-radius: 4px;
                                margin-bottom: 4px;
                                border: 1px solid #fca5a5;
                            ">
                                ● STOPPED (${stoppedDuration}s)
                            </div>
                        ` : `
                            <div style="font-size: 11px; color: #64748b;">
                                Last updated: ${new Date(driver.lastUpdate).toLocaleTimeString()}
                            </div>
                        `}
                        ${driver.batteryLevel !== null ? `
                            <div style="font-size: 11px; margin-top: 2px; font-weight: 600; color: ${
                                driver.batteryLevel > 50 ? '#047857' : 
                                driver.batteryLevel > 20 ? '#b45309' : 
                                '#be123c'
                            }">
                                Battery: ${driver.batteryLevel}%
                            </div>
                        ` : ''}
                    </div>
                `;

                let marker = markersRef.current.get(driver.tripId);

                if (!marker) {
                    // First time — place the marker immediately
                    marker = L.marker([driver.lat, driver.lng], {
                        icon,
                        zIndexOffset: zIndex,
                    }).addTo(group);

                    marker.bindTooltip(tooltipHtml, {
                        direction: 'top',
                        offset: [0, -(size)],
                        opacity: 1,
                    });

                    marker.on('click', () => {
                        onSelectDriver?.(driver.tripId);
                    });

                    markersRef.current.set(driver.tripId, marker);
                    lastPlacedRef.current.set(driver.tripId, { lat: driver.lat, lng: driver.lng });
                    lastIconStateRef.current.set(driver.tripId, iconStateKey);
                } else {
                    // Only update icon if the visual style (stopped/offline/hover/size) has changed.
                    // This avoids resetting CSS animations every 1-second tooltip tick!
                    if (lastIconStateRef.current.get(driver.tripId) !== iconStateKey) {
                        marker.setIcon(icon);
                        lastIconStateRef.current.set(driver.tripId, iconStateKey);
                    }
                    marker.setZIndexOffset(zIndex);
                    marker.setTooltipContent(tooltipHtml);

                    // Only move the marker if the truck has traveled ≥10 meters
                    const last = lastPlacedRef.current.get(driver.tripId);
                    if (last) {
                        const toRad = (deg: number) => (deg * Math.PI) / 180;
                        const R = 6371000; // Earth radius in meters
                        const dLat = toRad(driver.lat - last.lat);
                        const dLng = toRad(driver.lng - last.lng);
                        const a =
                            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.cos(toRad(last.lat)) * Math.cos(toRad(driver.lat)) *
                            Math.sin(dLng / 2) * Math.sin(dLng / 2);
                        const distanceMeters = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                        if (distanceMeters >= 10) {
                            marker.setLatLng([driver.lat, driver.lng]);
                            lastPlacedRef.current.set(driver.tripId, { lat: driver.lat, lng: driver.lng });
                        }
                    } else {
                        marker.setLatLng([driver.lat, driver.lng]);
                        lastPlacedRef.current.set(driver.tripId, { lat: driver.lat, lng: driver.lng });
                    }
                }

                if (isHovered) {
                    marker.openTooltip();
                }
            });

            // Smoothly focus/fly when a driver is selected from the sidebar
            const activeFocusId = selectedDriverId || hoveredDriverId;
            if (activeFocusId && activeFocusId !== lastFocusedDriverRef.current) {
                const targetDriver = drivers.find((d) => d.tripId === activeFocusId);
                if (targetDriver) {
                    map.flyTo([targetDriver.lat, targetDriver.lng], Math.max(map.getZoom(), 14), {
                        duration: 0.7,
                        easeLinearity: 0.25,
                    });
                }
            }
            lastFocusedDriverRef.current = activeFocusId;
        })();
    }, [isMapReady, drivers, hoveredDriverId, selectedDriverId, onSelectDriver, clockTick]);

    return (
        <div className="relative w-full h-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 z-0 isolate">
            <div ref={containerRef} className="w-full h-full" />

            {!isMapReady && (
                <div className="absolute inset-0 z-[1000] bg-slate-50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            )}

            {/* Recenter / Fit All Fleet Button */}
            {isMapReady && drivers.length > 0 && (
                <button
                    onClick={handleFitAllFleet}
                    title="Fit all fleet on map"
                    className="absolute top-4 right-4 z-[999] bg-white/95 backdrop-blur-sm text-slate-700 hover:text-blue-600 hover:bg-white px-3 py-1.5 rounded-lg shadow-md border border-slate-200/80 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Fit Fleet</span>
                </button>
            )}
        </div>
    );
}

