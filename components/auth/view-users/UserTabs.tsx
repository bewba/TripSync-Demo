import React from 'react';
import { Users, ShieldCheck } from 'lucide-react';

interface UserTabsProps {
  activeTab: 'admins' | 'requesting';
  setActiveTab: (tab: 'admins' | 'requesting') => void;
}

export const UserTabs = ({ activeTab, setActiveTab }: UserTabsProps) => {
  return (
    <div className="flex p-1 bg-slate-100 rounded-xl w-full sm:w-fit mb-6">
      <button
        onClick={() => setActiveTab('admins')}
        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex-1 sm:flex-initial cursor-pointer ${
          activeTab === 'admins'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
        }`}
      >
        <ShieldCheck className={`w-4 h-4 ${activeTab === 'admins' ? 'text-blue-500' : 'text-slate-400'}`} />
        Admins
      </button>
      <button
        onClick={() => setActiveTab('requesting')}
        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex-1 sm:flex-initial cursor-pointer ${
          activeTab === 'requesting'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
        }`}
      >
        <Users className={`w-4 h-4 ${activeTab === 'requesting' ? 'text-blue-500' : 'text-slate-400'}`} />
        Requesting Permissions
      </button>
    </div>
  );
};
