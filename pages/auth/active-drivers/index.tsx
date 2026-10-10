import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useActiveDriversLocations } from '@/hooks/queries/useActiveDrivers';
import ActiveDriversMap from '@/components/auth/active-drivers/ActiveDriversMap';
import { TripDetailModal } from '@/components/auth/trip-history/TripDetailModal';
import { useTripDetail } from '@/hooks/queries';
import { Loader2, Navigation, AlertCircle, Search, BatteryFull, BatteryMedium, BatteryWarning } from 'lucide-react';
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

    const onlineCount = drivers.filter(d => d.isOnline !== false).length;

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

            <div className="flex flex-col h-[calc(100vh-0px)] overflow-hidden">
                <header className="flex-none bg-white border-b border-slate-200 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <Navigation className="w-6 h-6 text-blue-600" />
                                Active Drivers Map
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Real-time locations of all currently active trips.
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm border border-blue-100 shadow-sm">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                            {onlineCount} Online &bull; {drivers.length} Active {drivers.length === 1 ? 'Trip' : 'Trips'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden p-6 gap-6">
                    {/* Map Area */}
                    <div className="flex-1 relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
                    <div className="w-96 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100">
                            <h2 className="font-bold text-slate-800 mb-4">Driver Roster</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search drivers or routes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {filteredDrivers.length === 0 ? (
                                <div className="text-center text-slate-500 text-sm mt-8">
                                    No drivers found.
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {filteredDrivers.map(driver => {
                                        const isSelected = selectedDriverId === driver.tripId;
                                        return (
                                            <motion.div
                                                key={driver.tripId}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onMouseEnter={() => setHoveredDriverId(driver.tripId)}
                                                onMouseLeave={() => setHoveredDriverId(null)}
                                                onClick={() => setSelectedDriverId(driver.tripId)}
                                                className={`w-full text-left p-3 rounded-xl transition-all duration-200 ease-out flex items-center gap-3 cursor-pointer group border ${
                                                    isSelected 
                                                        ? 'bg-blue-50/80 border-blue-300 shadow-sm ring-1 ring-blue-400' 
                                                        : driver.isOnline === false
                                                        ? 'bg-slate-50/60 hover:bg-slate-100/60 border-slate-200/80'
                                                        : 'bg-white hover:bg-slate-50 border-slate-100'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors ${
                                                    isSelected ? 'bg-blue-600 text-white' : 
                                                    driver.isOnline === false ? 'bg-slate-200 text-slate-500' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {driver.driverName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <h3 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push({
                                                                    pathname: '/auth/trip-history',
                                                                    query: { tripId: driver.tripId },
                                                                });
                                                            }}
                                                            className="font-semibold text-slate-800 text-sm truncate group-hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                                                            title={`View ${driver.tripId} in Trip History`}
                                                        >
                                                            {driver.driverName}
                                                        </h3>
                                                        {driver.isOnline === false ? (
                                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                                                                Offline
                                                            </span>
                                                        ) : driver.isStopped ? (
                                                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                                                                0 km/h
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                                {driver.speed || 60} km/h
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Driver Status below their name */}
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        {driver.isOnline === false ? (
                                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                                                Offline
                                                            </span>
                                                        ) : driver.isStopped ? (
                                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                                                Stopped ({getStoppedSeconds(driver)}s)
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                                Online
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-slate-500 truncate mt-1">
                                                        {driver.origin} &rarr; {driver.destination}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100/60 text-[10px] text-slate-400">
                                                        <span>{driver.isOnline === false ? 'Last seen 4m ago' : `Updated ${new Date(driver.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</span>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setModalTripId(driver.tripId);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                                                        >
                                                            Details &rarr;
                                                        </button>
                                                    </div>
                                                </div>
                                                {driver.batteryLevel !== null && (
                                                    <div className={`flex flex-col items-center gap-0.5 text-[9px] font-bold px-1.5 py-1 rounded-md shadow-sm border ${
                                                        driver.batteryLevel > 50 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                                        driver.batteryLevel > 20 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                                        'text-rose-700 bg-rose-50 border-rose-200'
                                                    }`}>
                                                        {driver.batteryLevel > 50 ? (
                                                            <BatteryFull className="w-3.5 h-3.5" />
                                                        ) : driver.batteryLevel > 20 ? (
                                                            <BatteryMedium className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <BatteryWarning className="w-3.5 h-3.5" />
                                                        )}
                                                        <span>{driver.batteryLevel}%</span>
                                                    </div>
                                                )}
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
