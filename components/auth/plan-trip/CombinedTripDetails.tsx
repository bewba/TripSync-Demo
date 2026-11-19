import React, { useState, useEffect, useCallback } from 'react';
import { Clock, MapPin, Truck, User, Plus, Trash, GripVertical, FileText, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Reorder, useDragControls } from 'motion/react';
import {
  TripFormField,
  TripTextArea,
  FormSection,
  FormGrid,
  FormDivider
} from '@/components/form-builder';
import { LocationInput } from '@/components/auth/plan-trip/2_location/LocationInput';
import { TruckSelect } from '@/components/auth/plan-trip/2_location/TruckSelect';
import { DriverSelect } from '@/components/auth/plan-trip/2_location/DriverSelect';
import { StepButton } from '@/components/auth/plan-trip/StepButton';
import type { TripFormData, Vehicle, Location } from '@/types/auth/plan-trip/trip-info';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface DraggableLocation extends Location {
  id: string;
}

interface CombinedTripDetailsProps {
  data: Partial<TripFormData>;
  onNext: (data: Partial<TripFormData>) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

function DraggableLocationRow({
  loc,
  idx,
  total,
  updateLocation,
  handleLoadingChange,
  removeStop,
}: {
  loc: DraggableLocation;
  idx: number;
  total: number;
  updateLocation: (id: string, name: string, lat?: number, lng?: number) => void;
  handleLoadingChange: (id: string, isLoading: boolean) => void;
  removeStop: (id: string) => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={loc.id}
      value={loc}
      dragListener={false}
      dragControls={dragControls}
      style={{ zIndex: (total - idx) * 10 }}
      className="flex items-start sm:items-center gap-3 bg-white/50 rounded-xl p-2 group relative"
    >
      <div
        className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500 transition-colors mt-4 sm:mt-0 select-none touch-none shrink-0"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <LocationInput
          type={idx === 0 ? 'start' : idx === total - 1 ? 'end' : 'middle'}
          placeholder={idx === 0 ? "City or Warehouse Code" : "Delivery Address"}
          value={loc.name}
          lat={loc.lat}
          lng={loc.long}
          onChange={(name, lat, lng) => updateLocation(loc.id, name, lat, lng)}
          onLoadingChange={(isLoading) => handleLoadingChange(loc.id, isLoading)}
          isLast={idx === total - 1}
        />
      </div>

      {total > 2 && (
        <button
          type="button"
          onClick={() => removeStop(loc.id)}
          className="p-3 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors mt-6 sm:mt-0 shrink-0 cursor-pointer"
        >
          <Trash className="w-5 h-5" />
        </button>
      )}
    </Reorder.Item>
  );
}

export default function CombinedTripDetails({ data, onNext, showToast }: CombinedTripDetailsProps) {
  const { data: session } = useSession();

  // Timeline & Requester states
  const [formData, setFormData] = useState({
    requestDate: data.requestInfo?.requestDate || '',
    requestTime: data.requestInfo?.requestTime || '',
    scheduledDeparture: data.requestInfo?.scheduledDeparture || '',
    travelPurpose: data.requestInfo?.travelPurpose || '',
    requestedBy: data.requestInfo?.requestedBy || 'TripSync ADMIN',
    notes: data.requestInfo?.notes || '',
  });

  const [depDate, setDepDate] = useState('');
  const [depHour, setDepHour] = useState('12');
  const [depMin, setDepMin] = useState('00');
  const [depAmPm, setDepAmPm] = useState<'AM' | 'PM'>('AM');
  const [minDate, setMinDate] = useState('');

  // Location & Fleet states
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
  const [loadingInputs, setLoadingInputs] = useState<Record<string, boolean>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAnyInputLoading = Object.values(loadingInputs).some(Boolean);

  // Helper date formatting utilities
  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatLocalDateTime = (d: Date) => {
    const dateStr = formatLocalDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateStr}T${hours}:${minutes}`;
  };

  const getNext5MinuteDate = (date: Date = new Date()): Date => {
    const d = new Date(date);
    d.setSeconds(0, 0);
    d.setMilliseconds(0);
    const currentMinutes = date.getMinutes() + date.getSeconds() / 60 + date.getMilliseconds() / 60000;
    const targetMinutes = Math.ceil(currentMinutes / 5) * 5;
    const nextMin = targetMinutes <= currentMinutes ? targetMinutes + 5 : targetMinutes;
    d.setMinutes(nextMin);
    return d;
  };

  // Sync default authorized user
  useEffect(() => {
    setFormData(prev => ({ ...prev, requestedBy: 'TripSync ADMIN' }));
  }, []);

  // Set default request date & time
  useEffect(() => {
    const now = new Date();
    const dateStr = formatLocalDate(now);
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setFormData((prev: any) => ({
      ...prev,
      requestDate: prev.requestDate || dateStr,
      requestTime: prev.requestTime || timeStr,
    }));
  }, []);

  const setPickerFromDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return;
    const [date, time] = dateTimeStr.split('T');
    if (!date || !time) return;

    setDepDate(date);
    const [hStr, mStr] = time.split(':');
    let h24 = parseInt(hStr || '0', 10);
    let mNum = parseInt(mStr || '0', 10);

    if (mNum % 5 !== 0) {
      mNum = Math.ceil(mNum / 5) * 5;
    }
    if (mNum >= 60) {
      mNum = 0;
      h24 = (h24 + 1) % 24;
    }
    const m = String(mNum).padStart(2, '0');
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    const ampm = h24 >= 12 ? 'PM' : 'AM';

    setDepHour(String(h12).padStart(2, '0'));
    setDepMin(m);
    setDepAmPm(ampm);
  };

  useEffect(() => {
    const now = new Date();
    setMinDate(formatLocalDate(now));

    const initialDep = data.requestInfo?.scheduledDeparture;
    if (initialDep) {
      setPickerFromDateTime(initialDep);
    } else {
      const baseDate = getNext5MinuteDate(now);
      const future = new Date(baseDate.getTime() + 30 * 60 * 1000);
      setPickerFromDateTime(formatLocalDateTime(future));
    }
  }, [data.requestInfo?.scheduledDeparture]);

  // Sync departure picker to formData
  useEffect(() => {
    if (depDate) {
      let hourNum = parseInt(depHour, 10);
      if (depAmPm === 'PM' && hourNum < 12) hourNum += 12;
      if (depAmPm === 'AM' && hourNum === 12) hourNum = 0;
      const hour24 = String(hourNum).padStart(2, '0');
      const value = `${depDate}T${hour24}:${depMin}`;

      setFormData((prev) => {
        if (prev.scheduledDeparture === value) return prev;
        return { ...prev, scheduledDeparture: value };
      });
    }
  }, [depDate, depHour, depMin, depAmPm]);

  // Pre-select default vehicle and driver if not already chosen
  useEffect(() => {
    if (!selectedVehicle) {
      fetch('/api/auth/view-vehicles/view-vehicles?planner=true')
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((vehicles: Vehicle[]) => {
          if (Array.isArray(vehicles) && vehicles.length > 0) {
            const preferred = vehicles.find((v) => v.truck_id === 'TRK-107' || v.id === 'TRK-107') || vehicles[0];
            setSelectedVehicle(preferred);
          }
        })
        .catch((err) => console.error('Failed to pre-select default vehicle', err));
    }

    if (!selectedDriver) {
      fetch('/api/auth/view-drivers/view-drivers?planner=true')
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((drivers: any[]) => {
          if (Array.isArray(drivers) && drivers.length > 0) {
            const preferred = drivers.find((d) => d.id === 'drv-107' || d.username === 'cgomez') || drivers[0];
            setSelectedDriver(preferred);
          }
        })
        .catch((err) => console.error('Failed to pre-select default driver', err));
    }
  }, []);

  const updateLocation = (id: string, name: string, lat?: number, lng?: number) => {
    setLocations(prev => prev.map(loc =>
      loc.id === id ? { ...loc, name, lat: lat ?? 0, long: lng ?? 0 } : loc
    ));
  };

  const handleLoadingChange = useCallback((id: string, isLoading: boolean) => {
    setLoadingInputs(prev => ({ ...prev, [id]: isLoading }));
  }, []);

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

  const setPresetOffset = (minutes: number) => {
    const baseDate = getNext5MinuteDate(new Date());
    const target = new Date(baseDate.getTime() + minutes * 60 * 1000);
    setPickerFromDateTime(formatLocalDateTime(target));
  };

  const handleSubmit = async () => {
    // 1. Validate Departure
    if (!formData.scheduledDeparture) {
      showToast('Please specify a scheduled departure time', 'error');
      return;
    }

    // 2. Validate Locations
    if (locations.some(loc => !loc.name.trim())) {
      showToast("Please fill in all locations", 'error');
      return;
    }

    if (locations.some(loc => loc.lat === 0 || loc.long === 0)) {
      showToast("One or more locations are missing coordinates. Please select from the map or dropdown.", 'warning');
    }

    // 3. Validate Vehicle & Driver
    if (!selectedVehicle) {
      showToast("Please select a vehicle", 'error');
      return;
    }

    if (!selectedDriver) {
      showToast("Please select a driver", 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Automatic route & distance calculation between consecutive locations
      const segmentPromises = locations.slice(0, -1).map((start, i) => {
        const end = locations[i + 1];
        const params = new URLSearchParams({
          lat1: start.lat.toString(),
          lon1: start.long.toString(),
          lat2: end.lat.toString(),
          lon2: end.long.toString(),
          avoidTolls: (!applyToll).toString(),
        });

        return fetch(`/api/auth/distance?${params.toString()}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }).then(async res => {
          if (!res.ok) throw new Error("Failed to calculate distance");
          return res.json();
        });
      });

      const results = await Promise.all(segmentPromises);
      const segmentDistances: number[] = results.map((res: any) => res.distance?.distanceKm || 0);
      const totalDistance = segmentDistances.reduce((a, b) => a + b, 0);

      const allWaypoints: [number, number][] = [];
      results.forEach((res: any) => {
        if (res?.distance?.waypoints && Array.isArray(res.distance.waypoints)) {
          allWaypoints.push(...res.distance.waypoints);
        }
      });

      const efficiency = selectedVehicle.fuel_efficiency || 12;
      const estimatedConsumption = efficiency > 0 ? (totalDistance / efficiency) : 0;
      const trafficAllowance = estimatedConsumption * 0.10;
      const recommendedTotal = parseFloat((estimatedConsumption * 1.5).toFixed(2));

      const payload: Partial<TripFormData> = {
        requestInfo: formData,
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
          driverName: selectedDriver.full_name || selectedDriver.username as string,
          driver: selectedDriver,
          geofenceEnabled,
          geofenceBuffer,
          applyToll,
          estDistanceRequired: segmentDistances,
          waypoints: allWaypoints.length > 0 ? allWaypoints : undefined,
        },
        fuelRequirement: {
          distance: parseFloat(totalDistance.toFixed(2)),
          estimatedTotalFuel: parseFloat(estimatedConsumption.toFixed(2)),
          finalFuelAmount: recommendedTotal,
          fuelPrice: 62.5,
        }
      };

      onNext(payload);
    } catch (err: any) {
      console.error("Route calculation error:", err);
      showToast(err.message || "Could not calculate route. Proceeding with estimates.", "warning");
      
      const payload: Partial<TripFormData> = {
        requestInfo: formData,
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
          driverName: selectedDriver.full_name || selectedDriver.username as string,
          driver: selectedDriver,
          geofenceEnabled,
          geofenceBuffer,
          applyToll,
        },
        fuelRequirement: {
          distance: 0,
          estimatedTotalFuel: 0,
          finalFuelAmount: 0,
          fuelPrice: 62.5,
        }
      };
      onNext(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. REQUEST TIMELINE */}
      <FormSection icon={<Clock size={16} />} title="Request Timeline">
        <FormGrid cols={2}>
          <TripFormField
            label="Date and Time of Request"
            name="requestDateTime"
            type="text"
            value={formData.requestDate && formData.requestTime ? `${formData.requestDate} , ${formData.requestTime}` : ''}
            disabled={true}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider flex items-center gap-1">
              Departure Date & Time <span className="text-error">*</span>
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="date"
                value={depDate}
                onChange={(e) => setDepDate(e.target.value)}
                min={minDate}
                className="flex-1 bg-surface-container-low border border-slate-200 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all font-medium outline-none"
                required
              />

              <div className="flex items-center gap-1.5">
                <select
                  value={depHour}
                  onChange={(e) => setDepHour(e.target.value)}
                  className="w-16 bg-surface-container-low border border-slate-200 rounded-lg px-2 py-3 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all font-medium outline-none text-center"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                    const val = String(h).padStart(2, '0');
                    return (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    );
                  })}
                </select>

                <span className="text-slate-400 font-bold">:</span>

                <select
                  value={depMin}
                  onChange={(e) => setDepMin(e.target.value)}
                  className="w-16 bg-surface-container-low border border-slate-200 rounded-lg px-2 py-3 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all font-medium outline-none text-center"
                >
                  {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setDepAmPm(prev => prev === 'AM' ? 'PM' : 'AM')}
                  className="w-16 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg px-2 py-3 font-semibold transition-colors hover:bg-slate-200 active:scale-95 text-center"
                >
                  {depAmPm}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {[
                { label: 'Now', offset: 0 },
                { label: 'In 30m', offset: 30 },
                { label: 'In 1h', offset: 60 },
                { label: 'In 2h', offset: 120 },
                { label: 'In 4h', offset: 240 },
              ].map(({ label, offset }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setPresetOffset(offset)}
                  className="text-[11px] bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-md px-2 py-1 transition-all active:scale-95 font-medium"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </FormGrid>
      </FormSection>

      {/* 2. TRIP LOCATIONS */}
      <FormSection icon={<MapPin size={16} />} title="Trip Locations">
        <div className="space-y-4">
          <Reorder.Group axis="y" values={locations} onReorder={setLocations} className="space-y-4 relative z-20">
            {locations.map((loc, idx) => (
              <DraggableLocationRow
                key={loc.id}
                loc={loc}
                idx={idx}
                total={locations.length}
                updateLocation={updateLocation}
                handleLoadingChange={handleLoadingChange}
                removeStop={removeStop}
              />
            ))}
          </Reorder.Group>

          <button
            type="button"
            onClick={addStop}
            className="text-sm cursor-pointer font-semibold text-secondary flex items-center gap-2 hover:opacity-80 transition-opacity px-2 py-1"
          >
            <Plus className="w-4 h-4" /> Add Stop
          </button>

          <div className="space-y-6 pt-4 relative z-0">
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
        </div>
      </FormSection>

      {/* 3. NOTES */}
      <FormSection icon={<FileText size={16} />} title="Notes">
        <TripTextArea
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Notes..."
          maxLength={300}
        />
      </FormSection>

      {/* 4. AUTHORIZED BY */}
      <FormSection
        icon={<Users size={16} />}
        title="Authorized By:"
        badge="Required"
      >
        <FormGrid cols={2}>
          <TripFormField
            label="Requested By"
            name="requestedBy"
            value={formData.requestedBy}
            onChange={(e) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
            placeholder="Requestor's Name"
            required
            disabled={true}
          />
        </FormGrid>
      </FormSection>

      <div className="pt-4">
        <StepButton
          onClick={handleSubmit}
          label="Continue to Trip Preview"
          isLoading={isSubmitting || isAnyInputLoading}
        />
      </div>
    </div>
  );
}
