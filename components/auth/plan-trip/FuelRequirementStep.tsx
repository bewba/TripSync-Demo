import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast/Toast";
import { FormSection, TripFormField } from "@/components/form-builder";
import { StepButton } from "@/components/auth/plan-trip/StepButton";
import { ChevronDown, ChevronUp, MapPin, Loader2 } from "lucide-react";
import type { TripFormData } from "@/types/auth/plan-trip/trip-info";

interface FuelRequirementFormProps {
    data: Partial<TripFormData>;
    onNext: (data: Partial<TripFormData>) => void;
    onBack: () => void;
    onReturnToStep: (step: number) => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function FuelRequirementStep({ data, onNext, onBack, onReturnToStep, showToast }: FuelRequirementFormProps) {
    // DEBUG: Look at incoming data
    useEffect(() => {
        console.log("%c--- FUEL STEP DATA ---", "color: #ff00ff; font-weight: bold; background: #eee; padding: 2px 5px;");
        console.log("Full Data Prop:", data);
        console.log("Truck in Data:", data.locationInfo?.truck);
    }, [data]);

    // Removed local showToast
    const [loading, setLoading] = useState(false);
    const [showSegments, setShowSegments] = useState(false);
    const [fuelPrice, setFuelPrice] = useState(0);

    const locations = data.locationInfo?.locations || [];

    const [segmentDistances, setSegmentDistances] = useState<number[]>([]);

    const [efficiencyRate, setEfficiencyRate] = useState(data.locationInfo?.truck?.fuel_efficiency || 0);

    // Sync local rate with vehicle selection
    useEffect(() => {
        setEfficiencyRate(data.locationInfo?.truck?.fuel_efficiency || 0);
    }, [data.locationInfo?.truck?.fuel_efficiency]);

    const [fuelData, setFuelData] = useState({
        distance: data.fuelRequirement?.distance || 0,
        estimatedTotalFuel: data.fuelRequirement?.estimatedTotalFuel || 0,
        finalFuelAmount: data.fuelRequirement?.finalFuelAmount || 0,
    });

    const calculateRequirements = useCallback((distances: number[], rateToUse: number) => {
        const totalDist = distances.reduce((a, b) => a + b, 0);

        // Fix: Distance / Efficiency = Fuel (L)
        // Guard against division by zero
        const estimated = rateToUse > 0 ? (totalDist / rateToUse) : 0;

        // Calculate the 50% recommendation (1.5x the estimate)
        const recommendedAmount = Number((estimated * 1.5).toFixed(2));

        setFuelData({
            distance: Number(totalDist.toFixed(2)),
            estimatedTotalFuel: Number(estimated.toFixed(2)),
            finalFuelAmount: recommendedAmount,
        });
    }, []);

    // Sync calculations when distances or efficiency rate changes
    useEffect(() => {
        calculateRequirements(segmentDistances, efficiencyRate);
    }, [segmentDistances, efficiencyRate, calculateRequirements]);

    useEffect(() => {
        const getDistanceData = async () => {
            if (!locations || locations.length < 2) return;

            setLoading(true);
            try {
                const segmentPromises = locations.slice(0, -1).map((start, i) => {
                    const end = locations[i + 1];
                    const params = new URLSearchParams({
                        lat1: start.lat.toString(),
                        lon1: start.long.toString(),
                        lat2: end.lat.toString(),
                        lon2: end.long.toString(),
                        avoidTolls: (!data.locationInfo?.applyToll).toString(), // If applyToll is true, avoidTolls is false
                    });

                    return fetch(`/api/auth/distance?${params.toString()}`, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" }
                    }).then(async res => {
                        if (res.status === 400) {
                            showToast("Invalid location, and no route found", "error");
                            onReturnToStep(2);
                            return null;
                        }
                        if (!res.ok) throw new Error("Network response was not ok");
                        return res.json();
                    });
                });

                const results = await Promise.all(segmentPromises);
                if (results.some(r => r === null)) return;

                const distances = results.map((res: any) => res.distance?.distanceKm || 0);
                setSegmentDistances(distances);
            } catch (error: any) {
                console.error('Parallel routing error:', error);
                showToast(error.message || "Failed to calculate distances.", "error");
            } finally {
                setLoading(false);
            }
        };

        getDistanceData();
    }, [locations, data.locationInfo?.applyToll, showToast, onReturnToStep]);

