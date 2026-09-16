import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X, RefreshCw, ArrowDown, ArrowUp,
  Terminal, Copy, CheckCheck, AlertCircle,
  ChevronDown, ChevronLeft, ChevronRight,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface LogEntry {
  id: string;
  message: string;
  trip_id: string | null;
  user_id: string | null;
  code: number | null;
  created_at: string;
}

type UserMap = Record<string, { username: string }>;

// ── Constants ──────────────────────────────────────────────────────────────────
const PAGE_SIZE = 50;

// ── Helpers ────────────────────────────────────────────────────────────────────
function detectLevel(msg: string): 'INFO' | 'ERROR' | 'WARN' | 'DEBUG' | 'SYSTEM' {
  const u = msg.toUpperCase();
  if (u.includes('[ERROR]') || u.includes('EXCEPTION') || u.includes('FAILED')) return 'ERROR';
  if (u.includes('[WARN]')  || u.includes('WARNING'))                            return 'WARN';
  if (u.includes('[DEBUG]') || u.includes('DEBUG'))                              return 'DEBUG';
  if (u.includes('[INFO]'))                                                       return 'INFO';
  return 'SYSTEM';
}

const LEVEL_CFG = {
  INFO:   'text-blue-600 bg-blue-50 border-blue-100',
  ERROR:  'text-red-600 bg-red-50 border-red-100',
  WARN:   'text-amber-600 bg-amber-50 border-amber-100',
  DEBUG:  'text-purple-600 bg-purple-50 border-purple-100',
  SYSTEM: 'text-slate-500 bg-slate-50 border-slate-100',
};

function fmtTimestamp(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Batch user resolver (module-level cache + debounce) ───────────────────────
const userCache: UserMap = {};
let pendingIds: Set<string> = new Set();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const cacheSubscribers: Set<() => void> = new Set();

async function flushUserIds() {
  const toFetch = Array.from(pendingIds).filter(id => !(id in userCache));
  pendingIds = new Set();
  if (!toFetch.length) return;
  try {
    const res = await fetch('/api/auth/logs/resolve-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: toFetch }),
    });
    if (res.ok) {
      const data: UserMap = await res.json();
      Object.assign(userCache, data);
      toFetch.forEach(id => { if (!(id in userCache)) userCache[id] = { username: id.slice(0, 8) }; });
      cacheSubscribers.forEach(fn => fn());
    }
  } catch { /* silent */ }
}

function queueUserIds(ids: string[]) {
  ids.forEach(id => { if (id && !(id in userCache)) pendingIds.add(id); });
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flushUserIds, 80);
}

function useUserMap(ids: string[]): UserMap {
  const [map, setMap] = useState<UserMap>({});
  useEffect(() => {
    const fn = () => setMap({ ...userCache });
    cacheSubscribers.add(fn);
    fn();
    return () => { cacheSubscribers.delete(fn); };
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const missing = ids.filter(id => id && !(id in userCache));
    if (missing.length) queueUserIds(missing);
  }, [ids.join(',')]);
  return map;
}

