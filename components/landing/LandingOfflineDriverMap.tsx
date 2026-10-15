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
          }).setView([14.5550, 121.0495], 15);

          mapRef.current = map;

          L.tileLayer(TILE_URL, {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          // Unified Popup + Downward Pointer Arrow + Offline Pin in a SINGLE DivIcon
          // Guarantees the popup and pointer can NEVER detach from the pin
          const cardWidth = 205;
          const cardHeight = 130;

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
                  <span style="font-weight: 800; color: #1e293b; font-size: 12.5px; letter-spacing: -0.01em;">Arnel Mendoza</span>
                  <span style="
                    display: inline-flex; align-items: center; gap: 3px;
                    background: #f1f5f9; color: #475569;
                    font-size: 10px; font-weight: 700;
                    padding: 1.5px 6px; border-radius: 4px;
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

              <!-- Offline Marker Pin directly attached to pointer -->
              <div style="
                margin-top: 3px;
                width: 32px; 
                height: 32px; 
                background: #64748b; 
                border: 2.5px solid white; 
                border-radius: 50%; 
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                display: flex; 
                align-items: center; 
                justify-content: center;
              ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
            </div>
          `;

          const unifiedIcon = L.divIcon({
            className: 'bg-transparent',
            html: unifiedHtml,
            iconSize: [cardWidth, cardHeight],
            iconAnchor: [cardWidth / 2, cardHeight - 5],
          });

          const marker = L.marker(lastKnownCoord, { icon: unifiedIcon });

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
    <div className="relative w-full h-full min-h-[260px] bg-slate-100 rounded-xl overflow-hidden pointer-events-none select-none cursor-default">
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
