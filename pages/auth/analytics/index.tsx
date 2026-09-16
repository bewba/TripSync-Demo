import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, ChevronDown, Search, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DistanceChart } from '@/components/auth/analytics/DistanceChart';
import { FuelChart } from '@/components/auth/analytics/FuelChart';
import { FuelRequestedChart } from '@/components/auth/analytics/FuelRequestedChart';
import { ChartSkeleton } from '@/components/auth/analytics/ChartSkeleton';
import { groupByDate, type AnalyticsEntry } from '@/lib/analyticsHelpers';
import { useAnalytics } from '@/hooks/queries';
import { fetchJson, queryKeys } from '@/hooks/queries/keys';

// ── Searchable combobox ───────────────────────────────────────────────────────
interface SelectOption {
    value: string;
    label: string;
    subtitle?: string;
    badge?: string;
    prefixCode?: string;
}

interface SearchableSelectProps {
    label: string;
    value: string;
    selectedValueLabel?: string;
    onChange: (value: string, label: string) => void;
    placeholder?: string;
    fetchOptions: (query: string) => Promise<SelectOption[]>;
}

function SearchableSelect({
    label,
    value,
    selectedValueLabel,
    onChange,
    placeholder = 'All',
    fetchOptions
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Load options dynamically when open or query changes
    useEffect(() => {
        if (!open) return;

        let active = true;
        const load = async () => {
            setIsLoading(true);
            try {
                const res = await fetchOptions(query);
                if (active) setOptions(res);
            } catch (err) {
                console.error(err);
            } finally {
                if (active) setIsLoading(false);
            }
        };

        if (query === '') {
            load();
        } else {
            // Debounce: Wait for 200ms of typing inactivity before fetching from the API
            const timer = setTimeout(load, 200);
            return () => {
                active = false;
                clearTimeout(timer);
            };
        }
    }, [query, open, fetchOptions]);

    const allOptions = [
        ...(query === '' ? [{ value: 'all', label: placeholder }] : []),
        ...options
    ];

    const selectedLabel = value === 'all' ? placeholder : (selectedValueLabel || placeholder);

    return (
        <div className="flex flex-col gap-1.5" ref={ref}>
            <label className="text-sm font-bold uppercase tracking-widest text-slate-400">{label}</label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => { setOpen(o => !o); setQuery(''); }}
                    className="w-full flex items-center justify-between gap-2 bg-white border border-slate-200 text-on-surface text-base font-semibold rounded-xl px-4 py-3 outline-none text-left hover:border-slate-300 transition-colors"
                >
                    <span className="truncate">{selectedLabel}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 top-full mt-1.5 w-full min-w-[200px] bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                        >
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Search…"
                                    className="flex-1 text-xs font-semibold text-slate-700 placeholder:text-slate-300 outline-none bg-transparent"
                                />
                                {isLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                                ) : (
                                    query && (
                                        <button onClick={() => setQuery('')} className="text-slate-300 hover:text-slate-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    )
                                )}
                            </div>
                            <ul className="py-1 max-h-[180px] overflow-y-auto">
                                {isLoading ? (
                                    [...Array(3)].map((_, idx) => (
                                        <li key={idx} className="px-4 py-2.5 animate-pulse flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                                                {idx === 1 && <div className="h-3 w-10 bg-slate-200/60 rounded" />}
                                            </div>
                                            <div className="h-2.5 bg-slate-200/40 rounded w-1/2" />
                                        </li>
                                    ))
                                ) : allOptions.length === 0 ? (
                                    <li className="px-3 py-2 text-xs text-slate-400 font-semibold">No results</li>
                                ) : (
                                    allOptions.map(opt => (
                                        <li key={opt.value}>
                                            <button
                                                type="button"
                                                onClick={() => { onChange(opt.value, opt.label); setOpen(false); setQuery(''); }}
                                                className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between transition-colors group cursor-pointer`}
                                            >
                                                <div>
                                                    <p className="text-base font-bold text-on-surface flex items-center gap-1.5">
                                                        {opt.prefixCode && (
                                                            <span className="text-blue-600">[{opt.prefixCode}]</span>
                                                        )}
                                                        {opt.label}
                                                        {opt.badge && (
                                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-black">
                                                                {opt.badge}
                                                            </span>
                                                        )}
                                                    </p>
                                                    {opt.subtitle && (
                                                        <p className="text-[11px] text-slate-400 uppercase tracking-tighter font-black mt-0.5">
                                                            {opt.subtitle}
                                                        </p>
                                                    )}
                                                </div>
                                                {opt.value === value && (
                                                    <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                                                )}
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ── Date helpers ──────────────────────────────────────────────────────────────
const DATE_RANGES = [0, 7, 30];

function getDateRange(days: number): { from: string; to: string } {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    const fmt = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    return { from: fmt(from), to: fmt(to) };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const queryClient = useQueryClient();
    const [selectedDriver, setSelectedDriver] = useState('all');
    const [selectedDriverName, setSelectedDriverName] = useState('All Drivers');
    const [selectedTruck, setSelectedTruck] = useState('all');
    const [selectedTruckName, setSelectedTruckName] = useState('All Trucks');

    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [activePreset, setActivePreset] = useState<number | null>(30);

    // Derive the active date range from either a preset or a custom range.
    const { from, to } = useMemo(() => {
        if (activePreset !== null) return getDateRange(activePreset);
        if (customFrom && customTo) return { from: customFrom, to: customTo };
        return { from: '', to: '' };
    }, [activePreset, customFrom, customTo]);

    // Cached analytics query — each (range, driver, truck) combo is cached, so
    // toggling between filters you've already viewed costs no extra egress.
    const analyticsQuery = useAnalytics({
        from,
        to,
        driverId: selectedDriver,
        truckId: selectedTruck,
        enabled: !!from && !!to,
    });

    const rawData: AnalyticsEntry[] = analyticsQuery.data ?? [];
    const isLoading = analyticsQuery.isLoading && !!from && !!to;
    const error = analyticsQuery.error ? (analyticsQuery.error as Error).message : null;

    const chartData = groupByDate(rawData);

    return (
        <div className="min-h-screen bg-slate-50/30 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-8 lg:p-12 max-w-[1400px] w-full mx-auto flex flex-col items-center"
            >
                {/* Hero */}
                <div className="mb-12 text-center">
                    <span className="text-secondary font-bold text-base tracking-widest uppercase block mb-2">
                        Fleet Metrics
                    </span>
                    <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-on-surface leading-tight">
                        Analytics
                    </h1>
                    <p className="text-lg text-on-surface-variant mt-4 leading-relaxed">
                        Track completed trip distances and fuel consumption over time.
                    </p>
                </div>

                {/* Filters — flat, single row on desktop, wraps on mobile */}
                <div className="w-full mb-8 flex flex-wrap items-end gap-3">

                    {/* Driver */}
                    <div className="w-full sm:w-56 shrink-0">
                        <SearchableSelect
                            label="Driver"
                            value={selectedDriver}
                            selectedValueLabel={selectedDriverName}
                            onChange={(val, name) => {
                                setSelectedDriver(val);
                                setSelectedDriverName(name);
                            }}
                            placeholder="All Drivers"
                            fetchOptions={async (q) => {
                                const data = await queryClient.fetchQuery({
                                    queryKey: queryKeys.drivers({ q: q || '', limit: 10 }),
                                    queryFn: () =>
                                        fetchJson<any[]>(`/api/auth/view-drivers/view-drivers?limit=10${q ? `&q=${encodeURIComponent(q)}` : ''}`),
                                    staleTime: 5 * 60 * 1000,
                                });
                                return data.map((d: any) => ({
                                    value: d.id,
                                    label: d.username,
                                    badge: d.license_number,
                                    subtitle: d.status || 'Active'
                                }));
                            }}
                        />
                    </div>

                    {/* Truck */}
                    <div className="w-full sm:w-56 shrink-0">
                        <SearchableSelect
                            label="Truck"
                            value={selectedTruck}
                            selectedValueLabel={selectedTruckName}
                            onChange={(val, name) => {
                                setSelectedTruck(val);
                                setSelectedTruckName(name);
                            }}
                            placeholder="All Trucks"
                            fetchOptions={async (q) => {
                                const data = await queryClient.fetchQuery({
                                    queryKey: queryKeys.trucks({ page: 1, limit: 10, q: q || '' }),
                                    queryFn: () =>
                                        fetchJson<any>(`/api/auth/view-vehicles/view-vehicles?limit=10${q ? `&q=${encodeURIComponent(q)}` : ''}`),
                                    staleTime: 5 * 60 * 1000,
                                });
                                const rows = Array.isArray(data) ? data : (data?.data || []);
                                return rows.map((t: any) => ({
                                    value: t.truck_id,
                                    label: t.truck_name,
                                    prefixCode: t.truck_id,
                                    badge: t.plate_number,
                                    subtitle: `Efficiency: ${t.fuel_efficiency} KM/L • ${t.engine_type || 'Standard'}`
                                }));
                            }}
                        />
                    </div>

                    {/* Preset range buttons */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                        <label className="text-sm font-bold uppercase tracking-widest text-slate-400">Range</label>
                        <div className="flex gap-2">
                            {DATE_RANGES.map(days => (
                                <button
                                    key={days}
                                    onClick={() => { setActivePreset(days); setCustomFrom(''); setCustomTo(''); }}
                                    className={`px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                                        activePreset === days
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                                >
                                    {days === 0 ? 'Today' : `${days}d`}
                                </button>
                            ))}
                        </div>
                    </div>
 
                    {/* Custom date range */}
                    <div className="flex flex-col gap-1.5 flex-1 min-w-[320px]">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-bold uppercase tracking-widest text-slate-400">Custom Range</label>
                            {(customFrom || customTo) && (
                                <button
                                    onClick={() => { setCustomFrom(''); setCustomTo(''); setActivePreset(30); }}
                                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600 bg-white hover:bg-red-50/50 border border-slate-200 hover:border-red-200 px-2 py-0.5 rounded-lg transition-all uppercase tracking-wider"
                                >
                                    <X className="w-3 h-3" /> Clear
                                </button>
                            )}
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <input
                                type="date"
                                value={customFrom}
                                onChange={e => { setCustomFrom(e.target.value); setActivePreset(null); }}
                                className="flex-1 min-w-[145px] bg-white border border-slate-200 text-on-surface text-base font-semibold rounded-xl px-4 py-3 outline-none hover:border-slate-300 transition-colors"
                            />
                            <span className="text-xs text-slate-400 font-bold shrink-0">to</span>
                            <input
                                type="date"
                                value={customTo}
                                onChange={e => { setCustomTo(e.target.value); setActivePreset(null); }}
                                className="flex-1 min-w-[145px] bg-white border border-slate-200 text-on-surface text-base font-semibold rounded-xl px-4 py-3 outline-none hover:border-slate-300 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="w-full">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="flex flex-col gap-6"
                            >
                                <ChartSkeleton />
                                <ChartSkeleton />
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-surface-container-lowest rounded-xl border border-slate-100 p-12 text-center shadow-sm"
                            >
                                <p className="text-slate-800 font-bold text-sm mb-1">Failed to load data</p>
                                <p className="text-slate-400 text-xs">{error}</p>
                            </motion.div>
                        ) : chartData.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-surface-container-lowest rounded-xl border border-slate-100 p-24 text-center shadow-sm"
                            >
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No data for this range</p>
                                <p className="text-slate-300 text-xs mt-2">Try a wider date range or different filters.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="charts"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="flex flex-col gap-6"
                            >
                                <DistanceChart data={chartData} tripCount={rawData.length} />
                                <FuelChart data={chartData} tripCount={rawData.length} />
                                <FuelRequestedChart data={chartData} tripCount={rawData.length} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
