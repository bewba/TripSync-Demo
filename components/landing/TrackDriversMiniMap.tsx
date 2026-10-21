'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'e520b867332a41708a3ac5a694477ae5';
const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;

// Coordinates for the 3 drivers around Manila / SLEX corridor
export interface TrackDriverItem {
  id: string;
  name: string;
  initial: string;
  route: string;
  speed: string;
  status: 'active' | 'moving' | 'offline';
  lat: number;
  lng: number;
  color: string;
}

const DRIVERS: TrackDriverItem[] = [
  {
    id: 'juan',
    name: 'Juan Dela Cruz',
    initial: 'J',
    route: 'Manila → Calamba',
    speed: '62km/h',
    status: 'active',
    lat: 14.5515,
    lng: 121.0310,
    color: '#3b82f6', // blue (matching actual site #3b82f6)
  },
  {
    id: 'ramon',
    name: 'Ramon Santos',
    initial: 'R',
    route: 'Manila → Laguna',
    speed: '45km/h',
    status: 'moving',
    lat: 14.5570,
    lng: 121.0385,
    color: '#22c55e', // green (matching actual site #22c55e)
  },
  {
    id: 'arnel',
    name: 'Arnel Mendoza',
    initial: 'A',
    route: 'Terminal Depot',
    speed: '0km/h',
    status: 'offline',
    lat: 14.5450,
    lng: 121.0220,
    color: '#64748b', // slate
  },
];

interface TrackDriversMiniMapProps {
  selectedDriverId?: string;
  onSelectDriver?: (id: string) => void;
}

function TrackDriversMiniMapInner({
  selectedDriverId = 'juan',
  onSelectDriver,
}: TrackDriversMiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const onSelectDriverRef = useRef(onSelectDriver);
  const [isMapReady, setIsMapReady] = useState(false);

  // Keep the callback ref current without re-initializing the map
  useEffect(() => {
    onSelectDriverRef.current = onSelectDriver;
  }, [onSelectDriver]);

  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;
    // Debounce timer for ResizeObserver to prevent rapid invalidateSize calls
    let resizeTimer: ReturnType<typeof setTimeout>;
    let observer: ResizeObserver | null = null;

    (async () => {
      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !containerRef.current) return;

        if (!mapRef.current) {
          const map = L.map(containerRef.current, {
            zoomControl: false,
            attributionControl: false,
            preferCanvas: true,
            dragging: true,
            touchZoom: true,
            scrollWheelZoom: false,
            doubleClickZoom: true,
            boxZoom: false,
            keyboard: false,
          }).setView([14.5520, 121.0320], 14);

          mapRef.current = map;

          L.tileLayer(TILE_URL, {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          // Build custom markers matching the actual app ActiveDriversMap icon design
          DRIVERS.forEach((driver) => {
            const size = 32;

            const iconHtml = `
              <div style="
                width: ${size}px;
                height: ${size}px;
                background: ${driver.color};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              ">
                <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
            `;

            const icon = L.divIcon({
              className: 'bg-transparent border-0',
              html: iconHtml,
              iconSize: [size, size],
              iconAnchor: [size / 2, size],
            });

            const marker = L.marker([driver.lat, driver.lng], { icon }).addTo(map);
            // Use ref so marker clicks always call the latest callback without re-initing the map
            marker.on('click', () => {
              if (onSelectDriverRef.current) {
                onSelectDriverRef.current(driver.id);
              }
            });

            markersRef.current.set(driver.id, marker);
          });

          // Draw an authentic subtle connecting corridor polyline
          const polylineCoords: [number, number][] = [
            [14.5450, 121.0220],
            [14.5480, 121.0260],
            [14.5515, 121.0310],
            [14.5540, 121.0345],
            [14.5570, 121.0385],
          ];

          L.polyline(polylineCoords, {
            color: '#3b82f6',
            weight: 3,
            opacity: 0.45,
            dashArray: '6, 6',
          }).addTo(map);

          // Fit bounds initially with gentle padding to display all drivers comfortably
          const bounds = L.latLngBounds(DRIVERS.map((d) => [d.lat, d.lng] as [number, number]));
          map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });

          // Debounced ResizeObserver — prevents rapid invalidateSize from triggering jitter
          observer = new ResizeObserver(() => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.invalidateSize({ animate: false, pan: false });
              }
            }, 150);
          });
          observer.observe(containerRef.current);

          setIsMapReady(true);
        }
      } catch (err) {
        console.error('Failed to init TrackDriversMiniMap:', err);
      }
    })();

    return () => {
      isMounted = false;
      clearTimeout(resizeTimer);
      if (observer) observer.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // ← empty deps: map initializes ONCE, never re-runs on parent re-renders

  return (
    <div className="relative w-full h-full min-h-[220px] sm:min-h-[240px] rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-[#f2efe9]">
      <div ref={containerRef} className="w-full h-full z-0" />
      {!isMapReady && (
        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center gap-2 z-10">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-[11px] font-mono text-slate-500">Loading map tiles...</span>
        </div>
      )}
    </div>
  );
}

// React.memo prevents re-renders when parent state changes don't affect map props
export default React.memo(TrackDriversMiniMapInner);
