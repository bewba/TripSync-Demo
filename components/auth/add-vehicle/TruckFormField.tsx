import React from 'react';

interface TruckFormFieldProps {
  label: string;
  children: React.ReactNode;
}

export const TruckFormField = ({ label, children }: TruckFormFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-700">
      {label}
    </label>
    {children}
  </div>
);

