import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { UserTable, UserRecord } from '@/components/auth/view-users/UserTable';
import { UserTabs } from '@/components/auth/view-users/UserTabs';
import { useSession } from 'next-auth/react';
import { useUsers, queryKeys } from '@/hooks/queries';

export default function ViewUsersPage() {
    const { data: session } = useSession();
    const currentUserRole = (session?.user as any)?.role;
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<'admins' | 'requesting'>('admins');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Cached user directory (shared across remounts within the stale window)
    const usersQuery = useUsers();
    const users: UserRecord[] = (usersQuery.data as UserRecord[] | undefined) ?? [];
    const isLoading = usersQuery.isLoading;
    const error = usersQuery.error ? (usersQuery.error as Error).message : null;

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                             (user.role?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                             (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        
        if (activeTab === 'admins') {
            const role = user.role?.toLowerCase();
            return matchesSearch && (role === 'admin' || role === 'superadmin');
        } else {
            return matchesSearch && (user.role === null || user.role === '');
        }
    });

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const onRefresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.users() });

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto bg-slate-50/50 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-extrabold text-on-surface">
                        User Management
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Manage system access, roles, and monitor user activity across the platform.
                    </p>
                </div>
            </div>

            {/* Tabs Section */}
            <UserTabs activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setCurrentPage(1); }} />

            {/* Search and Table Section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-headline font-bold text-on-surface capitalize">
                        {activeTab === 'admins' ? 'Administrators' : 'Permission Requests'}
                    </h2>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by email, name or role..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <div className="p-4">
                    {isLoading ? (
                        <div className="text-center py-20 bg-slate-50/50 rounded-xl border border-slate-100">
                            <p className="text-slate-400 animate-pulse">Loading user directory...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                            </div>
                            <p className="text-slate-800 font-bold text-sm mb-1">Unable to load users</p>
                            <p className="text-slate-400 text-xs mb-5">{error}</p>
                            <button
                                onClick={onRefresh}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors tracking-wide uppercase cursor-pointer shadow-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : paginatedUsers.length > 0 ? (
                        <>
                            <div className="mb-4">
                                <UserTable 
                                    users={paginatedUsers} 
                                    onRefresh={onRefresh} 
                                    currentUserRole={currentUserRole}
                                />
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
                                <span className="text-xs text-slate-500 font-medium">
                                    Showing <span className="font-bold text-slate-700">{Math.min(((currentPage - 1) * itemsPerPage) + 1, filteredUsers.length)}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-bold text-slate-700">{filteredUsers.length}</span> users
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-xs font-bold text-slate-700 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage >= totalPages}
                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium">
                                {searchQuery ? "No users match your search." : "No users found in this category."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
