import React from 'react';

export default function LandingAnalyticsChart() {
  // Fewer, spaced dates so labels never crowd or overlap
  const dateTicks = [
    { date: '2026-09-30', x: 65, anchor: 'start' as const },
    { date: '2026-10-03', x: 235, anchor: 'middle' as const },
    { date: '2026-10-07', x: 461.7, anchor: 'middle' as const },
    { date: '2026-10-10', x: 631.7, anchor: 'middle' as const },
    { date: '2026-10-13', x: 745, anchor: 'end' as const },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 text-slate-900 relative">
      {/* Top Metric Header matching DistanceChart.tsx / FuelChart.tsx */}
      <div className="mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-900 font-sans mb-1">
          DISTANCE COVERED
        </p>
        <p className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight font-sans">
          1345.10 <span className="text-sm sm:text-base font-semibold text-slate-400 font-sans ml-1">km total</span>
        </p>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-sans">
          across <span className="font-bold text-slate-700">15</span> trips
        </p>
      </div>

      {/* Chart Canvas — 100% width, naturally fitting card dimensions without overflow scrollbars */}
      <div className="relative w-full">
        <svg
          className="w-full h-auto block"
          viewBox="0 0 760 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="chartDistGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity="0.22" />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Dashed Grid Lines & Y-Axis Labels */}
          {/* 260 km */}
          <line x1="65" y1="18" x2="745" y2="18" stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x="52" y="22" textAnchor="end" fill="#64748b" fontSize="11" fontWeight="600" fontFamily="sans-serif">260 km</text>

          {/* 195 km */}
          <line x1="65" y1="70" x2="745" y2="70" stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x="52" y="74" textAnchor="end" fill="#64748b" fontSize="11" fontWeight="600" fontFamily="sans-serif">195 km</text>

          {/* 130 km */}
          <line x1="65" y1="122" x2="745" y2="122" stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x="52" y="126" textAnchor="end" fill="#64748b" fontSize="11" fontWeight="600" fontFamily="sans-serif">130 km</text>

          {/* 65 km */}
          <line x1="65" y1="174" x2="745" y2="174" stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x="52" y="178" textAnchor="end" fill="#64748b" fontSize="11" fontWeight="600" fontFamily="sans-serif">65 km</text>

          {/* 0 km */}
          <line x1="65" y1="225" x2="745" y2="225" stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x="52" y="228" textAnchor="end" fill="#64748b" fontSize="11" fontWeight="600" fontFamily="sans-serif">0 km</text>

          {/* Vertical Dotted Grid Lines matching date columns */}
          {[65, 235, 461.7, 631.7, 745].map((x) => (
            <line key={x} x1={x} y1="18" x2={x} y2="225" stroke="#f1f5f9" strokeDasharray="3 3" />
          ))}

          {/* Smooth Area Wave Gradient Fill */}
          <path
            d="M 65 167 
               C 90 140, 105 138, 121.7 140 
               C 145 142, 160 174, 178.3 175 
               C 198 176, 215 45, 235 30 
               C 255 15, 275 205, 291.7 212 
               C 310 219, 330 198, 348.3 189 
               C 370 178, 385 168, 405 160 
               C 425 152, 445 142, 461.7 138 
               C 485 132, 500 125, 518.3 116 
               C 540 105, 555 90, 575 80 
               C 595 70, 615 22, 631.7 17 
               C 650 12, 670 200, 688.3 210 
               C 705 218, 725 180, 745 164 
               L 745 225 L 65 225 Z"
            fill="url(#chartDistGradient)"
          />

          {/* Smooth Blue Stroke Curve */}
          <path
            d="M 65 167 
               C 90 140, 105 138, 121.7 140 
               C 145 142, 160 174, 178.3 175 
               C 198 176, 215 45, 235 30 
               C 255 15, 275 205, 291.7 212 
               C 310 219, 330 198, 348.3 189 
               C 370 178, 385 168, 405 160 
               C 425 152, 445 142, 461.7 138 
               C 485 132, 500 125, 518.3 116 
               C 540 105, 555 90, 575 80 
               C 595 70, 615 22, 631.7 17 
               C 650 12, 670 200, 688.3 210 
               C 705 218, 725 180, 745 164"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Vertical Cursor Guide Rule at 2026-10-07 */}
          <line x1="461.7" y1="18" x2="461.7" y2="225" stroke="#94a3b8" strokeWidth="1" />

          {/* Active Marker Dot at 2026-10-07 */}
          <circle cx="461.7" cy="138" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2.5" />

          {/* Clean Spaced X-Axis Dates — Reduced count so they never collide */}
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

        {/* Floating Tooltip Card matching CustomTooltip in DistanceChart.tsx / FuelChart.tsx */}
        <div className="absolute top-1 sm:top-2 right-1 sm:right-auto sm:left-[59%] z-20 bg-white/95 backdrop-blur-[2px] border border-slate-200/90 rounded-xl p-2.5 sm:p-3 shadow-lg text-[11px] sm:text-xs font-semibold text-slate-800 w-[180px] sm:w-[210px] pointer-events-none">
          <p className="text-slate-400 font-bold mb-1.5 pb-1 border-b border-slate-100 text-[11px] sm:text-xs font-sans">
            October 7, 2026
          </p>
          <div className="flex flex-col gap-1 mb-1.5">
            <div className="flex justify-between items-center bg-blue-50/70 -mx-1 px-1.5 py-0.5 rounded text-[10.5px] sm:text-[11px] font-sans">
              <span className="text-slate-500 font-medium">Distance Covered:</span>
              <span className="font-bold text-blue-600">107.4 km</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px] sm:text-[11px] py-0.5 px-0.5 font-sans">
              <span className="text-slate-500 font-medium">Fuel Consumed:</span>
              <span className="font-bold text-slate-700">39.8 L</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px] sm:text-[11px] py-0.5 px-0.5 font-sans">
              <span className="text-slate-500 font-medium">Fuel Requested:</span>
              <span className="font-bold text-slate-700">43.8 L</span>
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
