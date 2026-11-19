import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
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
  Search,
  Wifi,
  BatteryFull,
} from 'lucide-react';

const TrackDriversMiniMap = dynamic(
  () => import('@/components/landing/TrackDriversMiniMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[240px] rounded-xl bg-slate-100 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    ),
  }
);

const ROSTER_DRIVERS = [
  {
    id: 'juan',
    initial: 'J',
    name: 'Juan Dela Cruz',
    sub: 'Active · 62 km/h',
    battery: '92%',
    avatarBg: 'bg-blue-600',
    statusColor: 'text-emerald-700',
    batteryStyle: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'ramon',
    initial: 'R',
    name: 'Ramon Santos',
    sub: 'Manila → Laguna',
    battery: '84%',
    avatarBg: 'bg-emerald-600',
    statusColor: 'text-slate-500',
    batteryStyle: 'text-slate-600 bg-white border-slate-200',
  },
  {
    id: 'arnel',
    initial: 'A',
    name: 'Arnel Mendoza',
    sub: 'Offline · 0 km/h',
    battery: '18%',
    avatarBg: 'bg-slate-500',
    statusColor: 'text-slate-500',
    batteryStyle: 'text-rose-700 bg-rose-50 border-rose-200',
  },
];

function MiniPhoneFrame({
  driver,
  offsetClass,
  statusBg = 'bg-white',
  children,
}: {
  driver: string;
  offsetClass: string;
  statusBg?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col items-center ${offsetClass} transition-transform duration-200 hover:-translate-y-1`}>
      {/* True Smartphone Aspect Ratio Chassis (Slim & Tall) */}
      <div className="relative w-[170px] rounded-[30px] p-[5px] bg-gradient-to-b from-slate-800 via-slate-950 to-slate-900 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.32),0_4px_12px_rgba(15,23,42,0.12)] ring-1 ring-slate-950/20">
        {/* Subtle Hardware Side Buttons */}
        <span className="absolute -left-[2.5px] top-14 w-[2.5px] h-5 rounded-l bg-slate-700" aria-hidden="true" />
        <span className="absolute -left-[2.5px] top-22 w-[2.5px] h-7 rounded-l bg-slate-700" aria-hidden="true" />
        <span className="absolute -right-[2.5px] top-18 w-[2.5px] h-8 rounded-r bg-slate-700" aria-hidden="true" />

        {/* Corner Synced Badge */}
        <div className="absolute -top-2 -right-2 z-20 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-emerald-500 text-white">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>

        {/* Edge-to-Edge Inner Display (Tall 160x264 smartphone ratio) */}
        <div className="bg-[#f6f8fc] rounded-[25px] overflow-hidden h-[264px] flex flex-col select-none antialiased relative ring-1 ring-inset ring-black/5">
          {/* Realistic In-Screen Status Bar + Dynamic Island */}
          <div className={`${statusBg} px-3.5 pt-2 pb-1 flex items-center justify-between shrink-0`}>
            <span className="text-[8.5px] font-bold text-slate-800 tabular-nums">9:41</span>
            <div className="w-10 h-2.5 rounded-full bg-slate-950" />
            <div className="flex items-center gap-1 text-slate-700">
              <Wifi className="w-2.5 h-2.5" />
              <BatteryFull className="w-3 h-3 text-emerald-600" />
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {children}
          </div>

          {/* Bottom Home Indicator Pill */}
          <div className="py-1.5 bg-[#f6f8fc] flex justify-center shrink-0">
            <div className="w-11 h-1 rounded-full bg-slate-300/90" />
          </div>
        </div>
      </div>

      <span className="mt-2.5 text-xs font-semibold text-slate-600 tracking-tight">
        {driver}
      </span>
    </div>
  );
}

export default function HowItWorksSection() {
  const [selectedDriverId, setSelectedDriverId] = useState('juan');
  const handleSelectDriver = useCallback((id: string) => setSelectedDriverId(id), []);

  return (
    <section
      id="how-it-works"
      className="scroll-mt-16 bg-[#e8eef5] border-t border-slate-300/80 py-20 sm:py-28 relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
        {/* Clean Centered Header + Bulleted List */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-950 tracking-[-0.035em] leading-[1.08]">
            An app on their phone.{' '}
            <span className="text-[#059669]">A tab in your browser.</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Skip GPS boxes, truck wiring, and downtime. Drivers install the TripSync app on the phone they already carry—your admin opens a browser tab and sees the whole fleet live.
          </p>

          {/* Bulleted Key Points right below the subheading */}
          <ul className="mt-5 inline-flex flex-col items-start gap-2 text-left text-xs sm:text-sm font-medium text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>0 hardware boxes or truck wiring</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Runs on drivers&apos; existing Android phones</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Nothing to install at the office—just open a browser</span>
            </li>
          </ul>
        </div>

        {/* Razor-Sharp Hub-and-Spoke Stage */}
        <div className="mt-12 sm:mt-16 relative max-w-[1340px] mx-auto">
          {/* Desktop Pure-Vector Connector Arcs Behind Cards */}
          <svg
            viewBox="0 0 1340 660"
            shapeRendering="geometricPrecision"
            className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none select-none z-0"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="hub-ambient" cx="50%" cy="50%" r="46%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.09" />
                <stop offset="55%" stopColor="#059669" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#e8eef5" stopOpacity="0" />
              </radialGradient>
            </defs>

            <ellipse cx="670" cy="330" rx="430" ry="230" fill="url(#hub-ambient)" />

            {/* 4 Curved Dashed Telemetry Arcs spanning the open channel */}
            <g
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.75"
              strokeDasharray="5 6"
              strokeOpacity="0.7"
            >
              <path id="dom-arc-tl" d="M 184 162 C 232 162, 250 214, 286 254" />
              <path id="dom-arc-bl" d="M 196 496 C 236 492, 254 440, 286 404" />
              <path id="dom-arc-tr" d="M 1156 162 C 1108 162, 1090 214, 1054 254" />
              <path id="dom-arc-br" d="M 1144 496 C 1104 492, 1086 440, 1054 404" />
            </g>

            {/* Animated Live Telemetry Pulses */}
            <circle r="4.2" fill="#059669">
              <animateMotion dur="2.3s" repeatCount="indefinite">
                <mpath href="#dom-arc-tl" />
              </animateMotion>
            </circle>
            <circle r="4.2" fill="#2563eb">
              <animateMotion dur="2.6s" begin="0.6s" repeatCount="indefinite">
                <mpath href="#dom-arc-bl" />
              </animateMotion>
            </circle>
            <circle r="4.2" fill="#059669">
              <animateMotion dur="2.4s" begin="0.3s" repeatCount="indefinite">
                <mpath href="#dom-arc-tr" />
              </animateMotion>
            </circle>
            <circle r="4.2" fill="#2563eb">
              <animateMotion dur="2.2s" begin="0.9s" repeatCount="indefinite">
                <mpath href="#dom-arc-br" />
              </animateMotion>
            </circle>
          </svg>

          {/* 3-Column Orbit Layout: Left Phones | Generous Arc Channel | Center Browser | Right Phones */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[192px_1fr_192px] gap-8 lg:gap-16 xl:gap-20 items-center">
            {/* LEFT ORBIT: 2 Real TripSync Driver App Screens */}
            <div className="flex flex-row lg:flex-col items-center justify-center gap-5 sm:gap-8 lg:gap-7">
              {/* Phone 1: Trip in Progress */}
              <MiniPhoneFrame driver="Juan · Android" offsetClass="lg:-translate-x-2" statusBg="bg-white">
                <div className="bg-white border-b border-slate-100 px-3 py-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-slate-900 tracking-tight">
                    Trip in Progress
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between text-center">
                  <div className="pt-2">
                    <div className="text-[26px] font-black text-slate-900 font-mono leading-none tracking-tight">
                      00:42
                    </div>
                    <div className="text-[7.5px] font-extrabold tracking-widest text-slate-400 uppercase mt-1.5">
                      LEG 1 TIME
                    </div>
                  </div>

                  <div className="py-1">
                    <div className="text-xs font-extrabold text-slate-900">
                      System Running
                    </div>
                    <div className="text-[9px] text-slate-500 leading-snug mt-0.5 truncate">
                      Moving to: Batangas Port
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200/90 p-2 text-left flex items-start gap-1.5 shadow-2xs">
                    <MapPin className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                        NEXT STOP
                      </div>
                      <div className="text-[9px] font-bold text-slate-800 truncate mt-1">
                        Batangas Port, Pier 2
                      </div>
                    </div>
                  </div>

                  <div className="rounded-full bg-[#e0f2fe] border border-sky-300 p-0.5 flex items-center gap-1.5">
                    <div className="w-4.5 h-4.5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[8.5px] font-bold text-blue-800 truncate">
                      Swipe to Finish Trip
                    </span>
                  </div>
                </div>
              </MiniPhoneFrame>

              {/* Phone 2: Assigned Trips (No extra white bar — matches CoreTelemetrySection) */}
              <MiniPhoneFrame driver="Carlo · Android" offsetClass="lg:translate-x-2" statusBg="bg-[#f6f8fc]">
                <div className="px-3 pt-1 pb-2 flex-1 flex flex-col gap-2">
                  <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                    Assigned Trips
                  </span>

                  {/* Primary NEXT UP Card */}
                  <div className="bg-white rounded-2xl border-2 border-sky-300/80 p-2.5 shadow-xs space-y-2">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 text-[7.5px] font-extrabold uppercase tracking-wider">
                      NEXT UP
                    </span>

                    <div className="space-y-2 pl-3 relative">
                      <div className="absolute left-[3.5px] top-1 bottom-1 w-[1.5px] bg-slate-200" />
                      <div className="relative flex items-center">
                        <span className="absolute -left-3 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                        <span className="text-[9.5px] font-bold text-slate-800 truncate">
                          SMC, Bulacan
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <MapPin className="absolute -left-[13px] w-2.5 h-2.5 text-rose-500" />
                        <span className="text-[9.5px] font-bold text-slate-800 truncate">
                          Calamba, Laguna
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-0.5">
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[8px] font-bold">
                        <Clock className="w-2.5 h-2.5" />
                        Today · 35.1 km
                      </div>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[8px] font-bold truncate">
                        <Truck className="w-2.5 h-2.5 shrink-0" />
                        BOOMTRUCK &middot; ABK 9352
                      </div>
                    </div>
                  </div>

                  {/* Subtle Secondary Queued Trip Preview */}
                  <div className="bg-white/75 rounded-xl border border-slate-200/80 px-2.5 py-2 flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="block text-[7px] font-bold text-slate-400 uppercase">
                        Tomorrow · 8:00 AM
                      </span>
                      <span className="block text-[8.5px] font-bold text-slate-600 truncate mt-0.5">
                        Pasig &rarr; Cavite
                      </span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                  </div>
                </div>
              </MiniPhoneFrame>
            </div>

            {/* CENTER HUB: Large, Polished TripSync Web App Browser Window */}
            <div className="min-w-0">
              <div className="rounded-2xl bg-white border border-slate-300/80 ring-1 ring-slate-900/5 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.22),0_4px_14px_rgba(15,23,42,0.06)] overflow-hidden">
                {/* Browser Tab Strip */}
                <div className="bg-slate-200/80 border-b border-slate-200 px-4 pt-2.5 flex items-end gap-2.5">
                  <div className="flex items-center gap-1.5 pb-2.5 shrink-0">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56]/90 border border-black/10" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e]/90 border border-black/10" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f]/90 border border-black/10" />
                  </div>

                  {/* Active Browser Tab with TripSync Favicon */}
                  <div className="bg-white rounded-t-lg border-t border-x border-slate-300/70 px-3.5 py-2 flex items-center gap-2 text-xs font-semibold text-slate-800 shadow-2xs -mb-px">
                    <img
                      src="/logo-circle-light.png"
                      alt=""
                      className="w-4 h-4 rounded-full shrink-0"
                    />
                    <span className="truncate max-w-[200px]">TripSync — Active Drivers</span>
                  </div>
                </div>

                {/* Browser Address Bar */}
                <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                  <div className="flex-1 bg-slate-100/90 border border-slate-200/80 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs text-slate-600 font-mono truncate">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">app.tripsync.ph/auth/active-drivers</span>
                  </div>
                </div>

                {/* Real TripSync App Shell: Left Sidebar + Main Page */}
                <div className="flex min-h-[404px] bg-[#f8f9ff]">
                  {/* Left Sidebar */}
                  <aside className="hidden sm:flex w-[140px] shrink-0 bg-slate-100 border-r border-slate-200 py-3.5 px-2 flex-col justify-between select-none">
                    <div className="space-y-1">
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
                            className={`px-2.5 py-2 rounded-full flex items-center gap-2 text-[11px] tracking-tight ${
                              item.active
                                ? 'bg-emerald-100/80 text-emerald-800 font-bold'
                                : 'text-slate-500 font-medium'
                            }`}
                          >
                            <Icon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                item.active ? 'text-emerald-800' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="px-2.5 pt-3 border-t border-slate-200/80 flex items-center gap-2 text-[11px] font-medium text-slate-400">
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span>Sign Out</span>
                    </div>
                  </aside>

                  {/* Right Main Workspace */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    {/* Page Header Bar */}
                    <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-blue-600 shrink-0" />
                          Active Drivers Map
                        </h3>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Real-time locations of all currently active trips.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-semibold text-xs border border-blue-100 shrink-0">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        2 Online &bull; 3 Active
                      </div>
                    </div>

                    {/* Map + Driver Roster Split (Exact Live Replication of /auth/active-drivers) */}
                    <div className="p-3.5 flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                      {/* Live Interactive Leaflet Map */}
                      <div className="md:col-span-7 h-60 md:h-[316px] rounded-xl bg-slate-100 border border-slate-200/90 relative overflow-hidden">
                        <TrackDriversMiniMap
                          selectedDriverId={selectedDriverId}
                          onSelectDriver={handleSelectDriver}
                          randomizePositions
                        />
                      </div>

                      {/* Interactive Driver Roster Sidebar */}
                      <div className="md:col-span-5 bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-slate-800">
                              Driver Roster
                            </h4>
                            <span className="text-[10px] font-semibold text-slate-400">3 total</span>
                          </div>

                          <div className="relative mb-2.5">
                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <div className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-400">
                              Search driver...
                            </div>
                          </div>

                          <div className="space-y-2">
                            {ROSTER_DRIVERS.map((drv) => {
                              const isSelected = selectedDriverId === drv.id;
                              return (
                                <button
                                  key={drv.id}
                                  type="button"
                                  onClick={() => handleSelectDriver(drv.id)}
                                  className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-50/90 border-blue-300 ring-1 ring-blue-300/60 shadow-2xs'
                                      : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className={`w-7 h-7 rounded-full ${drv.avatarBg} text-white text-[11px] font-bold flex items-center justify-center shrink-0`}>
                                      {drv.initial}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                                        {drv.name}
                                      </p>
                                      <p className={`text-[10px] font-semibold truncate leading-tight mt-0.5 ${drv.statusColor}`}>
                                        {drv.sub}
                                      </p>
                                    </div>
                                  </div>
                                  <span className={`text-[9.5px] font-bold border px-1.5 py-0.5 rounded shrink-0 ${drv.batteryStyle}`}>
                                    {drv.battery}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-medium text-slate-400">
                          <span>Web App</span>
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Map
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT ORBIT: 2 Real TripSync Driver App Screens */}
            <div className="flex flex-row lg:flex-col items-center justify-center gap-5 sm:gap-8 lg:gap-7">
              {/* Phone 3: Trip Assigned */}
              <MiniPhoneFrame driver="Arnel · Android" offsetClass="lg:translate-x-2" statusBg="bg-white">
                <div className="bg-white border-b border-slate-100 px-3 py-1.5">
                  <span className="text-[10.5px] font-bold text-slate-900 tracking-tight">
                    Trip Assigned
                  </span>
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full border border-emerald-400 bg-white text-emerald-700 text-[8px] font-bold">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    Trip Assigned to You
                  </div>

                  {/* Route Card */}
                  <div>
                    <span className="block text-[8.5px] font-extrabold text-slate-900 mb-1">
                      Route
                    </span>
                    <div className="bg-white rounded-xl border border-slate-200/90 p-2 space-y-2 shadow-2xs relative">
                      <div className="absolute left-[11.5px] top-[14px] bottom-[14px] w-[1.5px] bg-slate-200" />
                      <div className="flex items-start gap-2 relative">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 bg-white shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-[7px] font-bold text-slate-400 uppercase leading-none">
                            Pickup
                          </div>
                          <div className="text-[9px] font-bold text-slate-800 truncate mt-0.5">
                            SMC, Bulacan
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 relative">
                        <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-[7px] font-bold text-slate-400 uppercase leading-none">
                            Dropoff
                          </div>
                          <div className="text-[9px] font-bold text-slate-800 truncate mt-0.5">
                            Baliwag, Bulacan
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Truck Details */}
                  <div className="bg-white rounded-xl border border-slate-200/90 px-2.5 py-1.5 flex items-center gap-2 shadow-2xs">
                    <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-[7px] font-bold text-slate-400 uppercase leading-none">
                        Truck ID
                      </div>
                      <div className="text-[9px] font-bold text-slate-800 leading-tight mt-0.5">
                        BT1
                      </div>
                    </div>
                  </div>

                  {/* Swipe to Accept */}
                  <div className="rounded-full bg-[#dcfce7] border border-emerald-300 p-0.5 flex items-center gap-1.5">
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[8.5px] font-bold text-emerald-800 truncate">
                      Swipe to Accept
                    </span>
                  </div>
                </div>
              </MiniPhoneFrame>

              {/* Phone 4: Trip in Progress Leg 2 */}
              <MiniPhoneFrame driver="Marco · Android" offsetClass="lg:-translate-x-2" statusBg="bg-white">
                <div className="bg-white border-b border-slate-100 px-3 py-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-slate-900 tracking-tight">
                    Trip in Progress
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between text-center">
                  <div className="pt-2">
                    <div className="text-[26px] font-black text-slate-900 font-mono leading-none tracking-tight">
                      01:15
                    </div>
                    <div className="text-[7.5px] font-extrabold tracking-widest text-slate-400 uppercase mt-1.5">
                      LEG 2 TIME
                    </div>
                  </div>

                  <div className="py-1">
                    <div className="text-xs font-extrabold text-slate-900">
                      System Running
                    </div>
                    <div className="text-[9px] text-slate-500 leading-snug mt-0.5 truncate">
                      Moving to: Baliwag, Bulacan
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200/90 p-2 text-left flex items-start gap-1.5 shadow-2xs">
                    <MapPin className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                        NEXT STOP
                      </div>
                      <div className="text-[9px] font-bold text-slate-800 truncate mt-1">
                        Golden Gate, Baliwag
                      </div>
                    </div>
                  </div>

                  <div className="rounded-full bg-[#e0f2fe] border border-sky-300 p-0.5 flex items-center gap-1.5">
                    <div className="w-4.5 h-4.5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
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
      </div>
    </section>
  );
}
