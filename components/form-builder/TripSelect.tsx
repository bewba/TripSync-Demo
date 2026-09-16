import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface TripSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
}

export const TripSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required,
  hint,
  error,
  disabled,
}: TripSelectProps) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={name}
      className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider flex items-center gap-1"
    >
      {label}
      {required && <span className="text-error">*</span>}
    </label>

    <div className="relative">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[
          'w-full bg-surface-container-low border rounded-lg px-4 py-3 pr-10',
          'text-on-surface appearance-none font-medium outline-none',
          'focus:ring-2 transition-all cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-error focus:ring-error/20'
            : 'border-slate-200 focus:ring-secondary/20',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
    </div>

    {error && (
      <p className="text-xs text-error flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
    {!error && hint && (
      <p className="text-xs text-on-surface-variant">{hint}</p>
    )}
  </div>
);