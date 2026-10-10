import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Truck, ChevronDown, Search, Loader2, Check } from 'lucide-react';
import { Vehicle, FuelType } from '@/types/auth/plan-trip/trip-info';
import { TruckRecord } from '@/types/types';

interface TruckSelectProps {
  value?: string;
  selectedVehicle?: Vehicle;
  onChange: (e: React.ChangeEvent<HTMLSelectElement> | null, vehicle?: Vehicle) => void;
}

export const TruckSelect = ({ onChange, value, selectedVehicle }: TruckSelectProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // FETCH LOGIC with search and limit
  const fetchVehicles = async (query: string = '') => {
    try {
      setIsLoading(true);
      const url = `/api/auth/view-vehicles/view-vehicles?planner=true&limit=25${query ? `&q=${encodeURIComponent(query)}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: TruckRecord[] = await res.json();
      setVehicles(data);
    } catch (err) {
      console.error("Vehicle fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search re-query (300ms) only active when dropdown is open
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(() => {
      fetchVehicles(searchQuery);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (v: Vehicle) => {
    onChange(null, v);
    setIsOpen(false);
    setSearchQuery('');
    // Reset to top after selection
    fetchVehicles('');
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative" ref={containerRef}>
      <div className="sm:w-32 flex items-center gap-2">
        <Truck className="w-5 h-5 text-on-surface-variant" />
        <label className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider">
          Vehicle
        </label>
      </div>

      <div className="relative flex-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-surface-container-low border border-slate-200 rounded-lg px-4 py-3 text-left flex justify-between items-center focus:ring-2 focus:ring-secondary/20 transition-all font-medium outline-none cursor-pointer`}
        >
          {selectedVehicle ? (
            <span className="text-on-surface font-semibold">{selectedVehicle.truck_name}</span>
          ) : (
            <span className="text-slate-400">Select an available vehicle</span>
          )}
          <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                autoFocus
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                placeholder="Search name, ID, or plates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isLoading && <Loader2 className="w-4 h-4 text-secondary animate-spin" />}
            </div>
            
            <div className={`max-h-64 overflow-y-auto ${isLoading ? 'opacity-50' : ''}`}>
              {vehicles.length > 0 ? (
                vehicles.map((v) => {
                  const isAvailable = v.status === 'Pending Trip Assignment';
                  const isInMotion = v.status === 'In Motion';

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelect(v)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between transition-colors group cursor-pointer border-b border-slate-50 last:border-b-0"
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-blue-600 font-mono">[{v.truck_id}]</span>
                          <span className="text-sm font-bold text-on-surface">{v.truck_name}</span>
                          {v.plate_number && (
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                              {v.plate_number}
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isInMotion
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {isAvailable ? 'Available' : v.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">
                          Efficiency: <strong className="text-slate-700">{v.fuel_efficiency} KM/L</strong> • Engine: {v.engine_type || 'Standard'}
                        </p>
                      </div>
                      {value === v.id && <Check className="w-4 h-4 text-secondary shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-slate-400 italic">
                    {isLoading ? 'Searching...' : 'No matching vehicles found'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};