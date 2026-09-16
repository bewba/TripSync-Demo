import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import DriverTable from '@/components/auth/view-drivers/DriverTable';
import CreateDriverModal from '@/components/auth/view-drivers/CreateDriverModal';
import { Driver } from '@/types/types';
import Loading from '@/components/ui/Loading/Loading';
import { useDrivers } from '@/hooks/queries';

const DriverList: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setModalOpen] = useState<boolean>(false);

    // Cached driver list — reused across remounts within the stale window.
    const driversQuery = useDrivers();
    const drivers: Driver[] = driversQuery.data ?? [];
    const isLoading = driversQuery.isLoading;
    const error = driversQuery.error ? (driversQuery.error as Error).message : null;

    // Invalidate so the next render refetches fresh drivers.
    const fetchDrivers = () => queryClient.invalidateQueries({ queryKey: ['drivers'] });

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Fleet Drivers</h1>
                    <p className="text-sm text-gray-500">Manage your active driver fleet</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap"
                >
                    + Add New Driver
                </button>
            </div>

            {/* Main Content */}
            {isLoading ? (
                <Loading text="Fetching fleet drivers..." />
            ) : error ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center shadow-sm mt-6">
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <p className="text-slate-800 font-bold text-sm mb-1">Unable to load drivers</p>
                    <p className="text-slate-500 text-xs mb-5">{error}</p>
                    <button
                        onClick={fetchDrivers}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors tracking-wide uppercase cursor-pointer shadow-sm"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <DriverTable drivers={drivers} />
            )}

            {isModalOpen && (
                <CreateDriverModal
                    onClose={() => setModalOpen(false)}
                    onSuccess={fetchDrivers} // Refresh the list after a new driver is saved
                />
            )}
        </div>
    );
};

export default DriverList;