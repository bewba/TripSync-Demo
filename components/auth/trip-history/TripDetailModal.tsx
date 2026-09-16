import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Close,
    CalendarToday,
    LocalShipping,
    Inventory as InventoryIcon,
    Route as RouteIcon,
    LocalGasStation,
    VerifiedUser,
    Person
} from '@mui/icons-material';
import { TripFormData } from '@/types/auth/plan-trip/trip-info';
import { parseTimeToMinutes, getTripFlagThresholds } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Trash2 } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal/ConfirmationModal';

const TripMapModal = dynamic(
    () => import('./TripMapModal').then(m => ({ default: m.TripMapModal })),
    { ssr: false }
);

// Warm the map bundle + Leaflet so the first "View Map" click renders instantly
// instead of waiting on a lazy chunk download.
const preloadMapAssets = () => {
    (TripMapModal as unknown as { preload?: () => void }).preload?.();
    import('leaflet').catch(() => { /* best-effort warmup */ });
};

interface TripDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripData: TripFormData | null;
    isLoading?: boolean;
    onCancelTrip?: (tripId: string) => Promise<void>; // Added cancel callback prop
    onEndTrip?: (tripId: string) => Promise<void>; // Added end callback prop
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
    isOpen,
    onClose,
    tripData,
    isLoading,
    onCancelTrip,
    onEndTrip
}) => {
    const [isMapOpen, setIsMapOpen] = React.useState(false);
    const [activeLeg, setActiveLeg] = React.useState<number | null>(null);
    const [isActionPending, setIsActionPending] = React.useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

    React.useEffect(() => {
        if (!isOpen) {
            setIsMapOpen(false);
            setActiveLeg(null);
            setIsActionPending(false);
            setIsConfirmOpen(false);
        }
    }, [isOpen]);

    // Preload the map assets as soon as the detail modal opens so opening the
    // map is instant rather than waiting on a lazy bundle + Leaflet download.
    React.useEffect(() => {
        if (isOpen) preloadMapAssets();
    }, [isOpen]);

    const formatDate = (dateStr: string | undefined): string => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00'); // force local time parse
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatDateTime = (dateTimeStr: string | undefined): string => {
        if (!dateTimeStr) return '—';
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Trip In Progress':
            case 'Trip in progress': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Trip is Pending': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    const handleActionClick = () => {
        if (!tripData?.id) return;
        setIsConfirmOpen(true);
    };

    const confirmTripAction = async () => {
        if (!tripData?.id) return;

        try {
            setIsActionPending(true);
            if (isLive) {
                if (onEndTrip) {
                    await onEndTrip(tripData.id);
                } else {
                    const res = await fetch('/api/auth/trip-history/end', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tripId: tripData.id }),
                    });
                    if (!res.ok) throw new Error('Failed to end trip');
                }
            } else if (canCancel) {
                if (onCancelTrip) {
                    await onCancelTrip(tripData.id);
                } else {
                    const res = await fetch('/api/auth/trip-history/cancel', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tripId: tripData.id }),
                    });
                    if (!res.ok) throw new Error('Failed to cancel trip');
                }
            }
            setIsConfirmOpen(false);
            onClose(); // Auto-close modal on success
        } catch (error) {
            console.error("Failed to perform trip action:", error);
            alert(`Something went wrong while trying to ${isLive ? 'end' : 'cancel'} the trip. Please try again.`);
        } finally {
            setIsActionPending(false);
        }
    };

    if (!tripData && !isLoading) return null;

    const {
        requestInfo = {} as any,
        locationInfo = { truck: {} as any, locations: [] } as any,
        inventoryItems = [],
        fuelRequirement = {} as any
    } = tripData || {};

    console.log(tripData?.status)
    const isLive = tripData?.status === 'Trip in progress' || tripData?.status === 'Trip In Progress';

    console.log(isLive, " - Trip in progress")
    const status = tripData?.status;

    const tripLabel = `${locationInfo.locations?.[0]?.name || 'N/A'} → ${locationInfo.locations?.[locationInfo.locations.length - 1]?.name || 'N/A'}`;
    const firstLocation = locationInfo.locations?.[0];
    const lastLocation = locationInfo.locations?.[locationInfo.locations.length - 1];

    const parsePoint = (loc: any) => {
        if (!loc) return null;
        const lat = Number(loc.lat);
        const lng = Number(loc.lng ?? loc.long);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return { lat, lng };
    };

    const tripStartPoint = parsePoint(firstLocation);
    const tripEndPoint = parsePoint(lastLocation);

    // Guard evaluation to show the cancel/end button
    const canCancel = tripData?.status === 'Assigned';
    const canEnd = isLive;
    const canShowAction = canCancel || canEnd;


    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div key="trip-detail-modal" className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Trip Details</h2>
                                        <p className="text-sm text-slate-500">Record for {formatDate(requestInfo.requestDate) || "Unknown Date"}</p>
                                    </div>
                                    {!isLoading && tripData && (
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(tripData.status || '')}`}>
                                            {tripData.status || 'Unknown'}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">

                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        <Close />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                                {isLoading ? (
                                    <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4">
                                        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                        <p className="font-bold uppercase tracking-widest text-xs animate-pulse">Fetching complete record...</p>
                                    </div>
                                ) : (
                                    <>
                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <CalendarToday fontSize="small" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">General Information</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8 pl-11">
                                                <InfoItem label="Travel Purpose" value={requestInfo.travelPurpose || (requestInfo as any).travel_purpose} />
                                                <InfoItem label="Date & Time of Request" value={`${formatDate(requestInfo.requestDate || (requestInfo as any).request_date) || ''} • ${requestInfo.requestTime || (requestInfo as any).request_time || ''}`} />
                                                <InfoItem label="Scheduled Departure" value={formatDateTime(requestInfo.scheduledDeparture || (requestInfo as any).scheduled_departure)} />
                                                <InfoItem label="Toll Roads" value={tripData?.useToll ? "Included" : "Avoided"} />
                                            </div>
                                        </section>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                    <Person fontSize="small" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Requester Details</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8 pl-11">
                                                <InfoItem label="Requested By" value={requestInfo.requestedBy || (requestInfo as any).requested_by} />
                                            </div>
                                        </section>

                                        {(requestInfo.notes || (requestInfo as any).notes) && (
                                            <section>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                                                        <InventoryIcon fontSize="small" />
                                                    </div>
                                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Trip Notes</h3>
                                                </div>
                                                <div className="pl-11">
                                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                                                        "{requestInfo.notes || (requestInfo as any).notes}"
                                                    </div>
                                                </div>
                                            </section>
                                        )}

                                        <div className="h-px bg-slate-100 mx-4" />

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <LocalShipping fontSize="small" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Logistics & Fuel</h3>
                                            </div>
                                            <div className="pl-11">
                                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Vehicle</p>
                                                        <p className="text-lg font-bold text-slate-900">{locationInfo.truck?.truck_name || locationInfo.truck?.truckName || "N/A"}</p>
                                                        <p className="text-xs text-slate-500 font-medium">
                                                            {locationInfo.truck?.plate_number || locationInfo.truck?.plateNumber} • {locationInfo.truck?.fuel_type || locationInfo.truck?.fuelType || 'Fuel Type N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="flex-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-4">
                                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1 flex items-center gap-1">
                                                            <Person fontSize="inherit" /> Driver
                                                        </p>
                                                        <p className="text-lg font-bold text-slate-900">{locationInfo.driver?.username || locationInfo.driverName || "No driver assigned"}</p>
                                                        <p className="text-xs text-slate-500 font-medium">
                                                            {locationInfo.driver?.phone_number || "No contact info"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-4 w-full sm:w-auto">
                                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Consumption</p>
                                                        <p className="text-2xl font-black text-blue-600">{fuelRequirement.finalFuelAmount || 0}<span className="text-sm ml-1 text-slate-400">L</span></p>
                                                        <p className="text-xs font-bold text-slate-400 flex items-center justify-end gap-1 mt-1">
                                                            <LocalGasStation sx={{ fontSize: 12 }} />
                                                            {fuelRequirement.distance || 0} km total
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                                    <RouteIcon fontSize="small" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Route Plan & Segments</h3>
                                            </div>
                                            <div className="pl-11">
                                                <div className="relative space-y-0 before:absolute before:inset-0 before:left-[7px] before:w-[2px] before:bg-slate-100">
                                                    {locationInfo.locations?.map((loc: any, idx: number) => {
                                                        const segmentStartTime = tripData?.tripStart && tripData?.tripStart[idx];
                                                        const segmentEndTime = tripData?.tripEnd && tripData?.tripEnd[idx];

                                                        const formatTime = (isoString: string) => {
                                                            const date = new Date(isoString);
                                                            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                                        };

                                                        const calculateDuration = (start: string, end: string) => {
                                                            const diff = new Date(end).getTime() - new Date(start).getTime();
                                                            const minutes = Math.floor(diff / 60000);
                                                            const seconds = ((diff % 60000) / 1000).toFixed(0);
                                                            return `${minutes}m ${seconds}s`;
                                                        };

                                                        const actualDist = tripData?.distanceTravelled?.[idx];
                                                        const estDist = tripData?.estDistanceRequired?.[idx] ?? tripData?.locationInfo?.estDistanceRequired?.[idx];
                                                        const actualTime = tripData?.actualTripTime?.[idx];
                                                        const estTime = tripData?.estimatedTripTime?.[idx];

                                                        const { timeMultiplier, distMultiplier } = getTripFlagThresholds(estTime);

                                                        const isDistanceFlagged = actualDist && estDist && Number(actualDist) > Number(estDist) * distMultiplier;
                                                        const isTimeFlagged = actualTime && estTime && parseTimeToMinutes(actualTime) > parseTimeToMinutes(estTime) * timeMultiplier;
                                                        const isFlagged = isDistanceFlagged || isTimeFlagged;

                                                        return (
                                                            <React.Fragment key={idx}>
                                                                <div className="relative pl-8 pb-8">
                                                                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full ring-4 ring-white z-10 ${idx === 0 ? 'bg-emerald-500' :
                                                                        idx === locationInfo.locations.length - 1 ? 'bg-rose-500' :
                                                                            'bg-blue-500'
                                                                        }`} />
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">
                                                                        {idx === 0 ? "Origin" : idx === locationInfo.locations.length - 1 ? "Destination" : `Stop ${idx}`}
                                                                    </p>
                                                                    <p className="text-sm font-bold text-slate-700 leading-tight">{loc.name}</p>
                                                                </div>

                                                                {idx < locationInfo.locations.length - 1 && (
                                                                    <div className="relative pl-8 mb-8 -mt-4 border-l-2 border-dashed border-blue-100 ml-[7px] py-2">
                                                                        <div
                                                                            className={`rounded-xl p-3 border transition-all cursor-pointer flex flex-col gap-1 
                                                                                ${isFlagged
                                                                                    ? 'bg-rose-50/70 border-rose-200/50 hover:bg-rose-100/80 hover:border-rose-300'
                                                                                    : 'bg-blue-50/50 border-blue-100/50 hover:bg-blue-100/60 hover:border-blue-200'
                                                                                }`}
                                                                            onClick={() => {
                                                                                setActiveLeg(idx + 1);
                                                                                setIsMapOpen(true);
                                                                            }}
                                                                        >
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Leg {idx + 1} Metrics</span>
                                                                                {segmentStartTime && segmentEndTime && (
                                                                                    <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                                                                        {calculateDuration(segmentStartTime, segmentEndTime)}
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            {segmentStartTime && (
                                                                                <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 mt-1">
                                                                                    <div className="flex flex-col">
                                                                                        <span className="text-[8px] uppercase text-slate-400 font-bold">Start</span>
                                                                                        <span>{formatTime(segmentStartTime)}</span>
                                                                                    </div>
                                                                                    {segmentEndTime && (
                                                                                        <>
                                                                                            <div className="w-4 h-px bg-slate-200" />
                                                                                            <div className="flex flex-col">
                                                                                                <span className="text-[8px] uppercase text-slate-400 font-bold">End</span>
                                                                                                <span>{formatTime(segmentEndTime)}</span>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            )}

                                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 pt-3 border-t border-blue-100/30">
                                                                                <div>
                                                                                    <p className="text-[8px] uppercase text-slate-400 font-bold">Est. Distance</p>
                                                                                    <p className="text-[11px] font-bold text-slate-700">
                                                                                        {tripData?.estDistanceRequired?.[idx] ?? tripData?.locationInfo?.estDistanceRequired?.[idx] ?? "—"} km
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-[8px] uppercase text-slate-400 font-bold">Est. Time</p>
                                                                                    <p className="text-[11px] font-bold text-slate-700">
                                                                                        {tripData?.estimatedTripTime?.[idx] ?? "—"}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className={`text-[8px] uppercase font-bold ${isDistanceFlagged ? 'text-rose-500' : 'text-blue-500'}`}>Actual Distance</p>
                                                                                    <p className={`text-[11px] font-black ${isDistanceFlagged ? 'text-rose-600' : 'text-blue-600'}`}>
                                                                                        {tripData?.distanceTravelled?.[idx] ? `${tripData.distanceTravelled?.[idx]} km` : <span className="block border-b border-blue-300 w-4 mt-1"></span>}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className={`text-[8px] uppercase font-bold ${isTimeFlagged ? 'text-rose-500' : 'text-blue-500'}`}>Actual Time</p>
                                                                                    <p className={`text-[11px] font-black ${isTimeFlagged ? 'text-rose-600' : 'text-blue-600'}`}>
                                                                                        {tripData?.actualTripTime?.[idx] || <span className="block border-b border-blue-300 w-4 mt-1"></span>}
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            {isFlagged && (
                                                                                <span className="text-[9px] font-black uppercase tracking-wider text-rose-500/80 mt-2 flex items-center gap-1">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                                                    Trip segment flagged (Exceeds 10% threshold)
                                                                                </span>
                                                                            )}

                                                                            <span className={`text-[9px] font-black uppercase tracking-wider mt-2 ${isFlagged ? 'text-rose-400' : 'text-blue-500/80'}`}>
                                                                                Click to view driver path
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                                    <InventoryIcon fontSize="small" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Inventory Items</h3>
                                            </div>
                                            <div className="pl-11 grid gap-3">
                                                {inventoryItems.length > 0 ? (
                                                    inventoryItems.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                                                            <span className="text-slate-700 font-bold">{item.itemName}</span>
                                                            <span className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-black uppercase tracking-wider">
                                                                {item.itemQuantity} {item.itemUnit}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-slate-400 italic">No inventory items listed for this trip.</p>
                                                )}
                                            </div>
                                        </section>
                                        <section>
                                            {/* Actionable Cancel / End Button */}
                                            <div className="flex justify-end">
                                                {!isLoading && canShowAction && (
                                                    <button
                                                        onClick={handleActionClick}
                                                        disabled={isActionPending}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Trash2 size={14} className={isActionPending ? "animate-spin" : ""} />
                                                        {isActionPending
                                                            ? (isLive ? "Ending..." : "Cancelling...")
                                                            : (isLive ? "End Trip" : "Cancel Trip")}
                                                    </button>
                                                )}
                                            </div>
                                        </section>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <TripMapModal
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                tripId={tripData?.id || null}
                tripLabel={tripLabel}
                initialLeg={activeLeg}
                tripStartPoint={tripStartPoint}
                tripEndPoint={tripEndPoint}
                isLive={isLive}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmTripAction}
                title={isLive ? "End Trip" : "Cancel Trip"}
                message={
                    isLive
                        ? "Are you sure you want to end this trip? It will be marked as Completed and the driver and truck will be released."
                        : "Are you sure you want to cancel this trip? This action cannot be undone."
                }
                confirmLabel={isLive ? "End Trip" : "Cancel Trip"}
                cancelLabel={isLive ? "Keep In Progress" : "Keep Trip"}
                isDestructive={true}
                isLoading={isActionPending}
            />

        </>
    );
};

const InfoItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="space-y-1">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
        <p className="text-sm text-slate-700 font-bold">{value || "\u2014"}</p>
    </div>
);