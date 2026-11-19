'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

type FeatureType = 'fuel' | 'distance';

interface FeatureConfig {
  id: FeatureType;
  label: string;
  metricTitle: string;
  totalValue: string;
  unit: string;
  color: string;
  gradientId: string;
  activePointY: number;
  yLabels: string[];
  strokePath: string;
  areaPath: string;
}

interface ChartDataPoint {
  date: string;
  shortDate: string;
  x: number;
  fuelY: number;
  distY: number;
  fuelValue: string;
  distValue: string;
  vehicle: string;
  driver: string;
}

const CHART_POINTS: ChartDataPoint[] = [
  {
    date: 'September 30, 2026',
    shortDate: '2026-09-30',
    x: 65,
    fuelY: 160,
    distY: 167,
    fuelValue: '28.5 L',
    distValue: '78.4 km',
    vehicle: 'Isuzu Giga Heavy Cargo',
    driver: 'Juan dela Cruz',
  },
  {
    date: 'October 1, 2026',
    shortDate: '2026-10-01',
    x: 121.7,
    fuelY: 142,
    distY: 140,
    fuelValue: '36.2 L',
    distValue: '98.6 km',
    vehicle: 'Scania R500 Heavy Prime Mover',
    driver: 'Arnel Mendoza',
  },
  {
    date: 'October 2, 2026',
    shortDate: '2026-10-02',
    x: 178.3,
    fuelY: 170,
    distY: 175,
    fuelValue: '24.1 L',
    distValue: '64.2 km',
    vehicle: 'Hino 700 Long Haul',
    driver: 'Danilo Santos',
  },
  {
    date: 'October 3, 2026',
    shortDate: '2026-10-03',
    x: 235,
    fuelY: 52,
    distY: 30,
    fuelValue: '74.8 L',
    distValue: '212.5 km',
    vehicle: 'Volvo FH16 Globetrotter',
    driver: 'Rodrigo D. Alcantara',
  },
  {
    date: 'October 4, 2026',
    shortDate: '2026-10-04',
    x: 291.7,
    fuelY: 206,
    distY: 212,
    fuelValue: '8.5 L',
    distValue: '18.4 km',
    vehicle: 'Fuso Super Great 10-Wheeler',
    driver: 'Mateo Reyes',
  },
  {
    date: 'October 5, 2026',
    shortDate: '2026-10-05',
    x: 348.3,
    fuelY: 182,
    distY: 189,
    fuelValue: '18.2 L',
    distValue: '48.6 km',
    vehicle: 'Isuzu Giga Heavy Cargo',
    driver: 'Juan dela Cruz',
  },
  {
    date: 'October 6, 2026',
    shortDate: '2026-10-06',
    x: 405,
    fuelY: 158,
    distY: 160,
    fuelValue: '30.6 L',
    distValue: '84.2 km',
    vehicle: 'Hino 700 Long Haul',
    driver: 'Danilo Santos',
  },
  {
    date: 'October 7, 2026',
    shortDate: '2026-10-07',
    x: 461.7,
    fuelY: 142,
    distY: 138,
    fuelValue: '39.8 L',
    distValue: '107.4 km',
    vehicle: 'Scania R500 Heavy Prime Mover',
    driver: 'Assigned Driver',
  },
  {
    date: 'October 8, 2026',
    shortDate: '2026-10-08',
    x: 518.3,
    fuelY: 122,
    distY: 116,
    fuelValue: '46.4 L',
    distValue: '128.5 km',
    vehicle: 'Volvo FH16 Globetrotter',
    driver: 'Rodrigo D. Alcantara',
  },
  {
    date: 'October 9, 2026',
    shortDate: '2026-10-09',
    x: 575,
    fuelY: 88,
    distY: 80,
    fuelValue: '61.2 L',
    distValue: '172.0 km',
    vehicle: 'Scania R500 Heavy Prime Mover',
    driver: 'Arnel Mendoza',
  },
  {
    date: 'October 10, 2026',
    shortDate: '2026-10-10',
    x: 631.7,
    fuelY: 44,
    distY: 17,
    fuelValue: '81.5 L',
    distValue: '236.4 km',
    vehicle: 'Volvo FH16 Globetrotter',
    driver: 'Juan dela Cruz',
  },
  {
    date: 'October 11, 2026',
    shortDate: '2026-10-11',
    x: 688.3,
    fuelY: 204,
    distY: 210,
    fuelValue: '9.4 L',
    distValue: '21.5 km',
    vehicle: 'Fuso Super Great 10-Wheeler',
    driver: 'Mateo Reyes',
  },
  {
    date: 'October 13, 2026',
    shortDate: '2026-10-13',
    x: 745,
    fuelY: 158,
    distY: 164,
    fuelValue: '27.0 L',
    distValue: '74.4 km',
    vehicle: 'Hino 700 Long Haul',
    driver: 'Danilo Santos',
  },
];

