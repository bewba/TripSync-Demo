'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

type FeatureType = 'fuel' | 'distance' | 'requested';

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
  {
    id: 'requested',
    label: 'Fuel Requested',
    metricTitle: 'FUEL REQUESTED',
    totalValue: '524.50',
    unit: 'L',
    color: '#0d9488', // Teal matching FuelRequestedChart.tsx
    gradientId: 'chartReqGradient',
    activePointY: 132,
    yLabels: ['120 L', '90 L', '60 L', '30 L', '0 L'],
    strokePath:
      'M 65 150 C 90 135, 105 132, 121.7 134 C 145 138, 160 162, 178.3 165 C 198 168, 215 52, 235 42 C 255 30, 275 192, 291.7 200 C 310 208, 330 185, 348.3 175 C 370 165, 385 158, 405 150 C 425 142, 445 136, 461.7 132 C 485 126, 500 120, 518.3 112 C 540 102, 555 88, 575 78 C 595 68, 615 36, 631.7 32 C 650 28, 670 188, 688.3 198 C 705 206, 725 168, 745 150',
    areaPath:
      'M 65 150 C 90 135, 105 132, 121.7 134 C 145 138, 160 162, 178.3 165 C 198 168, 215 52, 235 42 C 255 30, 275 192, 291.7 200 C 310 208, 330 185, 348.3 175 C 370 165, 385 158, 405 150 C 425 142, 445 136, 461.7 132 C 485 126, 500 120, 518.3 112 C 540 102, 555 88, 575 78 C 595 68, 615 36, 631.7 32 C 650 28, 670 188, 688.3 198 C 705 206, 725 168, 745 150 L 745 225 L 65 225 Z',
  },
];

