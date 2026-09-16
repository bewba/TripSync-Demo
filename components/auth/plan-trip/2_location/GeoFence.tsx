import React from "react";
import { Shield, Radio, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GeoFenceProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  buffer: string;
  onBufferChange: (buffer: string) => void;
}

export const GeoFence = ({
  enabled,
  onEnabledChange,
  buffer,
  onBufferChange,
}: GeoFenceProps) => {
  return (
    <div className="flex flex-col gap-6 p-1 border-t border-slate-50 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl transition-all duration-300 ${enabled
            ? 'bg-secondary/10 text-secondary shadow-sm shadow-secondary/5'
            : 'bg-slate-100 text-slate-400'
            }`}>
            <Shield className={`w-5 h-5 transition-transform duration-500 ${enabled ? 'scale-110' : 'scale-100'}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface tracking-tight">Enable Geofence</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50/50 p-1.5 px-3 rounded-full border border-slate-100">
          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${enabled ? 'text-secondary' : 'text-slate-400'}`}>
            {enabled ? 'Active' : 'Disabled'}
          </span>
          <button
            type="button"
            onClick={() => onEnabledChange(!enabled)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ring-offset-2 focus:ring-2 focus:ring-secondary/20 cursor-pointer ${enabled ? 'bg-secondary' : 'bg-slate-200'
              }`}
          >
            <motion.div
              animate={{ x: enabled ? 22 : 2 }}
              className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {enabled && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="sm:w-32 flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <Radio className="w-4 h-4 text-secondary" />
                  </div>
                  <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-loose">
                    Buffer
                  </label>
                </div>

                <div className="flex-1 flex items-center">
                  <div className="relative w-full max-w-[160px]">
                    <input
                      type="text"
                      value={buffer}
                      onChange={(e) => onBufferChange(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-on-surface focus:ring-4 focus:ring-secondary/10 outline-none transition-all pr-12 shadow-sm"
                      placeholder="5"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-200/50 border border-slate-200/50">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                        km
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 px-4 py-2.5 border-t border-slate-50 flex items-start gap-2.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-300 mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                  The geofence is a buffer that allows you to set expectations as to how far a driver can exceed the trip distance
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};