'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  MapPin,
  Truck,
  Plus,
  Trash,
  GripVertical,
  FileText,
  Users,
  UserCheck,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
} from 'lucide-react';
import CalendarToday from '@mui/icons-material/CalendarToday';
import LocalShipping from '@mui/icons-material/LocalShipping';
import RouteIcon from '@mui/icons-material/Route';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import Person from '@mui/icons-material/Person';

/**
 * Landing-page replica of the real /auth/plan-trip page (Hero + StepHeader +
 * CombinedTripDetails + TripPreview). It reuses the same markup / Tailwind classes, split into
 * short screens that auto-cycle (like the Driver app preview) inside a fixed-height window.
 */

interface PlanTrip {
  requestDateTime: string;
  depDate: string;
  depHour: string;
  depMin: string;
  depAmPm: 'AM' | 'PM';
  depLabel: string;
  stops: string[];
  truckName: string;
  plate: string;
  engine: string;
  efficiency: number;
  driverName: string;
  notes: string;
  distance: number;
  tripId: string;
}

const TRIPS: PlanTrip[] = [
  {
    requestDateTime: '2026-10-21 , 13:58',
    depDate: '2026-10-21',
    depHour: '02',
    depMin: '45',
    depAmPm: 'PM',
    depLabel: 'Oct 21, 2026 • 02:45 PM',
    stops: ['LivanTrade Pagbilao Depot', 'Lucena City Warehouse', 'Batangas International Container Terminal'],
    truckName: 'BOOMTRUCK',
    plate: 'ABK 9352',
    engine: 'Diesel',
    efficiency: 12,
    driverName: 'James Dy',
    notes: 'Heavy equipment haul. Call the port gate on arrival.',
    distance: 84.5,
    tripId: 'TRP-2026-089',
  },
  {
    requestDateTime: '2026-10-22 , 08:41',
    depDate: '2026-10-22',
    depHour: '09',
    depMin: '30',
    depAmPm: 'AM',
    depLabel: 'Oct 22, 2026 • 09:30 AM',
    stops: ['Manila North Harbor Hub', 'Calamba Logistics Depot'],
    truckName: 'ISUZU GIGA HEAVY',
    plate: 'NCR 4108',
    engine: 'Diesel',
    efficiency: 8.5,
    driverName: 'Juan Dela Cruz',
    notes: 'Raw materials transfer. Unload at Dock 3.',
    distance: 68.4,
    tripId: 'TRP-2026-090',
  },
];

const STEPS = ['Trip Details', 'Review'];

/* ── Shared building blocks (same markup as components/form-builder) ───────── */

const FormSection = ({
  icon,
  title,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
      <span className="w-7 h-7 rounded-md bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary flex-shrink-0">
        {icon}
      </span>
      <span className="text-sm font-bold text-on-surface tracking-wide uppercase font-headline">{title}</span>
      {badge && (
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant border border-slate-200 rounded px-2 py-0.5">
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
);

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider flex items-center gap-1">
    {children}
    {required && <span className="text-error">*</span>}
  </label>
);

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-500 font-medium mb-0.5 uppercase tracking-tighter">{label}</p>
    <p className="text-[15px] text-gray-900 font-medium">{value || '—'}</p>
  </div>
);

const fade = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: 0.08 * i },
});

/* ── Component ─────────────────────────────────────────────────────────────── */

const SCREENS = [
  { label: 'Trip Details', stepper: 1 },
  { label: 'Fleet & Notes', stepper: 1 },
  { label: 'Review', stepper: 2 },
  { label: 'Dispatched', stepper: 3 },
];

