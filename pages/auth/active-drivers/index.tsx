import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useActiveDriversLocations } from '@/hooks/queries/useActiveDrivers';
import ActiveDriversMap from '@/components/auth/active-drivers/ActiveDriversMap';
import { DriverCard } from '@/components/auth/active-drivers/DriverCard';
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
                                            <DriverCard
                                                key={driver.tripId}
                                                driver={driver as any}
                                                isSelected={isSelected}
                                                stoppedSeconds={getStoppedSeconds(driver)}
                                                onHover={setHoveredDriverId}
                                                onSelect={setSelectedDriverId}
                                                onViewDetails={setModalTripId}
                                            />
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
