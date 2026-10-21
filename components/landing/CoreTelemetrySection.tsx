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
              CARD 5 — TRIP REPORTS (COMPACT: 3 COLS)
              Embed: Authentic Fleet Trip History Report
          ═══════════════════════════════════════════════════════════ */}
          <div className={`${CARD} md:col-span-6 lg:col-span-3`}>
            <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug">Trip reports</h3>
                <p className="text-xs text-slate-500 mt-0.5">Instant PDF manifests &amp; fuel audit reports.</p>
              </div>
              <Link href="/auth/trip-history" aria-label="Generate Reports" className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors shrink-0">
                <Maximize2 className="w-3 h-3" />
              </Link>
            </div>

            {/* App window embed: authentic print report document */}
            <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-slate-200/90 shadow-sm flex flex-col flex-1 bg-white">
              {/* Modal-style window header */}
              <div className="bg-white border-b border-slate-100 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                    <Printer className="w-3 h-3"/>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold text-slate-900 leading-tight">Fleet Trip Manifest</div>
                    <div className="text-[8px] text-slate-400">PDF Audit Report</div>
                  </div>
                </div>
                <span className="text-[8.5px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">PDF</span>
              </div>

              {/* Document Sheet Preview matching real report */}
              <div className="p-2.5 bg-slate-50/60 flex-1 flex flex-col justify-between overflow-y-auto max-h-[385px] space-y-2">
                <div className="bg-white rounded-lg border border-slate-200/80 p-2.5 shadow-2xs space-y-2">
                  {/* Document Title Header */}
                  <div className="border-b border-slate-100 pb-2 flex items-start justify-between">
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-tight font-sans">
                        Fleet Trip History Report
                      </h4>
                      <p className="text-[7.5px] text-slate-500 font-medium mt-0.5">
                        Range: Oct 21, 2026 — Oct 21, 2026
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        GENERATED ON
                      </span>
                      <span className="text-[8px] font-bold text-slate-700">
                        10/21/2026
                      </span>
                    </div>
                  </div>

                  {/* Aggregated KPI Cards (Matching screenshot) */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-3 gap-1">
                      <div className="bg-slate-50 border border-slate-200/70 rounded-md p-1">
                        <span className="text-[6.5px] font-bold uppercase tracking-wider text-slate-400 block">TOTAL DISTANCE</span>
                        <span className="text-[9px] font-black text-slate-800">0.0<span className="text-[7px] font-normal text-slate-400 ml-0.5">km</span></span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/70 rounded-md p-1">
                        <span className="text-[6.5px] font-bold uppercase tracking-wider text-slate-400 block">FUEL REQUESTED</span>
                        <span className="text-[9px] font-black text-blue-600">4.4<span className="text-[7px] font-normal text-slate-400 ml-0.5">L</span></span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/70 rounded-md p-1">
                        <span className="text-[6.5px] font-bold uppercase tracking-wider text-slate-400 block">EST. CONSUMED</span>
                        <span className="text-[9px] font-black text-slate-800">0.0<span className="text-[7px] font-normal text-slate-400 ml-0.5">L</span></span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-md p-1 flex items-center justify-between">
                        <span className="text-[6.5px] font-bold uppercase tracking-wider text-emerald-700">COMPLETED</span>
                        <span className="text-[9px] font-black text-slate-800">1<span className="text-[7px] font-normal text-slate-400 ml-0.5">runs</span></span>
                      </div>
                      <div className="bg-rose-50/50 border border-rose-200/60 rounded-md p-1 flex items-center justify-between">
                        <span className="text-[6.5px] font-bold uppercase tracking-wider text-rose-700">CANCELLED</span>
                        <span className="text-[9px] font-black text-slate-800">0<span className="text-[7px] font-normal text-slate-400 ml-0.5">runs</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Trip Record Block (Matching screenshot) */}
                  <div className="border border-slate-200 rounded-lg p-2 space-y-1.5 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-black text-slate-900 block leading-tight">Trip Record</span>
                        <span className="text-[6.5px] font-mono text-slate-400">ID: cc3dd6d2-2273-4430...</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded-full border border-emerald-400 text-emerald-700 bg-white font-bold text-[7px]">
                        COMPLETED
                      </span>
                    </div>

                    <div className="border-t border-slate-100 pt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-[7.5px]">
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[6.5px] block">PROJECT TAG</span>
                        <span className="text-slate-700 font-semibold">—</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[6.5px] block">TRAVEL PURPOSE</span>
                        <span className="text-slate-800 font-bold truncate block">Loading Cargo</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[6.5px] block">DATE &amp; TIME</span>
                        <span className="text-slate-700 font-semibold">Oct 21, 2026 • 13:50</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[6.5px] block">SCHEDULED</span>
                        <span className="text-slate-700 font-semibold truncate block">Oct 21, 2:20 PM</span>
                      </div>
                    </div>

                    {/* Vehicle & Consumption Box */}
                    <div className="bg-slate-50 border border-slate-100 rounded p-1.5 text-[7px] space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">BOOMTRUCK <span className="font-normal text-slate-400">(BT1)</span></span>
                        <span className="font-bold text-blue-600">Fuel Req: 4.39 L</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Driver: <strong className="text-slate-700 font-medium">jamesdy7830</strong></span>
                        <span>Distance: <strong>0.00 km</strong></span>
                      </div>
                    </div>

                    {/* Route Segment */}
                    <div className="pt-0.5">
                      <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        PER-LEG ROUTE BREAKDOWN
                      </span>
                      <div className="flex items-center gap-1 text-[7.5px] font-semibold text-slate-800 truncate">
                        <span className="w-3 h-3 rounded bg-slate-900 text-white font-mono flex items-center justify-center text-[7px] shrink-0">1</span>
                        <span className="truncate">SMC, Bulacan → Golden Gate Memorial Park</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PDF Manifest download button */}
                <button type="button" className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[8.5px] flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0">
                  <Download className="w-3 h-3 text-emerald-400"/>
                  Export Audit Manifest (PDF)
                </button>
              </div>
            </div>
          </div>


          {/* ═══════════════════════════════════════════════════════════
              CARD 6 — DRIVER APP (BIGGER: 4 COLS)
              Embed: Smartphone frame with authentic driver app UI
          ═══════════════════════════════════════════════════════════ */}
          <div className={`${CARD} md:col-span-12 lg:col-span-4`}>
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
              <div className="flex items-center gap-1 mb-2.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                {[
                  { label: 'Assigned Trips', idx: 0 },
                  { label: 'Trip Details', idx: 1 },
                  { label: 'In Progress', idx: 2 },
                ].map((s) => (
                  <button
                    key={s.idx}
                    onClick={() => setDriverAppScreen(s.idx)}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                      driverAppScreen === s.idx
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Smartphone Frame - scaled with generous width for 4-col slot */}
              <div className="w-[230px] sm:w-[240px] bg-slate-950 rounded-[30px] p-[7px] border border-slate-800 shadow-2xl relative">
                {/* Dynamic Island / Speaker Pill */}
                <div className="w-16 h-3 bg-slate-900 rounded-full mx-auto mb-1.5 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-950/80 mr-2" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-950/60" />
                </div>

                {/* Smartphone Display */}
                <div className="bg-[#f6f8fc] rounded-[24px] overflow-hidden border border-slate-800/40 min-h-[360px] max-h-[360px] flex flex-col select-none relative">
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
                        className="p-3.5 flex flex-col flex-1"
                      >
                        <h4 className="text-base font-extrabold text-slate-900 tracking-tight mb-2.5">
                          Assigned Trips
                        </h4>

                        {/* Next Up Card */}
                        <div className="bg-white rounded-2xl border-2 border-sky-300/80 p-3 shadow-sm space-y-2.5">
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
                        <div className="bg-white border-b border-slate-100 px-3.5 py-2">
                          <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                            Trip Assigned
                          </h4>
                        </div>

                        <div className="p-3 space-y-2 overflow-y-auto max-h-[310px] flex-1">
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
                            <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 space-y-2 relative">
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
                          <div className="rounded-xl bg-[#e0f2fe]/70 border border-sky-200 p-2 text-[7px] text-sky-950 leading-snug">
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
                            <span className="text-[8.5px] font-bold text-emerald-800 truncate">
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
                        <div className="bg-white border-b border-slate-100 px-3.5 py-2">
                          <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                            Trip in Progress
                          </h4>
                        </div>

                        <div className="p-3.5 flex flex-col justify-between flex-1 text-center">
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
              CARD 3 — DISPATCH TRIPS IN SECONDS (FULL-WIDTH HERO: 12 COLS)
              Plan Trip page mockup matching the real /auth/plan-trip UI
          ═══════════════════════════════════════════════════════════ */}
          <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden md:col-span-12 lg:col-span-12">
            {/* Title row */}
            <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-950 tracking-tight leading-snug">
                  Dispatch trips in seconds
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Configure logistical routes with real-time precision.
                </p>
              </div>
              <Link href="/auth/plan-trip" aria-label="Open Plan Trip" className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors shrink-0">
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* App window embed */}
            <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
              {/* Window chrome bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"/>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"/>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"/>
                </div>
                <div className="flex-1 flex items-center justify-center gap-1.5">
                  <Navigation className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] text-slate-400 font-medium">New Dispatch · Plan Trip</span>
                </div>
              </div>

              {/* Page content */}
              <div className="bg-white px-5 py-5">
                {/* Page header */}
                <div className="text-center mb-5">
                  <p className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase mb-1">New Dispatch</p>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Plan Trip</h2>
                  <p className="text-xs text-slate-400 mt-1">Configure logistical routes with real-time precision.</p>
                </div>

                {/* 4-step stepper */}
                <div className="flex items-start justify-center gap-0 mb-6 overflow-x-auto">
                  {[
                    { n: 1, label: 'GENERAL INFORMATION', active: true },
                    { n: 2, label: 'LOCATION', active: false },
                    { n: 3, label: 'INVENTORY', active: false },
                    { n: 4, label: 'FUEL CONSUMPTION', active: false },
                  ].map(({ n, label, active }, i) => (
                    <div key={n} className="flex items-start">
                      <div className="flex flex-col items-center gap-1 min-w-[68px] sm:min-w-[80px]">
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-black transition-all ${
                          active
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-300 bg-white text-slate-400'
                        }`}>
                          {n}
                        </div>
                        <span className={`text-[9px] font-bold text-center leading-tight tracking-wide ${
                          active ? 'text-emerald-600' : 'text-slate-400'
                        }`}>{label}</span>
                      </div>
                      {i < 3 && (
                        <div className="flex-1 h-px bg-slate-200 mt-[18px] mx-1 min-w-[16px] sm:min-w-[24px]" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Section header */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 mb-4 w-fit">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Request Timeline &amp; Project</span>
                </div>

                {/* Form fields grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* DATE AND TIME OF REQUEST */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                      Date and Time of Request <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500 font-mono select-none cursor-not-allowed">
                      10 / 21 / 2026 , 02 : 17 &nbsp;PM
                    </div>
                  </div>

                  {/* DEPARTURE DATE & TIME */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                      Departure Date &amp; Time <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="flex items-center gap-2 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 font-mono">
                        <span>10 / 21 / 2026</span>
                        <svg className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </div>
                      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2.5">
                        <span className="text-xs text-slate-700 font-mono">02</span>
                        <ChevronRight className="w-2.5 h-2.5 text-slate-300 rotate-90" />
                      </div>
                      <span className="text-slate-400 text-xs">:</span>
                      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2.5">
                        <span className="text-xs text-slate-700 font-mono">45</span>
                        <ChevronRight className="w-2.5 h-2.5 text-slate-300 rotate-90" />
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-xs text-slate-700 font-semibold">
                        PM
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Now', 'In 30m', 'In 1h', 'In 2h', 'In 4h'].map((t) => (
                        <button key={t} className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PROJECT TAG */}
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                      Project Tag
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
                      <span className="px-3 py-2.5 text-xs font-bold text-slate-400 border-r border-slate-200">#</span>
                      <span className="px-3 py-2.5 text-xs text-slate-400">e.g. PRJ-2024-001</span>
                    </div>
                  </div>

                  {/* PURPOSE OF TRAVEL */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                      Purpose of Travel <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="w-full rounded-xl border border-slate-200 bg-white px-3 pt-2.5 pb-6 text-xs text-slate-400 min-h-[72px]">
                        Describe the reason for this trip...
                      </div>
                      <span className="absolute bottom-2 right-3 text-[10px] text-slate-400">0 / 300</span>
                    </div>
                  </div>

                  {/* NOTES */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                      Notes
                    </label>
                    <div className="relative">
                      <div className="w-full rounded-xl border border-slate-200 bg-white px-3 pt-2.5 pb-6 text-xs text-slate-400 min-h-[72px]">
                        Notes...
                      </div>
                      <span className="absolute bottom-2 right-3 text-[10px] text-slate-400">0 / 300</span>
                    </div>
                  </div>
                </div>

                {/* AUTHORIZED BY */}
                <div className="mt-4 flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20H7a2 2 0 01-2-2v-1a5 5 0 015-5h4a5 5 0 015 5v1a2 2 0 01-2 2z"/><circle cx="12" cy="8" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l1 1 3-3"/></svg>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Authorized By:</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-500">Required</span>
                </div>

                {/* REQUESTED BY */}
                <div className="mt-4">
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                    Requested By <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-400">
                    Requestor&apos;s Name
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
