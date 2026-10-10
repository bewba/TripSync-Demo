'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Loader2, Maximize2 } from 'lucide-react';
import { REAL_MCKINLEY_ROAD, REAL_AYALA_ROAD, REAL_BGC_ROAD } from './routesData';

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'e520b867332a41708a3ac5a694477ae5';
const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;

export interface LandingDriver {
  tripId: string;
  driverName: string;
  truckName: string;
  plateNumber: string;
  speed: string;
  battery: number;
  origin: string;
  destination: string;
  path: [number, number][];
}

// Demo fleet using real Philippine logistics road routes in Makati & BGC
const DEMO_FLEET: LandingDriver[] = [
  {
    tripId: 'TRP-101',
    driverName: 'Juan dela Cruz',
    truckName: 'Isuzu Giga Heavy Duty 10W',
    plateNumber: 'NBD-8891',
    speed: '64 km/h',
    battery: 95,
    origin: 'Manila North Harbor Terminal',
    destination: 'Batangas Port Depot',
    path: REAL_MCKINLEY_ROAD,
  },
  {
    tripId: 'TRP-102',
    driverName: 'Ricardo Santos',
    truckName: 'Hino 700 Heavy Fuel Tanker',
    plateNumber: 'CAE-4521',
    speed: '64 km/h',
    battery: 85,
    origin: 'Clark Logistics Hub',
    destination: 'Subic Bay Freeport',
    path: REAL_AYALA_ROAD,
  },
  {
    tripId: 'TRP-103',
    driverName: 'Eduardo Ramos',
    truckName: 'Fuso Canter 6W Closed Van',
    plateNumber: 'DAF-7812',
    speed: '70 km/h',
    battery: 75,
    origin: 'Laguna Technopark Hub',
    destination: 'Cavite Gateway Terminal',
    path: REAL_BGC_ROAD,
  },
];

export default function LandingHeroMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  const [isMapReady, setIsMapReady] = useState(false);
  const [hoveredDriverId, setHoveredDriverId] = useState<string | null>(null);

  // Staggered step indices along each road route
  const [stepIndices, setStepIndices] = useState<Record<string, number>>({
    'TRP-101': 20,
    'TRP-102': 10,
    'TRP-103': 15,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndices((prev) => {
        const next: Record<string, number> = {};
        DEMO_FLEET.forEach((driver) => {
          next[driver.tripId] = ((prev[driver.tripId] ?? 0) + 1) % driver.path.length;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentFleet = useMemo(() => {
    return DEMO_FLEET.map((driver) => {
      const idx = stepIndices[driver.tripId] ?? 0;
      const coords = driver.path[idx] || driver.path[0];
      return {
        ...driver,
        lat: coords[0],
        lng: coords[1],
      };
    });
  }, [stepIndices]);


  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;

    (async () => {
      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: false,
          preferCanvas: true,
          scrollWheelZoom: false,
        }).setView([14.5510, 121.0375], 14);

        mapRef.current = map;

        L.tileLayer(TILE_URL, {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        layerGroupRef.current = L.layerGroup().addTo(map);

        const observer = new ResizeObserver(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        });
        observer.observe(containerRef.current);

        setIsMapReady(true);
      } catch (err) {
        console.error('Failed to load map:', err);
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

  const handleFitFleet = useCallback(() => {
    if (!mapRef.current || currentFleet.length === 0) return;
    import('leaflet').then((LModule) => {
      const L = LModule.default;
      const bounds = L.latLngBounds(currentFleet.map((d) => [d.lat, d.lng] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true, duration: 0.5 });
    });
  }, [currentFleet]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !layerGroupRef.current) return;

    (async () => {
      const L = (await import('leaflet')).default;
      const group = layerGroupRef.current;

      currentFleet.forEach((driver) => {
        const isHovered = driver.tripId === hoveredDriverId;
        const size = isHovered ? 38 : 28;
        const zIndex = isHovered ? 1000 : 100;
        const bgColor = isHovered ? '#2563eb' : '#22c55e';

        const iconHtml = `
          <div style="
            width: ${size}px; height: ${size}px; 
            background: ${bgColor}; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s ease;
            cursor: pointer;
          ">
            <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `;

        const icon = L.divIcon({
          className: 'bg-transparent',
          html: iconHtml,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const tooltipHtml = `
          <div style="font-family: Inter, ui-sans-serif, system-ui, sans-serif; padding: 4px; min-width: 140px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
              <span style="font-weight: 700; font-size: 13px; color: #0f172a;">${driver.driverName}</span>
              <span style="font-size: 10px; font-weight: 600; color: #2563eb; background: #eff6ff; padding: 1px 4px; border-radius: 4px;">${driver.plateNumber}</span>
            </div>
            <div style="font-size: 10.5px; color: #64748b; margin-bottom: 3px;">
              ${driver.truckName}
            </div>
            <div style="
              display: inline-flex; align-items: center; gap: 4px;
              background: #ecfdf5; color: #059669;
              font-size: 10px; font-weight: 700;
              padding: 2px 6px; border-radius: 4px;
              margin-bottom: 2px;
              border: 1px solid #a7f3d0;
            ">
              ● In Motion &bull; ${driver.speed}
            </div>
            <div style="font-size: 10.5px; color: #64748b; margin-top: 2px;">
              ${driver.origin} &rarr; ${driver.destination}
            </div>
          </div>
        `;

        let marker = markersRef.current.get(driver.tripId);

        if (!marker) {
          marker = L.marker([driver.lat, driver.lng], {
            icon,
            zIndexOffset: zIndex,
          }).addTo(group);

          marker.bindTooltip(tooltipHtml, {
            direction: 'top',
            offset: [0, -(size / 2 + 4)],
            opacity: 1,
          });

          marker.on('mouseover', () => {
            setHoveredDriverId(driver.tripId);
            marker.openTooltip();
          });

          marker.on('mouseout', () => {
            setHoveredDriverId(null);
            marker.closeTooltip();
          });

          markersRef.current.set(driver.tripId, marker);
        } else {
          marker.setIcon(icon);
          marker.setLatLng([driver.lat, driver.lng]);
          marker.setZIndexOffset(zIndex);
          marker.setTooltipContent(tooltipHtml);
        }
      });
    })();
  }, [isMapReady, currentFleet, hoveredDriverId]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Top Header: Simple and authentic without pulsing dot */}
      <div className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between text-xs font-mono select-none">
        <span className="text-slate-900 font-bold text-sm tracking-tight">Active Drivers</span>

        <div className="text-slate-400 font-medium text-[11px] tracking-wide uppercase">
          Makati &bull; BGC Corridor
        </div>
      </div>

      {/* Pure Map Viewport: Only the map and moving drivers on actual roads */}
      <div className="relative w-full h-[360px] sm:h-[400px] bg-slate-100 overflow-hidden isolate">
        <div ref={containerRef} className="w-full h-full z-0" />

        {!isMapReady && (
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center gap-2 z-10">
            <Loader2 className="w-6 h-6 text-slate-600 animate-spin" />
            <span className="text-xs font-mono text-slate-500">Loading map...</span>
          </div>
        )}

        {/* Minimal Fit Fleet Button */}
        {isMapReady && (
          <button
            onClick={handleFitFleet}
            title="Fit All Drivers"
            className="absolute top-4 right-4 z-[999] bg-white/95 backdrop-blur-sm text-slate-700 hover:text-blue-600 hover:bg-white px-3 py-1.5 rounded-lg shadow-xs border border-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fit Fleet</span>
          </button>
        )}
      </div>

    </div>
  );
}