const DEFAULT_POINT_INDEX = 7; // October 7, 2026 (x = 461.7)

const FEATURES: FeatureConfig[] = [
  {
    id: 'fuel',
    label: 'Fuel Consumed',
    metricTitle: 'FUEL CONSUMED',
    totalValue: '486.20',
    unit: 'L',
    color: '#10b981', // Emerald green matching FuelChart.tsx
    gradientId: 'chartFuelGradient',
    activePointY: 142,
    yLabels: ['100 L', '75 L', '50 L', '25 L', '0 L'],
    strokePath:
      'M 65 160 C 90 142, 105 140, 121.7 142 C 145 144, 160 168, 178.3 170 C 198 172, 215 65, 235 52 C 255 40, 275 198, 291.7 206 C 310 214, 330 192, 348.3 182 C 370 172, 385 165, 405 158 C 425 150, 445 144, 461.7 142 C 485 138, 500 130, 518.3 122 C 540 112, 555 98, 575 88 C 595 78, 615 48, 631.7 44 C 650 40, 670 195, 688.3 204 C 705 212, 725 175, 745 158',
    areaPath:
      'M 65 160 C 90 142, 105 140, 121.7 142 C 145 144, 160 168, 178.3 170 C 198 172, 215 65, 235 52 C 255 40, 275 198, 291.7 206 C 310 214, 330 192, 348.3 182 C 370 172, 385 165, 405 158 C 425 150, 445 144, 461.7 142 C 485 138, 500 130, 518.3 122 C 540 112, 555 98, 575 88 C 595 78, 615 48, 631.7 44 C 650 40, 670 195, 688.3 204 C 705 212, 725 175, 745 158 L 745 225 L 65 225 Z',
  },
  {
    id: 'distance',
    label: 'Distance Covered',
    metricTitle: 'DISTANCE COVERED',
    totalValue: '1345.10',
    unit: 'km',
    color: '#3b82f6', // Blue matching DistanceChart.tsx
    gradientId: 'chartDistGradient',
    activePointY: 138,
    yLabels: ['260 km', '195 km', '130 km', '65 km', '0 km'],
    strokePath:
      'M 65 167 C 90 140, 105 138, 121.7 140 C 145 142, 160 174, 178.3 175 C 198 176, 215 45, 235 30 C 255 15, 275 205, 291.7 212 C 310 219, 330 198, 348.3 189 C 370 178, 385 168, 405 160 C 425 152, 445 142, 461.7 138 C 485 132, 500 125, 518.3 116 C 540 105, 555 90, 575 80 C 595 70, 615 22, 631.7 17 C 650 12, 670 200, 688.3 210 C 705 218, 725 180, 745 164',
    areaPath:
      'M 65 167 C 90 140, 105 138, 121.7 140 C 145 142, 160 174, 178.3 175 C 198 176, 215 45, 235 30 C 255 15, 275 205, 291.7 212 C 310 219, 330 198, 348.3 189 C 370 178, 385 168, 405 160 C 425 152, 445 142, 461.7 138 C 485 132, 500 125, 518.3 116 C 540 105, 555 90, 575 80 C 595 70, 615 22, 631.7 17 C 650 12, 670 200, 688.3 210 C 705 218, 725 180, 745 164 L 745 225 L 65 225 Z',
  },
];

const DRIVER_OPTIONS = Array.from(
  new Set(CHART_POINTS.map((p) => p.driver).filter((d) => d !== 'Assigned Driver'))
);
const TRUCK_OPTIONS = Array.from(new Set(CHART_POINTS.map((p) => p.vehicle)));

