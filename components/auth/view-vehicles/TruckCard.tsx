import React from 'react';
import { Gauge, Navigation, Milestone } from 'lucide-react';
import { TruckRecord } from '@/types/types';
import { StatusBadge } from '@/components/auth/view-vehicles/StatusBadge';

export const TruckCard = ({ truck }: { truck: TruckRecord }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-slate-200 transition-all group">
    {/* Card Header */}
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-lg font-headline font-extrabold text-on-surface group-hover:text-emerald-800 transition-colors">
          {truck.truck_name}
        </h3>
        <p className="text-sm text-slate-500 mt-0.5">{truck.driver}</p>
      </div>
      <StatusBadge status={truck.status} />
    </div>

    {/* Divider */}
    <div className="border-t border-slate-100 my-4" />

    {/* Stats */}
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Gauge className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Efficiency</span>
        </div>
        <span className="text-sm font-bold text-on-surface">{truck.fuelEfficiency} km/L</span>
      </div>
    </div>
  </div>
);
