import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Ban, 
  Crosshair, 
  Fuel, 
  MapPin, 
  Calendar, 
  RotateCcw, 
  BarChart3, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert,
  Radio,
  Sliders,
  ChevronRight,
  ExternalLink,
  Navigation,
  Terminal,
  BatteryFull,
  BatteryWarning,
  Search,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import ContactModal from '@/components/landing/ContactModal';

// Dynamically load interactive hero map with SSR turned off
const LandingHeroMap = dynamic(() => import('@/components/landing/LandingHeroMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[460px] bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      <span className="text-xs font-mono text-slate-500">Initializing BGC &amp; Makati live fleet telemetry...</span>
    </div>
  ),
});

const LandingStoppageMap = dynamic(() => import('@/components/landing/LandingStoppageMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[260px] bg-slate-100 rounded-xl flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
    </div>
  ),
});

const LandingOfflineDriverMap = dynamic(() => import('@/components/landing/LandingOfflineDriverMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[260px] bg-slate-100 rounded-xl flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  ),
});

import LandingAnalyticsChart from '@/components/landing/LandingAnalyticsChart';

export default function LandingPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 selection:bg-slate-900 selection:text-white flex flex-col">
      <Head>
        <title>TripSync | Real-Time Fleet &amp; Fuel Telemetry</title>
        <meta 
          name="description" 
          content="Track your drivers and fuel consumption in a few clicks. Real-time highway tracking, automated dispatch scheduling, and instantaneous stoppage and GPS blackout alerts for modern freight fleets." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Top Navbar matching the mockup */}
      <header className="sticky top-0 z-40 bg-[#fafbfc]/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center p-1.5 shadow-2xs group-hover:border-slate-300 transition-all">
              <img 
                src="/logo-icon.png" 
                alt="TripSync Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-950 group-hover:text-slate-800 transition-colors">
              TripSync
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-8 text-sm font-medium text-slate-600">
            <a 
              href="#features" 
              className="hover:text-slate-950 transition-colors scroll-smooth cursor-pointer"
            >
              Features
            </a>
            <Link 
              href="/auth/active-drivers" 
              className="hover:text-slate-950 transition-colors"
            >
              Demo
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1">
        <section className="bg-emerald-600 text-white py-14 sm:py-18 lg:py-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Hero Left Content */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <h1 className="text-4xl sm:text-5xl lg:text-[46px] font-black text-white tracking-tight leading-[1.12]">
                  Track your drivers and fuel consumption in a few clicks.
                </h1>

                <p className="mt-6 text-base sm:text-lg text-emerald-50 leading-relaxed max-w-lg">
                  Real-time highway tracking, automated dispatch scheduling, and instantaneous stoppage and GPS blackout alerts for modern freight fleets.
                </p>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/auth/active-drivers"
                    className="px-6 py-3.5 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-sm rounded-lg shadow-md transition-all duration-150 inline-flex items-center justify-center cursor-pointer"
                  >
                    Try the Demo
                  </Link>

                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="px-6 py-3.5 bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg border border-emerald-400/50 shadow-xs transition-all duration-150 inline-flex items-center justify-center cursor-pointer"
                  >
                    Contact us
                  </button>
                </div>
              </div>

              {/* Hero Right: Live Interactive Leaflet Map with Driver Roster Sidebar */}
              <div className="lg:col-span-7 w-full shadow-2xl rounded-2xl overflow-hidden">
                <LandingHeroMap />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: What Our Software Prevents (Discord-Inspired Showcase Cards) */}
        <section className="border-t border-slate-200/60 bg-white py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            {/* Section Header */}
            <div className="max-w-2xl mb-14 sm:mb-18">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
                What Our Software Prevents
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-500 leading-relaxed">
                The stuff that costs you money quietly. TripSync surfaces it before it becomes a pattern.
              </p>
            </div>

            <div className="space-y-10 sm:space-y-14">
              {/* Card 1: Unauthorized Stoppages */}
              <div className="rounded-[32px] bg-slate-50 border border-slate-200/80 p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left: Authentic Active Drivers App Embed (No floating pills) */}
                  <div className="lg:col-span-7">
                    {/* App Window Frame (Styled exactly like /auth/active-drivers) */}
                    <div className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden text-slate-900">
                      {/* App Header Bar (Matches /auth/active-drivers header) */}
                      <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-blue-600" />
                            Active Drivers Map
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Real-time locations of all currently active trips.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-semibold text-xs border border-blue-100 shadow-2xs">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                          3 Online &bull; 3 Active Trips
                        </div>
                      </div>

                      {/* Map & Roster Split Layout (Matches /auth/active-drivers) */}
                      <div className="p-4 bg-slate-50 flex flex-col md:flex-row gap-3.5">
                        {/* Live Leaflet Map Area */}
                        <div className="flex-1 h-72 min-h-[260px] bg-slate-100 rounded-xl shadow-xs border border-slate-200 relative overflow-hidden">
                          <LandingStoppageMap />
                        </div>

                        {/* Driver Roster Sidebar (Matches /auth/active-drivers Driver Roster) */}
                        <div className="w-full md:w-60 bg-white rounded-xl shadow-xs border border-slate-200 p-3 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs mb-2">Driver Roster</h4>
                            <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                              <input
                                type="text"
                                readOnly
                                value="Juan Dela Cruz"
                                className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-700 font-medium"
                              />
                            </div>

                            {/* Driver Card (Matches active-drivers selected state) */}
                            <div className="w-full text-left p-2.5 rounded-xl bg-blue-50/80 border border-blue-300 ring-1 ring-blue-400 shadow-xs flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                J
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-semibold text-slate-900 text-xs truncate">Juan Dela Cruz</h5>
                                  <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1 py-0.5 rounded">
                                    0 km/h
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-medium text-rose-600 mt-0.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                  Stopped (48m)
                                </div>
                                <p className="text-[10px] text-slate-500 truncate mt-1">
                                  Manila &rarr; Calamba
                                </p>
                              </div>
                              <div className="flex flex-col items-center text-[9px] font-bold px-1 py-0.5 rounded text-emerald-700 bg-emerald-50 border border-emerald-200">
                                <BatteryFull className="w-3 h-3" />
                                <span>84%</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 mt-2">
                            <span>Updated 14:32</span>
                            <span className="text-blue-600 font-semibold hover:underline cursor-pointer">
                              Details &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Text Description */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                      Unauthorized stops flagged before dispatch even calls
                    </h3>

                    <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                      When a truck sits outside an approved rest area for more than a few minutes, you know about it — not two hours later when someone notices fuel missing. TripSync calculates idle burn and logs the incident with exact timestamps for review.
                    </p>

                    <div className="mt-6 flex items-center gap-2.5 text-xs font-semibold text-rose-700">
                      <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>SMS &amp; webhook alerts on perimeter violations</span>
                    </div>
                  </div>
                </div>
              </div>


              {/* Card 2: GPS Signal Cutoffs & Tampering */}
              <div className="rounded-[32px] bg-slate-50 border border-slate-200/80 p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left: Content */}
                  <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                      Know when a unit goes dark on purpose
                    </h3>

                    <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                      Dead zones happen. Deliberate cuts are different. TripSync distinguishes between a cellular gap and an intentional hardware disconnect — and it alerts dispatch within seconds, not after the truck shows up at the depot.
                    </p>

                    <div className="mt-6 flex items-center gap-2.5 text-xs font-semibold text-amber-800">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Last known coordinates preserved for every blackout event</span>
                    </div>
                  </div>

                  {/* Right: Authentic Active Drivers Map App Embed (GPS Disconnect / Offline state) */}
                  <div className="lg:col-span-7 order-1 lg:order-2">
                    {/* App Window Frame (Styled exactly like /auth/active-drivers) */}
                    <div className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden text-slate-900">
                      {/* App Header Bar (Matches /auth/active-drivers header) */}
                      <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-blue-600" />
                            Active Drivers Map
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Real-time locations of all currently active trips.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs border border-slate-200 shadow-2xs">
                          <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                          2 Online &bull; 1 Offline
                        </div>
                      </div>

                      {/* Map & Roster Split Layout (Matches /auth/active-drivers) */}
                      <div className="p-4 bg-slate-50 flex flex-col md:flex-row gap-3.5">
                        {/* Live Leaflet Map Area (Offline Driver at Last Known Coordinates) */}
                        <div className="flex-1 h-72 min-h-[260px] bg-slate-100 rounded-xl shadow-xs border border-slate-200 relative overflow-hidden">
                          <LandingOfflineDriverMap />
                        </div>

                        {/* Driver Roster Sidebar (Matches /auth/active-drivers Driver Roster with Offline State) */}
                        <div className="w-full md:w-60 bg-white rounded-xl shadow-xs border border-slate-200 p-3 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs mb-2">Driver Roster</h4>
                            <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                              <input
                                type="text"
                                readOnly
                                value="Arnel Mendoza"
                                className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-700 font-medium"
                              />
                            </div>

                            {/* Driver Card (Matches active-drivers selected offline state) */}
                            <div className="w-full text-left p-2.5 rounded-xl bg-slate-50/90 border border-slate-300 ring-1 ring-slate-400 shadow-xs flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                A
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-semibold text-slate-900 text-xs truncate">Arnel Mendoza</h5>
                                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded">
                                    Offline
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 mt-0.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                  Offline
                                </div>
                                <p className="text-[10px] text-slate-500 truncate mt-1">
                                  Manila &rarr; Batangas
                                </p>
                              </div>
                              <div className="flex flex-col items-center text-[9px] font-bold px-1 py-0.5 rounded text-rose-700 bg-rose-50 border border-rose-200">
                                <BatteryWarning className="w-3 h-3" />
                                <span>18%</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 mt-2">
                            <span>Last seen 4m ago</span>
                            <span className="text-blue-600 font-semibold hover:underline cursor-pointer">
                              Details &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Card 3: Fuel Bleed & Siphon Loss */}
              <div className="rounded-[32px] bg-slate-50 border border-slate-200/80 p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left: Authentic Analytics Chart Embed matching demo site */}
                  <div className="lg:col-span-7">
                    <LandingAnalyticsChart />
                  </div>

                  {/* Right: Text Description */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                      The numbers don't lie — your receipts might
                    </h3>

                    <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                      TripSync cross-checks pump receipts against live tank sensor readings. If your rig burned 38 liters more than it was dispatched with, that discrepancy shows up on your dashboard — with trip timestamps, route data, and a full audit trail attached.
                    </p>

                    <div className="mt-6 flex items-center gap-2.5 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Fuel requested vs. consumed — audit-ready, trip by trip</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Core Fleet Telemetry Features */}
        <section id="features" className="bg-emerald-600 text-white py-20 sm:py-24 border-t border-emerald-700">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Core Fleet Telemetry Features
              </h2>
              <p className="mt-2 text-sm sm:text-base text-emerald-50">
                Built for precision control room dispatch, tracking, and compliance.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 1: Live Fleet Map */}
              <div className="rounded-[32px] bg-[#f2f6f2] p-8 sm:p-9 flex flex-col justify-between shadow-sm hover:shadow-md transition-all text-slate-900 border border-white/50">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#dbe7db] text-[#1b3d1b]">
                      <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Fleet Tracking</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight leading-snug">
                    Track expressways in sub-second time
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm">
                    Real-time highway tracking with live coordinate pings, corridor geofencing, and active speed telemetry across Luzon routes.
                  </p>
                </div>

                <div className="mt-8 pt-2 flex justify-center">
                  <Link
                    href="/auth/active-drivers"
                    className="px-6 py-2.5 rounded-full border border-slate-900 text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-900 hover:text-white transition-all text-center inline-block"
                  >
                    Open Live Map
                  </Link>
                </div>
              </div>

              {/* Feature 2: Trip Planning & Scheduling */}
              <div className="rounded-[32px] bg-[#f2f6f2] p-8 sm:p-9 flex flex-col justify-between shadow-sm hover:shadow-md transition-all text-slate-900 border border-white/50">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#dbe7db] text-[#1b3d1b]">
                      <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Dispatch Scheduling</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight leading-snug">
                    Plan and dispatch trips in minutes
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm">
                    Structured 4-step dispatch workflow: driver allocation, geofenced routes, weight limits, and automated fuel estimation.
                  </p>
                </div>

                <div className="mt-8 pt-2 flex justify-center">
                  <Link
                    href="/auth/plan-trip"
                    className="px-6 py-2.5 rounded-full border border-slate-900 text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-900 hover:text-white transition-all text-center inline-block"
                  >
                    Trip Dispatch Wizard
                  </Link>
                </div>
              </div>

              {/* Feature 3: Flagged Trips & History */}
              <div className="rounded-[32px] bg-[#f2f6f2] p-8 sm:p-9 flex flex-col justify-between shadow-sm hover:shadow-md transition-all text-slate-900 border border-white/50">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#dbe7db] text-[#1b3d1b]">
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Trip History</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight leading-snug">
                    Audit routes and stoppage events
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm">
                    Forensic breadcrumb replay of past journeys to audit stoppage events, detour warnings, and route breaches.
                  </p>
                </div>

                <div className="mt-8 pt-2 flex justify-center">
                  <Link
                    href="/auth/trip-history"
                    className="px-6 py-2.5 rounded-full border border-slate-900 text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-900 hover:text-white transition-all text-center inline-block"
                  >
                    Audit Trip History
                  </Link>
                </div>
              </div>

              {/* Feature 4: Analytics */}
              <div className="rounded-[32px] bg-[#f2f6f2] p-8 sm:p-9 flex flex-col justify-between shadow-sm hover:shadow-md transition-all text-slate-900 border border-white/50">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#dbe7db] text-[#1b3d1b]">
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Fuel Telemetry</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight leading-snug">
                    Verify consumption against receipts
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm">
                    Rig burn rate comparisons against baseline metrics, driver eco-efficiency scorings, and tank sensor siphon audits.
                  </p>
                </div>

                <div className="mt-8 pt-2 flex justify-center">
                  <Link
                    href="/auth/analytics"
                    className="px-6 py-2.5 rounded-full border border-slate-900 text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-900 hover:text-white transition-all text-center inline-block"
                  >
                    View Analytics
                  </Link>
                </div>
              </div>

              {/* Feature 5: Vehicles, Drivers, etc. */}
              <div className="rounded-[32px] bg-[#f2f6f2] p-8 sm:p-9 flex flex-col justify-between shadow-sm hover:shadow-md transition-all text-slate-900 border border-white/50">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#dbe7db] text-[#1b3d1b]">
                      <Users className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Asset Directory</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight leading-snug">
                    Manage rigs, drivers, and keys
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm">
                    Consolidated asset directory tracking truck maintenance, odometer counters, driver licenses, and active keys.
                  </p>
                </div>

                <div className="mt-8 pt-2 flex justify-center">
                  <Link
                    href="/auth/view-vehicles"
                    className="px-6 py-2.5 rounded-full border border-slate-900 text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-900 hover:text-white transition-all text-center inline-block"
                  >
                    Manage Fleet Assets
                  </Link>
                </div>
              </div>

              {/* Feature 6: System Event Logs */}
              <div className="rounded-[32px] bg-[#f2f6f2] p-8 sm:p-9 flex flex-col justify-between shadow-sm hover:shadow-md transition-all text-slate-900 border border-white/50">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#dbe7db] text-[#1b3d1b]">
                      <Terminal className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Event Logs</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight leading-snug">
                    Real-time alerts and audit trail
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm">
                    Immutable event streams capturing GPS blackouts, battery cuts, speed threshold violations, and carrier drops.
                  </p>
                </div>

                <div className="mt-8 pt-2 flex justify-center">
                  <Link
                    href="/auth/logs"
                    className="px-6 py-2.5 rounded-full border border-slate-900 text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-900 hover:text-white transition-all text-center inline-block"
                  >
                    Explore System Logs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Bottom Call To Action matching Mockup */}
        <section className="py-20 sm:py-28 bg-[#fafbfc]">
          <div className="max-w-5xl mx-auto px-6 sm:px-8">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-10 sm:p-16 text-center shadow-xs">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Ready to streamline your fleet operations?
              </h2>
              <p className="mt-3.5 text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
                Experience real-time telemetry dispatch or speak with our logistics solutions team.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/auth/active-drivers"
                  className="px-6 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
                >
                  Try the Demo
                </Link>

                <button
                  onClick={() => setIsContactOpen(true)}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-lg border border-slate-200 shadow-2xs transition-all duration-150 cursor-pointer"
                >
                  Contact us
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer matching Mockup */}
      <footer className="border-t border-slate-200/60 bg-[#fafbfc] py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center p-1 shadow-2xs">
              <img src="/logo-icon.png" alt="TripSync Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-slate-700">TripSync</span>
          </div>

          <div>
            &copy; {new Date().getFullYear()} TripSync. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Contact Sales / Support Dialog Modal */}
      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />
    </div>
  );
}
