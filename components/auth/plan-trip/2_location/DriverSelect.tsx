import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserCheck, ChevronDown, Search, Loader2, Check } from 'lucide-react';
import { Driver } from '@/types/types';

interface DriverSelectProps {
    value?: string;
    selectedDriver?: Driver;
    onChange: (e: React.ChangeEvent<HTMLSelectElement> | null, driver?: Driver) => void;
}

export const DriverSelect = ({ onChange, value, selectedDriver }: DriverSelectProps) => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * FETCH LOGIC
     * * Endpoint: /api/auth/view-drivers/view-drivers
     * * Query Parameters:
     * - planner=true: Filters for drivers eligible for assignment in the trip planner.
     * - limit=5: Restricts initial/empty search results to improve performance.
     * - q={query}: (Optional) Performs a server-side search against driver names or license numbers.
     */
    const fetchDrivers = async (query: string = '') => {
        try {
            setIsLoading(true);

            // Constructing the URL with search and filter parameters
            const url = `/api/auth/view-drivers/view-drivers?planner=true&limit=25${query ? `&q=${encodeURIComponent(query)}` : ''
                }`;

            const res = await fetch(url);

            if (!res.ok) throw new Error('Failed to fetch drivers');

            const data: Driver[] = await res.json();
            setDrivers(data);
        } catch (err) {
            console.error("Driver fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced search re-query (200ms) only active when dropdown is open
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            fetchDrivers(searchQuery);
        }, 200);

        return () => clearTimeout(timer);
    }, [searchQuery, isOpen]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (d: Driver) => {
        onChange(null, d);
        setIsOpen(false);
        setSearchQuery('');
        fetchDrivers('');
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative" ref={containerRef}>
            <div className="sm:w-32 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-on-surface-variant" />
                <label className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider">
                    Driver
                </label>
            </div>

            <div className="relative flex-1">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full bg-surface-container-low border border-slate-200 rounded-lg px-4 py-3 text-left flex justify-between items-center focus:ring-2 focus:ring-secondary/20 transition-all font-medium outline-none cursor-pointer`}
                >
                    {selectedDriver ? (
                        <span className="text-on-surface font-semibold">
                            {selectedDriver.full_name || selectedDriver.username}
                        </span>
                    ) : (
                        <span className="text-slate-400">Select an available driver</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
                        {/* Search Input tied to the API q= parameter */}
                        <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input
                                autoFocus
                                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                                placeholder="Search driver name or license..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {isLoading && <Loader2 className="w-4 h-4 text-secondary animate-spin" />}
                        </div>

                        <div className={`max-h-64 overflow-y-auto ${isLoading ? 'opacity-50' : ''}`}>
                            {drivers.length > 0 ? (
                                drivers.map((d) => {
                                    const isAvailable = d.status === 'Pending Trip Assignment';
                                    const isInMotion = d.status === 'In Motion';

                                    return (
                                        <button
                                            key={d.id}
                                            type="button"
                                            onClick={() => handleSelect(d)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between transition-colors group cursor-pointer border-b border-slate-50 last:border-b-0"
                                        >
                                            <div className="flex-1 pr-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-bold text-on-surface">
                                                        {d.full_name || d.username}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        (@{d.username})
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                        isAvailable
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : isInMotion
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                    }`}>
                                                        {isAvailable ? 'Available' : d.status}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium mt-1">
                                                    License: <strong className="text-slate-700 font-mono">{d.license_number || 'N/A'}</strong> • {d.phone_number || 'No contact'}
                                                </p>
                                            </div>
                                            {value === d.id && <Check className="w-4 h-4 text-secondary shrink-0" />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-sm text-slate-400 italic">
                                        {isLoading ? 'Searching...' : 'No matching drivers found'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};