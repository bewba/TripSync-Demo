'use client'
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, Loader2, ChevronRight, Navigation, Crosshair } from 'lucide-react';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker/MapPicker'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-400 font-medium border border-slate-200 rounded-3xl">Initializing Map...</div>
});

interface Step1Props {
    onNext: (data: { lat: number, lng: number, address: string }) => void;
    initialData?: { lat: number, lng: number, address: string } | null;
}

export const LocationStep1 = ({ onNext, initialData }: Step1Props) => {
    const [searchQuery, setSearchQuery] = useState(initialData?.address || '');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number, lng: number } | null>(
        initialData ? { lat: initialData.lat, lng: initialData.lng } : null
    );
    const [detectedAddress, setDetectedAddress] = useState(initialData?.address || '');
    const latestSearch = useRef(initialData?.address || '');

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 3) return;

        const timer = setTimeout(async () => {
            if (searchQuery === latestSearch.current) return;
            setIsLoading(true);
            try {
                const res = await fetch(`/api/auth/geocode?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (data && data.length > 0) {
                    const first = data[0];
                    const lat = Number(first.lat);
                    const lng = Number(first.lon);
                    setSelectedCoords({ lat, lng });
                    setDetectedAddress(first.formatted || searchQuery);
                    latestSearch.current = first.formatted;
                }
            } catch (err) {
                console.error("Geocoding failed", err);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleMapChange = async (lat: number, lng: number) => {
        setSelectedCoords({ lat, lng });
        setIsLoading(true);
        try {
            const res = await fetch(`/api/auth/geocode/reverse?lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const result = Array.isArray(data) ? data[0] : data?.features?.[0]?.properties || data;
            if (result?.formatted) {
                setDetectedAddress(result.formatted);
                setSearchQuery(result.formatted);
                latestSearch.current = result.formatted;
            } else {
                setDetectedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
        } catch (err) {
            console.error("Reverse geocoding failed", err);
            setDetectedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative h-[650px] w-full rounded-3xl overflow-hidden border border-slate-200 bg-white">
            {/* Map Container */}
            <div className="absolute inset-0 z-0">
                <MapPicker 
                    initialLat={selectedCoords?.lat} 
                    initialLng={selectedCoords?.lng} 
                    onChange={handleMapChange} 
                />
            </div>

            {/* Floating Search Bar */}
            <div className="absolute top-6 left-6 right-6 z-10 flex justify-center">
                <div className="relative w-full max-w-xl group bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-1 flex items-center gap-2">
                    <div className="pl-4">
                        <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for a location..."
                        className="flex-1 py-4 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all active:scale-95 mr-1 cursor-pointer">
                        Locate
                    </button>
                    {isLoading && (
                        <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-blue-100 overflow-hidden rounded-full">
                            <div className="h-full bg-blue-500 animate-progress w-1/3" />
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Location Card Overlay */}
            {selectedCoords && (
                <div className="absolute bottom-6 left-6 z-10 w-80 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Navigation className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-headline font-bold text-slate-900">Pin Selected</h4>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Coordinates captured</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                            <span className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 px-1">Active Coordinates</span>
                            <span className="text-xs font-mono font-bold text-slate-700 truncate block">
                                {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
                            </span>
                        </div>

                        <button
                            onClick={() => onNext({ ...selectedCoords!, address: detectedAddress })}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group active:scale-95 cursor-pointer"
                        >
                            Save Location
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
