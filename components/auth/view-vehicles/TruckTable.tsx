import React, { useState } from 'react';
import { Edit2, Check, X, User as UserIcon, Trash2 } from 'lucide-react';
import { TruckRecord } from '@/types/types';
import { useToast } from '@/components/ui/Toast/Toast';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal/ConfirmationModal';
import { useDeleteVehicleMutation, useUpdateVehicleMutation } from '@/hooks/mutations';

interface TruckTableProps {
  trucks: TruckRecord[];
  onRefresh: () => void;
}

export const TruckTable = ({ trucks, onRefresh }: TruckTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<Partial<TruckRecord>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Deletion State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast, ToastComponent } = useToast();
  const updateVehicleMutation = useUpdateVehicleMutation();
  const deleteVehicleMutation = useDeleteVehicleMutation();

  const handleEdit = (truck: TruckRecord) => {
    setEditingId(truck.id);
    setEditState({ ...truck });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditState({});
  };

  const handleChange = (field: keyof TruckRecord, value: any) => {
    let finalValue = value;
    if ((field === 'truck_id' || field === 'plate_number') && typeof value === 'string') {
      finalValue = value.toUpperCase();
    }
    setEditState((prev) => ({ ...prev, [field]: finalValue }));
  };

  const handleSave = async () => {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await updateVehicleMutation.mutateAsync({ id: editingId, payload: editState as Record<string, any> });

      showToast("Vehicle updated successfully", 'success');
      setEditingId(null);
    } catch (error: any) {
      const errorMessage = error.message || "";
      if (errorMessage.includes('duplicate key')) {
        if (errorMessage.includes('truck_pkey')) {
          showToast("Truck Id exists already", 'error');
        } else if (errorMessage.includes('truck_plate_number_key')) {
          showToast("Plate Number already exists", 'error');
        } else {
          showToast("Vehicle already exists", 'error');
        }
      } else {
        showToast(errorMessage || "Failed to update vehicle", 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteVehicleMutation.mutateAsync(deleteId);

      showToast("Vehicle deleted successfully", 'success');
      setDeleteId(null);
    } catch (error) {
      showToast("Failed to delete vehicle", 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr className="border-b border-slate-100 text-left bg-slate-50/50">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap w-[120px]">Truck ID</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap min-w-[200px]">Vehicle</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap w-[150px]">Plate</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap w-[180px]">Driver</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap w-[180px]">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap w-[150px]">Efficiency</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-right whitespace-nowrap w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {trucks.map((truck) => {
              const isEditing = editingId === truck.id;

              // Internal mapping to fix the Amber color issue
              const getStatusStyles = (status: string) => {
                const s = status?.toUpperCase();
                if (s === 'IN MOTION') return 'bg-blue-50 text-blue-600 border-blue-100';
                if (s === 'MAINTENANCE') return 'bg-amber-50 text-amber-600 border-amber-100';
                if (s === 'ASSIGNED TRIP' || s === 'ACTIVE TRIP') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
                return 'bg-slate-100 text-slate-500 border-slate-200';
              };

              return (
                <tr key={truck.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        className="w-32 px-3 py-1.5 text-sm border border-blue-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-black text-blue-700 uppercase"
                        value={editState.truck_id || ''}
                        placeholder="TRUCK ID"
                        onChange={(e) => handleChange('truck_id', e.target.value)}
                      />
                    ) : (
                      <span className="font-black text-base text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                        {truck.truck_id}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap min-w-[220px]">
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5 max-w-[250px]">
                        <input
                          className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-bold"
                          value={editState.truck_name}
                          onChange={(e) => handleChange('truck_name', e.target.value)}
                        />
                        <input
                          className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-500"
                          placeholder="Engine Type"
                          value={editState.engine_type || ''}
                          onChange={(e) => handleChange('engine_type', e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <p className="font-extrabold font-headline text-on-surface text-[15px]">{truck.truck_name}</p>
                        <p className="text-[12px] text-slate-400 font-medium">{truck.engine_type || 'Standard Engine'}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        className="w-24 px-2 py-1 text-xs border border-slate-200 rounded outline-none focus:border-blue-500 font-bold uppercase"
                        value={editState.plate_number || ''}
                        placeholder="ABC 123"
                        onChange={(e) => handleChange('plate_number', e.target.value)}
                      />
                    ) : (
                      <span className="font-bold text-xs text-slate-500 bg-slate-100 px-2 py-1.5 rounded">
                        {truck.plate_number?.toUpperCase() || 'N/A'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-600">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold">{truck.driver || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        className="px-2 py-1 text-xs border border-slate-200 rounded outline-none focus:border-blue-500 cursor-pointer"
                        value={editState.status || ''}
                        onChange={(e) => handleChange('status', e.target.value)}
                      >
                        <option value="In Motion">In Motion</option>
                        <option value="Assigned Trip">Assigned Trip</option>
                        <option value="Pending Trip Assignment">Pending Trip Assignment</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    ) : (
                      <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm ${getStatusStyles(truck.status)}`}>
                        {truck.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          className="w-16 px-2 py-1 text-xs border border-slate-200 rounded outline-none focus:border-blue-500 font-bold"
                          value={editState.fuel_efficiency}
                          onChange={(e) => handleChange('fuel_efficiency', parseFloat(e.target.value))}
                        />
                        <select
                          className="px-1 py-1 text-[10px] border border-slate-200 rounded outline-none focus:border-blue-500"
                          value={editState.metric_type}
                          onChange={(e) => handleChange('metric_type', e.target.value)}
                        >
                          <option value="km/L">km/L</option>
                          <option value="L/H">L/H</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-[15px] font-black text-slate-700">{truck.fuel_efficiency} <span className="text-xs text-slate-400 font-bold">{truck.metric_type}</span></span>

                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="p-1.5 cursor-pointer text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="p-1.5 cursor-pointer text-slate-400 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(truck)}
                          className="p-2 cursor-pointer text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95 group"
                          title="Edit Vehicle"
                        >
                          <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => setDeleteId(truck.id)}
                          className="p-2 cursor-pointer text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95 group"
                          title="Delete Vehicle"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone and will remove it from all future trip selections."
        confirmLabel="Delete Vehicle"
      />

      {ToastComponent}
    </div>
  );
};