function buildSmoothPaths(points: { x: number; y: number }[]) {
  if (points.length === 0) return { strokePath: '', areaPath: '' };
  if (points.length === 1) {
    const p = points[0];
    return {
      strokePath: `M ${p.x} ${p.y} L ${p.x} ${p.y}`,
      areaPath: '',
    };
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  const first = points[0];
  const last = points[points.length - 1];
  const area = `${d} L ${last.x} 225 L ${first.x} 225 Z`;
  return { strokePath: d, areaPath: area };
}

interface LandingAnalyticsChartProps {
  compact?: boolean;
}

export default function LandingAnalyticsChart({ compact = false }: LandingAnalyticsChartProps = {}) {
  // Fuel Consumed as the default feature
  const [activeFeature, setActiveFeature] = useState<FeatureType>('fuel');
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [selectedTruck, setSelectedTruck] = useState<string>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  const currentFeature = FEATURES.find((f) => f.id === activeFeature) || FEATURES[0];
  const isFiltered = selectedDriver !== 'all' || selectedTruck !== 'all';

  const visiblePoints = useMemo(() => {
    return CHART_POINTS.filter((pt) => {
      const matchDriver = selectedDriver === 'all' || pt.driver === selectedDriver;
      const matchTruck = selectedTruck === 'all' || pt.vehicle === selectedTruck;
      return matchDriver && matchTruck;
    });
  }, [selectedDriver, selectedTruck]);

  const { strokePath, areaPath, displayTotal, tripCount } = useMemo(() => {
    if (!isFiltered) {
      return {
        strokePath: currentFeature.strokePath,
        areaPath: currentFeature.areaPath,
        displayTotal: currentFeature.totalValue,
        tripCount: 15,
      };
    }

    const total = visiblePoints.reduce((sum, pt) => {
      const raw = activeFeature === 'fuel' ? pt.fuelValue : pt.distValue;
      return sum + (parseFloat(raw) || 0);
    }, 0);

    const coords = visiblePoints.map((pt) => ({
      x: pt.x,
      y: activeFeature === 'fuel' ? pt.fuelY : pt.distY,
    }));
    const paths = buildSmoothPaths(coords);

    return {
      strokePath: paths.strokePath,
      areaPath: paths.areaPath,
      displayTotal: total.toFixed(2),
      tripCount: visiblePoints.length,
    };
  }, [isFiltered, visiblePoints, activeFeature, currentFeature]);

  const hasPoints = visiblePoints.length > 0;
  const isHovered = hoveredIndex !== null && hoveredIndex < visiblePoints.length;
  const defaultIdx = isFiltered
    ? Math.floor(visiblePoints.length / 2)
    : DEFAULT_POINT_INDEX;
  const activePoint = hasPoints
    ? visiblePoints[isHovered ? hoveredIndex : defaultIdx] || visiblePoints[0]
    : CHART_POINTS[DEFAULT_POINT_INDEX];
  const activeY = activeFeature === 'fuel' ? activePoint.fuelY : activePoint.distY;

  // Spaced date labels along the X-axis
  const dateTicks = [
    { date: '2026-09-30', x: 65, anchor: 'start' as const },
    { date: '2026-10-03', x: 235, anchor: 'middle' as const },
    { date: '2026-10-07', x: 461.7, anchor: 'middle' as const },
    { date: '2026-10-10', x: 631.7, anchor: 'middle' as const },
    { date: '2026-10-13', x: 745, anchor: 'end' as const },
  ];

  const yPositions = [18, 70, 122, 174, 225];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasPoints) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * 760;

    let closestIdx = 0;
    let minDiff = Infinity;
    visiblePoints.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!e.touches[0] || !hasPoints) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const svgX = (touchX / rect.width) * 760;

    let closestIdx = 0;
    let minDiff = Infinity;
    visiblePoints.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full bg-white text-slate-900 relative ${
        compact
          ? 'rounded-none border-0 p-3 sm:p-3.5 flex flex-col justify-between flex-1'
          : 'rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6'
      }`}
    >
      {/* Top Controls Bar: Driver, Truck & Metric Switcher aligned on one row above the metric header */}
      <div
        className={`flex flex-wrap items-end justify-between border-b border-slate-100 ${
          compact ? 'gap-1.5 mb-2.5 pb-2' : 'gap-2.5 mb-4 pb-3.5'
        }`}
      >
        {/* Left: Driver & Truck Dropdowns */}
        <div className={`grid grid-cols-2 flex-1 min-w-0 ${compact ? 'gap-1.5' : 'gap-2.5 sm:max-w-[330px]'}`}>
          {/* Driver Filter */}
          <div className="min-w-0">
            <label
              className={`block font-bold uppercase tracking-wider text-slate-400 ${
                compact ? 'text-[8px] mb-0.5' : 'text-[10px] mb-1'
              }`}
            >
              Driver
            </label>
            <div className="relative">
              <select
                aria-label="Filter by driver"
                value={selectedDriver}
                onChange={(e) => {
                  setSelectedDriver(e.target.value);
                  setHoveredIndex(null);
                }}
                className={`w-full appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer truncate ${
                  compact
                    ? 'h-7 pl-2 pr-5 text-[10px]'
                    : 'h-9 pl-2.5 pr-7 text-xs'
                }`}
              >
                <option value="all">All Drivers</option>
                {DRIVER_OPTIONS.map((driver) => (
                  <option key={driver} value={driver}>
                    {driver}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 ${
                  compact ? 'w-3 h-3' : 'w-3.5 h-3.5'
                }`}
              />
            </div>
          </div>

          {/* Truck Filter */}
          <div className="min-w-0">
            <label
              className={`block font-bold uppercase tracking-wider text-slate-400 ${
                compact ? 'text-[8px] mb-0.5' : 'text-[10px] mb-1'
              }`}
            >
              Truck
            </label>
            <div className="relative">
              <select
                aria-label="Filter by truck"
                value={selectedTruck}
                onChange={(e) => {
                  setSelectedTruck(e.target.value);
                  setHoveredIndex(null);
                }}
                className={`w-full appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer truncate ${
                  compact
                    ? 'h-7 pl-2 pr-5 text-[10px]'
                    : 'h-9 pl-2.5 pr-7 text-xs'
                }`}
              >
                <option value="all">All Trucks</option>
                {TRUCK_OPTIONS.map((truck) => (
                  <option key={truck} value={truck}>
                    {truck}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 ${
                  compact ? 'w-3 h-3' : 'w-3.5 h-3.5'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Right: Metric Switcher (Fuel Consumed & Distance Covered) aligned to same height */}
        <div className="shrink-0">
          <span
            className={`block font-bold uppercase tracking-wider text-slate-400 ${
              compact ? 'text-[8px] mb-0.5' : 'text-[10px] mb-1'
            }`}
          >
            Metric
          </span>
          <div
            className={`grid grid-cols-2 gap-0.5 bg-slate-100 rounded-lg border border-slate-200/80 ${
              compact ? 'h-7 p-0.5' : 'h-9 p-1'
            }`}
          >
            {FEATURES.map((feat) => {
              const isActive = activeFeature === feat.id;
              return (
                <button
                  key={feat.id}
                  onClick={() => setActiveFeature(feat.id)}
                  className={`font-bold rounded-md transition-all duration-150 cursor-pointer whitespace-nowrap text-center flex items-center justify-center ${
                    compact ? 'px-2 text-[9px]' : 'px-2.5 text-[11px]'
                  } ${
                    isActive
                      ? feat.id === 'fuel'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {feat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metric Header */}
      <div className={compact ? 'mb-2' : 'mb-4 sm:mb-5'}>
        <div className="min-w-0">
          <p
            className={`font-bold uppercase tracking-widest text-slate-900 font-sans ${
              compact ? 'text-[9px] mb-0.5' : 'text-xs sm:text-sm mb-1'
            }`}
          >
            {currentFeature.metricTitle}
          </p>
          <p
            className={`font-black text-slate-950 tracking-tight font-sans ${
              compact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-4xl'
            }`}
          >
            {displayTotal}{' '}
            <span
              className={`font-semibold text-slate-400 font-sans ml-1 ${
                compact ? 'text-[10px]' : 'text-sm sm:text-base'
              }`}
            >
              {currentFeature.unit} total
            </span>
          </p>
          <p
            className={`text-slate-400 font-sans ${
              compact ? 'text-[9px] mt-0' : 'text-xs sm:text-sm mt-0.5'
            }`}
          >
            across <span className="font-bold text-slate-700">{tripCount}</span> {tripCount === 1 ? 'trip' : 'trips'}
          </p>
        </div>
      </div>

      {/* Chart Canvas with Interactive Hover Tracking */}
      <div
        className="relative w-full cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
      >
        <svg
          className="w-full h-auto block"
          viewBox="0 0 760 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Emerald Gradient for Fuel Consumed */}
            <linearGradient id="chartFuelGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="95%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Blue Gradient for Distance Covered */}
            <linearGradient id="chartDistGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity="0.22" />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Dashed Grid Lines & Dynamic Y-Axis Labels */}
          {yPositions.map((y, i) => (
            <React.Fragment key={y}>
              <line x1="65" y1={y} x2="745" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text
                x="52"
                y={y + 4}
                textAnchor="end"
                fill="#64748b"
                fontSize="11"
                fontWeight="600"
                fontFamily="sans-serif"
              >
                {currentFeature.yLabels[i]}
              </text>
            </React.Fragment>
          ))}

          {/* Vertical Dotted Grid Lines matching date columns */}
          {[65, 235, 461.7, 631.7, 745].map((x) => (
            <line key={x} x1={x} y1="18" x2={x} y2="225" stroke="#f1f5f9" strokeDasharray="3 3" />
          ))}

          {/* Animated Area Gradient Fill */}
          {hasPoints && areaPath && (
            <motion.path
              key={`area-${activeFeature}-${selectedDriver}-${selectedTruck}`}
              d={areaPath}
              fill={`url(#${currentFeature.gradientId})`}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: isFiltered ? 0.35 : 1.4, delay: isFiltered ? 0 : 1.2 }}
            />
          )}

          {/* Animated Stroke Curve - draws line smoothly and noticeably slower */}
          {hasPoints && strokePath && (
            <motion.path
              key={`stroke-${activeFeature}-${selectedDriver}-${selectedTruck}`}
              d={strokePath}
              fill="none"
              stroke={currentFeature.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: isFiltered ? 0.6 : 2.8, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Vertical Cursor Guide Rule at Active Point */}
          {hasPoints && (
            <line
              x1={activePoint.x}
              y1="18"
              x2={activePoint.x}
              y2="225"
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray={isHovered ? '3 3' : undefined}
            />
          )}

          {/* Hover Halo Ring */}
          {hasPoints && isHovered && (
            <circle
              cx={activePoint.x}
              cy={activeY}
              r="9"
              fill={currentFeature.color}
              fillOpacity="0.22"
            />
          )}

          {/* Active Marker Dot */}
          {hasPoints && (
            <motion.circle
              key={`circle-${activeFeature}-${activePoint.x}-${selectedDriver}-${selectedTruck}`}
              cx={activePoint.x}
              cy={activeY}
              r="4.5"
              fill={currentFeature.color}
              stroke="#ffffff"
              strokeWidth="2.5"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}

          {/* Clean Spaced X-Axis Dates */}
          {dateTicks.map(({ date, x, anchor }) => (
            <text
              key={date}
              x={x}
              y="246"
              textAnchor={anchor}
              fill="#64748b"
              fontSize="10.5"
              fontWeight="600"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {date}
            </text>
          ))}

          {/* Transparent interactive vertical slices for accurate hit-testing */}
          {visiblePoints.map((pt, i) => {
            const prevX = i === 0 ? 0 : (visiblePoints[i - 1].x + pt.x) / 2;
            const nextX =
              i === visiblePoints.length - 1 ? 760 : (visiblePoints[i + 1].x + pt.x) / 2;
            return (
              <rect
                key={`slice-${pt.shortDate}`}
                x={prevX}
                y="18"
                width={nextX - prevX}
                height="207"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
              />
            );
          })}
        </svg>

        {/* Empty Filter State */}
        {!hasPoints && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 backdrop-blur-[1px] rounded-xl text-center px-4">
            <p className="text-xs font-bold text-slate-700">
              No trips match this driver &amp; truck filter
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDriver('all');
                setSelectedTruck('all');
              }}
              className="mt-2 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold cursor-pointer transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Floating Tooltip Card:
            - When NOT hovered: Stays at the default position.
            - When hovered: Default popup is replaced by the hovered point's popup, dynamically positioned.
        */}
        {hasPoints && (
        <div
          className={`absolute top-1 sm:top-2 z-20 bg-white/95 backdrop-blur-[2px] border border-slate-200/90 rounded-xl shadow-lg font-semibold text-slate-800 pointer-events-none transition-all duration-150 ease-out ${
            compact
              ? 'p-1.5 sm:p-2 text-[9px] sm:text-[10px] w-[140px] sm:w-[160px]'
              : 'p-2.5 sm:p-3 text-[11px] sm:text-xs w-[180px] sm:w-[210px]'
          } ${
            !isHovered ? 'right-1 sm:right-auto sm:left-[59%]' : ''
          }`}
          style={
            isHovered
              ? (activePoint.x / 760) * 100 > 55
                ? {
                    right: `calc(${100 - (activePoint.x / 760) * 100}% + 12px)`,
                    left: 'auto',
                  }
                : {
                    left: `calc(${(activePoint.x / 760) * 100}% + 12px)`,
                    right: 'auto',
                  }
              : undefined
          }
        >
          <p
            className={`text-slate-400 font-bold border-b border-slate-100 font-sans ${
              compact ? 'mb-1 pb-0.5 text-[9px] sm:text-[10px]' : 'mb-1.5 pb-1 text-[11px] sm:text-xs'
            }`}
          >
            {activePoint.date}
          </p>
          <div className={`flex flex-col font-sans ${compact ? 'gap-0.5 mb-1' : 'gap-1 mb-1.5'}`}>
            {/* Fuel Consumed */}
            <div
              className={`flex justify-between items-center -mx-1 px-1.5 py-0.5 rounded font-sans ${
                compact ? 'text-[8.5px] sm:text-[9.5px]' : 'text-[10.5px] sm:text-[11px]'
              } ${
                activeFeature === 'fuel' ? 'bg-emerald-50 text-emerald-800 font-bold' : ''
              }`}
            >
              <span
                className={
                  activeFeature === 'fuel'
                    ? 'text-emerald-700 font-semibold'
                    : 'text-slate-500 font-medium'
                }
              >
                Fuel:
              </span>
              <span
                className={`font-bold ${
                  activeFeature === 'fuel' ? 'text-emerald-600 font-black' : 'text-slate-700'
                }`}
              >
                {activePoint.fuelValue}
              </span>
            </div>

            {/* Distance Covered */}
            <div
              className={`flex justify-between items-center -mx-1 px-1.5 py-0.5 rounded font-sans ${
                compact ? 'text-[8.5px] sm:text-[9.5px]' : 'text-[10.5px] sm:text-[11px]'
              } ${
                activeFeature === 'distance' ? 'bg-blue-50 text-blue-800 font-bold' : ''
              }`}
            >
              <span
                className={
                  activeFeature === 'distance'
                    ? 'text-blue-700 font-semibold'
                    : 'text-slate-500 font-medium'
                }
              >
                Distance:
              </span>
              <span
                className={`font-bold ${
                  activeFeature === 'distance' ? 'text-blue-600 font-black' : 'text-slate-700'
                }`}
              >
                {activePoint.distValue}
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-100 font-sans">
            <span
              className={`text-slate-400 font-bold uppercase tracking-wider block ${
                compact ? 'text-[8px] mb-0.5' : 'text-[9.5px] sm:text-[10px] mb-0.5'
              }`}
            >
              Vehicle
            </span>
            <div className="flex flex-wrap gap-1">
              <span
                className={`bg-slate-100 text-slate-900 font-medium px-1.5 py-0.5 rounded truncate max-w-full ${
                  compact ? 'text-[8.5px] sm:text-[9px]' : 'text-[10px] sm:text-[10.5px]'
                }`}
              >
                {activePoint.vehicle}
              </span>
            </div>
          </div>
          <div className="mt-0.5 pt-0.5 border-t border-slate-100 font-sans">
            <span
              className={`text-slate-400 font-bold uppercase tracking-wider block ${
                compact ? 'text-[8px] mb-0.5' : 'text-[9.5px] sm:text-[10px] mb-0.5'
              }`}
            >
              Driver
            </span>
            <div className="flex flex-wrap gap-1">
              <span
                className={`bg-slate-100 text-slate-900 font-medium px-1.5 py-0.5 rounded ${
                  compact ? 'text-[8.5px] sm:text-[9px]' : 'text-[10px] sm:text-[10.5px]'
                }`}
              >
                {activePoint.driver}
              </span>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
