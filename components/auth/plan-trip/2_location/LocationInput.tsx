'use client'
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Loader2, ChevronDown, Search, Check, Map as MapIcon, List, Lock } from 'lucide-react';

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
  const [showMap, setShowMap] = useState(true);
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
      const res = await fetch(`/api/auth/locations/get-locations`);
      if (!res.ok) {
        setLocations([]);
        return;
      }
      const data = await res.json();
      
      let filtered = Array.isArray(data) ? data : [];
      if (query) {
        filtered = filtered.filter((l: any) => l.name?.toLowerCase().includes(query.toLowerCase()));
      }
      setLocations(filtered);
    } catch (err) {
      console.error("Failed to fetch locations", err);
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !showMap) {
      fetchLocations(searchQuery);
    }
  }, [isOpen, showMap, searchQuery]);

  // Geocoding search by text is disabled in demo; map selection is handled via pin drop (handleMapChange)

  // Sync internal display when parent state changes
  useEffect(() => {
    setInputValue(value);
    if (lat && lng) {
      latestData.current.lastFetchedAddress = value;
    }
    latestData.current.lat = lat;
    latestData.current.lng = lng;
  }, [value, lat, lng]);

  // Click Outside Handler (robust against Leaflet tile DOM recycling during dragging)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (target && !target.isConnected) return;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (loc: SavedLocation) => {
    setInputValue(loc.name);
    latestData.current = {
      lat: loc.lat,
      lng: loc.long,
      lastFetchedAddress: loc.name,
    };
    onChange(loc.name, loc.lat, loc.long);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleMapChange = async (pickedLat: number, pickedLng: number) => {
    setIsLoading(true);
    onLoadingChange?.(true);
    latestData.current.lat = pickedLat;
    latestData.current.lng = pickedLng;

    try {
      const res = await fetch(`/api/auth/geocode/reverse?lat=${pickedLat}&lon=${pickedLng}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const result = Array.isArray(data) ? data[0] : data?.features?.[0]?.properties || data;

      if (result?.formatted) {
        latestData.current.lastFetchedAddress = result.formatted;
        setInputValue(result.formatted);
        onChange(result.formatted, pickedLat, pickedLng);
      } else {
        const fallbackAddress = `Pinned Location (${pickedLat.toFixed(4)}, ${pickedLng.toFixed(4)})`;
        latestData.current.lastFetchedAddress = fallbackAddress;
        setInputValue(fallbackAddress);
        onChange(fallbackAddress, pickedLat, pickedLng);
      }
    } catch (err) {
      console.error("Reverse geocoding failed, using fallback coordinates", err);
      const fallbackAddress = `Pinned Location (${pickedLat.toFixed(4)}, ${pickedLng.toFixed(4)})`;
      latestData.current.lastFetchedAddress = fallbackAddress;
      setInputValue(fallbackAddress);
      onChange(fallbackAddress, pickedLat, pickedLng);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <div ref={containerRef} className={`flex items-start gap-4 relative mb-6 last:mb-0 ${isOpen ? 'z-50' : 'z-0'}`}>
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
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
            
            {/* Dynamic View Toggle (Map vs List) */}
            <button
                type="button"
                onClick={() => {
                    setShowMap(!showMap);
                    setSearchQuery('');
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 font-bold text-sm border-b transition-colors cursor-pointer ${
                    showMap ? 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100' : 'bg-blue-50/50 text-blue-600 border-blue-100 hover:bg-blue-50'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${
                        showMap ? 'bg-slate-500' : 'bg-blue-600 shadow-blue-200'
                    }`}>
                        {showMap ? <List size={16} /> : <MapIcon size={16} />}
                    </div>
                    <span>{showMap ? 'Show Saved Locations' : 'Choose from Maps'}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    showMap ? 'text-slate-400 bg-slate-200/70 border-slate-300/60' : 'text-blue-700 bg-blue-100/80 border-blue-200'
                }`}>
                    {showMap ? 'Demo Locked' : 'Recommended'}
                </span>
            </button>

            {/* Conditional Content (Map or Censored Saved Locations) */}
            {showMap ? (
                <div>
                    <div className="h-[300px]">
                        <MapPicker
                            initialLat={lat}
                            initialLng={lng}
                            onChange={handleMapChange}
                        />
                    </div>
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MapPin size={15} className="text-blue-600 shrink-0" />
                            <span className="text-xs text-slate-800 font-semibold truncate">
                                {isLoading ? 'Locating address...' : inputValue || 'Click map to drop pin'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                        >
                            Confirm Location
                        </button>
                    </div>
                </div>
            ) : (
                /* Censored & Blurred Saved Locations & Search Feature */
                <div className="relative overflow-hidden min-h-[300px]">
                    {/* Blurred background preview of the search bar and saved locations list */}
                    <div className="filter blur-[3px] opacity-25 select-none pointer-events-none p-3 space-y-3">
                        <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50 flex items-center gap-2">
                            <Search className="w-4 h-4 text-slate-400" />
                            <div className="h-4 bg-slate-200 rounded w-40" />
                        </div>
                        {['Manila North Harbor Terminal', 'Batangas International Port & Depot', 'Clark Logistics Hub, Pampanga', 'Subic Bay Freeport Terminal'].map((name, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2.5 border-b border-slate-100 last:border-0">
                                <div className="w-8 h-8 rounded-lg bg-slate-200" />
                                <div className="h-4 bg-slate-300 rounded w-48" />
                            </div>
                        ))}
                    </div>

                    {/* Prominent Censored / Demo Locked Overlay */}
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10 select-none">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-sm ring-4 ring-amber-50">
                            <Lock className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200 mb-2">
                            Feature Not Available in Demo
                        </span>
                        <h4 className="text-sm font-bold text-slate-800">
                            Saved Locations & Search
                        </h4>
                        <p className="text-xs text-slate-500 max-w-[260px] mt-1 mb-4 leading-relaxed">
                            Database search and saved depot rosters are disabled in the demo. Please use the map to drop a pin.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowMap(true)}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                            <MapIcon size={14} />
                            Choose from Maps (Pin Drop)
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};