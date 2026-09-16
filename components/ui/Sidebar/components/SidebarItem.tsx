import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
    label: string;
    icon: LucideIcon;
    isActive: boolean;
    onClick: () => void;
}

export const SidebarItem = ({ label, icon: Icon, isActive, onClick }: SidebarItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "mx-2 px-4 py-3 rounded-full flex items-center gap-3 transition-all duration-300 group outline-none cursor-pointer",
                isActive
                    ? "bg-emerald-100/50 text-emerald-800 font-semibold"
                    : "text-slate-500 hover:bg-slate-200 focus-visible:bg-slate-200"
            )}
        >
            <Icon
                className={cn(
                    "w-5 h-5",
                    isActive ? "text-emerald-800" : "text-slate-400 group-hover:text-slate-600"
                )}
            />
            <span className="font-body text-sm font-medium tracking-wide">
                {label}
            </span>
        </button>
    );
};