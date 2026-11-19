import React from 'react';
import {
  CheckCircle2,
  Check,
  Navigation,
  Lock,
  MapPin,
  Clock,
  Truck,
  ArrowRight,
  Route,
  BarChart2,
  History,
  Warehouse,
  User,
  LogOut,
} from 'lucide-react';

function MiniPhoneFrame({
  driver,
  offsetClass,
  children,
}: {
  driver: string;
  offsetClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col items-center ${offsetClass} transition-transform duration-200 hover:-translate-y-1`}>
      <div className="relative w-[174px] bg-slate-950 rounded-[24px] p-[5px] border border-slate-800 shadow-[0_14px_30px_-8px_rgba(15,23,42,0.18)]">
        {/* Corner Synced Badge */}
        <div className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-emerald-100 text-emerald-700">
          <Check className="w-3.5 h-3.5 stroke-[2.8]" />
        </div>

        {/* Dynamic Island */}
        <div className="w-12 h-2 bg-slate-900 rounded-full mx-auto mb-1" />

        {/* Crisp Native DOM Display (#f6f8fc matching real driver app, axis-aligned for razor-sharp text) */}
        <div className="bg-[#f6f8fc] rounded-[18px] overflow-hidden h-[196px] flex flex-col select-none antialiased">
          {children}
        </div>
      </div>

      <span className="mt-2.5 text-xs font-semibold text-slate-500 tracking-tight">
        {driver}
      </span>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-16 bg-[#f8fafc] border-t border-slate-300 py-20 sm:py-28 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Clean Centered Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-950 tracking-[-0.035em] leading-[1.08]">
            An app on their phone.{' '}
            <span className="text-[#059669]">A tab in your browser.</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Skip GPS boxes, truck wiring, and downtime. Drivers install the TripSync app on the phone they already carry—your admin opens a browser tab and sees the whole fleet live.
          </p>
        </div>

        {/* Razor-Sharp Hub-and-Spoke Stage (Pure Vector Arcs + Axis-Aligned DOM Cards) */}
        <div className="mt-12 sm:mt-16 relative max-w-[1100px] mx-auto">
          {/* Desktop Pure-Vector Connector Arcs Behind Cards */}
          <svg
            viewBox="0 0 1100 520"
            shapeRendering="geometricPrecision"
            className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none select-none z-0"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="hub-ambient" cx="50%" cy="50%" r="45%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.07" />
                <stop offset="55%" stopColor="#059669" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
              </radialGradient>
            </defs>

            <ellipse cx="550" cy="260" rx="350" ry="190" fill="url(#hub-ambient)" />

            {/* 4 Curved Dashed Telemetry Arcs */}
            <g
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.6"
              strokeDasharray="5 6"
              strokeOpacity="0.55"
            >
              <path id="dom-arc-tl" d="M 196 130 C 254 126, 274 170, 306 202" />
              <path id="dom-arc-bl" d="M 218 386 C 260 386, 280 342, 306 312" />
              <path id="dom-arc-tr" d="M 904 130 C 846 126, 826 170, 794 202" />
              <path id="dom-arc-br" d="M 882 386 C 840 386, 820 342, 794 312" />
            </g>

            {/* Animated Live Telemetry Pulses */}
            <circle r="4" fill="#059669">
              <animateMotion dur="2.3s" repeatCount="indefinite">
                <mpath href="#dom-arc-tl" />
              </animateMotion>
            </circle>
            <circle r="4" fill="#2563eb">
              <animateMotion dur="2.6s" begin="0.6s" repeatCount="indefinite">
                <mpath href="#dom-arc-bl" />
              </animateMotion>
            </circle>
            <circle r="4" fill="#059669">
              <animateMotion dur="2.4s" begin="0.3s" repeatCount="indefinite">
                <mpath href="#dom-arc-tr" />
              </animateMotion>
            </circle>
            <circle r="4" fill="#2563eb">
              <animateMotion dur="2.2s" begin="0.9s" repeatCount="indefinite">
                <mpath href="#dom-arc-br" />
              </animateMotion>
            </circle>
          </svg>

          {/* 3-Column Orbit Layout: Staggered Left Phones | Center Browser | Staggered Right Phones */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            {/* LEFT ORBIT: 2 Real TripSync Driver App Screens */}
            <div className="lg:col-span-3 flex flex-row lg:flex-col items-center justify-center gap-5 sm:gap-8 lg:gap-7">
              {/* Phone 1: Trip in Progress */}
              <MiniPhoneFrame driver="Juan · Android" offsetClass="lg:-translate-x-4">
                <div className="bg-white border-b border-slate-100 px-3 py-1.5">
                  <span className="text-[10px] font-bold text-slate-900 tracking-tight">
                    Trip in Progress
                  </span>
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between text-center">
                  <div>
                    <div className="text-xl font-black text-slate-900 font-mono leading-none">
                      00:42
                    </div>
                    <div className="text-[8px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                      LEG 1 TIME
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-extrabold text-slate-900">
                      System Running
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Moving to: Batangas Port
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200/90 px-2 py-1.5 text-left flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[7.5px] font-bold text-slate-400 uppercase leading-none">
                        NEXT STOP
                      </div>
                      <div className="text-[9px] font-bold text-slate-800 truncate mt-0.5">
                        Batangas Port, Pier 2
                      </div>
                    </div>
                  </div>

                  <div className="rounded-full bg-[#e0f2fe] border border-sky-300 p-0.5 flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[8.5px] font-bold text-blue-800 truncate">
                      Swipe to Finish Trip
                    </span>
                  </div>
                </div>
              </MiniPhoneFrame>

              {/* Phone 2: Assigned Trips */}
              <MiniPhoneFrame driver="Carlo · iOS" offsetClass="lg:translate-x-4">
                <div className="p-2.5 flex-1 flex flex-col">
                  <span className="text-[11px] font-extrabold text-slate-900 mb-1.5">
                    Assigned Trips
                  </span>

                  <div className="bg-white rounded-xl border border-sky-300 p-2 shadow-2xs flex-1 flex flex-col justify-between">
                    <span className="self-start px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 text-[8px] font-extrabold uppercase tracking-wider">
                      NEXT UP
                    </span>

                    <div className="space-y-1.5 pl-3 relative my-1">
                      <div className="absolute left-[3.5px] top-1 bottom-1 w-[1.5px] bg-slate-200" />
                      <div className="relative flex items-center">
                        <span className="absolute -left-3 w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-bold text-slate-800 truncate">
                          SMC, Bulacan
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <MapPin className="absolute -left-[13px] w-2.5 h-2.5 text-rose-500" />
                        <span className="text-[9px] font-bold text-slate-800 truncate">
                          Calamba, Laguna
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[8px] font-bold">
                        <Clock className="w-2.5 h-2.5" />
                        35.1 km
                      </div>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 text-[8px] font-bold truncate">
                        <Truck className="w-2.5 h-2.5 shrink-0" />
                        BOOMTRUCK &middot; ABK 9352
                      </div>
                    </div>
                  </div>
                </div>
              </MiniPhoneFrame>
            </div>

            {/* CENTER HUB: Authentic TripSync Web App Browser Window (Sidebar + Active Drivers Map) */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-white border border-slate-200/90 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.16)] overflow-hidden">
                {/* Browser Top Bar */}
                <div className="bg-slate-100 border-b border-slate-200 px-3.5 py-2 flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  </div>
                  <div className="flex-1 bg-white border border-slate-200/90 rounded-md px-2.5 py-1 flex items-center gap-1.5 text-[10.5px] text-slate-500 font-mono truncate">
                    <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">app.tripsync.ph/auth/active-drivers</span>
                  </div>
                </div>

                {/* Real TripSync App Shell: Left Sidebar + Main Page */}
                <div className="flex min-h-[312px] bg-[#f8f9ff]">
                  {/* Left Sidebar (Matches components/ui/Sidebar/Sidebar.tsx) */}
                  <aside className="hidden sm:flex w-[116px] shrink-0 bg-slate-100 border-r border-slate-200 py-3 px-1.5 flex-col justify-between select-none">
                    <div className="space-y-0.5">
                      {[
                        { label: 'Active Drivers', icon: Navigation, active: true },
                        { label: 'Plan Trip', icon: Route, active: false },
                        { label: 'Analytics', icon: BarChart2, active: false },
                        { label: 'Locations', icon: MapPin, active: false },
                        { label: 'Trip History', icon: History, active: false },
                        { label: 'View Vehicles', icon: Warehouse, active: false },
                        { label: 'View Drivers', icon: User, active: false },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.label}
                            className={`px-2 py-1.5 rounded-full flex items-center gap-1.5 text-[9.5px] tracking-tight ${
                              item.active
                                ? 'bg-emerald-100/80 text-emerald-800 font-bold'
                                : 'text-slate-500 font-medium'
                            }`}
                          >
                            <Icon
                              className={`w-3 h-3 shrink-0 ${
                                item.active ? 'text-emerald-800' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="px-2 pt-2 border-t border-slate-200/70 flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
                      <LogOut className="w-3 h-3 shrink-0" />
                      <span>Sign Out</span>
                    </div>
                  </aside>

                  {/* Right Main Workspace */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    {/* Page Header Bar */}
                    <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          Active Drivers Map
                        </h3>
                        <p className="text-[9.5px] text-slate-500 truncate mt-0.5">
                          Real-time locations of all currently active trips.
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-semibold text-[10px] border border-blue-100 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        4 Online
                      </div>
                    </div>

                    {/* Map + Driver Roster Split */}
                    <div className="p-3 flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      {/* Carto-style Light Map */}
                      <div className="sm:col-span-7 h-52 sm:h-auto rounded-xl bg-[#eef2f6] border border-slate-200 relative overflow-hidden">
                        <svg
                          viewBox="0 0 280 220"
                          shapeRendering="geometricPrecision"
                          className="w-full h-full"
                          aria-hidden="true"
                        >
                          <rect x="14" y="14" width="72" height="48" rx="4" fill="#e2e8f0" fillOpacity="0.55" />
                          <rect x="102" y="14" width="84" height="40" rx="4" fill="#e2e8f0" fillOpacity="0.45" />
                          <rect x="202" y="16" width="64" height="62" rx="4" fill="#dbeafe" fillOpacity="0.45" />
                          <rect x="16" y="80" width="66" height="58" rx="4" fill="#e2e8f0" fillOpacity="0.5" />
                          <rect x="98" y="72" width="88" height="66" rx="4" fill="#e2e8f0" fillOpacity="0.4" />
                          <rect x="202" y="96" width="62" height="52" rx="4" fill="#e2e8f0" fillOpacity="0.5" />
                          <rect x="22" y="156" width="104" height="48" rx="4" fill="#e2e8f0" fillOpacity="0.45" />
                          <rect x="144" y="160" width="118" height="44" rx="4" fill="#e2e8f0" fillOpacity="0.5" />

                          <path d="M 0 68 L 280 60" stroke="#ffffff" strokeWidth="6.5" />
                          <path d="M 0 146 L 280 152" stroke="#ffffff" strokeWidth="5.5" />
                          <path d="M 92 0 L 88 220" stroke="#ffffff" strokeWidth="6.5" />
                          <path d="M 194 0 L 200 220" stroke="#ffffff" strokeWidth="5.5" />

                          <path
                            d="M 28 64 C 82 64, 102 88, 146 104 S 204 94, 246 64"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <path
                            d="M 48 182 C 94 166, 130 148, 194 152"
                            fill="none"
                            stroke="#059669"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray="5 4"
                          />
                        </svg>

                        {/* Crisp Native HTML Map Pins */}
                        <div className="absolute left-[52%] top-[44%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <span className="bg-slate-950 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap mb-1">
                            Juan &middot; 64 km/h
                          </span>
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-500/20 shadow-sm" />
                        </div>

                        <div className="absolute left-[72%] top-[69%] -translate-x-1/2 -translate-y-1/2">
                          <span className="block w-3 h-3 rounded-full bg-emerald-600 border-2 border-white shadow-sm" />
                        </div>

                        <div className="absolute left-[25%] top-[74%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <span className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white ring-4 ring-amber-500/25 shadow-sm mb-1" />
                          <span className="bg-amber-50 text-amber-900 border border-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                            Stop &middot; 12m
                          </span>
                        </div>
                      </div>

                      {/* Driver Roster Sidebar */}
                      <div className="sm:col-span-5 bg-white rounded-xl border border-slate-200 p-2 flex flex-col justify-between">
                        <div>
                          <h4 className="text-[10.5px] font-bold text-slate-800 mb-1.5">
                            Driver Roster
                          </h4>

                          <div className="space-y-1.5">
                            <div className="p-1.5 rounded-lg bg-blue-50/80 border border-blue-300 flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                J
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-900 truncate leading-tight">
                                  Juan Dela Cruz
                                </p>
                                <p className="text-[9px] font-semibold text-emerald-700 leading-tight mt-0.5">
                                  64 km/h
                                </p>
                              </div>
                            </div>

                            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                C
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-900 truncate leading-tight">
                                  Carlo Reyes
                                </p>
                                <p className="text-[9px] text-slate-500 truncate leading-tight mt-0.5">
                                  Laguna
                                </p>
                              </div>
                            </div>

                            <div className="p-1.5 rounded-lg bg-amber-50/80 border border-amber-200 flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-amber-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                A
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-900 truncate leading-tight">
                                  Arnel Mendoza
                                </p>
                                <p className="text-[9px] font-semibold text-amber-800 leading-tight mt-0.5">
                                  Stop &middot; 12m
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-1.5 mt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] font-medium text-slate-400">
                          <span>Web App</span>
                          <span className="text-emerald-600 font-semibold">Live</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT ORBIT: 2 Real TripSync Driver App Screens */}
            <div className="lg:col-span-3 flex flex-row lg:flex-col items-center justify-center gap-5 sm:gap-8 lg:gap-7">
              {/* Phone 3: Trip Assigned */}
              <MiniPhoneFrame driver="Arnel · Android" offsetClass="lg:translate-x-4">
                <div className="bg-white border-b border-slate-100 px-3 py-1.5">
                  <span className="text-[10px] font-bold text-slate-900 tracking-tight">
                    Trip Assigned
                  </span>
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full border border-emerald-400 bg-white text-emerald-700 text-[8px] font-bold">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    Trip Assigned to You
                  </div>

                  {/* Route Card */}
                  <div className="bg-white rounded-lg border border-slate-200/90 p-1.5 space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <span className="w-2 h-2 rounded-full border-2 border-blue-600 bg-white shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-[7.5px] font-bold text-slate-400 uppercase leading-none">
                          Pickup
                        </div>
                        <div className="text-[8.5px] font-bold text-slate-800 truncate">
                          SMC, Bulacan
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[7.5px] font-bold text-slate-400 uppercase leading-none">
                          Dropoff
                        </div>
                        <div className="text-[8.5px] font-bold text-slate-800 truncate">
                          Baliwag, Bulacan
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Truck ID */}
                  <div className="bg-white rounded-lg border border-slate-200/90 px-2 py-1 flex items-center gap-1.5">
                    <Truck className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="text-[8.5px] font-bold text-slate-800">Truck ID: BT1</span>
                  </div>

                  {/* Swipe to Accept */}
                  <div className="rounded-full bg-[#dcfce7] border border-emerald-300 p-0.5 flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[8.5px] font-bold text-emerald-800 truncate">
                      Swipe to Accept
                    </span>
                  </div>
                </div>
              </MiniPhoneFrame>

              {/* Phone 4: Trip in Progress Leg 2 */}
              <MiniPhoneFrame driver="Marco · iOS" offsetClass="lg:-translate-x-4">
                <div className="bg-white border-b border-slate-100 px-3 py-1.5">
                  <span className="text-[10px] font-bold text-slate-900 tracking-tight">
                    Trip in Progress
                  </span>
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between text-center">
                  <div>
                    <div className="text-xl font-black text-slate-900 font-mono leading-none">
                      01:15
                    </div>
                    <div className="text-[8px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                      LEG 2 TIME
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-extrabold text-slate-900">
                      System Running
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Moving to: Baliwag, Bulacan
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200/90 px-2 py-1.5 text-left flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[7.5px] font-bold text-slate-400 uppercase leading-none">
                        NEXT STOP
                      </div>
                      <div className="text-[9px] font-bold text-slate-800 truncate mt-0.5">
                        Golden Gate, Baliwag
                      </div>
                    </div>
                  </div>

                  <div className="rounded-full bg-[#e0f2fe] border border-sky-300 p-0.5 flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[8.5px] font-bold text-blue-800 truncate">
                      Swipe to Finish Trip
                    </span>
                  </div>
                </div>
              </MiniPhoneFrame>
            </div>
          </div>
        </div>

        {/* Clean Bottom Proof Strip */}
        <div className="mt-10 pt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm font-medium text-slate-600">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            0 hardware boxes or truck wiring
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Runs on drivers&apos; existing Android or iOS phones
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Nothing to install at the office—just open a browser
          </span>
        </div>
      </div>
    </section>
  );
}
