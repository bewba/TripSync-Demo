import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  Navigation,
  BatteryFull,
  BatteryWarning,
  Search,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import ContactModal from '@/components/landing/ContactModal';
import CoreTelemetrySection from '@/components/landing/CoreTelemetrySection';

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

// Scroll reveal component for silky slide-up entrances
function ScrollReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Kinetic word-by-word animation variants for the hero section
const HERO_WORDS = ['Track', 'every', 'driver', 'and', 'every', 'liter.'];

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const heroWordVariants = {
  hidden: {
    opacity: 0,
    y: 32,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 16,
      stiffness: 120,
    },
  },
};

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

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200/90 flex items-center justify-center p-1.5 shadow-2xs group-hover:border-slate-300 transition-all">
              <img 
                src="/logo-icon.png" 
                alt="TripSync Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-950 group-hover:text-slate-800 transition-colors">
              TripSync
            </span>
          </Link>

          {/* Navigation Links & Action */}
          <div className="flex items-center gap-6 sm:gap-8">
            <nav className="flex items-center gap-6 sm:gap-8 text-sm font-medium text-slate-600">
              <a 
                href="#features" 
                className="hover:text-slate-950 transition-colors scroll-smooth cursor-pointer"
              >
                Features
              </a>
              <Link 
                href="/auth/active-drivers" 
                className="hover:text-slate-950 transition-colors hidden sm:inline"
              >
                Demo
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/active-drivers"
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-2xs transition-all active:scale-[0.98]"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 overflow-x-clip">
        <section className="bg-gradient-to-r from-[#059669] via-[#10b981] to-[#34d399] text-white pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-28 lg:pb-36 relative overflow-visible">
          {/* Dotted Logistics Route Network */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
            <svg
              className="w-full h-full"
              viewBox="0 0 1920 800"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* === DOTTED FREIGHT CORRIDOR LINES === */}
              {/* Route 1: North Harbor to Northern Luzon Trunk */}
              <path
                d="M -100 130 C 280 50, 620 220, 1060 120 S 1520 40, 2040 160"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeDasharray="10 8"
                strokeOpacity="0.35"
              />

              {/* Route 2: Metro Manila Central Express Transit */}
              <path
                d="M -120 250 C 240 150, 560 370, 1020 220 S 1500 100, 2040 290"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="8 6"
                strokeOpacity="0.32"
              />

              {/* Route 3: SLEX Southern Luzon Freight Trunk */}
              <path
                d="M -60 380 C 320 280, 740 500, 1200 330 S 1680 180, 2160 410"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
                strokeDasharray="6 6"
                strokeOpacity="0.28"
              />

              {/* Route 4: Deep Southern Port Corridor to Batangas */}
              <path
                d="M 60 520 C 440 430, 860 620, 1360 450 S 1840 300, 2300 540"
                fill="none"
                stroke="white"
                strokeWidth="1.6"
                strokeDasharray="5 5"
                strokeOpacity="0.25"
              />

              {/* Route 5: Cross-Arterial Orbital Ring Route */}
              <path
                d="M 140 -40 C 360 200, 680 360, 1120 540 S 1600 680, 1960 760"
                fill="none"
                stroke="white"
                strokeWidth="1.6"
                strokeDasharray="6 8"
                strokeOpacity="0.26"
              />

              {/* Route 6: Coastal Express Tributary Connector */}
              <path
                d="M -60 580 C 360 440, 720 200, 1180 160 S 1640 250, 2060 90"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                strokeOpacity="0.24"
              />

              {/* Route 7: Subic-Clark Upper Bypass Route */}
              <path
                d="M -40 50 C 380 160, 800 30, 1260 100 S 1700 50, 2080 80"
                fill="none"
                stroke="white"
                strokeWidth="1.3"
                strokeDasharray="4 5"
                strokeOpacity="0.22"
              />

              {/* Route 8: Regional Feeder Corridor (Laguna/Cavite) */}
              <path
                d="M 300 680 C 680 550, 1080 610, 1480 450 S 1880 490, 2240 410"
                fill="none"
                stroke="white"
                strokeWidth="1.3"
                strokeDasharray="5 7"
                strokeOpacity="0.22"
              />

              {/* Route 9: Secondary Diagonal Connector */}
              <path
                d="M 520 -20 C 660 180, 880 320, 1200 330 S 1580 460, 1920 540"
                fill="none"
                stroke="white"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                strokeOpacity="0.2"
              />

              {/* Route 10: Inland Freight Link */}
              <path
                d="M 800 750 C 1040 580, 1340 360, 1680 280 S 1980 210, 2140 180"
                fill="none"
                stroke="white"
                strokeWidth="1.2"
                strokeDasharray="6 6"
                strokeOpacity="0.18"
              />
            </svg>
          </div>

          <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-6 sm:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-start">
              {/* Hero Left Content - Pushed to the side in a compact column */}
              <div className="lg:col-span-4 xl:col-span-3 2xl:col-span-3 flex flex-col z-10">
                <motion.h1
                  variants={heroContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-4xl sm:text-5xl lg:text-[42px] xl:text-[46px] 2xl:text-[50px] font-black text-white tracking-[-0.035em] leading-[1.04]"
                >
                  {HERO_WORDS.map((word, i) => (
                    <span key={i} className="inline-block overflow-hidden mr-[0.24em] last:mr-0 pb-1">
                      <motion.span
                        variants={heroWordVariants}
                        className="inline-block will-change-transform"
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.62, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6 text-sm sm:text-base lg:text-[15px] xl:text-base text-emerald-50/90 leading-relaxed font-normal"
                >
                  Real-time highway tracking, automated dispatch scheduling, and instantaneous stoppage and GPS blackout alerts for modern freight fleets.
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.82, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
                >
                  <Link
                    href="/auth/active-drivers"
                    className="px-5 sm:px-6 py-3.5 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs sm:text-sm rounded-lg shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150 inline-flex items-center justify-center cursor-pointer whitespace-nowrap"
                  >
                    Try the Demo
                  </Link>

                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="px-5 sm:px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm rounded-lg border border-slate-800 shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150 inline-flex items-center justify-center cursor-pointer whitespace-nowrap"
                  >
                    Contact us
                  </button>
                </motion.div>
              </div>

              {/* Hero Right: Live Interactive Leaflet Map with Driver Roster Sidebar - Expanded wider on the right */}
              <motion.div
                initial={{ opacity: 0, y: 35, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-8 xl:col-span-9 2xl:col-span-9 w-full relative z-20 translate-y-0 lg:-mb-28 sm:-mb-20 -mb-14"
              >
                {/* Map Window Container: Contained horizontally, bleeding downward */}
                <div className="w-full shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] rounded-2xl ring-1 ring-white/25 overflow-hidden bg-white">
                  <LandingHeroMap />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 2: What Our Software Prevents */}
        <section className="border-t border-slate-200/60 bg-[#f8fafc] pt-24 sm:pt-32 lg:pt-48 pb-20 sm:pb-28">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            {/* Section Header */}
            <div className="max-w-2xl mb-14 sm:mb-18">
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-950 tracking-[-0.03em]">
                What Our Software Prevents
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
                The stuff that costs you money quietly. TripSync surfaces it before it becomes a pattern.
              </p>
            </div>

            <div className="space-y-10 sm:space-y-14">
              {/* Card 1: Unauthorized Stoppages */}
              <ScrollReveal delay={0}>
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200">
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
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight leading-snug">
                        Unauthorized stops flagged before dispatch even calls
                      </h3>

                      <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                        When a truck sits outside an approved rest area for more than a few minutes, you know about it — not two hours later when someone notices fuel missing. TripSync calculates idle burn and logs the incident with exact timestamps for review.
                      </p>

                      <div className="mt-6 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-rose-700">
                        <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>SMS &amp; webhook alerts on perimeter violations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>


              {/* Card 2: GPS Signal Cutoffs & Tampering */}
              <ScrollReveal delay={100}>
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left: Content */}
                    <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight leading-snug">
                        Know when a unit goes dark on purpose
                      </h3>

                      <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                        Dead zones happen. Deliberate cuts are different. TripSync distinguishes between a cellular gap and an intentional hardware disconnect — and it alerts dispatch within seconds, not after the truck shows up at the depot.
                      </p>

                      <div className="mt-6 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-amber-800">
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
              </ScrollReveal>


              {/* Card 3: Fuel Bleed & Siphon Loss (Overlapping Core Telemetry Lighter Green Background) */}
              <div className="relative">
                {/* Lighter Green Background extending from 50% height of Card 3 through bottom of section */}
                <div
                  className="absolute inset-x-0 top-1/2 bottom-0 bg-emerald-600 pointer-events-none -mb-20 sm:-mb-28"
                  style={{
                    left: 'calc(-50vw + 50%)',
                    width: '100vw',
                  }}
                  aria-hidden="true"
                />

                <ScrollReveal delay={100} className="relative z-10">
                  <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_45px_rgba(0,0,0,0.12)] transition-all duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                      {/* Left: Authentic Analytics Chart Embed matching demo site */}
                      <div className="lg:col-span-7">
                        <LandingAnalyticsChart />
                      </div>

                      {/* Right: Text Description */}
                      <div className="lg:col-span-5 flex flex-col justify-center">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight leading-snug">
                          The numbers don't lie — your receipts might
                        </h3>

                        <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                          TripSync cross-checks pump receipts against live tank sensor readings. If your rig burned 38 liters more than it was dispatched with, that discrepancy shows up on your dashboard — with trip timestamps, route data, and a full audit trail attached.
                        </p>

                        <div className="mt-6 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Fuel consumption &amp; mileage analytics — audit-ready, trip by trip</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Core Fleet Telemetry Features (Stripe-style card grid) */}
        <CoreTelemetrySection />


        {/* Section 4: Bottom Call To Action */}
        <section className="py-20 sm:py-28 bg-[#fafbfc]">
          <div className="max-w-5xl mx-auto px-6 sm:px-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-10 sm:p-16 text-center shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-[-0.03em]">
                Ready to streamline your fleet operations?
              </h2>
              <p className="mt-3.5 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
                Experience real-time telemetry dispatch or speak with our logistics solutions team.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/auth/active-drivers"
                  className="px-6 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150 cursor-pointer inline-flex items-center justify-center"
                >
                  Try the Demo
                </Link>

                <button
                  onClick={() => setIsContactOpen(true)}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-lg border border-slate-200 shadow-2xs active:scale-[0.98] transition-all duration-150 cursor-pointer inline-flex items-center justify-center"
                >
                  Contact us
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center p-1 shadow-2xs">
              <img src="/logo-icon.png" alt="TripSync Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-slate-800 text-sm tracking-tight">TripSync</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Real-Time Fleet &amp; Fuel Telemetry</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All systems operational
            </div>
            <span>&copy; {new Date().getFullYear()} TripSync. All rights reserved.</span>
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
