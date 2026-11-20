import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useActiveDriversLocations } from '@/hooks/queries/useActiveDrivers';
import ActiveDriversMap from '@/components/auth/active-drivers/ActiveDriversMap';
import { TripDetailModal } from '@/components/auth/trip-history/TripDetailModal';
import { useTripDetail } from '@/hooks/queries';
import { Loader2, Navigation, AlertCircle, Search, BatteryFull, BatteryMedium, BatteryWarning, Timer, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActiveDriversPage() {
    const router = useRouter();
    const { data: drivers = [], isLoading, isError } = useActiveDriversLocations();
    const [hoveredDriverId, setHoveredDriverId] = useState<string | null>(null);
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [modalTripId, setModalTripId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const detailQuery = useTripDetail(modalTripId);
    const selectedTripDetails = detailQuery.data ?? null;
    const isDetailLoading = detailQuery.isLoading && !!modalTripId;

    const [currentTime, setCurrentTime] = useState<number>(Date.now());

    // Auto-select driver if tripId is passed in query params (e.g. from plan-trip dispatch)
    useEffect(() => {
        if (!router.isReady) return;
        const tripIdQuery = router.query.tripId;
        if (tripIdQuery && typeof tripIdQuery === 'string' && drivers.length > 0) {
            const matched = drivers.find(d => d.tripId === tripIdQuery);
            if (matched) {
                setSelectedDriverId(matched.tripId);
            }
        }
    }, [router.isReady, router.query.tripId, drivers]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getStoppedSeconds = (driver: any) => {
        if (!driver.isStopped) return 0;
        if (driver.stoppedAt && driver.stoppedAt > 0) {
            return Math.max(0, Math.floor((currentTime - driver.stoppedAt) / 1000));
        }
        return driver.stoppedForSeconds ?? 0;
    };

    const formatMmSs = (totalSec: number) => {
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getGpsOffTimer = (driver: any) => {
        if (!driver.isGpsOff || !driver.gpsOffAt) return '00:00';
        const elapsed = Math.max(0, Math.floor((currentTime - driver.gpsOffAt) / 1000));
        return formatMmSs(elapsed);
    };

    const formatLastSeen = (driver: any) => {
        const lastTs =
            driver.offlineAt && driver.offlineAt > 0
                ? driver.offlineAt
                : new Date(driver.lastUpdate).getTime();
        const elapsedSec = Math.max(0, Math.floor((currentTime - lastTs) / 1000));
        if (elapsedSec < 60) {
            return `Last seen ${elapsedSec}s ago`;
        }
        const mins = Math.floor(elapsedSec / 60);
        const secs = elapsedSec % 60;
        if (mins < 60) {
            return `Last seen ${mins}m ${secs}s ago`;
        }
        const hours = Math.floor(mins / 60);
        const remMins = mins % 60;
        return `Last seen ${hours}h ${remMins}m ${secs}s ago`;
    };

    const onlineCount = drivers.filter(d => d.isOnline !== false).length;
    const gpsOffCount = drivers.filter(d => !!d.isGpsOff).length;

    const filteredDrivers = drivers.filter(d => 
        d.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.truckName && d.truckName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.origin && d.origin.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.destination && d.destination.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <>
            <Head>
                <title>Active Drivers | Transport Admin</title>
            </Head>

            <div className="flex flex-col h-[calc(100vh-0px)] overflow-hidden bg-[#f8fafc]">
                <header className="flex-none bg-white border-b border-slate-200/90 px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <Navigation className="w-5 h-5 text-blue-600" />
                                Active Drivers Map
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Real-time locations and live telemetry of all currently active trips.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/90 shadow-2xs">
                            <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold text-xs px-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                {onlineCount} Online &bull; {drivers.length} {drivers.length === 1 ? 'Trip' : 'Trips'}
                            </span>
                            {gpsOffCount > 0 && (
                                <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    {gpsOffCount} GPS Off
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden p-5 gap-5">
                    {/* Map Area */}
                    <div className="flex-1 relative bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                <span className="text-sm font-medium text-slate-500">Loading live locations...</span>
                            </div>
                        ) : isError ? (
                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-red-500">
                                <AlertCircle className="w-8 h-8" />
                                <span className="text-sm font-medium">Failed to load active drivers</span>
                            </div>
                        ) : (
                            <ActiveDriversMap 
                                drivers={drivers} 
                                hoveredDriverId={hoveredDriverId} 
                                selectedDriverId={selectedDriverId}
                                onSelectDriver={(tripId) => {
                                    setSelectedDriverId(tripId);
                                }}
                                onViewTripDetails={(tripId) => {
                                    setModalTripId(tripId);
                                }}
                            />
                        )}
                    </div>

                    {/* Sidebar List */}
                    <div className="w-[410px] shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
                        <div className="p-4 border-b border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-bold text-slate-900 text-base tracking-tight">Driver Roster</h2>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                                    {filteredDrivers.length} {filteredDrivers.length === 1 ? 'driver' : 'drivers'}
                                </span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search drivers or routes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3">
                            {filteredDrivers.length === 0 ? (
                                <div className="text-center text-slate-500 text-sm mt-8">
                                    No drivers found.
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {filteredDrivers.map(driver => {
                                        const isSelected = selectedDriverId === driver.tripId;
                                        const displaySpeed =
                                            driver.isOnline === false || driver.isGpsOff || driver.isStopped
                                                ? 0
                                                : (driver.speed || 60);
                                        return (
                                            <motion.div
                                                key={driver.tripId}
                                                whileHover={{ scale: 1.005 }}
                                                whileTap={{ scale: 0.995 }}
                                                onMouseEnter={() => setHoveredDriverId(driver.tripId)}
                                                onMouseLeave={() => setHoveredDriverId(null)}
                                                onClick={() => setSelectedDriverId(driver.tripId)}
                                                className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 ease-out flex items-start gap-3 cursor-pointer group border ${
                                                    isSelected 
                                                        ? 'bg-blue-50/70 border-blue-300 shadow-sm ring-1 ring-blue-400/80' 
                                                        : driver.isGpsOff
                                                        ? 'bg-white hover:bg-rose-50/30 border-rose-200/90 shadow-2xs'
                                                        : driver.isOnline === false
                                                        ? 'bg-slate-50/60 hover:bg-slate-100/60 border-slate-200/80'
                                                        : 'bg-white hover:bg-slate-50/70 border-slate-200/80 shadow-2xs'
                                                }`}
                                            >
                                                {/* Rounded-Square Avatar */}
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                                                    isSelected ? 'bg-blue-600 text-white' : 
                                                    driver.isGpsOff ? 'bg-rose-100/80 text-rose-600' :
                                                    driver.isOnline === false ? 'bg-slate-200/80 text-slate-500' :
                                                    driver.isStopped ? 'bg-rose-100/80 text-rose-600' :
                                                    'bg-blue-50 text-blue-600'
                                                }`}>
                                                    {driver.driverName.charAt(0).toUpperCase()}
                                                </div>

                                                {/* Center Info Column */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1.5">
                                                        <h3 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push({
                                                                    pathname: '/auth/trip-history',
                                                                    query: { tripId: driver.tripId },
                                                                });
                                                            }}
                                                            className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                                                            title={`View ${driver.tripId} in Trip History`}
                                                        >
                                                            {driver.driverName}
                                                        </h3>
                                                        {driver.isGpsOff ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/90 px-2 py-0.5 rounded-full shrink-0">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                                                GPS OFF
                                                            </span>
                                                        ) : driver.isOnline === false ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                                                OFFLINE
                                                            </span>
                                                        ) : driver.isStopped ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                                                STOPPED
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    {/* Live Status Line */}
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        {driver.isGpsOff ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                                                <span>GPS Turned Off</span>
                                                                <span className="inline-flex items-center gap-0.5 font-mono tabular-nums text-rose-600">
                                                                    <Timer className="w-3 h-3" />
                                                                    {getGpsOffTimer(driver)}
                                                                </span>
                                                            </span>
                                                        ) : driver.isOnline === false ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                                                Offline
                                                            </span>
                                                        ) : driver.isStopped ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                                                Stopped ({getStoppedSeconds(driver)}s)
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                                Online
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs font-medium text-slate-600 truncate mt-1">
                                                        {driver.origin} &rarr; {driver.destination}
                                                    </p>

                                                    {/* Footer Row: Timestamp + Pill Details Button */}
                                                    <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
                                                        <span className="truncate">
                                                            {driver.isOnline === false
                                                                ? formatLastSeen(driver)
                                                                : `Updated ${new Date(driver.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                                        </span>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setModalTripId(driver.tripId);
                                                            }}
                                                            className="px-2.5 py-1 rounded-lg bg-blue-50/80 hover:bg-blue-100 text-blue-600 border border-blue-200/80 font-bold text-[11px] transition-colors cursor-pointer shrink-0"
                                                        >
                                                            Details &rarr;
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Right Telemetry Tiles: Speedometer + Battery */}
                                                <div className="flex items-stretch gap-1.5 shrink-0">
                                                    {/* Speed Tile */}
                                                    <div className="w-11 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col items-center justify-center text-slate-700">
                                                        <Gauge className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                                                        <span className="text-xs font-extrabold leading-none text-slate-800 tabular-nums">
                                                            {displaySpeed}
                                                        </span>
                                                        <span className="text-[7.5px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                                                            KM/H
                                                        </span>
                                                    </div>

                                                    {/* Battery Tile */}
                                                    {driver.batteryLevel !== null && (
                                                        <div className={`w-11 py-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 border ${
                                                            driver.batteryLevel > 50 ? 'text-emerald-700 bg-emerald-50/80 border-emerald-200/90' :
                                                            driver.batteryLevel > 20 ? 'text-amber-800 bg-amber-50/80 border-amber-200/90' :
                                                            'text-rose-700 bg-rose-50/80 border-rose-200/90'
                                                        }`}>
                                                            {driver.batteryLevel > 50 ? (
                                                                <BatteryFull className="w-3.5 h-3.5" />
                                                            ) : driver.batteryLevel > 20 ? (
                                                                <BatteryMedium className="w-3.5 h-3.5" />
                                                            ) : (
                                                                <BatteryWarning className="w-3.5 h-3.5" />
                                                            )}
                                                            <span className="text-[11px] font-extrabold tabular-nums">
                                                                {driver.batteryLevel}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trip Detail Modal when clicked */}
            <TripDetailModal
                isOpen={!!modalTripId}
                onClose={() => setModalTripId(null)}
                tripData={selectedTripDetails}
                isLoading={isDetailLoading}
            />
        </>
    );
}
