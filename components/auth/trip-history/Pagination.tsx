import React from 'react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  total: number;
  showing: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ total, showing, currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (total === 0) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((page) => {
      if (totalPages <= 7) return true;
      if (page === 1 || page === totalPages) return true;
      if (Math.abs(page - currentPage) <= 1) return true;
      return false;
    })
    .reduce<(number | '...')[]>((acc, page, idx, arr) => {
      if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push('...');
      acc.push(page);
      return acc;
    }, []);

  const btnBase = 'px-3 h-8 rounded-lg font-bold text-[10px] uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container-highest transition-colors bg-surface-container text-on-surface-variant';

  return (
    <footer className="py-12 flex flex-col sm:flex-row justify-between items-center gap-6">
      <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-60">
        Showing {showing} of {total.toLocaleString()} entries
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={btnBase}
        >
          Prev
        </button>

        <div className="flex gap-1.5">
          {pages.map((page, idx) =>
            page === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-bold"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all',
                  page === currentPage
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
                )}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={btnBase}
        >
          Next
        </button>
      </div>
    </footer>
  );
};