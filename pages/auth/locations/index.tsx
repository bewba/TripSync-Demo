'use client'
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, List, Search } from 'lucide-react';
import { LocationStep1 } from '@/components/auth/locations/LocationStep1';
import { LocationStep2 } from '@/components/auth/locations/LocationStep2';
import { LocationList } from '@/components/auth/locations/LocationList';
import { motion, AnimatePresence } from 'motion/react';
import { useLocations, queryKeys } from '@/hooks/queries';

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'add' | 'view'>('view');
  const [step, setStep] = useState(1);
  const [pickedData, setPickedData] = useState<{ lat: number, lng: number, address: string } | null>(null);

  // Cached saved locations — shared with the trip planner picker.
  const locationsQuery = useLocations();
  const savedLocations = locationsQuery.data ?? [];
  const isLoading = locationsQuery.isLoading;

  const refetchLocations = () => queryClient.invalidateQueries({ queryKey: queryKeys.locations() });

  const handleNext = (data: { lat: number, lng: number, address: string }) => {
    setPickedData(data);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleShowOnMap = (lat: number, lng: number, name: string) => {
    setPickedData({ lat, lng, address: name });
    setStep(1);
    setViewMode('add');
  };

  const handleComplete = () => {
    setStep(1);
    setPickedData(null);
    setViewMode('view');
    refetchLocations();
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Top Toggle - Google Style */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-2xl font-headline font-bold text-slate-900">Location Management</h1>
            <p className="text-sm text-slate-500 font-medium">Register and oversee logistics nodes across the network.</p>
          </div>

          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1 self-start">
            <button
              onClick={() => {
                setViewMode('view');
                setPickedData(null);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'view' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <List className="w-4 h-4" />
              View Locations
            </button>
            <button
              onClick={() => {
                setViewMode('add');
                setStep(1);
                setPickedData(null);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'add' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Location
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in duration-500">
          {viewMode === 'view' ? (
            <LocationList 
                locations={savedLocations} 
                isLoading={isLoading} 
                onRefresh={refetchLocations} 
                onShowOnMap={handleShowOnMap}
            />
          ) : (
            <div className="max-w-4xl mx-auto">
              {step === 1 ? (
                <LocationStep1 
                    onNext={handleNext} 
                    initialData={pickedData}
                />
              ) : (
                pickedData && (
                  <LocationStep2 
                    data={pickedData} 
                    onBack={handleBack} 
                    onComplete={handleComplete} 
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
