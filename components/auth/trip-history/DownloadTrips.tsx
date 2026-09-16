import React, { useState, useRef, useEffect } from 'react';
import { Download, Calendar, ChevronDown, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { useQuery } from '@tanstack/react-query';
import { TripReportTemplate } from './TripReportTemplate';
import { useHydrateTripReport } from '@/hooks/queries/useHydrateTripReport';
import { fetchTripCoordinatesOnce, fetchDriverFlagsOnce } from '@/lib/api/exportfetchers';

const fetchTripReport = async (startDate: string, endDate: string) => {
  const res = await fetch(`/api/auth/trip-history/report?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error('Failed to retrieve requested trip history report payloads.');
  return res.json();
};

export const DownloadTrips = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [reportRange, setReportRange] = useState<{ start: string; end: string } | null>(null);
  const [triggerPrint, setTriggerPrint] = useState(false);
  const [compiledTrips, setCompiledTrips] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const reportTemplateRef = useRef<HTMLDivElement>(null);
  const hydratingRef = useRef(false); // guards against re-entrant hydration passes

  const { hydrateTripsData, isHydrating, progressText } = useHydrateTripReport();

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    setEndDate(formatDate(today));
    setStartDate(formatDate(lastWeek));
  }, []);

  // Dropdown dismissal tracking
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // TanStack Query integration — raw trip rows only, no coordinates/flags yet
  const { data: trips = [], isFetching, isError, error } = useQuery({
    queryKey: ['tripReportData', reportRange?.start, reportRange?.end],
    queryFn: () => fetchTripReport(reportRange!.start, reportRange!.end),
    enabled: !!reportRange,
    staleTime: 4 * 60 * 1000,
  });

  // react-to-print compilation binding
  const handlePrint = useReactToPrint({
    contentRef: reportTemplateRef,
  });

  // Once raw trips arrive, hydrate each with coordinates + driver flags,
  // THEN print — instead of printing the raw (unhydrated) trips directly.
  // Waits until every <img> inside the report template container is fully
  // decoded (or has errored out) before resolving. This is essential because
  // PrintableTripMapStatic now fetches tiles via an async POST request —
  // two rAF frames fire long before the network round-trip finishes.
  const waitForImages = (container: HTMLElement, timeoutMs = 30_000): Promise<void> => {
    return new Promise((resolve) => {
      const deadline = Date.now() + timeoutMs;
      const check = () => {
        const imgs = Array.from(container.querySelectorAll('img'));
        // An img is "done" when:
        //   - It has no src yet (still waiting for the component to set one) — keep waiting
        //   - It is complete AND decoded (naturalWidth > 0 means the image was actually rendered)
        //   - It is complete with naturalWidth === 0 but also has no src (empty placeholder) — treat as done
        const allDone = imgs.every((img) => {
          if (!img.src || img.src === window.location.href) return false; // no src yet — still loading
          return img.complete && (img.naturalWidth > 0 || img.getAttribute('src') === '');
        });
        if ((imgs.length > 0 && allDone) || Date.now() > deadline) {
          resolve();
        } else {
          setTimeout(check, 150);
        }
      };
      // Small initial delay to let React commit the img elements to the DOM
      setTimeout(check, 100);
    });
  };

  useEffect(() => {
    if (isFetching || !triggerPrint || hydratingRef.current) return;

    hydratingRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const hydrated = trips.length
          ? await hydrateTripsData(trips, fetchTripCoordinatesOnce, fetchDriverFlagsOnce)
          : [];

        if (cancelled) return;
        setCompiledTrips(hydrated);

        // Wait for React to commit the updated template to the DOM, then wait
        // for every map tile image to finish loading before printing.
        requestAnimationFrame(async () => {
          if (cancelled) return;
          if (reportTemplateRef.current) {
            await waitForImages(reportTemplateRef.current);
          }
          if (cancelled) return;
          handlePrint();
          setTriggerPrint(false);
        });
      } catch (err) {
        if (!cancelled) {
          alert('An error occurred while compiling spatial maps for print.');
          setTriggerPrint(false);
        }
      } finally {
        hydratingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
    // hydrateTripsData is now memoized (useCallback with []), and handlePrint
    // is guarded by hydratingRef, so neither needs to be — or should be — a dep here.
  }, [isFetching, trips, triggerPrint]);


  useEffect(() => {
    if (isError && error) {
      alert((error as Error).message || 'An error occurred compiling records.');
      setTriggerPrint(false);
    }
  }, [isError, error]);

  const isBusy = isFetching || isHydrating;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => !isBusy && setIsOpen(!isOpen)}
          disabled={isBusy}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
        >
          {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isFetching ? 'Processing Logs...' : isHydrating ? (progressText || 'Compiling Trails...') : 'Generate Trip Report'}
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 p-2 flex flex-col gap-1">
            <button
              onClick={() => {
                const todayStr = formatDate(new Date());
                setReportRange({ start: todayStr, end: todayStr });
                setTriggerPrint(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl text-left"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Today's Trips
            </button>
            <button
              onClick={() => { setIsOpen(false); setIsModalOpen(true); }}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl text-left"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              Custom Dates...
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Select Date Range</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none" />
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest">Cancel</button>
                <button onClick={() => { setReportRange({ start: startDate, end: endDate }); setTriggerPrint(true); setIsModalOpen(false); }} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Generate</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Structured Single Print Layout View Component Target */}
      <TripReportTemplate ref={reportTemplateRef} trips={compiledTrips} startDate={reportRange?.start || ''} endDate={reportRange?.end || ''} />
    </>
  );
};