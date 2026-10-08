import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { BatteryFull, BatteryMedium, BatteryWarning } from 'lucide-react';
import type { ActiveDriverLocation } from '@/hooks/queries/useActiveDrivers';

interface DriverCardProps {
    driver: ActiveDriverLocation;
    isSelected: boolean;
    stoppedSeconds: number;
    onHover: (tripId: string | null) => void;
    onSelect: (tripId: string) => void;
    onViewDetails: (tripId: string) => void;
}

export function DriverCard({
    driver,
    isSelected,
    stoppedSeconds,
    onHover,
    onSelect,
    onViewDetails,
}: DriverCardProps) {
    const router = useRouter();

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onMouseEnter={() => onHover(driver.tripId)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(driver.tripId)}
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

                <div className="flex items-center gap-1.5 mt-0.5">
                    {driver.isOnline === false ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            Offline
                        </span>
                    ) : driver.isStopped ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                            Stopped ({stoppedSeconds}s)
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
                            onViewDetails(driver.tripId);
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
}
