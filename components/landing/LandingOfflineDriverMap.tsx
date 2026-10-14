'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { REAL_BGC_ROAD } from './routesData';

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'e520b867332a41708a3ac5a694477ae5';
const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;

export default function LandingOfflineDriverMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;

    (async () => {
      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !containerRef.current) return;

        if (!mapRef.current) {
          // Last known coordinate along C-5 / BGC corridor
          const lastKnownCoord: [number, number] = REAL_BGC_ROAD[30] || [14.5538, 121.0497];

          const map = L.map(containerRef.current, {
            zoomControl: true,
            attributionControl: true,
            preferCanvas: true,
          }).setView(lastKnownCoord, 15);

          mapRef.current = map;

          L.tileLayer(TILE_URL, {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          // Offline driver marker matching ActiveDriversMap.tsx exactly
          const offlineIcon = L.divIcon({
            className: 'custom-offline-pin',
            html: `
              <div style="
                width: 36px; height: 36px; 
                background: #64748b; 
                border: 3px solid white; 
                border-radius: 50%; 
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                display: flex; align-items: center; justify-content: center;
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
          });

          const marker = L.marker(lastKnownCoord, { icon: offlineIcon }).addTo(map);

          // Tooltip matching the demo site's ActiveDriversMap.tsx offline tooltip
          const tooltipHtml = `
            <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; min-width: 175px; line-height: 1.35; padding: 3px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                <span style="font-weight: 800; color: #1e293b; font-size: 12px;">Arnel Mendoza</span>
                <span style="
                  display: inline-flex; align-items: center; gap: 3px;
                  background: #f1f5f9; color: #475569;
                  font-size: 10px; font-weight: 700;
                  padding: 2px 6px; border-radius: 4px;
                  border: 1px solid #cbd5e1;
                ">
                  ● OFFLINE
                </span>
              </div>
              <div style="color: #64748b; font-size: 10.5px; margin-bottom: 3px;">Isuzu Forward #3 (CAE-4521)</div>
              <div style="color: #64748b; font-size: 10.5px; margin-bottom: 2px;">
                Last seen: 4m ago &bull; C-5 Taguig
              </div>
              <div style="font-size: 10.5px; font-weight: 700; color: #be123c; margin-top: 2px;">
                Battery: 18% &bull; GPS Lost
              </div>
            </div>
          `;

          marker.bindTooltip(tooltipHtml, {
            permanent: true,
            direction: 'top',
            offset: [0, -36],
            className: 'offline-leaflet-tooltip',
          }).openTooltip();

          // Resize observer to align tiles
          const observer = new ResizeObserver(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
            }
          });
          observer.observe(containerRef.current);

          setIsMapReady(true);
        }
      } catch (err) {
        console.error('Failed to load offline driver map:', err);
      }
    })();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[260px] bg-slate-100 rounded-xl overflow-hidden">
      {!isMapReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 gap-2">
          <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
          <span className="text-[11px] font-mono text-slate-500">Loading last known telemetry...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
