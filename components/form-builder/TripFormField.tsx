import React from 'react';

interface TripFormFieldProps {
  label: string;
  name: string;
  type?: string;
  step?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

export const TripFormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  hint,
  error,
  prefix,
  suffix,
  disabled,
  min,
  max,
}: TripFormFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={name}
      className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider flex items-center gap-1"
    >
      {label}
      {required && <span className="text-error">*</span>}
    </label>

    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className={[
          'w-full bg-surface-container-low border rounded-lg px-4 py-3',
          'text-on-surface placeholder:text-on-surface-variant/50',
          'focus:ring-2 transition-all font-medium outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-error focus:ring-error/20'
            : 'border-slate-200 focus:ring-secondary/20',
          prefix ? 'pl-8' : '',
          suffix ? 'pr-8' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">
          {suffix}
        </span>
      )}
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