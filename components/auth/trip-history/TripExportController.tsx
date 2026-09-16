import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { TripReportTemplate } from './TripReportTemplate';
import { useHydrateTripReport } from '@/hooks/queries/useHydrateTripReport';
import { fetchTripCoordinatesOnce, fetchDriverFlagsOnce } from '@/lib/api/exportfetchers';

interface TripExportControllerProps {
    baseTripsData: any[];
    dateRange: { start: string; end: string };
}

export const TripExportController: React.FC<TripExportControllerProps> = ({
    baseTripsData,
    dateRange,
}) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [compiledTrips, setCompiledTrips] = useState<any[]>([]);
    const { hydrateTripsData, isHydrating, progressText } = useHydrateTripReport();

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `Fleet_Operations_Report_${dateRange.start}_to_${dateRange.end}`,
    });

    const handleExportTrigger = async () => {
        try {
            const fullyHydratedData = await hydrateTripsData(
                baseTripsData,
                fetchTripCoordinatesOnce,
                fetchDriverFlagsOnce
            );

            setCompiledTrips(fullyHydratedData);

            // Pause briefly to allow React to paint the new vector map elements inside the DOM
            setTimeout(() => {
                handlePrint();
            }, 300);

        } catch (err) {
            alert('An error occurred while compiling spatial maps for print.');
        }
    };

    return (
        <div className="flex flex-col items-start gap-4">
            <button
                onClick={handleExportTrigger}
                disabled={isHydrating || !baseTripsData.length}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
            >
                {isHydrating ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{progressText || 'Compiling Trails...'}</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Export Comprehensive Report
                    </>
                )}
            </button>

            <TripReportTemplate
                ref={reportRef}
                trips={compiledTrips}
                startDate={dateRange.start}
                endDate={dateRange.end}
            />
        </div>
    );
};