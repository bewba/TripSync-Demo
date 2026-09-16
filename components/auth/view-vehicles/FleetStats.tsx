import React from 'react';

interface FleetStatsProps {
  stats: { total: number; active: number; idle: number; maintenance: number; inMotion: number } | null;
  isLoading: boolean;
}

export const FleetStats = ({ stats, isLoading }: FleetStatsProps) => {
  const displayStats = [
    { label: 'Total Fleet', value: stats?.total || 0, color: 'text-on-surface' },
    { label: 'Pending Assignment', value: stats?.idle || 0, color: 'text-slate-500' },
    { label: 'In Motion', value: stats?.inMotion || 0, color: 'text-blue-600' },
    { label: 'Assigned Trips', value: stats?.active || 0, color: 'text-emerald-600' },
    { label: 'Maintenance', value: stats?.maintenance || 0, color: 'text-amber-600' },
  ];

  console.log(stats)
  console.log(stats?.inMotion)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
      {displayStats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-slate-100 rounded-xl px-5 py-4 flex flex-col gap-1"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {stat.label}
          </span>
          {isLoading ? (
            <span className="h-8 w-12 bg-slate-100 rounded animate-pulse mt-1" />
          ) : (
            <span className={`text-2xl font-headline font-extrabold ${stat.color}`}>
              {stat.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
