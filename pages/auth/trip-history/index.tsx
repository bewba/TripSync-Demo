import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

import { TripRow } from '@/components/auth/trip-history/TripRow';
import { Pagination } from '@/components/auth/trip-history/Pagination';
import { TripDetailModal } from '@/components/auth/trip-history/TripDetailModal';
import { DownloadTrips } from '@/components/auth/trip-history/DownloadTrips';
import { Trip } from '@/types/types';
import { Search, X } from 'lucide-react';
import { useTrips, useTripDetail } from '@/hooks/queries';
import { useCancelTripMutation, useEndTripMutation } from '@/hooks/mutations';

const PAGE_SIZE = 10;

export default function TripHistoryPage() {
  const router = useRouter();
  const cancelTripMutation = useCancelTripMutation();
  const endTripMutation = useEndTripMutation();

  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState('All');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Handle URL query parameters (e.g. ?tripId=TRP-101 from Active Drivers roster)
  useEffect(() => {
    if (!router.isReady) return;
    const targetTripId = (router.query.tripId || router.query.trip_id || router.query.trip) as string | undefined;
    if (targetTripId) {
      setSearchQuery(targetTripId);
      setDebouncedSearch(targetTripId);
      setActiveStatus('All');
      setSelectedTripId(targetTripId);
      setIsModalOpen(true);
    }
  }, [router.isReady, router.query.tripId, router.query.trip_id, router.query.trip]);

  // 1. Debounce the search input to avoid spamming the DB
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cached, paginated trip list — paging back/forth reuses the cache.
  const tripsQuery = useTrips({
    page: currentPage,
    limit: PAGE_SIZE,
    searchQuery: debouncedSearch,
    status: activeStatus,
  });

  const trips: Trip[] = tripsQuery.data?.trips ?? [];
  const totalTrips = tripsQuery.data?.total ?? 0;
  const isLoading = tripsQuery.isLoading;
  const error = tripsQuery.error ? (tripsQuery.error as Error).message : null;

  // Cached trip detail — only fetched when a row is selected.
  const detailQuery = useTripDetail(isModalOpen ? selectedTripId : null);
  const selectedTripDetails = detailQuery.data ?? null;
  const isDetailLoading = detailQuery.isLoading && !!selectedTripId;

  // Clear detail when modal closes
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTripId(null);
  };

  // Open modal for a trip (detail is fetched + cached by the hook)
  const handleRowClick = (trip: Trip) => {
    setSelectedTripId(trip.trip_id);
    setIsModalOpen(true);
  };

  // Handle trip cancellation, then invalidate cached lists so they refetch.
  const handleCancelTrip = async (tripId: string) => {
    try {
      await cancelTripMutation.mutateAsync(tripId);

      console.log(`Trip ${tripId} cancelled successfully.`);
    } catch (error: any) {
      console.error('Error cancelling trip:', error);
      alert(error.message || 'Could not cancel the trip. Please try again later.');
      throw error; // Re-throw to be caught by the modal
    }
  };

  // Handle ending trip, then invalidate cached lists so they refetch.
  const handleEndTrip = async (tripId: string) => {
    try {
      await endTripMutation.mutateAsync(tripId);

      console.log(`Trip ${tripId} ended successfully.`);
    } catch (error: any) {
      console.error('Error ending trip:', error);
      alert(error.message || 'Could not end the trip. Please try again later.');
      throw error; // Re-throw to be caught by the modal
    }
  };


  const refetchTrips = () => tripsQuery.refetch();

  const totalPages = Math.ceil(totalTrips / PAGE_SIZE);

  const statuses = ['All', 'Flagged', 'Trip In Progress', 'Completed', 'Assigned', 'Trip is Pending', 'Cancelled'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto"
    >
      <div className="mb-6">
        <span className="text-secondary font-bold text-xs uppercase tracking-widest mb-2 block">
          Operational Records
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-on-surface font-headline">
          Trip History
        </h1>
      </div>

      {/* Action Bar: Filters on Left, Download on Right */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-6">
        
        {/* Filters (Left) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full xl:w-auto">
          {/* Search */}
          <div className="relative group w-full lg:w-72">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text"
              placeholder="Search Vehicle or Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high pl-11 pr-10 py-2.5 rounded-2xl font-bold text-sm text-on-surface outline-none border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide w-full lg:w-auto max-w-[calc(100vw-2rem)]">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setActiveStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeStatus === status
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-surface-container-high text-slate-500 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Download (Right) */}
        <div className="w-full xl:w-auto flex justify-end">
          <DownloadTrips />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] flex flex-col justify-center">
        {isLoading ? (
          /* Loading State */
          <div className="p-12 text-center text-slate-400">
            <div className="animate-pulse font-bold uppercase tracking-widest text-xs">Requerying Database...</div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <p className="text-slate-800 font-bold text-sm mb-1">Unable to load history</p>
            <p className="text-slate-400 text-xs mb-5">{error}</p>
            <button
              onClick={() => refetchTrips()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors tracking-wide uppercase"
            >
              Try Again
            </button>
          </div>
        ) : trips.length > 0 ? (
          /* List State */
          <div className="divide-y divide-slate-50 h-full justify-start">
            {trips.map((trip) => (
              <TripRow
                key={trip.trip_id}
                trip={trip}
                onClick={() => handleRowClick(trip)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-24 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found</p>
            <p className="text-slate-300 text-xs mt-2">Try searching for a different vehicle or location.</p>
          </div>
        )}
      </div>

      {!isLoading && !error && trips.length > 0 && (
        <Pagination
          total={totalTrips}
          showing={trips.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Detail Modal */}
      <TripDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tripData={selectedTripDetails}
        isLoading={isDetailLoading}
        onCancelTrip={handleCancelTrip}
        onEndTrip={handleEndTrip}
      />

    </motion.div>
  );
}