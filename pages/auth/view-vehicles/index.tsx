import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TruckRecord } from '@/types/types';
import { FleetStats } from '@/components/auth/view-vehicles/FleetStats';
import { TruckTable } from '@/components/auth/view-vehicles/TruckTable';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTrucks, useFleetStats, queryKeys } from '@/hooks/queries';

export default function ViewVehiclesPage() {
  const queryClient = useQueryClient();

  // Search and Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset page on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Cached, paginated data (no refetch when revisiting a page within stale window)
  const trucksQuery = useTrucks({ page: currentPage, limit: itemsPerPage, q: debouncedQuery });
  const statsQuery = useFleetStats();

  const trucks: TruckRecord[] = trucksQuery.data?.data ?? [];
  const totalTrucks = trucksQuery.data?.total ?? 0;
  const isLoading = trucksQuery.isLoading;
  const error = trucksQuery.error ? (trucksQuery.error as Error).message : null;
  const stats = statsQuery.data ?? null;
  const isStatsLoading = statsQuery.isLoading;

  // Invalidate cached fleet data so the next render refetches fresh rows.
  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['trucks'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.fleetStats() });
  };

  const totalPages = Math.max(1, Math.ceil(totalTrucks / itemsPerPage));

  // Ensure currentPage is valid after filtering or deletion
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto bg-slate-50/50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-extrabold text-on-surface">
          Vehicle Inventory
        </h1>
        <p className="text-slate-500 mt-1">
          Real-time status and performance tracking for all registered fleet units.
        </p>
      </div>

      {/* Stats Overview Section */}
      <FleetStats stats={stats} isLoading={isStatsLoading} />

      {/* Search and Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1 mt-8">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-headline font-bold text-on-surface">Fleet Roster</h2>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or plate..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-xl border border-slate-100">
              <p className="text-slate-400 animate-pulse">Loading fleet data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <p className="text-slate-800 font-bold text-sm mb-1">Unable to load vehicles</p>
              <p className="text-slate-400 text-xs mb-5">{error}</p>
              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors tracking-wide uppercase cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : trucks.length > 0 ? (
            <>
              <div className="mb-4">
                <TruckTable trucks={trucks} onRefresh={onRefresh} />
              </div>

              {/* Pagination Controls */}
              {totalTrucks > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
                  <span className="text-xs text-slate-500 font-medium">
                    Showing <span className="font-bold text-slate-700">{Math.min(((currentPage - 1) * itemsPerPage) + 1, totalTrucks)}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, totalTrucks)}</span> of <span className="font-bold text-slate-700">{totalTrucks}</span> vehicles
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-bold text-slate-700 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage >= totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">
                {debouncedQuery ? "No vehicles match your search." : "No vehicles found in the fleet database."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}