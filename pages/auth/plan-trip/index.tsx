import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'motion/react';
import { StepHeader } from '@/components/auth/plan-trip/Header';
import { Hero } from '@/components/auth/plan-trip/Hero';
import type { TripFormData } from '@/types/auth/plan-trip/trip-info';
import { useToast } from '@/components/ui/Toast/Toast';

// Step Components
import CombinedTripDetails from '@/components/auth/plan-trip/CombinedTripDetails';
import TripPreview from '@/components/auth/plan-trip/TripPreview';

export default function PlanTripPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const [formData, setFormData] = useState<Partial<TripFormData>>({});

  const updateFormData = (newData: Partial<TripFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 2));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleConfirm = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/plan-trip/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        showToast("Trip dispatched successfully! Redirecting to live tracking...", "success");
        const dispatchedTripId = result.data?.id;
        setTimeout(() => {
          if (dispatchedTripId) {
            router.push(`/auth/active-drivers?tripId=${dispatchedTripId}`);
          } else {
            router.push('/auth/active-drivers');
          }
        }, 800);
      } else {
        showToast(result.message || "Failed to save trip", "error");
      }
    } catch (err) {
      showToast("Connection error. Please try again.", "error");
      console.error("Fetch error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CombinedTripDetails
            data={formData}
            onNext={(data) => {
              updateFormData(data);
              nextStep();
            }}
            showToast={showToast}
          />
        );
      case 2:
        return (
          <TripPreview
            data={formData}
            onConfirm={handleConfirm}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-8 lg:p-12 max-w-4xl mx-auto flex flex-col items-center"
      >
        <section className="w-full flex flex-col items-center">
          <Hero />
          {ToastComponent}

          <div className="w-full max-w-2xl">
            <StepHeader currentStep={currentStep} />
          </div>

          <div className="w-full mt-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
