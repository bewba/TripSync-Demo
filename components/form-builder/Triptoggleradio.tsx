import React from 'react';

// ─── TripToggle ───────────────────────────────

interface TripToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  disabled?: boolean;
}

export const TripToggle = ({
  label,
  checked,
  onChange,
  hint,
  disabled,
}: TripToggleProps) => (
  <div className="flex flex-col gap-1.5">
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        checked
          ? 'border-secondary bg-secondary/5'
          : 'border-slate-200 bg-surface-container-low hover:border-slate-300',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Custom checkbox box */}
      <span
        className={[
          'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
          checked
            ? 'bg-secondary border-secondary'
            : 'border-slate-300 bg-surface-container-lowest',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {checked && (
          <svg
            viewBox="0 0 8 8"
            fill="none"
            className="w-2 h-2"
          >
            <path
              d="M1 4l2 2 4-4"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        className={[
          'text-sm font-medium transition-colors',
          checked ? 'text-on-surface' : 'text-on-surface-variant',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label}
      </span>
    </button>
    {hint && <p className="text-xs text-on-surface-variant">{hint}</p>}
  </div>
);

// ─── TripRadioGroup ───────────────────────────

interface RadioOption {
  value: string;
  label: string;
}

interface TripRadioGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  required?: boolean;
  hint?: string;
}

export const TripRadioGroup = ({
  label,
  name,
  value,
  onChange,
  options,
  required,
  hint,
}: TripRadioGroupProps) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider flex items-center gap-1">
      {label}
      {required && <span className="text-error">*</span>}
    </span>

    <div
      role="radiogroup"
      aria-label={name}
      className="flex gap-2 flex-wrap"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={[
            'flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all flex-1 justify-center',
            value === o.value
              ? 'border-secondary bg-secondary/5 text-on-surface'
              : 'border-slate-200 bg-surface-container-low text-on-surface-variant hover:border-slate-300',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span
            className={[
              'w-2 h-2 rounded-full border-2 flex-shrink-0 transition-all',
              value === o.value
                ? 'bg-secondary border-secondary'
                : 'border-slate-300',
            ]
              .filter(Boolean)
              .join(' ')}
          />
          {o.label}
        </button>
      ))}
    </div>

    {hint && <p className="text-xs text-on-surface-variant">{hint}</p>}
  </div>
);