import React from 'react';

export interface QuantityUnitOption {
    label: string;
    value: string;
}

interface QuantityFieldProps {
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    // Unit select props
    unitName: string;
    unitValue: string;
    onUnitChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    unitOptions: QuantityUnitOption[];

    placeholder?: string;
    required?: boolean;
    hint?: string;
    error?: string;
    disabled?: boolean;
}

export const QuantityField = ({
    label,
    name,
    value,
    onChange,
    unitName,
    unitValue,
    onUnitChange,
    unitOptions,
    placeholder,
    required,
    hint,
    error,
    disabled,
}: QuantityFieldProps) => (
    <div className="flex flex-col gap-1.5">
        <label
            htmlFor={name}
            className={`text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wider flex items-center gap-1 ${!label ? 'hidden sm:block' : ''}`}
        >
            {label}
            {required && <span className="text-error">*</span>}
        </label>

        <div className="relative flex items-stretch group">
            {/* Numeric/Float Input */}
            <input
                id={name}
                name={name}
                type="number"
                step="any"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={[
                    'w-full bg-surface-container-low border-y border-l rounded-l-lg px-4 py-3',
                    'text-on-surface placeholder:text-on-surface-variant/50',
                    'focus:ring-2 focus:z-20 transition-all font-medium outline-none',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    error
                        ? 'border-error focus:ring-error/20'
                        : 'border-slate-200 focus:ring-secondary/20',
                ]
                    .filter(Boolean)
                    .join(' ')}
            />

            {/* Unit Selector Group */}
            <div className="relative min-w-[90px] flex">
                {/* Divider line */}
                <div className={`w-[1px] my-3 ${error ? 'bg-error/30' : 'bg-slate-200'}`} />

                <select
                    name={unitName}
                    value={unitValue}
                    onChange={onUnitChange}
                    disabled={disabled}
                    className={[
                        'h-full w-full bg-surface-container-low border-y border-r rounded-r-lg pl-3 pr-8',
                        'text-[10px] font-black text-on-surface-variant uppercase tracking-tighter cursor-pointer outline-none',
                        'appearance-none transition-all focus:z-20',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error ? 'border-error' : 'border-slate-200',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {unitOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Custom Chevron */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/70">
                    <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
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