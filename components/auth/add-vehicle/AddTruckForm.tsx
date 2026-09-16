import React from 'react';
import { Loader2 } from 'lucide-react';
import { TruckFormField } from './TruckFormField';
import { QuantityField } from '@/components/form-builder';

interface AddVehicleFormProps {
  formData: {
    name: string;
    fuelEfficiency: string;
    truckId: string;
    metricType: string;
    engineType: string;
    plateNumber: string;
    status: string;
  };
  isSubmitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const METRIC_OPTIONS = [
  { label: 'KM/L', value: 'km/L' },
  { label: 'L/H', value: 'L/H' },
];

export const AddTruckForm = ({ formData, isSubmitting, onInputChange, onSubmit }: AddVehicleFormProps) => (
  <form onSubmit={onSubmit} className="w-full space-y-6">
    <div className="flex flex-col gap-6">
      <div>
        <TruckFormField label="Truck ID">
          <input
            name="truckId"
            value={formData.truckId}
            onChange={onInputChange}
            className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium uppercase"
            placeholder="e.g. TRUCK-01"
          />
        </TruckFormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <TruckFormField label="Vehicle name">
          <input
            name="name"
            value={formData.name}
            onChange={onInputChange}
            className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
            placeholder="e.g. Thunder Hauler 2000"
          />
        </TruckFormField>

        <TruckFormField label="Plate Number">
          <input
            name="plateNumber"
            value={formData.plateNumber}
            onChange={onInputChange}
            className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium uppercase"
            placeholder="e.g. ABC 1234"
          />
        </TruckFormField>
      </div>


      <TruckFormField label="Engine Type">
        <input
          name="engineType"
          value={formData.engineType}
          onChange={onInputChange}
          className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
          placeholder="e.g. 6-Cylinder Diesel"
        />
      </TruckFormField>

      <QuantityField
        label="Fuel Efficiency"
        name="fuelEfficiency"
        value={formData.fuelEfficiency}
        onChange={onInputChange as any}
        unitName="metricType"
        unitValue={formData.metricType}
        onUnitChange={onInputChange as any}
        unitOptions={METRIC_OPTIONS}
        placeholder="0.0"
      />

      <TruckFormField label="Initial Status">
        <select
          name="status"
          value={formData.status}
          onChange={onInputChange}
          className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer"
        >
          <option value="Active Trip">Active Trip</option>
          <option value="Assigned Trip">Assigned Trip</option>
          <option value="Pending Trip Assignment">Pending Trip Assignment</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </TruckFormField>
    </div>

    <div className="pt-6 flex justify-start border-t border-slate-100">
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save vehicle"
        )}
      </button>
    </div>
  </form>
);

