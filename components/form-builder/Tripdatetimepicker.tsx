import React from 'react';

interface DateTimePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
}

export const TripDatePicker = ({
  label,
  name,
  value,
  onChange,
  required,
  hint,
  error,
  disabled,
}: DateTimePickerProps) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={name}
      className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider flex items-center gap-1"
    >
      {label}
      {required && <span className="text-error">*</span>}
    </label>

    <input
      id={name}
      name={name}
      type="date"
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={[
        'w-full bg-surface-container-low border rounded-lg px-4 py-3',
        'text-on-surface font-medium outline-none',
        'focus:ring-2 transition-all cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error
          ? 'border-error focus:ring-error/20'
          : 'border-slate-200 focus:ring-secondary/20',
      ]
        .filter(Boolean)
        .join(' ')}
    />

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

export const TripTimePicker = ({
  label,
  name,
  value,
  onChange,
  required,
  hint,
  error,
  disabled,
}: DateTimePickerProps) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={name}
      className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider flex items-center gap-1"
    >
      {label}
      {required && <span className="text-error">*</span>}
    </label>

    <input
      id={name}
      name={name}
      type="time"
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={[
        'w-full bg-surface-container-low border rounded-lg px-4 py-3',
        'text-on-surface font-medium outline-none',
        'focus:ring-2 transition-all cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error
          ? 'border-error focus:ring-error/20'
          : 'border-slate-200 focus:ring-secondary/20',
      ]
        .filter(Boolean)
        .join(' ')}
    />

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