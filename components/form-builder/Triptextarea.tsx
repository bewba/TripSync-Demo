import React from 'react';

interface TripTextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
}

export const TripTextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  hint,
  error,
  maxLength,
  rows = 3,
  disabled,
}: TripTextAreaProps) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={name}
      className={`text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider flex items-center gap-1 ${!label ? 'hidden sm:block' : ''}`}
    >
      {label}
      {required && <span className="text-error">*</span>}
    </label>

    <textarea
      id={name}
      name={name}
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      className={[
        'w-full bg-surface-container-low border rounded-lg px-4 py-3',
        'text-on-surface placeholder:text-on-surface-variant/50',
        'focus:ring-2 transition-all font-medium outline-none resize-y',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error
          ? 'border-error focus:ring-error/20'
          : 'border-slate-200 focus:ring-secondary/20',
      ]
        .filter(Boolean)
        .join(' ')}
    />

    <div className="flex items-center justify-between">
      <div>
        {error && (
          <p className="text-xs text-error flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-on-surface-variant">{hint}</p>
        )}
      </div>
      {maxLength && (
        <span className="text-xs text-on-surface-variant ml-auto">
          {value.length} / {maxLength}
        </span>
      )}
    </div>
  </div>
);