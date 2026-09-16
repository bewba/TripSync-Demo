import { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { ChartPoint } from '@/lib/analyticsHelpers';

interface FuelRequestedChartProps {
    data: ChartPoint[];
    tripCount: number;
}

const CustomTooltip = ({ active, payload, isChartHovered }: any) => {
    if (active && isChartHovered && payload && payload.length) {
        const data = payload[0].payload as ChartPoint;
        return (
            <div className="bg-white/30 backdrop-blur-[2px] border border-slate-100/30 rounded-xl p-3 shadow-md text-base font-semibold text-slate-800 min-w-[200px]">
                <p className="text-slate-400 font-bold mb-2 pb-1.5 border-b border-slate-100 text-base">
                    {new Date(`${data.date}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <div className="flex flex-col gap-1 mb-2">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">Distance Covered:</span>
                        <span className="font-bold text-slate-700">
                            {Number(data.total_distance).toFixed(1)} km
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">Fuel Consumed:</span>
                        <span className="font-bold text-slate-700">
                            {Number(data.total_fuel).toFixed(1)} L
                        </span>
                    </div>
                    <div className="flex justify-between items-center bg-teal-50/50 -mx-1.5 px-1.5 py-0.5 rounded">
                        <span className="text-slate-500">Fuel Requested:</span>
                        <span className="font-black text-teal-600">
                            {Number(data.fuel_requested).toFixed(1)} L
                        </span>
                    </div>
                </div>
                {data.trucks && data.trucks.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Vehicles Used</span>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {data.trucks.map((t: string) => (
                                <span key={t} className="bg-slate-100 text-black px-1.5 py-0.5 rounded text-xs">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {data.drivers && data.drivers.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Drivers</span>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {data.drivers.map((d: string) => (
                                <span key={d} className="bg-slate-100 text-black px-1.5 py-0.5 rounded text-xs">
                                    {d}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export function FuelRequestedChart({ data, tripCount }: FuelRequestedChartProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="bg-surface-container-lowest rounded-2xl border border-slate-100 shadow-sm p-6"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <p className="text-base font-bold uppercase tracking-widest text-on-surface mb-1.5">Fuel Requested</p>
            <p className="text-4xl font-black text-on-surface font-headline">
                {data.reduce((sum, d) => sum + d.fuel_requested, 0).toFixed(2)}
                <span className="text-base font-semibold text-slate-400 ml-1.5">L total</span>
            </p>
            <p className="text-base text-slate-400 mb-8">across <span className="font-bold text-slate-500">{tripCount}</span> trip{tripCount !== 1 ? 's' : ''}</p>
            <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data} syncId="fuelAnalytics" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="fuelRequestedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 14, fill: '#64748b', fontWeight: 700 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 14, fill: '#64748b', fontWeight: 700 }}
                        tickLine={false}
                        axisLine={false}
                        unit=" L"
                    />
                    <Tooltip content={<CustomTooltip isChartHovered={isHovered} />} wrapperStyle={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }} />
                    <Area
                        type="monotone"
                        dataKey="fuel_requested"
                        stroke="#0d9488"
                        strokeWidth={2.5}
                        fill="url(#fuelRequestedGradient)"
                        dot={false}
                        activeDot={{ r: 5, fill: '#0d9488' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
