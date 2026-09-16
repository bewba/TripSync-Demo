import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash, GripVertical } from 'lucide-react';
import { LocationInput } from '@/components/auth/plan-trip/2_location/LocationInput';
import { TruckSelect } from '@/components/auth/plan-trip/2_location/TruckSelect';
import { DriverSelect } from '@/components/auth/plan-trip/2_location/DriverSelect';
import { useToast } from '@/components/ui/Toast/Toast';
import { StepButton } from '@/components/auth/plan-trip/StepButton';
import { Reorder } from 'motion/react';
import type { TripFormData, Vehicle, Location } from '@/types/auth/plan-trip/trip-info';

// Add a helper for generating stable IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

interface LocationStepProps {
  data: Partial<TripFormData>;
  onNext: (data: Partial<TripFormData>) => void;
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface DraggableLocation extends Location {
    id: string;
}

export default function LocationStep({ data, onNext, onBack, showToast }: LocationStepProps) {
  const [locations, setLocations] = useState<DraggableLocation[]>(() => {
    const existing = data.locationInfo?.locations || [
      { name: '', order: 0, lat: 0, long: 0 },
      { name: '', order: 1, lat: 0, long: 0 }
    ];
    return existing.map(l => ({ ...l, id: generateId() }));
  });

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(data.locationInfo?.truck);
  const [selectedDriver, setSelectedDriver] = useState<any | undefined>(data.locationInfo?.driver);
  const [geofenceEnabled, setGeofenceEnabled] = useState(data.locationInfo?.geofenceEnabled ?? false);
  const [geofenceBuffer, setGeofenceBuffer] = useState(data.locationInfo?.geofenceBuffer ?? "5");
  const [applyToll, setApplyToll] = useState(data.locationInfo?.applyToll ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingInputs, setLoadingInputs] = useState<Record<string, boolean>>({});

  const isAnyInputLoading = Object.values(loadingInputs).some(Boolean);

  const updateLocation = (id: string, name: string, lat?: number, lng?: number) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, name, lat: lat ?? 0, long: lng ?? 0 } : loc
    ));
  };

  const handleLoadingChange = useCallback((id: string, isLoading: boolean) => {
    setLoadingInputs(prev => ({ ...prev, [id]: isLoading }));
  }, []);

  const handlePlanTrip = () => {
    if (locations.some(loc => !loc.name.trim())) {
      showToast("Please fill in all locations", 'error');
      return;
    }

    if (locations.some(loc => loc.lat === 0 || loc.long === 0)) {
      showToast("One or more locations are missing coordinates. Please select from the map.", 'warning');
    }

    if (!selectedVehicle) {
      showToast("Please select a truck", 'error');
      return;
    }
    
    if (!selectedDriver) {
      showToast("Please select a driver", 'error');
      return;
    }

    setIsSubmitting(true);

    const finalData = {
      locationInfo: {
        locations: locations.map((loc, idx) => ({ 
            name: loc.name,
            lat: loc.lat,
            long: loc.long,
            order: idx 
        })),
        truckId: selectedVehicle.id as string,
        truck: selectedVehicle,
        driverId: selectedDriver.id as string,
        driverName: selectedDriver.username as string,
        driver: selectedDriver,
        geofenceEnabled,
        geofenceBuffer,
        applyToll
      }
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onNext(finalData);
    }, 400);
  };

  const addStop = () => {
    setLocations([
      ...locations,
      { id: generateId(), name: '', order: locations.length, lat: 0, long: 0 }
    ]);
  };

  const removeStop = (id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
    setLoadingInputs(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="bg-surface-container-lowest p-4 sm:p-6 lg:p-10 rounded-xl shadow-sm space-y-8 border border-slate-100 w-full">
      <div className="space-y-4">
        <Reorder.Group axis="y" values={locations} onReorder={setLocations} className="space-y-4">
          {locations.map((loc, idx) => (
            <Reorder.Item 
                key={loc.id} 
                value={loc}
                className="flex items-start sm:items-center gap-3 bg-white/50 rounded-xl p-2 group"
            >
              <div className="cursor-grab active:cursor-grabbing p-1 text-slate-300 group-hover:text-slate-400 transition-colors mt-4 sm:mt-0">
                <GripVertical className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <LocationInput
                  type={idx === 0 ? 'start' : idx === locations.length - 1 ? 'end' : 'middle'}
                  placeholder={idx === 0 ? "City or Warehouse Code" : "Delivery Address"}
                  value={loc.name}
                  lat={loc.lat}
                  lng={loc.long}
                  onChange={(name, lat, lng) => updateLocation(loc.id, name, lat, lng)}
                  onLoadingChange={(isLoading) => handleLoadingChange(loc.id, isLoading)}
                  isLast={idx === locations.length - 1}
                />
              </div>

              {locations.length > 2 && (
                <button
                  onClick={() => removeStop(loc.id)}
                  className="p-3 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors mt-6 sm:mt-0"
                >
                  <Trash className="w-5 h-5" />
                </button>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <button
        onClick={addStop}
        className="text-sm cursor-pointer font-semibold text-secondary flex items-center gap-2 hover:opacity-80 transition-opacity px-10"
      >
        <Plus className="w-4 h-4 " /> Add Stop
      </button>

      <div className="space-y-6 pt-4">
        <TruckSelect
          value={selectedVehicle?.id as string}
          selectedVehicle={selectedVehicle}
          onChange={(_, vehicle) => setSelectedVehicle(vehicle)}
        />

        <DriverSelect
          value={selectedDriver?.id as string}
          selectedDriver={selectedDriver}
          onChange={(_, driver) => setSelectedDriver(driver)}
        />

        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-blue-100 bg-blue-50/30">
          <div className="space-y-0.5">
            <label className="text-sm font-bold text-blue-900">Apply Toll</label>
            <p className="text-[10px] text-blue-600 font-medium italic">
              {applyToll ? "Including toll roads in calculation" : "Avoiding toll roads (Standard)"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setApplyToll(!applyToll)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${applyToll ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${applyToll ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>

      <div className="pt-6 flex justify-center border-t border-slate-50">
        <StepButton
          onClick={handlePlanTrip}
          onBack={onBack}
          isLoading={isSubmitting || isAnyInputLoading}
          label="Continue to Step 3"
        />
      </div>
    </div>
  );
}