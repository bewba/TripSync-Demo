import React, { useState } from 'react';
import { Edit2, Check, X, Trash2, Mail, Shield, User as UserIcon } from 'lucide-react';
import { useToast } from '@/components/ui/Toast/Toast';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal/ConfirmationModal';
import { useDeleteUserMutation, useUpdateUserRoleMutation } from '@/hooks/mutations';

export interface UserRecord {
  id: string;
  email: string;
  name?: string;
  role: 'Admin' | 'Superadmin' | null | '';
  lastLogin?: string;
}

interface UserTableProps {
  users: UserRecord[];
  onRefresh: () => void;
  currentUserRole?: string;
}

export const UserTable = ({ users, onRefresh, currentUserRole }: UserTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<Partial<UserRecord>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Deletion State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast, ToastComponent } = useToast();
  const updateUserRoleMutation = useUpdateUserRoleMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const isSuperAdmin = currentUserRole?.toLowerCase() === 'superadmin';

  console.log(currentUserRole)

  const handleEdit = (user: UserRecord) => {
    if (!isSuperAdmin) {
      showToast("Only Superadmins can edit roles", 'error');
      return;
    }
    setEditingId(user.id);
    setEditState({ ...user });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditState({});
  };

  const handleChange = (field: keyof UserRecord, value: any) => {
    setEditState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await updateUserRoleMutation.mutateAsync({ id: editingId, role: editState.role as string | null });

      showToast("User role updated successfully", 'success');
      setEditingId(null);
    } catch (error: any) {
      showToast(error.message || "Failed to update user", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteUserMutation.mutateAsync(deleteId);

      showToast("User access removed successfully", 'success');
      setDeleteId(null);
    } catch (error: any) {
      showToast(error.message || "Failed to remove user", 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-left bg-slate-50/50">
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">User Details</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => {
              const isEditing = editingId === user.id;

              return (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold font-headline text-on-surface">{user.email}</p>
                        {user.name && <p className="text-[11px] text-slate-400 font-medium">{user.name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {isEditing ? (
                      <select
                        className="px-2 py-1 text-xs border border-slate-200 rounded outline-none focus:border-blue-500 cursor-pointer font-bold"
                        value={editState.role || ''}
                        onChange={(e) => handleChange('role', e.target.value || null)}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Superadmin">Superadmin</option>
                        <option value="">None (Requesting)</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className={`w-3.5 h-3.5 ${user.role ? 'text-blue-500' : 'text-slate-300'}`} />
                        <span className={`text-sm font-bold ${user.role ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                          {user.role || 'Requesting Access'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
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
                          onClick={() => handleEdit(user)}
                          className={`p-2 rounded-lg transition-all active:scale-95 group ${isSuperAdmin
                            ? 'cursor-pointer text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                            : 'cursor-not-allowed text-slate-200'
                            }`}
                          title={isSuperAdmin ? "Edit Role" : "Only Superadmins can edit roles"}
                          disabled={!isSuperAdmin}
                        >
                          <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => {
                            if (!isSuperAdmin) {
                              showToast("Only Superadmins can revoke access", 'error');
                              return;
                            }
                            setDeleteId(user.id);
                          }}
                          className={`p-2 rounded-lg transition-all active:scale-95 group ${isSuperAdmin
                            ? 'cursor-pointer text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'cursor-not-allowed text-slate-200'
                            }`}
                          title={isSuperAdmin ? "Remove User" : "Only Superadmins can revoke access"}
                          disabled={!isSuperAdmin}
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
        title="Remove User Access"
        message="Are you sure you want to permanently delete this user? This will remove their record from both the Users and Accounts tables."
        confirmLabel="Permanently Delete"
      />

      {ToastComponent}
    </div>
  );
};
