import React from 'react';
import {
    CalendarToday,
    LocalShipping,
    Route,
    LocalGasStation,
    Person
} from '@mui/icons-material';
import { TripFormData } from '@/types/auth/plan-trip/trip-info';
import { StepButton } from '@/components/auth/plan-trip/StepButton';

interface TripPreviewProps {
    data: Partial<TripFormData>;
    onConfirm: (data: any) => void;
    onBack: () => void;
    isSubmitting?: boolean;
}

const TripPreview: React.FC<TripPreviewProps> = ({ data, onConfirm, onBack, isSubmitting }) => {
    const {
        requestInfo = {} as any,
        locationInfo = { truck: {} as any, locations: [] } as any,
        fuelRequirement = {} as any
    } = data;

    const formatDeparture = (dateTimeString: string | undefined) => {
        if (!dateTimeString) return '—';
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return dateTimeString;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }) + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const totalDistance = fuelRequirement?.distance ?? 0;
    const estConsumption = fuelRequirement?.estimatedTotalFuel ?? 0;
    const trafficAllowance = (estConsumption * 0.10);
    const fuelEfficiency = locationInfo.truck?.fuel_efficiency ?? 12;

    const originName = locationInfo.locations?.[0]?.name;
    const destName = locationInfo.locations?.[locationInfo.locations.length - 1]?.name;
    const isSameLocation = originName && destName && originName === destName;

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <header className="mb-8">
                <h1 className="text-2xl font-normal text-gray-900">Trip Review</h1>
                <p className="text-sm text-gray-500 mt-1">Check the details of your request before finalizing.</p>
            </header>

            <div className={`space-y-10 transition-opacity duration-300 ${isSubmitting ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>

                {/* SECTION: GENERAL INFORMATION */}
                <section>
                    <div className="flex items-center gap-3 mb-4 text-gray-600">
                        <CalendarToday fontSize="small" className="text-blue-600" />
                        <h2 className="text-sm font-medium uppercase tracking-wider">General Information</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 px-1">
                        <InfoItem
                            label="Date & Time of Request"
                            value={requestInfo.requestDate && requestInfo.requestTime ? `${requestInfo.requestDate} • ${requestInfo.requestTime}` : '—'}
                        />
                        <InfoItem
                            label="Scheduled Departure"
                            value={formatDeparture(requestInfo.scheduledDeparture)}
                        />
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* SECTION: REQUESTER */}
                <section>
                    <div className="flex items-center gap-3 mb-4 text-gray-600">
                        <Person fontSize="small" className="text-blue-600" />
                        <h2 className="text-sm font-medium uppercase tracking-wider">Requester Details</h2>
                    </div>
                    <div className="px-1">
                        <InfoItem label="Requested By" value={requestInfo.requestedBy} />
                    </div>
                </section>

                {requestInfo.notes && (
                    <>
                        <hr className="border-gray-100" />
                        <section className="px-1">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Trip Notes</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {requestInfo.notes}
                            </p>
                        </section>
                    </>
                )}

                <hr className="border-gray-100" />

                {/* SECTION: LOGISTICS & FUEL */}
                <section>
                    <div className="flex items-center gap-3 mb-4 text-gray-600">
                        <LocalShipping fontSize="small" className="text-blue-600" />
                        <h2 className="text-sm font-medium uppercase tracking-wider">Logistics & Fuel</h2>
                    </div>
                    <div className="bg-gray-100/50 rounded-xl p-5 border border-gray-100 mb-3 flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">Assigned Vehicle</p>
                            <p className="text-lg font-medium text-gray-900">{locationInfo.truck?.truck_name || "No vehicle selected"}</p>
                            <p className="text-sm text-gray-600">
                                {locationInfo.truck?.plate_number ? locationInfo.truck.plate_number.toUpperCase() : ''} {locationInfo.truck?.engine_type ? `• ${locationInfo.truck.engine_type}` : ''}
                            </p>
                        </div>
                        <div className="flex-1 border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-4">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-tight flex items-center gap-1">
                                <Person fontSize="small" /> Driver
                            </p>
                            <p className="text-lg font-medium text-gray-900">
                                {locationInfo.driver?.full_name || locationInfo.driver?.username || locationInfo.driverName || "No driver selected"}
                            </p>
                        </div>
                        <div className="text-right border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-4 w-full sm:w-auto">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">Est. Fuel Request</p>
                            <p className="text-xl font-bold text-blue-700">
                                {estConsumption.toFixed(2)} L
                            </p>
                            <p className="text-xs text-gray-500 italic mt-0.5 flex items-center justify-end gap-1">
                                <LocalGasStation sx={{ fontSize: 13 }} />
                                {Number(totalDistance).toFixed(2)} km
                            </p>
                            <div className="text-[11px] text-gray-500 mt-1 leading-tight space-y-0.5">
                                <p>Estimated consumption: {estConsumption.toFixed(2)} L</p>
                                <p>With traffic allowance (10%): {(estConsumption + trafficAllowance).toFixed(2)} L</p>
                                <p>Fuel efficiency: {fuelEfficiency} km/L</p>
                            </div>
                            {isSameLocation && (
                                <p className="text-xs text-red-500 mt-2 font-medium">
                                    Invalid distance returned for {originName} to {destName}.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* SECTION: ROUTE PLAN */}
                <section>
                    <div className="flex items-center gap-3 mb-4 text-gray-600">
                        <Route fontSize="small" className="text-blue-600" />
                        <h2 className="text-sm font-medium uppercase tracking-wider">Route Plan</h2>
                    </div>
                    <div className="ml-2 border-l-2 border-dashed border-gray-200 pl-6 space-y-6 relative">
                        {locationInfo.locations?.map((loc: any, idx: number) => (
                            <div key={idx} className="space-y-1">
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                                    <p className="text-xs font-bold text-blue-600 uppercase mb-0.5">
                                        {idx === 0 ? "Origin" : idx === locationInfo.locations.length - 1 ? "Destination" : `Stop ${idx}`}
                                    </p>
                                    <p className="text-sm text-gray-800 leading-relaxed font-medium">{loc.name || "—"}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Route Distance Bar */}
                    <div className="mt-6 flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <span className="text-sm font-bold text-slate-700">Total Route Distance</span>
                        <span className="text-base font-bold text-blue-700">{Number(totalDistance).toFixed(2)} km</span>
                    </div>
                </section>

                <hr className="border-gray-100" />
            </div>

            <footer className="mt-8 pt-4">
                <StepButton
                    onClick={() => onConfirm(data)}
                    onBack={onBack}
                    label={isSubmitting ? "Submitting Request..." : "Submit Trip Request"}
                    disabled={isSubmitting}
                />
            </footer>
        </div>
    );
};

const InfoItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <div>
        <p className="text-xs text-gray-500 font-medium mb-0.5 uppercase tracking-tighter">{label}</p>
        <p className="text-[15px] text-gray-900 font-medium">{value || "—"}</p>
    </div>
);

export default TripPreview;
