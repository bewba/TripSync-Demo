import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Trip } from '@/types/types';

export const TripRow = ({ trip, onClick }: { trip: Trip; onClick?: () => void }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "INVALID DATE";

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "INVALID DATE";

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Trip In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Trip is Pending': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all px-4 cursor-pointer group
        ${trip.isFlagged 
          ? 'bg-rose-50/40 hover:bg-rose-50/60 border-l-4 border-l-rose-500' 
          : 'bg-transparent hover:bg-slate-50'
        }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-8 flex-1 w-full">

        {/* ROUTE SECTION - Using first_location and last_location */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Route</span>
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="font-semibold text-on-surface truncate flex-1" title={trip.first_location}>
              {trip.first_location || 'N/A'}
            </span>

            <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />

            <span className="font-semibold text-on-surface truncate flex-1" title={trip.last_location}>
              {trip.last_location || 'N/A'}
            </span>
          </div>
        </div>

        {/* TRUCK SECTION - Using vehicle_name */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Truck</span>
          <span className="text-sm font-medium text-on-surface truncate max-w-[150px]" title={trip.vehicle_name}>
            {trip.vehicle_name}
          </span>
        </div>

        {/* STATUS SECTION */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Status</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(trip.status || '')}`}>
              {trip.status || 'Unknown'}
            </span>
            {trip.isFlagged && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Flagged
              </span>
            )}
          </div>
        </div>

        {/* METRICS SECTION */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Metrics</span>
          <span className="text-sm font-medium text-on-surface">
            {/* Note: Ensure total_distance exists in your data, 
                 it wasn't visible in the snippet but usually follows this pattern */}
            {trip.total_distance || 0} Km
          </span>
        </div>
      </div>

      {/* DATE SECTION - Using 'when' instead of 'date' */}
      <div className="text-left sm:text-right sm:ml-4 w-full sm:w-auto flex flex-col gap-1.5">
        <div className="text-left sm:text-right">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Requested</span>
          <span className="text-xs font-semibold text-slate-600 block">
            {formatDate(trip.when)}
          </span>
        </div>
        {trip.scheduled_departure && (
          <div className="text-left sm:text-right">
            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider block">Scheduled</span>
            <span className="text-xs font-bold text-blue-600 block">
              {formatDateTime(trip.scheduled_departure)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}