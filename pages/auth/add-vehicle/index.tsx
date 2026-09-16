import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useToast } from '@/components/ui/Toast/Toast';
import { AddVehicleHeader } from '@/components/auth/add-vehicle/AddTruckHeader';
import { AddTruckForm } from '@/components/auth/add-vehicle/AddTruckForm';

export default function AddVehiclePage() {
  const [formData, setFormData] = useState({
    truckId: '',
    name: '',
    fuelEfficiency: '',
    metricType: 'km/L',
    engineType: '',
    plateNumber: '',
    status: 'Pending Trip Assignment'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'truckId' || name === 'plateNumber') {
      finalValue = value.toUpperCase();
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.truckId || !formData.name || !formData.fuelEfficiency) {
      showToast("Please fill in all required fields", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/add-vehicle/add-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 'Failed to add vehicle';
        if (errorMessage.includes('duplicate key')) {
          if (errorMessage.includes('truck_pkey')) {
            showToast("Truck Id exists already", 'error');
          } else if (errorMessage.includes('truck_plate_number_key')) {
            showToast("Plate Number already exists", 'error');
          } else {
            showToast("Vehicle already exists", 'error');
          }
        } else {
          showToast(errorMessage, 'error');
        }
        setIsSubmitting(false);
        return;
      }

      showToast("Vehicle added successfully!", 'success');
      setFormData({
        truckId: '',
        name: '',
        fuelEfficiency: '',
        metricType: 'km/L',
        engineType: '',
        plateNumber: '',
        status: 'Pending Trip Assignment'
      });
    } catch (error: any) {
      console.error("Failed to add vehicle:", error);
      showToast("An unexpected error occurred", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]"
    >
      <div className="w-full max-w-lg bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-slate-200">
        <AddVehicleHeader />

        <AddTruckForm
          formData={formData}
          isSubmitting={isSubmitting}
          onInputChange={handleInputChange}
          onSubmit={handleAddVehicle}
        />
      </div>

      {ToastComponent}
    </motion.div>
  );
}


