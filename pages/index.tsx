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
  ExternalLink
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
          <Link href="/" className="flex items-baseline group">
            <span className="text-2xl font-black tracking-tight text-slate-950 group-hover:text-slate-800 transition-colors">
              TripSync
            </span>
            <span className="text-xs text-slate-400 font-medium ml-2 tracking-normal">
              by Innovare
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
        <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-12 sm:pt-16 pb-20 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <h1 className="text-4xl sm:text-5xl lg:text-[46px] font-black text-slate-950 tracking-tight leading-[1.12]">
                Track your drivers and fuel consumption in a few clicks.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
                Real-time highway tracking, automated dispatch scheduling, and instantaneous stoppage and GPS blackout alerts for modern freight fleets.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/auth/active-drivers"
                  className="px-6 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all duration-150 inline-flex items-center justify-center cursor-pointer"
                >
                  Try the Demo
                </Link>

                <button
                  onClick={() => setIsContactOpen(true)}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-lg border border-slate-200 shadow-2xs transition-all duration-150 inline-flex items-center justify-center cursor-pointer"
                >
                  Contact us
                </button>
              </div>
            </div>

            {/* Hero Right: Live Interactive Leaflet Map matching Mockup */}
            <div className="lg:col-span-7 w-full">
              <LandingHeroMap />
            </div>
          </div>
        </section>

        {/* Section 2: What Our Software Prevents */}
        <section className="border-t border-slate-200/60 bg-white py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                What Our Software Prevents
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-500">
                Detect and resolve operational variance across all active transit corridors in real time.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Card 1: Unauthorized Stoppages */}
              <div className="group rounded-2xl border border-slate-200/90 bg-[#fafbfc] p-7 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-xs">
                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-2xs mb-6 group-hover:text-rose-600 transition-colors">
                  <Ban className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Unauthorized Stoppages
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Detect unapproved rest periods, off-manifest side trips, and prolonged excessive engine idling the moment vehicles stop outside assigned zones.
                </p>
              </div>

              {/* Card 2: GPS Signal Cutoffs */}
              <div className="group rounded-2xl border border-slate-200/90 bg-[#fafbfc] p-7 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-xs">
                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-2xs mb-6 group-hover:text-amber-600 transition-colors">
                  <Crosshair className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  GPS Signal Cutoffs
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Know where your drivers are at all times and get notified when hardware disconnects, power is cut, or transponders are manually tampered with.
                </p>
              </div>

              {/* Card 3: Fuel Bleed & Usage */}
              <div className="group rounded-2xl border border-slate-200/90 bg-[#fafbfc] p-7 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-xs">
                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-2xs mb-6 group-hover:text-blue-600 transition-colors">
                  <Fuel className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Fuel Bleed &amp; Usage
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Compare tank sensor burn with dispatched pump authorizations. Stop siphon loss, unapproved fuel claims, and throttle waste instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Core Fleet Telemetry Features */}
        <section id="features" className="border-t border-slate-200/60 bg-[#fafbfc] py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Core Fleet Telemetry Features
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-500">
                Built for precision control room dispatch, tracking, and compliance.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 1: Live Fleet Map */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-7 transition-all duration-200 hover:border-slate-300 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-800 shadow-2xs mb-6">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Live Fleet Map
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Real-time expressway tracking with sub-second position pings, corridor overlays, and active speed telemetry.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center">
                  <Link
                    href="/auth/active-drivers"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 group"
                  >
                    <span>Open Live Map</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Feature 2: Trip Planning & Scheduling */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-7 transition-all duration-200 hover:border-slate-300 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-800 shadow-2xs mb-6">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Trip Planning &amp; Scheduling
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Structured 4-step dispatch workflow: driver allocation, geofenced routes, weight limits, and automated fuel estimation.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center">
                  <Link
                    href="/auth/plan-trip"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 group"
                  >
                    <span>Trip Dispatch Wizard</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Feature 3: Flagged Trips & History */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-7 transition-all duration-200 hover:border-slate-300 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-800 shadow-2xs mb-6">
                    <RotateCcw className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Flagged Trips &amp; History
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Forensic breadcrumb replay of past journeys to audit stoppage events, detour warnings, and route breaches.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center">
                  <Link
                    href="/auth/trip-history"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 group"
                  >
                    <span>Audit Trip History</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Feature 4: Analytics */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-7 transition-all duration-200 hover:border-slate-300 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-800 shadow-2xs mb-6">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Analytics
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Rig burn rate comparisons against baseline metrics, driver eco-efficiency scorings, and fuel leak analysis.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center">
                  <Link
                    href="/auth/analytics"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 group"
                  >
                    <span>View Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Feature 5: Vehicles, Drivers, etc. */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-7 transition-all duration-200 hover:border-slate-300 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-800 shadow-2xs mb-6">
                    <Users className="w-5 h-5 text-sky-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Vehicles, Drivers, etc.
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Consolidated asset directory tracking truck maintenance, odometer counters, driver licenses, and active keys.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center">
                  <Link
                    href="/auth/view-vehicles"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 group"
                  >
                    <span>Manage Fleet Assets</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">TripSync</span>
            <span>&bull;</span>
            <span>Innovare Logistics Systems</span>
          </div>

          <div>
            &copy; {new Date().getFullYear()} Innovare. All rights reserved.
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
