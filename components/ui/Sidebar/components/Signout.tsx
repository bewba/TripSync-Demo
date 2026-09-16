import React from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from "next-auth/react";

export const SignOutButton = () => {


    return (
        <div className="mt-auto px-2 flex flex-col gap-y-1">
            <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-slate-500 mx-2 px-4 py-3 hover:bg-slate-200 rounded-full flex items-center gap-3 transition-all outline-none"
            >
                <LogOut className="w-5 h-5 text-slate-400" />
                <span className="font-body text-sm font-medium tracking-wide">Sign Out</span>
            </button>
        </div>
    );
};