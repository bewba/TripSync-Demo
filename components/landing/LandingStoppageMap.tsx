'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { REAL_MCKINLEY_ROAD } from './routesData';

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'e520b867332a41708a3ac5a694477ae5';
const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;

export default function LandingStoppageMap() {
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
          // Stoppage location along McKinley / SLEX corridor
          const stoppedCoord: [number, number] = REAL_MCKINLEY_ROAD[35] || [14.5555, 121.0358];

          const map = L.map(containerRef.current, {
            zoomControl: true,
            attributionControl: true,
            preferCanvas: true,
          }).setView(stoppedCoord, 15);

          mapRef.current = map;

          L.tileLayer(TILE_URL, {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          // Stopped incident marker icon
          const stoppedIcon = L.divIcon({
            className: 'custom-stoppage-pin',
            html: `
              <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
                <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: rgba(244, 63, 94, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background-color: #e11d48; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px; font-weight: 900; font-family: sans-serif;">
                  !
                </div>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          const marker = L.marker(stoppedCoord, { icon: stoppedIcon }).addTo(map);

          // Permanent tooltip showing stopped driver incident
          const popupHtml = `
            <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; min-width: 170px; line-height: 1.35; padding: 2px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-weight: 700; color: #0f172a; font-size: 12px;">Juan dela Cruz</span>
                <span style="font-weight: 700; color: #e11d48; background-color: #ffe4e6; padding: 2px 6px; border-radius: 4px; font-size: 10px;">0 km/h</span>
              </div>
              <div style="color: #64748b; font-size: 10.5px; margin-bottom: 4px;">Isuzu Giga #4 (NBD-8891)</div>
              <div style="color: #e11d48; font-weight: 700; font-size: 10.5px; display: flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #f43f5e;"></span>
                Stopped (48m 12s)
              </div>
            </div>
          `;

          marker.bindTooltip(popupHtml, {
            permanent: true,
            direction: 'top',
            offset: [0, -14],
            className: 'stoppage-leaflet-tooltip',
          }).openTooltip();

          // Resize observer to keep tiles aligned
          const observer = new ResizeObserver(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
            }
          });
          observer.observe(containerRef.current);

          setIsMapReady(true);
        }
      } catch (err) {
        console.error('Failed to load stoppage map:', err);
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
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-[11px] font-mono text-slate-500">Loading live corridor map...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
