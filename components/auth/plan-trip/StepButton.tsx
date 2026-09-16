import React from 'react';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

interface StepButtonProps {
  onClick: () => void;
  onBack?: () => void; // Added onBack prop
  isLoading?: boolean;
  label?: string;
  backLabel?: string; // Added customizable back label
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

export const StepButton = ({
  onClick,
  onBack,
  isLoading,
  label = "Save & Continue",
  backLabel = "Back",
  disabled,
  type = "button",
  className = ""
}: StepButtonProps) => {
  return (
    <div className={`pt-6 flex flex-col-reverse sm:flex-row items-center gap-4 w-full ${className}`}>
      {/* Back Button - Only renders if onBack is provided */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex cursor-pointer items-center justify-center gap-2 w-full sm:w-auto px-6 py-4 text-secondary font-headline font-bold text-lg hover:bg-secondary/5 rounded-lg transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          {backLabel}
        </button>
      )}

      {/* Primary Action Button */}
      <button
        type={type}
        className="w-full sm:w-auto sm:ml-auto px-6 sm:px-12 cursor-pointer py-4 bg-secondary text-on-secondary rounded-lg font-headline font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-secondary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        onClick={onClick}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            {label}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
};