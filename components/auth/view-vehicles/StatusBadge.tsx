import React from 'react';
import { cn } from '@/lib/utils';
import { TruckRecord } from '@/types/types';

const STATUS_STYLES: Record<string, string> = {
  'ASSIGNED TRIP': 'bg-emerald-100 text-emerald-700',
  'PENDING TRIP ASSIGNMENT': 'bg-slate-100 text-slate-500',
  'MAINTENANCE': 'bg-amber-100 text-amber-700',
  'IN MOTION': 'bg-blue-100 text-blue-700',
};

const STATUS_DOT: Record<string, string> = {
  'ASSIGNED TRIP': 'bg-emerald-500',
  'PENDING TRIP ASSIGNMENT': 'bg-slate-400',
  'MAINTENANCE': 'bg-amber-500',
  'IN MOTION': 'bg-blue-500',
};

export const StatusBadge = ({ status }: { status: TruckRecord['status'] }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize',
      STATUS_STYLES[status]
    )}
  >
    <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[status])} />
    {status}
  </span>
);
