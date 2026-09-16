'use client'
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Loader2, ChevronDown, Search, Check, Map as MapIcon, List } from 'lucide-react';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[250px] bg-surface-2 rounded-lg animate-pulse" />
});

interface LocationInputProps {
  type: 'start' | 'middle' | 'end';
  placeholder: string;
  value: string;
  lat?: number;
  lng?: number;
  onChange: (address: string, lat?: number, lng?: number) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  isLast?: boolean;
}

interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  long: number;
}

export const LocationInput = ({ type, placeholder, value, lat, lng, onChange, onLoadingChange, isLast = false }: LocationInputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const latestData = useRef({
    lat: lat,
    lng: lng,
    lastFetchedAddress: value
  });

  // Fetch saved locations (preset 5)
  const fetchLocations = async (query: string = '') => {
    try {
      setIsLoading(true);
      // We can use the existing get-locations but we'll filter client-side or add a query param if needed
      // For now, let's just fetch all and filter for the dropdown
      const res = await fetch(`/api/auth/locations/get-locations`);
      const data = await res.json();
      
      let filtered = data || [];
      if (query) {
        filtered = filtered.filter((l: any) => l.name.toLowerCase().includes(query.toLowerCase()));
      }
      setLocations(filtered.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch locations", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLocations(searchQuery);
    }
  }, [isOpen, searchQuery]);

  // SEARCH LOGIC (Geocoding - only active when showMap is true)
  useEffect(() => {
    if (!showMap || !searchQuery || searchQuery.length < 3) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/auth/geocode?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          const first = data[0];
          const lat = Number(first.lat);
          const lng = Number(first.lon);
          latestData.current = { lat, lng, lastFetchedAddress: first.formatted };
          onChange(first.formatted, lat, lng);
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, showMap, onChange]);

  // Sync internal display when parent state changes
  useEffect(() => {
    setInputValue(value);
    if (lat && lng) {
      latestData.current.lastFetchedAddress = value;
    }
    latestData.current.lat = lat;
    latestData.current.lng = lng;
  }, [value, lat, lng]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMap(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (loc: SavedLocation) => {
    onChange(loc.name, loc.lat, loc.long);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleMapChange = async (lat: number, lng: number) => {
    setIsLoading(true);
    onLoadingChange?.(true);
    latestData.current.lat = lat;
    latestData.current.lng = lng;

    try {
      const res = await fetch(`/api/auth/geocode/reverse?lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const result = Array.isArray(data) ? data[0] : data?.features?.[0]?.properties || data;

      if (result?.formatted) {
        latestData.current.lastFetchedAddress = result.formatted;
        setInputValue(result.formatted);
        onChange(result.formatted, lat, lng);
        // Close both on successful pick
        setIsOpen(false);
        setShowMap(false);
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <div ref={containerRef} className="flex items-start gap-4 relative mb-6 last:mb-0">
      {/* Connector Line */}
      <div className="flex flex-col items-center absolute left-0 h-full">
        <div className={`w-3 h-3 rounded-full mt-5 ring-4 ${
          type === 'start' ? 'bg-emerald-500 ring-emerald-500/20' :
          type === 'end' ? 'bg-rose-500 ring-rose-500/20' : 'bg-slate-400 ring-slate-400/20'
        }`} />
        {!isLast && <div className="w-[2px] flex-1 bg-slate-200 my-1" />}
      </div>

      <div className="flex-1 ml-8 relative min-w-0">
        {/* Dropdown Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-left grid grid-cols-[auto_1fr_auto] items-center gap-3 focus:ring-4 focus:ring-blue-50 transition-all font-bold outline-none shadow-sm cursor-pointer`}
        >
          <MapPin size={18} className={inputValue ? "text-blue-500" : "text-slate-400"} />
          {inputValue ? (
            <span className="text-slate-900 truncate w-full">{inputValue}</span>
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2">
            
            {/* Dynamic View Toggle (Map vs List) */}
            <button
                type="button"
                onClick={() => {
                    setShowMap(!showMap);
                    setSearchQuery(''); // Clear search when swapping views
                }}
                className={`w-full flex items-center gap-3 px-4 py-4 font-bold text-sm border-b transition-colors cursor-pointer ${
                    showMap ? 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100' : 'bg-blue-50/50 text-blue-600 border-blue-100 hover:bg-blue-50'
                }`}
            >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg ${
                    showMap ? 'bg-slate-500 shadow-slate-100' : 'bg-blue-600 shadow-blue-200'
                }`}>
                    {showMap ? <List size={16} /> : <MapIcon size={16} />}
                </div>
                {showMap ? 'Show Saved Locations' : 'Choose from Maps'}
            </button>

            {/* Contextual Search Input */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                autoFocus
                className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-700"
                placeholder={showMap ? "Search address or place..." : "Search saved locations..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
            </div>
            
            {/* Conditional Content (Map or List) */}
            {showMap ? (
                <div className="animate-in fade-in duration-300">
                    <div className="h-[300px]">
                        <MapPicker
                            initialLat={latestData.current.lat}
                            initialLng={latestData.current.lng}
                            onChange={handleMapChange}
                        />
                    </div>
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click on map to drop a pin</span>
                    </div>
                </div>
            ) : (
                <div className={`max-h-64 overflow-y-auto ${isLoading ? 'opacity-50' : ''}`}>
                {locations.length > 0 ? (
                    locations.map((loc) => (
                    <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelect(loc)}
                        className="w-full text-left px-5 py-4 hover:bg-slate-50 flex items-center justify-between transition-colors group border-b border-slate-50 last:border-0 cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                <MapPin size={16} />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{loc.name}</span>
                        </div>
                        {inputValue === loc.name && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                    ))
                ) : (
                    <div className="px-4 py-10 text-center">
                    <p className="text-sm text-slate-400 italic">
                        {isLoading ? 'Searching...' : 'No saved locations found'}
                    </p>
                    </div>
                )}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};