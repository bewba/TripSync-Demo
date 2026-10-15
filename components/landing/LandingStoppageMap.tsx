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

          // Completely stationary map - cannot be moved, dragged, or zoomed
          const map = L.map(containerRef.current, {
            zoomControl: false,
            attributionControl: false,
            preferCanvas: true,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
          }).setView([14.5570, 121.0355], 15);

          mapRef.current = map;

          L.tileLayer(TILE_URL, {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          // Unified Popup + Downward Pointer Arrow + Incident Pin in a SINGLE DivIcon
          // Guarantees the popup and pointer can NEVER detach from the pin
          const cardWidth = 200;
          const cardHeight = 125;

          const unifiedHtml = `
            <div class="animate-pin-drop" style="
              width: ${cardWidth}px;
              display: flex;
              flex-direction: column;
              align-items: center;
              pointer-events: none;
              user-select: none;
            ">
              <!-- Popup Card -->
              <div style="
                width: 100%;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                padding: 9px 12px;
                font-family: system-ui, -apple-system, sans-serif;
              ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                  <span style="font-weight: 800; color: #0f172a; font-size: 12.5px; letter-spacing: -0.01em;">Juan dela Cruz</span>
                  <span style="font-weight: 700; color: #e11d48; background-color: #ffe4e6; padding: 1.5px 6px; border-radius: 4px; font-size: 10px;">0 km/h</span>
                </div>
                <div style="color: #64748b; font-size: 10.5px; margin-bottom: 3px;">Isuzu Giga #4 (NBD-8891)</div>
                <div style="color: #e11d48; font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 4px;">
                  <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #f43f5e;"></span>
                  Stopped (48m 12s)
                </div>
              </div>

              <!-- Downward Pointer Arrow -->
              <div style="
                width: 0; 
                height: 0; 
                border-left: 7px solid transparent;
                border-right: 7px solid transparent;
                border-top: 7px solid #ffffff;
                margin-top: -1px;
                filter: drop-shadow(0 2px 1px rgba(0,0,0,0.08));
              "></div>

              <!-- Incident Pin directly attached to pointer -->
              <div style="
                position: relative; 
                margin-top: 3px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                width: 34px; 
                height: 34px;
              ">
                <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: rgba(244, 63, 94, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background-color: #e11d48; border: 2.5px solid #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px; font-weight: 900; font-family: sans-serif;">
                  !
                </div>
              </div>
            </div>
          `;

          const unifiedIcon = L.divIcon({
            className: 'bg-transparent',
            html: unifiedHtml,
            iconSize: [cardWidth, cardHeight],
            iconAnchor: [cardWidth / 2, cardHeight - 5],
          });

          const marker = L.marker(stoppedCoord, { icon: unifiedIcon });

          // Trigger drop-in when scrolled into view
          if (containerRef.current) {
            const pinObserver = new IntersectionObserver(([entry]) => {
              if (entry.isIntersecting) {
                setTimeout(() => {
                  if (mapRef.current) {
                    marker.addTo(mapRef.current);
                  }
                }, 200);
                pinObserver.disconnect();
              }
            }, { threshold: 0.15 });
            pinObserver.observe(containerRef.current);
          }

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
    <div className="relative w-full h-full min-h-[260px] bg-slate-100 rounded-xl overflow-hidden pointer-events-none select-none cursor-default">
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
