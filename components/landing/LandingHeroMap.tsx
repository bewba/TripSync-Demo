'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Loader2, Maximize2, Search, Navigation } from 'lucide-react';
import { REAL_MCKINLEY_ROAD, REAL_AYALA_ROAD, REAL_BGC_ROAD } from './routesData';

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'e520b867332a41708a3ac5a694477ae5';
const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;

export interface LandingDriverConfig {
  tripId: string;
  driverName: string;
  truckName: string;
  plateNumber: string;
  battery: number;
  origin: string;
  destination: string;
  corridor: string;
  baseSpeed: number;
  stepPerPing: number; // Speed multiplier per uniform telemetry ping
  path: [number, number][];
}

// Realistic longer regional logistics routes traversing the Makati & BGC freight corridor
const DEMO_FLEET_CONFIG: LandingDriverConfig[] = [
  {
    tripId: 'TRP-101',
    driverName: 'Juan dela Cruz',
    truckName: 'Isuzu Giga Heavy Duty 10W',
    plateNumber: 'NBD-8891',
    battery: 94,
    origin: 'Manila North Harbor Port',
    destination: 'Batangas International Port',
    corridor: 'McKinley • SLEX Corridor',
    baseSpeed: 64,
    stepPerPing: 2, // Fast cruising speed (2 points per ping)
    path: REAL_MCKINLEY_ROAD,
  },
  {
    tripId: 'TRP-102',
    driverName: 'Ricardo Santos',
    truckName: 'Hino 700 Heavy Fuel Tanker',
    plateNumber: 'CAE-4521',
    battery: 88,
    origin: 'Bulacan Bulk Logistics Hub',
    destination: 'Cavite Gateway Container Terminal',
    corridor: 'Ayala Ave • Buendia Freight',
    baseSpeed: 38,
    stepPerPing: 0.5, // Heavy tanker (1 point every 2 pings)
    path: REAL_AYALA_ROAD,
  },
  {
    tripId: 'TRP-103',
    driverName: 'Eduardo Ramos',
    truckName: 'Fuso Canter 6W Closed Van',
    plateNumber: 'DAF-7812',
    battery: 78,
    origin: 'Quezon City Logistics Central',
    destination: 'Laguna Technopark Industrial Hub',
    corridor: 'BGC 5th Ave Arterial',
    baseSpeed: 54,
    stepPerPing: 1, // Standard urban delivery speed (1 point per ping)
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
  const [searchQuery, setSearchQuery] = useState('');

  // Staggered starting indices for each driver
  const [stepIndices, setStepIndices] = useState<Record<string, number>>({
    'TRP-101': 20,
    'TRP-102': 10,
    'TRP-103': 35,
  });

  // Uniform 1-second telemetry ping for all vehicles, moving at different speeds
  useEffect(() => {
    let pingCount = 0;
    const interval = setInterval(() => {
      pingCount += 1;
      setStepIndices((prev) => {
        const next: Record<string, number> = {};
        DEMO_FLEET_CONFIG.forEach((driver) => {
          let advance = 0;
          if (driver.stepPerPing === 2) {
            advance = 2;
          } else if (driver.stepPerPing === 1) {
            advance = 1;
          } else if (driver.stepPerPing === 0.5) {
            advance = pingCount % 2 === 0 ? 1 : 0;
          }
          const currentIndex = prev[driver.tripId] ?? 0;
          next[driver.tripId] = (currentIndex + advance) % driver.path.length;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Compute live coordinates and realistic individual speeds for each driver
  const currentFleet = useMemo(() => {
    return DEMO_FLEET_CONFIG.map((driver) => {
      const idx = stepIndices[driver.tripId] ?? 0;
      const coords = driver.path[idx] || driver.path[0];
      const speedFluctuation = Math.round(Math.sin(idx * 0.35) * 2);
      const currentSpeedNum = driver.baseSpeed + speedFluctuation;

      return {
        ...driver,
        lat: coords[0],
        lng: coords[1],
        speed: `${currentSpeedNum} km/h`,
      };
    });
  }, [stepIndices]);

  const filteredFleet = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return currentFleet;
    return currentFleet.filter(
      (d) =>
        d.driverName.toLowerCase().includes(query) ||
        d.truckName.toLowerCase().includes(query) ||
        d.origin.toLowerCase().includes(query) ||
        d.destination.toLowerCase().includes(query) ||
        d.corridor.toLowerCase().includes(query) ||
        d.plateNumber.toLowerCase().includes(query)
    );
  }, [currentFleet, searchQuery]);

  // Initialize Map
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
      mapRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 15, animate: true, duration: 0.5 });
    });
  }, [currentFleet]);

  const handleSelectDriver = useCallback((tripId: string) => {
    setHoveredDriverId(tripId);
    const target = currentFleet.find((d) => d.tripId === tripId);
    if (target && mapRef.current) {
      mapRef.current.flyTo([target.lat, target.lng], 15, { animate: true, duration: 0.6 });
      const marker = markersRef.current.get(tripId);
      if (marker) {
        marker.openTooltip();
      }
    }
  }, [currentFleet]);

  // Render & Update Live Markers using original uniform circular map-pin icons
  useEffect(() => {
    if (!isMapReady || !mapRef.current || !layerGroupRef.current) return;

    (async () => {
      const L = (await import('leaflet')).default;
      const group = layerGroupRef.current;

      currentFleet.forEach((driver) => {
        // Exactly identical to original: all drivers use same 28px #22c55e green pin, turns blue on hover
        const isHovered = driver.tripId === hoveredDriverId;
        const size = isHovered ? 38 : 28;
        const zIndex = isHovered ? 1000 : 100;
        const bgColor = isHovered ? '#2563eb' : '#22c55e';

        // Original circular location pin icon
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

          marker.on('click', () => {
            handleSelectDriver(driver.tripId);
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
  }, [isMapReady, currentFleet, hoveredDriverId, handleSelectDriver]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col">
      {/* Top Header: matches demo active drivers page */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-5 py-3 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-600" />
          <span className="text-slate-900 font-bold text-sm tracking-tight">Active Drivers Map</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold text-[11px] border border-emerald-100 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            3 Online &bull; Makati &amp; BGC Corridors
          </span>
        </div>
      </div>

      {/* Main Container: Map Viewport + Active Drivers Sidebar */}
      <div className="flex flex-col md:flex-row h-[430px] sm:h-[470px] bg-slate-100 overflow-hidden isolate relative">
        {/* Map Viewport */}
        <div className="flex-1 h-[260px] md:h-full relative order-1">
          <div ref={containerRef} className="w-full h-full z-0" />

          {!isMapReady && (
            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center gap-2 z-10">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              <span className="text-xs font-mono text-slate-500">Loading live telemetry...</span>
            </div>
          )}

          {/* Minimal Fit Fleet Button */}
          {isMapReady && (
            <button
              onClick={handleFitFleet}
              title="Fit All Drivers"
              className="absolute top-3 right-3 z-[999] bg-white/95 backdrop-blur-xs text-slate-700 hover:text-emerald-700 hover:bg-white px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fit Fleet</span>
            </button>
          )}
        </div>

        {/* Sidebar Roster: Matches /auth/active-drivers driver roster list */}
        <div className="w-full md:w-64 lg:w-72 bg-white border-t md:border-t-0 md:border-l border-slate-200/90 flex flex-col order-2 h-[170px] md:h-full">
          {/* Sidebar Header & Search */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-xs text-slate-800 tracking-tight">Driver Roster</h2>
              <span className="text-[10px] text-emerald-700 font-medium">3 Active Trips</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search drivers or routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>
          </div>

          {/* Scrollable Driver Cards: all identical styling */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredFleet.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-6">
                No matching drivers.
              </div>
            ) : (
              filteredFleet.map((driver) => {
                const isHovered = hoveredDriverId === driver.tripId;

                return (
                  <div
                    key={driver.tripId}
                    onMouseEnter={() => setHoveredDriverId(driver.tripId)}
                    onMouseLeave={() => setHoveredDriverId(null)}
                    onClick={() => handleSelectDriver(driver.tripId)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-start gap-2.5 cursor-pointer border ${
                      isHovered
                        ? 'bg-blue-50/80 border-blue-200 shadow-2xs'
                        : 'bg-white hover:bg-slate-50/80 border-slate-100'
                    }`}
                  >
                    {/* Driver Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs transition-colors ${
                        isHovered
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {driver.driverName.charAt(0)}
                    </div>

                    {/* Driver Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-semibold text-slate-800 text-xs truncate group-hover:text-blue-600 transition-colors">
                          {driver.driverName}
                        </h3>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                          {driver.speed}
                        </span>
                      </div>

                      {/* Online Status & Corridor */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10.5px] font-medium text-emerald-700">En Route</span>
                        <span className="text-[10px] text-slate-400">&bull;</span>
                        <span className="text-[10px] text-slate-500 truncate">{driver.corridor}</span>
                      </div>

                      {/* Truck Name */}
                      <div className="text-[10.5px] text-slate-600 truncate mt-0.5">
                        {driver.truckName}
                      </div>

                      {/* Realistic Long Journey Path */}
                      <div className="text-[9.5px] text-slate-400 truncate flex items-center gap-1 mt-0.5 font-mono">
                        <span className="truncate">{driver.origin}</span>
                        <span>&rarr;</span>
                        <span className="truncate">{driver.destination}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
