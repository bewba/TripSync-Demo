'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const TrackDriversMiniMap = dynamic(
  () => import('@/components/landing/TrackDriversMiniMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[220px] sm:min-h-[240px] rounded-lg bg-slate-100 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    ),
  }
);
import LandingAnalyticsChart from '@/components/landing/LandingAnalyticsChart';
import {
  Maximize2,
  Navigation,
  Truck,
  Fuel,
  FileText,
  Download,
  Check,
  MapPin,
  BatteryFull,
  BatteryWarning,
  Search,
  Sparkles,
  RotateCcw,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Printer,
  ChevronRight,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function CoreTelemetrySection() {
  const [selectedDriverId, setSelectedDriverId] = useState('juan');

  // Stable callback — won't change on re-renders, prevents map from re-initializing
  const handleSelectDriver = useCallback((id: string) => setSelectedDriverId(id), []);

  // Dispatch step animation
  const [dispatchStep, setDispatchStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setDispatchStep((prev) => (prev + 1) % 4);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  // Report generation animation
  const [reportProgress, setReportProgress] = useState(12);
  const [reportStatus, setReportStatus] = useState('Compiling GPS breadcrumbs...');
  useEffect(() => {
    const tick = setInterval(() => {
      setReportProgress((prev) => {
        if (prev >= 100) { setReportStatus('Manifest generated & verified ✓'); return 100; }
        const next = prev + 18;
        if (next > 70) setReportStatus('Reconciling tank telemetry...');
        else if (next > 40) setReportStatus('Auditing toll & fuel receipts...');
        return next;
      });
    }, 1100);
    const reset = setInterval(() => {
      setReportProgress(12);
      setReportStatus('Compiling GPS breadcrumbs...');
    }, 9000);
    return () => { clearInterval(tick); clearInterval(reset); };
  }, []);

  // Fuel chart animation tick
  const [fuelTick, setFuelTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFuelTick(n => n + 1), 1800);
    return () => clearInterval(t);
  }, []);

  // Driver app screen toggle: 0 = Assigned Trips, 1 = Trip Assigned, 2 = Trip in Progress
  const [driverAppScreen, setDriverAppScreen] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setDriverAppScreen((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // ─── Shared card styles ─────────────────────────────────────────────────────
  const CARD = "group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden";

  // ─── Shared app "window chrome" header ──────────────────────────────────────
  const AppHeader = ({ title, subtitle, badge, badgeColor = 'blue' }: {
    title: string; subtitle: string; badge: string; badgeColor?: string;
  }) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-700 border-blue-100',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      amber: 'bg-amber-50 text-amber-700 border-amber-100',
    };
    return (
      <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between shrink-0">
        <div>
          <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-blue-600" />
            {title}
          </h4>
          <p className="text-[9px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className={`flex items-center gap-1.5 ${colors[badgeColor]} px-2 py-0.5 rounded-md font-semibold text-[10px] border`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {badge}
        </div>
      </div>
    );
  };

  return (
    <section id="features" className="bg-emerald-600 pt-10 sm:pt-14 pb-24 sm:pb-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">

        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-[-0.03em] leading-tight">
            Everything you need to monitor, dispatch, and audit your fleet
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-emerald-100/75 leading-relaxed font-normal">
            Built for precision control room dispatch, real-time highway monitoring, and strict fuel audit compliance.
          </p>
        </div>

        {/* Bento Grid inspired by Stripe with small gaps & smaller modern rounding */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">


          {/* ═══════════════════════════════════════════════════════════
              CARD 1 — TRACK DRIVERS (WIDE: 7 COLS)
              Embed: Active Drivers Map + Live Driver Roster
          ═══════════════════════════════════════════════════════════ */}
          <div className={`${CARD} md:col-span-12 lg:col-span-7`}>
            {/* Card title row */}
            <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug">Track drivers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Live highway positions, active speeds, and stoppage detection.</p>
              </div>
              <Link href="/auth/active-drivers" aria-label="Open Active Drivers" className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors shrink-0">
                <Maximize2 className="w-3 h-3" />
              </Link>
            </div>

            {/* App window embed */}
            <div className="mx-4 mb-4 rounded-lg overflow-hidden border border-slate-200 shadow-2xs flex flex-col flex-1">
              <AppHeader title="Active Drivers Map" subtitle="Real-time locations of all currently active trips." badge="3 Online · 3 Active" />

              {/* Map + Roster split — matching the actual app layout */}
              <div className="bg-slate-50 p-3 flex flex-col sm:flex-row gap-3 flex-1">
                {/* Real interactive/dynamic map area */}
                <div className="flex-1 min-h-[210px] sm:min-h-[230px] rounded-lg relative overflow-hidden flex flex-col">
                  <TrackDriversMiniMap
                    selectedDriverId={selectedDriverId}
                    onSelectDriver={handleSelectDriver}
                  />
                </div>

                {/* Driver roster sidebar */}
                <div className="w-full sm:w-48 bg-white rounded-lg border border-slate-200 p-2.5 flex flex-col gap-2 shadow-2xs shrink-0">
                  <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Driver Roster</div>

                  {/* Active card */}
                  <div
                    onClick={() => setSelectedDriverId('juan')}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      selectedDriverId === 'juan'
                        ? 'bg-blue-50/80 border border-blue-300 ring-1 ring-blue-400 shadow-2xs'
                        : 'bg-white border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">J</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-slate-900 truncate">Juan Dela Cruz</div>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>In Motion
                        </div>
                      </div>
                      <span className="text-[8px] font-bold text-slate-600 shrink-0">62km/h</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5 truncate pl-7">Manila → Calamba</p>
                  </div>

                  {/* Other drivers */}
                  <div
                    onClick={() => setSelectedDriverId('ramon')}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      selectedDriverId === 'ramon'
                        ? 'bg-emerald-50/80 border border-emerald-300 ring-1 ring-emerald-400 shadow-2xs'
                        : 'bg-white border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">R</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-slate-900 truncate">Ramon Santos</div>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>In Motion
                        </div>
                      </div>
                      <BatteryFull className="w-3 h-3 text-emerald-500 shrink-0"/>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedDriverId('arnel')}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      selectedDriverId === 'arnel'
                        ? 'bg-slate-100 border border-slate-300 ring-1 ring-slate-400 shadow-2xs'
                        : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-slate-400 text-white text-[9px] font-bold flex items-center justify-center shrink-0">A</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-slate-600 truncate">Arnel Mendoza</div>
                        <div className="text-[9px] text-slate-400 font-medium">Offline</div>
                      </div>
                      <BatteryWarning className="w-3 h-3 text-rose-400 shrink-0"/>
                    </div>
                  </div>

                  <div className="mt-auto pt-1.5 border-t border-slate-100 flex justify-between text-[9px] text-slate-400">
                    <span>Updated 14:32</span>
                    <Link href="/auth/active-drivers" className="text-blue-600 font-semibold hover:underline">Details →</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ═══════════════════════════════════════════════════════════
              CARD 2 — TRACK FUEL (COMPACT: 5 COLS)
              Embed: Analytics page chart chrome matching Card 3
          ═══════════════════════════════════════════════════════════ */}
          <div className={`${CARD} md:col-span-12 lg:col-span-5`}>
            <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug">Track fuel</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time fuel consumption &amp; mileage analytics.</p>
              </div>
              <Link href="/auth/analytics" aria-label="Open Analytics" className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors shrink-0">
                <Maximize2 className="w-3 h-3" />
              </Link>
            </div>

            {/* App window embed: Analytics page */}
            <div className="mx-4 mb-4 rounded-lg overflow-hidden border border-slate-200 shadow-2xs flex flex-col flex-1 bg-white">
              <AppHeader title="Fleet Analytics" subtitle="Fuel consumed, distance, and efficiency metrics." badge="Live Data" badgeColor="emerald" />

              <div className="flex-1 flex flex-col bg-slate-50">
                <LandingAnalyticsChart compact />
              </div>
            </div>
          </div>


          {/* ═══════════════════════════════════════════════════════════
              CARD 4 — TRIP HISTORY (MEDIUM-WIDE: 5 COLS)
              Embed: Authentic Trip History page table chrome
          ═══════════════════════════════════════════════════════════ */}
          <div className={`${CARD} md:col-span-6 lg:col-span-5`}>
            <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug">Trip history</h3>
                <p className="text-xs text-slate-500 mt-0.5">Audit logs, stoppage flags, and route archives.</p>
              </div>
              <Link href="/auth/trip-history" aria-label="Open Trip History" className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors shrink-0">
                <Maximize2 className="w-3 h-3" />
              </Link>
            </div>

            {/* App window embed: Trip History page */}
            <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-slate-200/90 shadow-sm flex flex-col flex-1 bg-white">
              {/* Page header */}
              <div className="bg-white px-3.5 pt-3 pb-2 flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-emerald-700 font-bold uppercase tracking-widest font-sans">
                    OPERATIONAL RECORDS
                  </div>
                  <div className="text-sm font-black text-slate-950 tracking-tight font-sans">
                    Trip History
                  </div>
                </div>
                {/* Generate Trip Report Button */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 text-white font-bold text-[9px] uppercase tracking-wider shrink-0 shadow-xs">
                  <Download className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">GENERATE TRIP REPORT</span>
                  <span className="sm:hidden">REPORT</span>
                  <ChevronRight className="w-2.5 h-2.5 opacity-60 rotate-90" />
                </div>
              </div>

              {/* Action Bar: Search input + Pill status filters */}
              <div className="bg-white px-3.5 pb-2.5 flex items-center gap-1.5 border-b border-slate-100 overflow-x-auto scrollbar-hide">
                {/* Search input with rounded-2xl & light blue bg */}
                <div className="flex items-center gap-1.5 bg-[#e8f0fe] rounded-xl px-2.5 py-1 min-w-[130px] shrink-0">
                  <Search className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-[9px] text-slate-500 font-medium truncate">
                    Search Vehicle or Location...
                  </span>
                </div>

                {/* Filter pills matching the actual screenshot */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                    ALL
                  </span>
                  <span className="px-2 py-1 rounded-xl bg-[#e8f0fe] text-slate-600 text-[9px] font-semibold uppercase tracking-wider">
                    ASSIGNED
                  </span>
                  <span className="px-2 py-1 rounded-xl bg-[#e8f0fe] text-slate-600 text-[9px] font-semibold uppercase tracking-wider hidden sm:inline">
                    TRIP IN PROGRESS
                  </span>
                  <span className="px-2 py-1 rounded-xl bg-[#e8f0fe] text-slate-600 text-[9px] font-semibold uppercase tracking-wider">
                    COMPLETED
                  </span>
                </div>
              </div>

              {/* Real table rows matching the screenshot layout & typography */}
              <div className="bg-white divide-y divide-slate-100 flex-1 overflow-hidden">
                {[
                  {
                    routeFrom: 'LivanTrade Pa...',
                    routeTo: 'SMC , Bulaca...',
                    truck: 'BOOMTRUCK',
                    status: 'Completed',
                    metrics: '196.48 Km',
                    requested: 'Oct 19, 2026',
                    scheduled: 'Oct 19, 2026 • 11:35 PM',
                  },
                  {
                    routeFrom: 'LivanTrade Pa...',
                    routeTo: 'SMC , Bulaca...',
                    truck: 'BOOMTRUCK',
                    status: 'Completed',
                    metrics: '196.48 Km',
                    requested: 'Oct 19, 2026',
                    scheduled: 'Oct 19, 2026 • 10:30 PM',
                  },
                  {
                    routeFrom: 'LivanTrade Pa...',
                    routeTo: 'bgc',
                    truck: 'BOOMTRUCK',
                    status: 'Completed',
                    metrics: '147.24 Km',
                    requested: 'Oct 19, 2026',
                    scheduled: 'Oct 19, 2026 • 09:50 PM',
                  },
                  {
                    routeFrom: 'LivanTrade Pa...',
                    routeTo: 'SMC , Bulaca...',
                    truck: 'BOOMTRUCK',
                    status: 'Completed',
                    metrics: '196.48 Km',
                    requested: 'Oct 19, 2026',
                    scheduled: 'Oct 19, 2026 • 09:45 PM',
                  },
                  {
                    routeFrom: 'LivanTrade Pa...',
                    routeTo: 'bgc',
                    truck: 'BOOMTRUCK',
                    status: 'Completed',
                    metrics: '153.22 Km',
                    requested: 'Oct 18, 2026',
                    scheduled: 'Oct 18, 2026 • 10:20 AM',
                  },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="px-3.5 py-2 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer text-left"
                  >
                    {/* Left: Route, Truck, Status, Metrics columns */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
                      {/* ROUTE */}
                      <div className="flex flex-col min-w-0">
                        <span className="text-[7.5px] text-slate-400 uppercase font-bold tracking-wider">
                          ROUTE
                        </span>
                        <div className="flex items-center gap-1 font-bold text-slate-900 text-[9.5px] truncate mt-0.5">
                          <span className="truncate">{row.routeFrom}</span>
                          <span className="text-slate-400 font-normal shrink-0">→</span>
                          <span className="truncate">{row.routeTo}</span>
                        </div>
                      </div>

                      {/* TRUCK */}
                      <div className="flex flex-col min-w-0">
                        <span className="text-[7.5px] text-slate-400 uppercase font-bold tracking-wider">
                          TRUCK
                        </span>
                        <span className="font-bold text-slate-900 text-[9.5px] truncate mt-0.5">
                          {row.truck}
                        </span>
                      </div>

                      {/* STATUS */}
                      <div className="flex flex-col min-w-0">
                        <span className="text-[7.5px] text-slate-400 uppercase font-bold tracking-wider">
                          STATUS
                        </span>
                        <div className="mt-0.5">
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[8px] font-semibold bg-emerald-100 text-emerald-800">
                            {row.status}
                          </span>
                        </div>
                      </div>

                      {/* METRICS */}
                      <div className="flex flex-col min-w-0">
                        <span className="text-[7.5px] text-slate-400 uppercase font-bold tracking-wider">
                          METRICS
                        </span>
                        <span className="font-semibold text-slate-900 text-[9.5px] truncate mt-0.5">
                          {row.metrics}
                        </span>
                      </div>
                    </div>

                    {/* Right: REQUESTED & SCHEDULED dates */}
                    <div className="text-right shrink-0 flex flex-col items-end">
                      <span className="text-[7px] text-slate-400 uppercase font-bold tracking-wider">
                        REQUESTED
                      </span>
                      <span className="text-[8.5px] font-semibold text-slate-700 leading-tight">
                        {row.requested}
                      </span>
                      <span className="text-[7px] text-blue-600 uppercase font-bold tracking-wider mt-0.5">
                        SCHEDULED
                      </span>
                      <span className="text-[8px] font-bold text-blue-600 leading-tight">
                        {row.scheduled}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* ═══════════════════════════════════════════════════════════
              CARD 6 — DRIVER APP (COMPACT PORTRAIT: 3 COLS)
              Embed: Smartphone frame with authentic driver app UI
          ═══════════════════════════════════════════════════════════ */}
          <div className={`${CARD} md:col-span-6 lg:col-span-3`}>
            <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug">Driver app</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mobile companion for routes &amp; slips.</p>
              </div>
              <Link href="/auth/active-drivers" aria-label="Explore Driver App" className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors shrink-0">
                <Maximize2 className="w-3 h-3" />
              </Link>
            </div>

            {/* App embed: smartphone mockup with authentic Driver App UI */}
            <div className="mx-4 mb-4 flex flex-col items-center justify-center py-1 flex-1">
              {/* Screen Selector Pills */}
              <div className="flex items-center gap-1 mb-2 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
                {[
                  { label: 'Assigned', idx: 0 },
                  { label: 'Details', idx: 1 },
                  { label: 'Active', idx: 2 },
                ].map((s) => (
                  <button
                    key={s.idx}
                    onClick={() => setDriverAppScreen(s.idx)}
                    className={`px-2 py-0.5 text-[8.5px] font-bold rounded-md transition-all cursor-pointer ${
                      driverAppScreen === s.idx
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Smartphone Frame */}
              <div className="w-[210px] bg-slate-950 rounded-[28px] p-[6px] border border-slate-800 shadow-2xl relative">
                {/* Dynamic Island / Speaker Pill */}
                <div className="w-14 h-3 bg-slate-900 rounded-full mx-auto mb-1 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-950/80 mr-2" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-950/60" />
                </div>

                {/* Smartphone Display */}
                <div className="bg-[#f6f8fc] rounded-[22px] overflow-hidden border border-slate-800/40 min-h-[355px] max-h-[355px] flex flex-col select-none relative">
                  <AnimatePresence mode="wait">
                    {/* ─────────────────────────────────────────────────────────────
                        SCREEN 0: ASSIGNED TRIPS (Screenshot 1)
                    ───────────────────────────────────────────────────────────── */}
                    {driverAppScreen === 0 && (
                      <motion.div
                        key="screen-0"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        className="p-3 flex flex-col flex-1"
                      >
                        <h4 className="text-base font-extrabold text-slate-900 tracking-tight mb-2.5">
                          Assigned Trips
                        </h4>

                        {/* Next Up Card */}
                        <div className="bg-white rounded-2xl border-2 border-sky-300/80 p-2.5 shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md bg-[#e0f2fe] text-[#0284c7] font-bold text-[8.5px] tracking-wider uppercase">
                              NEXT UP
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-sky-500" />
                          </div>

                          {/* Route timeline */}
                          <div className="relative pl-4 space-y-2.5 py-0.5">
                            {/* Connector line */}
                            <div className="absolute left-[5px] top-[7px] bottom-[7px] w-[1.5px] bg-slate-200" />

                            {/* Origin */}
                            <div className="relative flex items-start gap-1.5">
                              <span className="absolute -left-4 top-[3px] w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                              <span className="text-[10px] font-bold text-slate-800 leading-tight">
                                SMC , Bulacan, Philippines
                              </span>
                            </div>

                            {/* Destination */}
                            <div className="relative flex items-start gap-1.5">
                              <MapPin className="absolute -left-[18px] top-[1px] w-3 h-3 text-rose-500 fill-rose-500" />
                              <span className="text-[10px] font-bold text-slate-800 leading-tight truncate">
                                Golden Gate Memorial Park, San Roqu...
                              </span>
                            </div>
                          </div>

                          {/* Time & Distance badges */}
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#e0f2fe] text-[#0284c7] font-semibold text-[8.5px]">
                              <Clock className="w-2.5 h-2.5 text-[#0284c7]" />
                              <span>Today, 2:20 PM</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f3e8ff] text-[#9333ea] font-bold text-[8.5px]">
                              <span>🔀 35.1 km</span>
                            </div>
                          </div>

                          {/* Truck badge */}
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#ccfbf1] text-[#0f766e] font-bold text-[8.5px]">
                            <Truck className="w-2.5 h-2.5 text-[#0f766e]" />
                            <span>BOOMTRUCK · ABK 9352</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        SCREEN 1: TRIP ASSIGNED (Screenshot 2)
                    ───────────────────────────────────────────────────────────── */}
                    {driverAppScreen === 1 && (
                      <motion.div
                        key="screen-1"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col flex-1"
                      >
                        {/* Top App Bar */}
                        <div className="bg-white border-b border-slate-100 px-3 py-2">
                          <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                            Trip Assigned
                          </h4>
                        </div>

                        <div className="p-2.5 space-y-2 overflow-y-auto max-h-[305px] flex-1">
                          {/* Trip Assigned To You Badge */}
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-400 bg-white text-emerald-700 text-[8.5px] font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Trip Assigned to You</span>
                          </div>

                          {/* Route Section */}
                          <div>
                            <span className="text-[9.5px] font-extrabold text-slate-900 block mb-1">
                              Route
                            </span>
                            <div className="bg-white rounded-xl border border-slate-200/90 p-2 space-y-2 relative">
                              <div className="absolute left-[13px] top-[14px] bottom-[16px] w-[1.5px] bg-slate-200" />

                              {/* Pickup */}
                              <div className="flex items-start gap-2 relative">
                                <span className="w-3 h-3 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                </span>
                                <div>
                                  <div className="text-[7.5px] font-bold text-slate-400 uppercase">
                                    Pickup
                                  </div>
                                  <div className="text-[9px] font-bold text-slate-800 leading-tight">
                                    SMC , Bulacan, Philippines
                                  </div>
                                </div>
                              </div>

                              {/* Dropoff */}
                              <div className="flex items-start gap-2 relative">
                                <MapPin className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-[7.5px] font-bold text-slate-400 uppercase">
                                    Dropoff
                                  </div>
                                  <div className="text-[8.5px] font-bold text-slate-800 leading-tight">
                                    Golden Gate Memorial Park, Baliwag, Bulacan
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Truck Details */}
                          <div>
                            <span className="text-[9.5px] font-extrabold text-slate-900 block mb-1">
                              Truck Details
                            </span>
                            <div className="bg-white rounded-xl border border-slate-200/90 p-2 flex items-center gap-2">
                              <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <div>
                                <div className="text-[7.5px] font-bold text-slate-400 uppercase">
                                  Truck ID
                                </div>
                                <div className="text-[9.5px] font-bold text-slate-800 leading-tight">
                                  BT1
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tagalog Consent / Terms Notice */}
                          <div className="rounded-xl bg-[#e0f2fe]/70 border border-sky-200 p-1.5 text-[7px] text-sky-950 leading-snug">
                            <div className="flex items-start gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center shrink-0 text-[6.5px]">
                                i
                              </span>
                              <span>
                                Sa pag-swipe at pagtanggap ng trip na ito, ikaw ay sumasang-ayon na susubaybayan ng TripSync ang iyong GPS lokasyon...
                              </span>
                            </div>
                          </div>

                          {/* Swipe to Accept CTA button */}
                          <div className="rounded-full bg-[#dcfce7] border border-emerald-300 p-0.5 flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <ArrowRight className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-[8px] font-bold text-emerald-800 truncate">
                              Swipe to Accept &amp; Start Leg 1
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        SCREEN 2: TRIP IN PROGRESS (Screenshot 3)
                    ───────────────────────────────────────────────────────────── */}
                    {driverAppScreen === 2 && (
                      <motion.div
                        key="screen-2"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col flex-1"
                      >
                        {/* Top App Bar */}
                        <div className="bg-white border-b border-slate-100 px-3 py-2">
                          <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                            Trip in Progress
                          </h4>
                        </div>

                        <div className="p-3 flex flex-col justify-between flex-1 text-center">
                          {/* Elapsed Timer */}
                          <div className="pt-2">
                            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                              00:02
                            </div>
                            <div className="text-[8px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5">
                              LEG 1 TIME
                            </div>
                          </div>

                          {/* System Running status */}
                          <div className="py-2">
                            <div className="text-sm font-extrabold text-slate-900">
                              System Running
                            </div>
                            <div className="text-[8.5px] text-slate-500 mt-0.5 leading-snug px-1">
                              Moving to: Golden Gate Memorial Park, Baliwag, Bulacan
                            </div>
                          </div>

                          {/* Next Stop Card */}
                          <div className="bg-white rounded-xl border border-slate-200/90 p-2 text-left flex items-start gap-2 shadow-2xs">
                            <div className="w-4 h-4 text-blue-600 shrink-0 mt-0.5">
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                                NEXT STOP
                              </div>
                              <div className="text-[8.5px] font-bold text-slate-800 leading-tight mt-0.5">
                                Golden Gate Memorial Park, Baliwag, Bulacan
                              </div>
                            </div>
                          </div>

                          {/* Swipe to Finish Trip Button */}
                          <div className="rounded-full bg-[#e0f2fe] border border-sky-300 p-0.5 flex items-center gap-1.5 mt-2">
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <ArrowRight className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-[8.5px] font-bold text-blue-800 truncate">
                              Swipe to Finish Trip
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>


          {/* ═══════════════════════════════════════════════════════════
              CARD 5 — AUTOMATED TRIP REPORT (MEDIUM: 4 COLS)
              Embed: TripReportTemplate / export modal chrome
          ═══════════════════════════════════════════════════════════ */}
          <div className={`${CARD} md:col-span-12 lg:col-span-4`}>
            <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug">Trip reports</h3>
                <p className="text-xs text-slate-500 mt-0.5">Instant PDF manifests &amp; fuel audit reports.</p>
              </div>
              <Link href="/auth/trip-history" aria-label="Generate Reports" className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors shrink-0">
                <Maximize2 className="w-3 h-3" />
              </Link>
            </div>

            {/* App window embed: print report modal */}
            <div className="mx-4 mb-4 rounded-lg overflow-hidden border border-slate-200 shadow-2xs flex flex-col flex-1">
              {/* Modal-style header */}
              <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                    <Printer className="w-3.5 h-3.5"/>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Trip Manifest</div>
                    <div className="text-[9px] text-slate-400">TRP-0041 · Oct 16, 2026</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">PDF</span>
              </div>

              {/* Report body preview */}
              <div className="bg-white p-3 space-y-2 flex-1 flex flex-col justify-between">
                {/* Trip details grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {[
                    ['Driver', 'Juan Dela Cruz'],
                    ['Vehicle', 'Truck #04 · ABC-1234'],
                    ['Route', 'Manila → Calamba'],
                    ['Distance', '68.4 km'],
                    ['Fuel Used', '21.5 L'],
                    ['Duration', '1h 42m'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-slate-50 rounded-md p-1.5 border border-slate-100">
                      <div className="text-slate-400 font-semibold">{k}</div>
                      <div className="font-bold text-slate-800 truncate">{v}</div>
                    </div>
                  ))}
                </div>

                {/* Flags section */}
                <div className="bg-emerald-50 rounded-md p-2 border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0"/>
                  <span className="text-[10px] font-bold text-emerald-800">No anomalies detected — 0 flags</span>
                </div>

                {/* Generation progress */}
                <div className="bg-white rounded-md p-2 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-600 font-medium truncate pr-2">{reportStatus}</span>
                    <span className="text-emerald-700 font-bold font-mono">{Math.min(reportProgress, 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      style={{ width: `${Math.min(reportProgress, 100)}%` }}
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Download button */}
                <button type="button" className="w-full py-2 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                  <Download className="w-3 h-3 text-emerald-400"/>
                  Download Audit Manifest (PDF)
                </button>
              </div>
            </div>
          </div>


          {/* ═══════════════════════════════════════════════════════════
              CARD 3 — DISPATCH TRIPS IN SECONDS (FULL-WIDTH HERO: 12 COLS)
              Stripe-style grand showcase banner + interactive wizard steps
          ═══════════════════════════════════════════════════════════ */}
          <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden md:col-span-12 lg:col-span-12">
            {/* Title row */}
            <div className="px-6 sm:px-8 pt-5 sm:pt-6 pb-3 flex items-start justify-between gap-3 bg-white">
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-950 tracking-tight leading-snug">
                  Dispatch trips in seconds
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Automated route planning, fuel forecasting, and instant driver dispatch.
                </p>
              </div>
              <Link href="/auth/plan-trip" aria-label="Open Plan Trip" className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors shrink-0">
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Full-bleed gradient body */}
            <div className="relative flex-1 min-h-[260px] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 overflow-hidden p-6 sm:p-8">
              <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-violet-300/20 blur-3xl pointer-events-none"/>
              <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-indigo-300/15 blur-3xl pointer-events-none"/>
              <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}/>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                {/* Left side: Wizard status, progress bar & compilation CTA */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-violet-200" />
                      4-Step Automated Dispatch Wizard
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                      Zero-touch dispatch from depot to delivery
                    </h4>
                    <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                      Auto-computes required fuel from truck efficiency ratings, assigns available certified drivers, and generates audit manifests in under 2 seconds.
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                      <span>Dispatch Progress</span>
                      <span className="font-mono text-[11px]">{Math.min(dispatchStep + 1, 4)} / 4 Complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[0, 1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                            dispatchStep >= s ? 'bg-white' : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action trigger button */}
                  <div>
                    <AnimatePresence mode="wait">
                      {dispatchStep === 3 ? (
                        <motion.div
                          key="done"
                          initial={{ opacity: 0, scale: 0.96, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full py-3 px-4 rounded-lg bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/20"
                        >
                          <Check className="w-4 h-4" /> Trip dispatched in 1.4 seconds
                        </motion.div>
                      ) : (
                        <motion.div
                          key="going"
                          initial={{ opacity: 0, scale: 0.96, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full py-3 px-4 rounded-lg bg-white/15 border border-white/25 backdrop-blur-sm text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 animate-spin text-violet-200" /> Compiling dispatch telemetry...
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right side: 3 Animated Wizard Step Cards */}
                <div className="lg:col-span-7 space-y-2.5">
                  {[
                    { n: 1, label: 'Route', value: 'Manila North → Calamba', right: '68.4 km', rightCls: 'text-white/60 font-mono text-xs' },
                    { n: 2, label: 'Fuel Forecast', value: '21.5 L · Auto-computed', right: 'Optimal', rightCls: 'text-xs font-bold text-emerald-300 bg-emerald-400/20 border border-emerald-300/25 px-2.5 py-0.5 rounded-md' },
                    { n: 3, label: 'Assignment', value: 'Ramon S. · Truck #08', right: 'Confirmed', rightCls: 'text-[11px] text-white/45' },
                  ].map(({ n, label, value, right, rightCls }) => (
                    <motion.div
                      key={n}
                      animate={{ opacity: dispatchStep >= n - 1 ? 1 : 0.3, y: dispatchStep >= n - 1 ? 0 : 10 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="flex items-center justify-between bg-white/12 backdrop-blur-md border border-white/20 rounded-xl px-4 sm:px-5 py-3 sm:py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all duration-300 ${
                            dispatchStep >= n - 1 ? 'bg-white text-indigo-700 shadow-md' : 'bg-white/15 text-white/40'
                          }`}
                        >
                          {n}
                        </div>
                        <div>
                          <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mb-0.5">{label}</div>
                          <div className="text-sm sm:text-base font-bold text-white leading-tight">{value}</div>
                        </div>
                      </div>
                      <span className={rightCls}>{right}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