export default function LandingAnalyticsChart() {
  // Fuel Consumed as the default feature
  const [activeFeature, setActiveFeature] = useState<FeatureType>('fuel');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  const currentFeature = FEATURES.find((f) => f.id === activeFeature) || FEATURES[0];

  // Spaced date labels along the X-axis
  const dateTicks = [
    { date: '2026-09-30', x: 65, anchor: 'start' as const },
    { date: '2026-10-03', x: 235, anchor: 'middle' as const },
    { date: '2026-10-07', x: 461.7, anchor: 'middle' as const },
    { date: '2026-10-10', x: 631.7, anchor: 'middle' as const },
    { date: '2026-10-13', x: 745, anchor: 'end' as const },
  ];

  const yPositions = [18, 70, 122, 174, 225];

  return (
    <div
      ref={containerRef}
      className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 text-slate-900 relative"
    >
      {/* Top Metric Header & Interactive Feature Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-900 font-sans mb-1">
            {currentFeature.metricTitle}
          </p>
          <p className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight font-sans">
            {currentFeature.totalValue}{' '}
            <span className="text-sm sm:text-base font-semibold text-slate-400 font-sans ml-1">
              {currentFeature.unit} total
            </span>
          </p>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-sans">
            across <span className="font-bold text-slate-700">15</span> trips
          </p>
        </div>

        {/* Feature Switcher Tabs - Fixed equal width columns with whitespace-nowrap to eliminate any resizing */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/70 w-full sm:w-[380px] shrink-0 self-start">
          {FEATURES.map((feat) => {
            const isActive = activeFeature === feat.id;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveFeature(feat.id)}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap text-center ${
                  isActive
                    ? feat.id === 'fuel'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : feat.id === 'distance'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {feat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full">
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

            {/* Teal Gradient for Fuel Requested */}
            <linearGradient id="chartReqGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity="0.22" />
              <stop offset="95%" stopColor="#0d9488" stopOpacity="0.0" />
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
          <motion.path
            key={`area-${activeFeature}`}
            d={currentFeature.areaPath}
            fill={`url(#${currentFeature.gradientId})`}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.4, delay: 1.2 }}
          />

          {/* Animated Stroke Curve - draws line smoothly and noticeably slower */}
          <motion.path
            key={`stroke-${activeFeature}`}
            d={currentFeature.strokePath}
            fill="none"
            stroke={currentFeature.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Vertical Cursor Guide Rule at 2026-10-07 */}
          <line x1="461.7" y1="18" x2="461.7" y2="225" stroke="#94a3b8" strokeWidth="1" />

          {/* Active Marker Dot at 2026-10-07 */}
          <motion.circle
            key={`circle-${activeFeature}`}
            cx="461.7"
            cy={currentFeature.activePointY}
            r="4.5"
            fill={currentFeature.color}
            stroke="#ffffff"
            strokeWidth="2.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ delay: 1.8, duration: 0.4 }}
          />

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
        </svg>

        {/* Floating Tooltip Card matching CustomTooltip in FuelChart / DistanceChart */}
        <div className="absolute top-1 sm:top-2 right-1 sm:right-auto sm:left-[59%] z-20 bg-white/95 backdrop-blur-[2px] border border-slate-200/90 rounded-xl p-2.5 sm:p-3 shadow-lg text-[11px] sm:text-xs font-semibold text-slate-800 w-[180px] sm:w-[210px] pointer-events-none">
          <p className="text-slate-400 font-bold mb-1.5 pb-1 border-b border-slate-100 text-[11px] sm:text-xs font-sans">
            October 7, 2026
          </p>
          <div className="flex flex-col gap-1 mb-1.5">
            {/* Fuel Consumed */}
            <div
              className={`flex justify-between items-center -mx-1 px-1.5 py-0.5 rounded text-[10.5px] sm:text-[11px] font-sans ${
                activeFeature === 'fuel' ? 'bg-emerald-50 text-emerald-800 font-bold' : ''
              }`}
            >
              <span
                className={
                  activeFeature === 'fuel' ? 'text-emerald-700 font-semibold' : 'text-slate-500 font-medium'
                }
              >
                Fuel Consumed:
              </span>
              <span
                className={`font-bold ${
                  activeFeature === 'fuel' ? 'text-emerald-600 font-black' : 'text-slate-700'
                }`}
              >
                39.8 L
              </span>
            </div>

            {/* Distance Covered */}
            <div
              className={`flex justify-between items-center -mx-1 px-1.5 py-0.5 rounded text-[10.5px] sm:text-[11px] font-sans ${
                activeFeature === 'distance' ? 'bg-blue-50 text-blue-800 font-bold' : ''
              }`}
            >
              <span
                className={
                  activeFeature === 'distance' ? 'text-blue-700 font-semibold' : 'text-slate-500 font-medium'
                }
              >
                Distance Covered:
              </span>
              <span
                className={`font-bold ${
                  activeFeature === 'distance' ? 'text-blue-600 font-black' : 'text-slate-700'
                }`}
              >
                107.4 km
              </span>
            </div>

            {/* Fuel Requested */}
            <div
              className={`flex justify-between items-center -mx-1 px-1.5 py-0.5 rounded text-[10.5px] sm:text-[11px] font-sans ${
                activeFeature === 'requested' ? 'bg-teal-50 text-teal-800 font-bold' : ''
              }`}
            >
              <span
                className={
                  activeFeature === 'requested' ? 'text-teal-700 font-semibold' : 'text-slate-500 font-medium'
                }
              >
                Fuel Requested:
              </span>
              <span
                className={`font-bold ${
                  activeFeature === 'requested' ? 'text-teal-600 font-black' : 'text-slate-700'
                }`}
              >
                43.8 L
              </span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 font-sans">
            <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
              Vehicles Used
            </span>
            <div className="flex flex-wrap gap-1">
              <span className="bg-slate-100 text-slate-900 font-medium px-1.5 py-0.5 rounded text-[10px] sm:text-[10.5px] truncate max-w-full">
                Scania R500 Heavy Prime Mover
              </span>
            </div>
          </div>
          <div className="mt-1 pt-1 border-t border-slate-100 font-sans">
            <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
              Drivers
            </span>
            <div className="flex flex-wrap gap-1">
              <span className="bg-slate-100 text-slate-900 font-medium px-1.5 py-0.5 rounded text-[10px] sm:text-[10.5px]">
                Assigned Driver
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
