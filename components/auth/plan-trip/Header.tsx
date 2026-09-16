import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

const STEPS = [
  'General Information',
  'Location',
  'Fuel Consumption'
];

interface StepHeaderProps {
  currentStep: number;
}

export function StepHeader({ currentStep }: StepHeaderProps) {
  return (
    <div className="w-full py-8 mb-8">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        {STEPS.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <React.Fragment key={step}>
              {/* Step Circle & Label */}
              <div className="flex flex-col items-center relative z-10">
                <motion.div
                  initial={false}
                  animate={{
                    // Solid Green for Done, White with thick Green border for Active
                    backgroundColor: isCompleted ? '#10b981' : '#ffffff',
                    borderColor: isCompleted ? '#10b981' : isActive ? '#10b981' : '#cbd5e1',
                    scale: isActive ? 1.15 : 1,
                  }}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-colors
                    ${isCompleted ? 'text-white' : ''}
                    ${isActive ? 'text-emerald-600 shadow-lg shadow-emerald-500/30' : ''}
                    ${!isActive && !isCompleted ? 'text-slate-500' : ''} 
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" strokeWidth={3} />
                  ) : (
                    /* Darker slate-500 for pending so it's visible on slate-50 background */
                    <span>{stepNumber}</span>
                  )}
                </motion.div>

                <span className={`absolute -bottom-7 text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap hidden sm:block
                  ${isCompleted ? 'text-emerald-700' : isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] bg-slate-200 mx-2 -translate-y-3.5 relative overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{
                      width: isCompleted ? '100%' : isActive ? '50%' : '0%',
                    }}
                    className="h-full bg-emerald-500 transition-all duration-500"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}