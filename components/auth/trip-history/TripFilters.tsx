import React from 'react';
import { Search, X } from 'lucide-react';

interface TripFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TripFilters = ({ searchQuery, onSearchChange }: TripFiltersProps) => (
  <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div>
      <span className="text-secondary font-bold text-xs uppercase tracking-widest mb-2 block">
        Operational Records
      </span>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-on-surface font-headline">
        Trip History
      </h1>
    </div>
    <div className="flex-1 max-w-md">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input 
          type="text"
          placeholder="Search Vehicle, Start or End Location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-surface-container-high pl-11 pr-10 py-3 rounded-2xl font-bold text-sm text-on-surface outline-none border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all shadow-sm"
        />
        {searchQuery && (
          <button 
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  </div>
);
