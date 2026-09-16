import React, { useMemo } from 'react';
import { PrintableTripMap } from '@/components/ui/PrintableTripMap/PrintableTripMap';
import { PrintableTripMapStatic } from '@/components/ui/PrintableTripMap/PrintableTripMapStatic';

interface TripReportTemplateProps {
  trips: any[];
  startDate: string;
  endDate: string;
}

export const TripReportTemplate = React.forwardRef<HTMLDivElement, TripReportTemplateProps>(
  ({ trips, startDate, endDate }, ref) => {

    const safeParse = (field: any) => {
      if (!field) return {};
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return {};
        }
      }
      return field;
    };

    // Flattens the "legs" shape returned by fetchTripCoordinatesOnce (res.legs)
    // into the flat LatLng[] that PrintableTripMap expects. If the array is
    // already flat points (e.g. the locInfo/locations fallback), pass through untouched.
    const flattenCoordinates = (raw: any[]): any[] => {
      if (!Array.isArray(raw) || raw.length === 0) return [];
      let flat = raw;
      if (raw[0]?.lat === undefined) {
        // treat as an array of leg objects
        flat = raw.flatMap((leg: any) => leg.points || leg.coordinates || leg.path || []);
      }
      // Normalize 'long' to 'lng' to ensure map components parse it correctly
      return flat.map((p: any) => ({
        ...p,
        lat: Number(p.lat),
        lng: Number(p.lng ?? p.long)
      })).filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));
    };

    // Normalizes trip coordinate data into discrete legs so the report can be
    // broken down per leg. Handles both the { leg, coordinates } shape returned
    // by fetchTripCoordinatesOnce and the flat-point fallback (treated as one leg).
    const normalizeLegs = (raw: any[]): { leg: number; coordinates: any[] }[] => {
      if (!Array.isArray(raw) || raw.length === 0) return [];
      // Flat list of points → single implicit leg.
      if (raw[0]?.lat !== undefined) return [{ leg: 1, coordinates: raw }];
      // Array of leg objects.
      return raw
        .map((leg: any, idx: number) => ({
          leg: Number(leg.leg ?? idx + 1),
          coordinates: leg.coordinates || leg.points || leg.path || [],
        }))
        .filter((leg) => Array.isArray(leg.coordinates))
        .sort((a, b) => a.leg - b.leg);
    };

    const formatFlagDuration = (sec?: number | null): string => {
      // driver_flags.duration is stored in minutes (matches TripMapModal display).
      const m = Math.round(Number(sec || 0));
      return m > 0 ? `${m}m` : '—';
    };

    const metricsDashboard = useMemo(() => {
      let totalDistance = 0;
      let completedCount = 0;
      let cancelledCount = 0;
      let totalFuelRequested = 0;
      let totalEstimatedConsumed = 0;

      trips.forEach((row) => {
        if (row.status === 'Completed') completedCount++;
        if (row.status === 'Cancelled') cancelledCount++;

        const fuelReq = safeParse(row.fuel_requirement);
        const locInfo = safeParse(row.location_info);

        let distance = 0;
        if (Array.isArray(row.distance_travelled) && row.distance_travelled.length > 0) {
          distance = row.distance_travelled.reduce((sum: number, val: any) => sum + Number(val || 0), 0);
        } else {
          distance = Number(fuelReq.distance || 0);
        }
        totalDistance += distance;

        const requested = Number(fuelReq.final_fuel_amount || fuelReq.finalFuelAmount || 0);
        totalFuelRequested += requested;

        const efficiency = Number(locInfo.truck?.fuel_efficiency || 1);
        const estimatedConsumed = efficiency > 0 ? (distance / efficiency) : 0;
        totalEstimatedConsumed += estimatedConsumed;
      });

      return {
        totalDistance,
        completedCount,
        cancelledCount,
        totalFuelRequested,
        totalEstimatedConsumed,
      };
    }, [trips]);

    const formatLongDate = (dateStr: string) => {
      if (!dateStr) return '—';
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    return (
      <div className="absolute -left-[9999px] -top-[9999px] w-[850px]">
        <div ref={ref} className="p-10 bg-white text-slate-800 font-sans print:p-6">
          <style dangerouslySetInnerHTML={{
            __html: `
            @media print {
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              .trip-card-block { page-break-inside: avoid !important; break-inside: avoid !important; }
            }
          `}} />

          {/* Document Header */}
          <div className="border-b-2 border-slate-100 pb-5 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Fleet Trip History Report</h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Range: {formatLongDate(startDate)} — {formatLongDate(endDate)}
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Generated On</p>
              <p className="font-bold text-slate-700">{new Date().toLocaleDateString('en-US')}</p>
            </div>
          </div>

          {/* Aggregated Dashboard Metrics Box */}
          <div className="grid grid-cols-3 gap-3 pb-6">
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 text-left">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Total Distance</p>
              <p className="text-lg font-black text-slate-800">{metricsDashboard.totalDistance.toFixed(1)}<span className="text-xs font-normal text-slate-400"> km</span></p>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 text-left">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Fuel Requested</p>
              <p className="text-lg font-black text-blue-600">{metricsDashboard.totalFuelRequested.toFixed(1)}<span className="text-xs font-normal text-slate-400"> L</span></p>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 text-left">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Est. Fuel Consumed</p>
              <p className="text-lg font-black text-slate-800">{metricsDashboard.totalEstimatedConsumed.toFixed(1)}<span className="text-xs font-normal text-slate-400"> L</span></p>
            </div>

            <div className="bg-emerald-50/40 border border-emerald-200/50 rounded-2xl p-3.5 text-left">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600 mb-0.5">Completed</p>
              <p className="text-lg font-black text-slate-800">{metricsDashboard.completedCount}<span className="text-xs font-normal text-slate-400"> runs</span></p>
            </div>

            <div className="bg-rose-50/40 border border-rose-200/50 rounded-2xl p-3.5 text-left">
              <p className="text-[9px] font-black uppercase tracking-wider text-rose-600 mb-0.5">Cancelled</p>
              <p className="text-lg font-black text-slate-800">{metricsDashboard.cancelledCount}<span className="text-xs font-normal text-slate-400"> runs</span></p>
            </div>
          </div>

          {/* Individual Trip Record Section */}
          <div className="space-y-6">
            {trips.length === 0 ? (
              <p className="text-center py-10 border border-dashed border-slate-200 text-slate-400 rounded-2xl font-medium italic">No logged trips matched the specified parameter range.</p>
            ) : (
              trips.map((row, idx) => {
                const reqInfo = safeParse(row.request_info);
                const locInfo = safeParse(row.location_info);
                const fuelReq = safeParse(row.fuel_requirement);

                const locations = locInfo.locations || [];
                const originName = locations[0]?.name || 'Origin';
                const destinationName = locations[locations.length - 1]?.name || 'Destination';
                const waypoints = locations.slice(1, -1);

                // Fallbacks to handle both nested and hydrated property schemas smoothly.
                // row.coordinates comes back as an array of "legs" (res.legs) from the
                // hydration fetch, so it must be flattened into flat LatLng points
                // before being handed to PrintableTripMap.
                const rawCoords = row.coordinates || locInfo.coordinates || locations || [];
                const coordinates = flattenCoordinates(rawCoords);
                const flags = row.flags || row.exception_flags || locInfo.flags || [];

                // Discrete legs for the per-leg breakdown. Leg N runs from
                // locations[N-1] → locations[N].
                const legs = normalizeLegs(rawCoords);
                const hasLegBreakdown = legs.length > 0;

                let tripDistance = 0;
                if (Array.isArray(row.distance_travelled) && row.distance_travelled.length > 0) {
                  tripDistance = row.distance_travelled.reduce((sum: number, val: any) => sum + Number(val || 0), 0);
                } else {
                  tripDistance = Number(fuelReq.distance || 0);
                }

                const fuelEfficiency = Number(locInfo.truck?.fuel_efficiency || 1);
                const estimatedFuelConsumed = fuelEfficiency > 0 ? (tripDistance / fuelEfficiency) : 0;
                const fuelRequested = Number(fuelReq.final_fuel_amount || fuelReq.finalFuelAmount || 0);

                return (
                  <div key={row.id || idx} className="trip-card-block bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-base font-black text-slate-800 tracking-tight">Trip Record</h3>
                        <p className="text-[11px] text-slate-400 font-semibold tracking-tight mt-0.5">ID: {row.id}</p>
                      </div>
                      <span className={`px-3 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-widest ${row.status === 'Completed' || row.status === 'Assigned'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-600'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                        {row.status || 'N/A'}
                      </span>
                    </div>

                    <hr className="border-slate-100 mb-4" />

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-xs mb-5">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Travel Purpose</p>
                        <p className="font-bold text-slate-700 mt-0.5">{reqInfo.travel_purpose || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Date & Time of Request</p>
                        <p className="font-bold text-slate-700 mt-0.5">
                          {reqInfo.request_date ? `${new Date(reqInfo.request_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • ${reqInfo.request_time || ''}` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Scheduled Departure</p>
                        <p className="font-bold text-slate-700 mt-0.5">
                          {reqInfo.scheduled_departure ? new Date(reqInfo.scheduled_departure).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Requested By</p>
                        <p className="font-bold text-slate-700 mt-0.5">{reqInfo.requested_by || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Toll Roads</p>
                        <p className="font-bold text-slate-700 mt-0.5">{row.use_toll || locInfo.apply_toll ? 'Included' : 'Avoided'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 grid grid-cols-3 gap-4 items-center mb-5">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Vehicle</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">{locInfo.truck?.truck_name || 'Asset'}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5">{row.truck_id || 'N/A'}</p>
                      </div>
                      <div className="border-l border-slate-200/70 pl-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Driver</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">{locInfo.driver_name || locInfo.driver?.username || 'Unassigned'}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5">ID: {row.driver_id ? `${row.driver_id.slice(0, 8)}...` : 'N/A'}</p>
                      </div>
                      <div className="border-l border-slate-200/70 pl-4 space-y-0.5 text-xs">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Consumption Details</p>
                        <div className="flex justify-between text-slate-600 font-bold text-[11px]">
                          <span>Distance Travelled:</span>
                          <span className="text-slate-800 tabular-nums">{tripDistance.toFixed(2)} km</span>
                        </div>
                        <div className="flex justify-between text-slate-600 font-bold text-[11px]">
                          <span>Estimated Fuel Consumed:</span>
                          <span className="text-slate-800 tabular-nums">{estimatedFuelConsumed.toFixed(2)} L</span>
                        </div>
                        <div className="flex justify-between text-blue-600 font-black text-[11px]">
                          <span>Fuel Requested:</span>
                          <span className="tabular-nums">{fuelRequested.toFixed(2)} L</span>
                        </div>
                      </div>
                    </div>

                    {/* Per-Leg Breakdown ─ one map + flag ledger per leg */}
                    <div className="mb-5 block w-full">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Per-Leg Route Breakdown</p>

                      {hasLegBreakdown ? (
                        <div className="flex flex-col gap-5">
                          {legs.map((legObj, legIdx) => {
                            const legCoords = flattenCoordinates(legObj.coordinates);
                            const legFlags = flags.filter((f: any) => Number(f.leg) === Number(legObj.leg));
                            const fromName = locations[legIdx]?.name || `Point ${legIdx + 1}`;
                            const toName = locations[legIdx + 1]?.name || `Point ${legIdx + 2}`;

                            const legDistance = Array.isArray(row.distance_travelled)
                              ? Number(row.distance_travelled[legIdx] || 0)
                              : 0;

                            const stoppages = legFlags.filter((f: any) => Number(f.code) === 0).length;
                            const gpsOff = legFlags.filter((f: any) => Number(f.code) === 1).length;

                            return (
                              <div key={legObj.leg ?? legIdx} className="trip-card-block border border-slate-100 rounded-2xl p-4 bg-slate-50/40">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">{legObj.leg}</span>
                                    <p className="text-xs font-black text-slate-700 tracking-tight">
                                      {fromName} <span className="text-slate-400 font-bold mx-0.5">→</span> {toName}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                    {legDistance > 0 && (
                                      <span className="tabular-nums">{legDistance.toFixed(2)} km</span>
                                    )}
                                    {stoppages > 0 && (
                                      <span className="text-rose-600">{stoppages} Stoppage{stoppages > 1 ? 's' : ''}</span>
                                    )}
                                    {gpsOff > 0 && (
                                      <span className="text-orange-600">{gpsOff} GPS Off</span>
                                    )}
                                  </div>
                                </div>

                                <PrintableTripMapStatic
                                  coordinates={legCoords}
                                  flags={legFlags}
                                  width={770}
                                  height={220}
                                />

                                {legFlags.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Flag Ledger</p>
                                    <div className="flex flex-col gap-1">
                                      {legFlags.map((f: any, fIdx: number) => {
                                        const isStoppage = Number(f.code) === 0;
                                        return (
                                          <div key={f.id || fIdx} className="flex items-center justify-between text-[11px] bg-white border border-slate-100 rounded-lg px-2.5 py-1">
                                            <span className="flex items-center gap-1.5 font-bold">
                                              <span className={`w-2 h-2 rounded-full ${isStoppage ? 'bg-rose-500' : 'bg-orange-500'}`} />
                                              <span className={isStoppage ? 'text-rose-600' : 'text-orange-600'}>
                                                {isStoppage ? 'Stoppage' : 'GPS Turned Off'}
                                              </span>
                                            </span>
                                            <span className="text-slate-600 font-bold tabular-nums">
                                              Duration: {formatFlagDuration(f.duration)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <PrintableTripMapStatic
                          coordinates={coordinates}
                          flags={flags}
                          width={770}
                          height={240}
                        />
                      )}
                    </div>

                    <div className="mt-4 pt-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Route Plan & Segments</p>
                      <div className="relative pl-2 flex flex-col gap-3">

                        <div className="flex items-center gap-3 z-10">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 border border-white flex-shrink-0" />
                          <p className="text-xs text-slate-700 font-semibold">
                            <span className="text-[10px] uppercase font-black text-slate-400 mr-1.5">Origin:</span>
                            <span className="font-bold text-slate-800">{originName}</span>
                          </p>
                        </div>

                        {waypoints.map((wp: any, wIdx: number) => (
                          <div key={wIdx} className="flex items-center gap-3 pl-0.5 relative z-10">
                            <div className="absolute top-[-16px] bottom-[-16px] left-[4px] w-[2px] bg-slate-100 -z-10" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ring-4 ring-slate-50 border border-white flex-shrink-0 ml-[1px]" />
                            <p className="text-xs text-slate-500 font-semibold pl-0.5">
                              <span className="text-[10px] font-bold text-slate-400 mr-1">Waypoints:</span> {wp.name}
                            </p>
                          </div>
                        ))}

                        <div className="flex items-center gap-3 relative z-10">
                          <div className="absolute top-[-16px] left-[4.5px] h-[16px] w-[2px] bg-slate-100 -z-10" />
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-50 border border-white flex-shrink-0" />
                          <p className="text-xs text-slate-700 font-semibold">
                            <span className="text-[10px] uppercase font-black text-slate-400 mr-1.5">Destination:</span>
                            <span className="font-bold text-slate-800">{destinationName}</span>
                          </p>
                        </div>

                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      </div >
    );
  }
);

TripReportTemplate.displayName = 'TripReportTemplate';