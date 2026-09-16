'use client'
import React, { useState } from 'react';
import { MapPin, Search, Trash2, Edit2, Map as MapIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast/Toast';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal/ConfirmationModal';
import { useDeleteLocationMutation } from '@/hooks/mutations';

interface Location {
    id: string;
    name: string;
    lat: number;
    long: number;
    created_at: string;
}

interface ListProps {
    locations: Location[];
    isLoading: boolean;
    onRefresh: () => void;
    onShowOnMap: (lat: number, lng: number, name: string) => void;
}

export const LocationList = ({ locations, isLoading, onRefresh, onShowOnMap }: ListProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast, ToastComponent } = useToast();
    
    // Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteLocationMutation = useDeleteLocationMutation();

    const filtered = locations.filter(l => 
        l.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await deleteLocationMutation.mutateAsync(deleteId);
            showToast("Location deleted", "success");
        } catch (err) {
            showToast("Failed to delete", "error");
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* List Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Filter by name..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 sm:px-0 self-end sm:self-auto">
                    {filtered.length} Total Sites
                </div>
            </div>

            {/* Table/List View */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="py-20 text-center text-slate-400 font-medium">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 opacity-20" />
                        Loading registry...
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Site Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coordinates</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((l) => (
                                    <tr key={l.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-slate-700">{l.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 animate-in fade-in duration-300">
                                                {Number(l.lat).toFixed(4)}, {Number(l.long).toFixed(4)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => onShowOnMap(Number(l.lat), Number(l.long), l.name)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95 cursor-pointer"
                                                >
                                                    <MapIcon className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteId(l.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No locations found. Switch to "Add Location" to register a new one.</p>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Delete Location"
                message="Are you sure you want to remove this site from the registry? This action cannot be undone."
                confirmLabel="Delete Site"
            />

            {ToastComponent}
        </div>
    );
};