export default function LandingPlanTripPreview() {
  const [screen, setScreen] = useState(0);
  const [tripIndex, setTripIndex] = useState(0);

  const trip = TRIPS[tripIndex];
  const totalFuel = trip.distance / trip.efficiency;
  const withTraffic = totalFuel * 1.1;
  const step = SCREENS[screen].stepper; // 1 = Trip Details, 2 = Review, 3 = done

  // Auto-cycle screens (restarts whenever a pill is clicked, like the Driver app preview)
  useEffect(() => {
    const t = setTimeout(() => {
      if (screen === SCREENS.length - 1) {
        setTripIndex((i) => (i + 1) % TRIPS.length);
        setScreen(0);
      } else {
        setScreen(screen + 1);
      }
    }, screen === SCREENS.length - 1 ? 3000 : 4800);
    return () => clearTimeout(t);
  }, [screen, tripIndex]);

  const screenMotion = {
    initial: { opacity: 0, x: 14 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -14 },
    transition: { duration: 0.25, ease: 'easeInOut' as const },
  };

  return (
    <div className="bg-slate-50 flex flex-col items-center pt-3 pb-3 select-none">
      {/* Screen selector pills (same as Driver app card) */}
      <div className="flex items-center gap-1 mb-2 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
        {SCREENS.map((s, idx) => (
          <button
            key={s.label}
            onClick={() => setScreen(idx)}
            className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
              screen === idx ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Fixed-height page (no scrolling) */}
      <div className="w-full h-[470px] overflow-hidden relative">
        <div className="px-4 sm:px-6 max-w-3xl mx-auto flex flex-col items-center" style={{ zoom: 0.78 }}>
          {/* ── StepHeader ── */}
          <div className="w-full max-w-2xl">
            <div className="w-full pt-2 pb-5 mb-4">
              <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                {STEPS.map((label, idx) => {
                  const n = idx + 1;
                  const isCompleted = step > n;
                  const isActive = step === n;
                  return (
                    <React.Fragment key={label}>
                      <div className="flex flex-col items-center relative z-10">
                        <motion.div
                          initial={false}
                          animate={{
                            backgroundColor: isCompleted ? '#10b981' : '#ffffff',
                            borderColor: isCompleted || isActive ? '#10b981' : '#cbd5e1',
                            scale: isActive ? 1.15 : 1,
                          }}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-colors
                            ${isCompleted ? 'text-white' : ''}
                            ${isActive ? 'text-emerald-600 shadow-lg shadow-emerald-500/30' : ''}
                            ${!isActive && !isCompleted ? 'text-slate-500' : ''}`}
                        >
                          {isCompleted ? <Check className="w-6 h-6" strokeWidth={3} /> : <span>{n}</span>}
                        </motion.div>
                        <span
                          className={`absolute -bottom-7 text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap hidden sm:block
                            ${isCompleted ? 'text-emerald-700' : isActive ? 'text-emerald-600' : 'text-slate-500'}`}
                        >
                          {label}
                        </span>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className="flex-1 h-[2px] bg-slate-200 mx-2 -translate-y-3.5 relative overflow-hidden">
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full mt-4">
            <AnimatePresence mode="wait">
              {/* ── SCREEN 0: Request Timeline + Trip Locations ── */}
              {screen === 0 && (
                <motion.div key={`s0-${tripIndex}`} {...screenMotion}>
                  <div className="space-y-6">
                    <motion.div {...fade(0)}>
                      <FormSection icon={<Clock size={16} />} title="Request Timeline">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                          <div className="flex flex-col gap-1.5">
                            <FieldLabel required>Date and Time of Request</FieldLabel>
                            <input
                              readOnly
                              disabled
                              value={trip.requestDateTime}
                              className="w-full bg-surface-container-low border border-slate-200 rounded-lg px-4 py-3 text-on-surface font-medium outline-none disabled:opacity-50"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5 w-full">
                            <FieldLabel required>Departure Date &amp; Time</FieldLabel>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <input
                                readOnly
                                type="date"
                                value={trip.depDate}
                                className="flex-1 bg-surface-container-low border border-slate-200 rounded-lg px-4 py-3 text-on-surface font-medium outline-none"
                              />
                              <div className="flex items-center gap-1.5">
                                <span className="w-16 bg-surface-container-low border border-slate-200 rounded-lg px-2 py-3 text-on-surface font-medium text-center">
                                  {trip.depHour}
                                </span>
                                <span className="text-slate-400 font-bold">:</span>
                                <span className="w-16 bg-surface-container-low border border-slate-200 rounded-lg px-2 py-3 text-on-surface font-medium text-center">
                                  {trip.depMin}
                                </span>
                                <span className="w-16 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg px-2 py-3 font-semibold text-center">
                                  {trip.depAmPm}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {['Now', 'In 30m', 'In 1h', 'In 2h', 'In 4h'].map((label) => (
                                <span
                                  key={label}
                                  className="text-[11px] bg-slate-50 text-slate-600 border border-slate-200 rounded-md px-2 py-1 font-medium"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </FormSection>
                    </motion.div>

                    <motion.div {...fade(1)}>
                      <FormSection icon={<MapPin size={16} />} title="Trip Locations">
                        <div className="space-y-2">
                          {trip.stops.map((name, idx) => {
                            const total = trip.stops.length;
                            const type = idx === 0 ? 'start' : idx === total - 1 ? 'end' : 'middle';
                            return (
                              <motion.div
                                key={name}
                                {...fade(idx + 2)}
                                className="flex items-start sm:items-center gap-3 bg-white/50 rounded-xl p-1 relative"
                              >
                                <div className="p-1 text-slate-300 select-none shrink-0">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-4 relative">
                                    <div className="flex flex-col items-center absolute left-0 h-full">
                                      <div
                                        className={`w-3 h-3 rounded-full mt-5 ring-4 ${
                                          type === 'start'
                                            ? 'bg-emerald-500 ring-emerald-500/20'
                                            : type === 'end'
                                            ? 'bg-rose-500 ring-rose-500/20'
                                            : 'bg-slate-400 ring-slate-400/20'
                                        }`}
                                      />
                                      {idx !== total - 1 && <div className="w-[2px] flex-1 bg-slate-200 my-1" />}
                                    </div>
                                    <div className="flex-1 ml-8 relative min-w-0">
                                      <div className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-left grid grid-cols-[auto_1fr_auto] items-center gap-3 font-bold shadow-sm">
                                        <MapPin size={18} className="text-blue-500" />
                                        <span className="text-slate-900 truncate w-full">{name}</span>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {total > 2 && (
                                  <div className="p-3 text-slate-400 shrink-0">
                                    <Trash className="w-5 h-5" />
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                          <div className="text-sm font-semibold text-secondary flex items-center gap-2 px-2 py-1">
                            <Plus className="w-4 h-4" /> Add Stop
                          </div>
                        </div>
                      </FormSection>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ── SCREEN 1: Vehicle / Driver / Toll + Notes + Authorized + Continue ── */}
              {screen === 1 && (
                <motion.div key={`s1-${tripIndex}`} {...screenMotion}>
                  <div className="space-y-4" style={{ zoom: 0.88 }}>
                    <motion.div {...fade(0)} className="space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="sm:w-32 flex items-center gap-2">
                          <Truck className="w-5 h-5 text-on-surface-variant" />
                          <label className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider">
                            Vehicle
                          </label>
                        </div>
                        <div className="flex-1 bg-surface-container-low border border-slate-200 rounded-lg px-4 py-3 flex justify-between items-center font-medium">
                          <span className="text-on-surface font-semibold">
                            {trip.truckName} · {trip.plate}
                          </span>
                          <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="sm:w-32 flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-on-surface-variant" />
                          <label className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider">
                            Driver
                          </label>
                        </div>
                        <div className="flex-1 bg-surface-container-low border border-slate-200 rounded-lg px-4 py-3 flex justify-between items-center font-medium">
                          <span className="text-on-surface font-semibold">{trip.driverName}</span>
                          <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-blue-100 bg-blue-50/30">
                        <div className="space-y-0.5">
                          <label className="text-sm font-bold text-blue-900">Apply Toll</label>
                          <p className="text-[10px] text-blue-600 font-medium italic">Avoiding toll roads (Standard)</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div {...fade(1)}>
                      <FormSection icon={<FileText size={16} />} title="Notes">
                        <div className="flex flex-col gap-1.5">
                          <div className="w-full bg-surface-container-low border border-slate-200 rounded-lg px-4 py-3 text-on-surface font-medium min-h-[64px]">
                            {trip.notes}
                          </div>
                        </div>
                      </FormSection>
                    </motion.div>

                    <motion.div {...fade(2)}>
                      <FormSection icon={<Users size={16} />} title="Authorized By:" badge="Required">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                          <div className="flex flex-col gap-1.5">
                            <FieldLabel required>Requested By</FieldLabel>
                            <input
                              readOnly
                              disabled
                              value="TripSync ADMIN"
                              className="w-full bg-surface-container-low border border-slate-200 rounded-lg px-4 py-3 text-on-surface font-medium outline-none disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </FormSection>
                    </motion.div>

                    <motion.div {...fade(3)} className="flex items-center">
                      <div className="ml-auto px-12 py-3.5 bg-secondary text-on-secondary rounded-lg font-headline font-bold text-lg flex items-center justify-center gap-3">
                        Continue to Trip Preview
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ── SCREEN 2: Trip Review ── */}
              {screen === 2 && (
                <motion.div key={`s2-${tripIndex}`} {...screenMotion}>
                  <div className="max-w-2xl mx-auto space-y-3" style={{ zoom: 0.84 }}>
                    <motion.section {...fade(0)}>
                      <div className="flex items-center gap-3 mb-2 text-gray-600">
                        <CalendarToday fontSize="small" className="text-blue-600" />
                        <h2 className="text-sm font-medium uppercase tracking-wider">General Information</h2>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 px-1">
                        <InfoItem label="Date & Time of Request" value={trip.requestDateTime.replace(' , ', ' • ')} />
                        <InfoItem label="Scheduled Departure" value={trip.depLabel} />
                      </div>
                    </motion.section>

                    <hr className="border-gray-100" />

                    <motion.section {...fade(1)}>
                      <div className="flex items-center gap-3 mb-2 text-gray-600">
                        <LocalShipping fontSize="small" className="text-blue-600" />
                        <h2 className="text-sm font-medium uppercase tracking-wider">Logistics &amp; Fuel</h2>
                      </div>
                      <div className="bg-gray-100/50 rounded-xl p-3 border border-gray-100 flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">Assigned Vehicle</p>
                          <p className="text-lg font-medium text-gray-900">{trip.truckName}</p>
                          <p className="text-sm text-gray-600">
                            {trip.plate} • {trip.engine}
                          </p>
                        </div>
                        <div className="flex-1 border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-4">
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-tight flex items-center gap-1">
                            <Person fontSize="small" /> Driver
                          </p>
                          <p className="text-lg font-medium text-gray-900">{trip.driverName}</p>
                        </div>
                        <div className="text-right border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-4 w-full sm:w-auto">
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">Est. Fuel Request</p>
                          <p className="text-xl font-bold text-blue-700">{totalFuel.toFixed(2)} L</p>
                          <p className="text-xs text-gray-500 italic mt-0.5 flex items-center justify-end gap-1">
                            <LocalGasStation sx={{ fontSize: 13 }} />
                            {trip.distance.toFixed(2)} km
                          </p>
                          <div className="text-[11px] text-gray-500 mt-1 leading-tight space-y-0.5">
                            <p>With traffic allowance (10%): {withTraffic.toFixed(2)} L</p>
                            <p>Fuel efficiency: {trip.efficiency} km/L</p>
                          </div>
                        </div>
                      </div>
                    </motion.section>

                    <hr className="border-gray-100" />

                    <motion.section {...fade(2)}>
                      <div className="flex items-center gap-3 mb-2 text-gray-600">
                        <RouteIcon fontSize="small" className="text-blue-600" />
                        <h2 className="text-sm font-medium uppercase tracking-wider">Route Plan</h2>
                      </div>
                      <div className="ml-2 border-l-2 border-dashed border-gray-200 pl-6 space-y-2.5 relative">
                        {trip.stops.map((name, idx) => (
                          <div key={name} className="relative">
                            <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                            <p className="text-xs font-bold text-blue-600 uppercase mb-0.5">
                              {idx === 0 ? 'Origin' : idx === trip.stops.length - 1 ? 'Destination' : `Stop ${idx}`}
                            </p>
                            <p className="text-sm text-gray-800 leading-relaxed font-medium">{name}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <span className="text-sm font-bold text-slate-700">Total Route Distance</span>
                        <span className="text-base font-bold text-blue-700">{trip.distance.toFixed(2)} km</span>
                      </div>
                    </motion.section>

                    <motion.div {...fade(3)} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 px-4 py-3 text-secondary font-headline font-bold text-lg">
                        <ArrowLeft className="w-5 h-5" />
                        Back
                      </div>
                      <div className="px-12 py-3.5 bg-secondary text-on-secondary rounded-lg font-headline font-bold text-lg flex items-center justify-center gap-3">
                        Submit Trip Request
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ── SCREEN 3: Dispatched (toast + redirect in the real app) ── */}
              {screen === 3 && (
                <motion.div
                  key={`s3-${tripIndex}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <h5 className="text-lg font-black text-slate-900">Trip dispatched successfully!</h5>
                    <p className="text-sm text-slate-500 mt-1">
                      Dispatched to driver <strong className="text-slate-800">{trip.driverName}</strong> · Manifest ID:{' '}
                      {trip.tripId}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Redirecting to live tracking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