// ── CopyButton ─────────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0"
    >
      {copied
        ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── LogRow (memoized) ──────────────────────────────────────────────────────────
const LogRow = memo(function LogRow({ log, userMap }: { log: LogEntry; userMap: UserMap }) {
  const [expanded, setExpanded] = useState(false);
  const level = detectLevel(log.message);
  const username = log.user_id ? (userMap[log.user_id]?.username ?? null) : null;

  return (
    <>
      <tr
        className={`group border-b border-slate-50 cursor-pointer transition-colors ${expanded ? 'bg-blue-50/30' : 'hover:bg-slate-50/60'}`}
        onClick={() => setExpanded(p => !p)}
      >
        {/* created_at */}
        <td className="px-4 py-2.5 whitespace-nowrap align-top">
          <span className="text-[11px] font-mono text-slate-500" title={fmtTimestamp(log.created_at)}>
            {fmtTimestamp(log.created_at)}
          </span>
        </td>

        {/* message */}
        <td className="px-3 py-2.5 align-top max-w-[420px]">
          <div className="flex items-start gap-2">
            <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${LEVEL_CFG[level]}`}>
              {level}
            </span>
            <span className="text-xs font-mono text-slate-700 truncate block">{log.message}</span>
            <CopyButton text={log.message} />
          </div>
        </td>

        {/* user_id → username */}
        <td className="px-3 py-2.5 whitespace-nowrap align-top">
          {log.user_id ? (
            <div className="flex flex-col gap-0.5">
              {username
                ? <span className="text-xs font-semibold text-slate-700">{username}</span>
                : <span className="text-[10px] font-mono text-slate-400 animate-pulse">resolving…</span>}
              <span className="text-[10px] font-mono text-slate-300">{log.user_id.slice(0, 8)}…</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-300">—</span>
          )}
        </td>

        {/* trip_id */}
        <td className="px-3 py-2.5 whitespace-nowrap align-top">
          {log.trip_id ? (
            <span className="text-[11px] font-mono text-slate-500" title={log.trip_id}>
              {log.trip_id.slice(0, 8)}…
            </span>
          ) : (
            <span className="text-[11px] text-slate-300">—</span>
          )}
        </td>

        {/* code */}
        <td className="px-3 py-2.5 whitespace-nowrap align-top">
          {log.code != null
            ? <span className="text-[11px] font-mono font-bold text-slate-600">{log.code}</span>
            : <span className="text-[11px] text-slate-300">—</span>}
        </td>

        {/* expand chevron */}
        <td className="px-3 py-2.5 align-top w-6">
          <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </td>
      </tr>

      {/* Expanded: full raw message */}
      {expanded && (
        <tr className="bg-slate-900/[0.02]">
          <td colSpan={6} className="px-4 pb-3 pt-0">
            <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
              <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap break-all leading-relaxed">
                {log.message}
              </pre>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});


// ── Pagination ─────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, total, onPageChange }: {
  page: number; totalPages: number; total: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to   = Math.min(page * PAGE_SIZE, total);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
      <span className="text-xs text-slate-400 font-medium">
        Showing <span className="font-bold text-slate-600">{from}–{to}</span> of{' '}
        <span className="font-bold text-slate-600">{total.toLocaleString()}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-slate-600 px-2">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LogsPage() {
  const [logs, setLogs]       = useState<LogEntry[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Filters
  const [search, setSearch]         = useState('');
  const [debSearch, setDebSearch]   = useState('');
  const [tripFilter, setTripFilter] = useState('');
  const [sort, setSort]             = useState<'asc' | 'desc'>('desc');
  const [fromDate, setFromDate]     = useState('');
  const [toDate, setToDate]         = useState('');

  const abortRef = useRef<AbortController | null>(null);

  // Collect unique user_ids for batch resolution
  const userIds = Array.from(new Set(logs.map(l => l.user_id).filter(Boolean) as string[]));
  const userMap = useUserMap(userIds);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [sort, fromDate, toDate, tripFilter]);

  const fetchLogs = useCallback(async (pageNum: number) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page:  String(pageNum),
      limit: String(PAGE_SIZE),
      sort,
      ...(debSearch  && { search: debSearch }),
      ...(tripFilter && { trip_id: tripFilter }),
      ...(fromDate   && { from: fromDate }),
      ...(toDate     && { to: toDate }),
    });

    try {
      const res = await fetch(`/api/auth/logs/logs?${params}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const incoming: LogEntry[] = data.logs ?? [];

      setLogs(incoming);
      setTotal(data.total ?? 0);

      // Queue user resolution for this page
      const ids = incoming.map(l => l.user_id).filter(Boolean) as string[];
      if (ids.length) queueUserIds(ids);
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message ?? 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  }, [debSearch, tripFilter, sort, fromDate, toDate]);

  useEffect(() => { fetchLogs(page); }, [fetchLogs, page]);

  const hasFilters = debSearch || tripFilter || fromDate || toDate;
  const clearFilters = () => { setSearch(''); setTripFilter(''); setFromDate(''); setToDate(''); };
  const totalPages  = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">System Logs</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {total > 0
                ? <><span className="font-bold text-slate-600">{total.toLocaleString()}</span> entries{hasFilters && <span className="text-blue-500 ml-1">(filtered)</span>}</>
                : 'Raw driver-app logs from the logger database.'}
            </p>
          </div>
          <button
            onClick={() => fetchLogs(page)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-40 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm space-y-3">
          {/* Row 1: Search + Trip ID */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="log-search"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search messages…"
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative min-w-[200px] flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase pointer-events-none">
                Trip:
              </span>
              <input
                id="trip-id-filter"
                type="text"
                value={tripFilter}
                onChange={e => { setTripFilter(e.target.value); setPage(1); }}
                placeholder="Filter by trip UUID…"
                className="w-full pl-12 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
              {tripFilter && (
                <button onClick={() => setTripFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Dates + Sort + Clear */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={fromDate}
              onChange={e => { setFromDate(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-400 transition-colors"
            />
            <span className="text-xs text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={toDate}
              onChange={e => { setToDate(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-400 transition-colors"
            />

            <button
              id="sort-toggle"
              onClick={() => { setSort(s => s === 'asc' ? 'desc' : 'asc'); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[11px] font-black text-slate-600 uppercase tracking-wider transition-colors"
            >
              {sort === 'desc'
                ? <><ArrowDown className="w-3.5 h-3.5" /> Newest first</>
                : <><ArrowUp   className="w-3.5 h-3.5" /> Oldest first</>}
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-xl transition-all"
              >
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Column headers */}
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">created_at</th>
                  <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">message</th>
                  <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">user_id</th>
                  <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">trip_id</th>
                  <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">code</th>
                  <th className="px-3 py-2.5 w-6" />
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: 14 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 animate-pulse">
                      <td className="px-4 py-3"><div className="h-3 w-32 bg-slate-100 rounded" /></td>
                      <td className="px-3 py-3"><div className="h-3 bg-slate-100 rounded" style={{ width: `${55 + (i % 5) * 9}%` }} /></td>
                      <td className="px-3 py-3"><div className="h-3 w-20 bg-slate-100 rounded" /></td>
                      <td className="px-3 py-3"><div className="h-3 w-16 bg-slate-100 rounded" /></td>
                      <td className="px-3 py-3"><div className="h-3 w-6 bg-slate-100 rounded" /></td>
                      <td />
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">Failed to load logs</p>
                        <p className="text-xs text-slate-400">{error}</p>
                        <button onClick={() => fetchLogs(page)} className="mt-1 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 uppercase tracking-wide">
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Terminal className="w-10 h-10 text-slate-200" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No logs found</p>
                        {hasFilters && <p className="text-xs text-slate-300">Try adjusting your filters.</p>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map(log => <LogRow key={log.id} log={log} userMap={userMap} />)
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && !error && logs.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