    return (
        <FormSection title="Fuel Requirement">
            <div className="relative space-y-6">
                {/* Visual feedback for parallel processing */}
                {loading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        <p className="mt-2 text-sm font-semibold text-blue-900">Calculating Trip Segments...</p>
                    </div>
                )}

                {/* 1. Total Distance Output */}
                <TripFormField
                    label="Total Distance (km)"
                    name="distance"
                    type="number"
                    value={fuelData.distance.toString()}
                    disabled
                />

                {/* 2. Efficiency Override & Consumption Estimate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TripFormField
                        label="Efficiency Rate (km/L)"
                        name="efficiency_rate"
                        type="number"
                        step="0.1"
                        value={efficiencyRate.toString()}
                        onChange={(e) => {
                            const newRate = Number(e.target.value);
                            setEfficiencyRate(newRate);
                        }}
                        className="border-blue-200 focus:border-blue-500 font-bold"
                        hint="Override the standard vehicle rate for this trip"
                    />
                    <TripFormField
                        label="Total Estimated Fuel (L)"
                        name="estimatedTotalFuel"
                        type="number"
                        value={fuelData.estimatedTotalFuel.toString()}
                        disabled
                    />
                </div>

                <div className="grid grid-cols-1">
                    <TripFormField
                        label="Traffic Allowance (10%)"
                        name="allowance"
                        value={(fuelData.estimatedTotalFuel * 1.10).toFixed(2).toString()}
                        disabled
                        className="bg-blue-50 font-bold text-blue-700 border-blue-100"
                    />
                </div>

                {/* 3. Detailed Breakdown Accordion */}
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => setShowSegments(!showSegments)}
                        className="flex items-center gap-2 px-1 text-sm font-bold text-gray-600 hover:text-blue-600 transition-all cursor-pointer"
                    >
                        <span>View Segment Breakdown</span>
                        {showSegments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showSegments && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4 shadow-inner">
                            {segmentDistances.map((dist, i) => (
                                <div key={i} className="flex justify-between items-start text-sm border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                                    <div className="flex gap-3">
                                        <div className="mt-1 flex flex-col items-center">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            <div className="w-0.5 h-full bg-blue-200 my-1 min-h-[10px]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Leg {i + 1}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">
                                                {locations[i]?.name.split(',')[0] || "Start"} → {locations[i + 1]?.name.split(',')[0] || "End"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400">{dist.toFixed(2)} km</p>
                                        <p className="font-mono text-sm font-bold text-blue-600">
                                            {efficiencyRate > 0 ? (dist / efficiencyRate).toFixed(2) : "0"} L
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. Editable Final Amount - Pre-filled with 50% Recommendation */}
                <div className="pt-2">
                    <div className="flex justify-between items-center mb-1 px-1">
                        <label className="text-sm font-medium text-gray-700">
                            Final Fuel Request (L)
                        </label>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            Recommended (+50% Buffer)
                        </span>
                    </div>

                    <TripFormField
                        label=""
                        name="finalFuelAmount"
                        type="number"
                        value={fuelData.finalFuelAmount === 0 ? "" : fuelData.finalFuelAmount.toString()}
                        onChange={(e) => setFuelData({
                            ...fuelData,
                            finalFuelAmount: e.target.value === "" ? 0 : Number(e.target.value)
                        })}
                        className="border-2 border-blue-200 focus:border-blue-500 font-bold text-lg"
                    />
                    <p className="mt-1 text-[10px] text-gray-400 px-1 italic">
                        *Field is pre-filled with a 50% safety margin but can be edited manually.
                    </p>
                </div>
            </div>

            <StepButton
    onClick={() => {
        // We create a base object and then cast it to satisfy the strict nested types
        const updatedData = {
            ...data,
            fuelRequirement: { ...fuelData, fuelPrice },
            locationInfo: {
                ...data.locationInfo,
                locations: data.locationInfo?.locations ?? [],
                // 1. Fallback for truckId (ensures it's never undefined)
                truckId: data.locationInfo?.truckId ?? "",
                estDistanceRequired: segmentDistances,
                // 2. Use 'as any' or a fallback for the truck object to clear the TruckRecord error
                truck: data.locationInfo?.truck ? {
                    ...data.locationInfo.truck,
                    fuel_efficiency: efficiencyRate
                } : (data.locationInfo?.truck as any)
            }
        } as Partial<TripFormData>; // Cast the whole result at the end

        onNext(updatedData);
    }}
    onBack={onBack}
    label="Preview Trip"
    disabled={loading}
/>

        </FormSection>
    );
}