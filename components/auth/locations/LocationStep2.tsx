'use client'
import React, { useState } from 'react';
import { MapPin, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast/Toast';
import { useAddLocationMutation } from '@/hooks/mutations';

interface Step2Props {
    data: { lat: number, lng: number, address: string };
    onBack: () => void;
    onComplete: () => void;
}

export const LocationStep2 = ({ data, onBack, onComplete }: Step2Props) => {
    const [name, setName] = useState(data.address);
    const [isSaving, setIsSaving] = useState(false);
    const { showToast, ToastComponent } = useToast();
    const addLocationMutation = useAddLocationMutation();

    const handleSave = async () => {
        if (!name.trim()) {
            showToast("Please enter a name for this location", "error");
            return;
        }

        setIsSaving(true);
        try {
            await addLocationMutation.mutateAsync({ name, lat: data.lat, long: data.lng });

            showToast("Location saved successfully!", "success");
            setTimeout(onComplete, 1000);
        } catch (err: any) {
            showToast(err.message || "Something went wrong", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="space-y-8">
                <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                        Location Name
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Manila Logistics Hub"
                        className="w-full px-6 py-5 bg-white border border-slate-200 rounded-xl text-xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Latitude</span>
                        <span className="text-lg font-mono font-bold text-slate-700 tracking-tight">{data.lat.toFixed(6)}</span>
                    </div>
                    <div className="flex-1 p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Longitude</span>
                        <span className="text-lg font-mono font-bold text-slate-700 tracking-tight">{data.lng.toFixed(6)}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 border-t border-slate-100">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-8 py-3 text-slate-500 hover:text-slate-900 font-bold transition-all rounded-full hover:bg-slate-50 cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Map
                </button>

                <button
                    disabled={isSaving}
                    onClick={handleSave}
                    className="flex items-center gap-3 px-12 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-100 active:scale-95 cursor-pointer"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Register Location
                        </>
                    )}
                </button>
            </div>
            {ToastComponent}
        </div>
    );
};
