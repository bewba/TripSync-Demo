import { Route as RouteIcon, Truck, History, Warehouse, User, Users, MapPin, X, BarChart2, Navigation } from 'lucide-react';
import { useRouter } from 'next/router';
import { SidebarItem } from './components/SidebarItem';
import { SignOutButton } from './components/Signout';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const router = useRouter();

  const navItems = [
    { path: '/auth/active-drivers', label: 'Active Drivers', icon: Navigation },
    { path: '/auth/plan-trip', label: 'Plan Trip', icon: RouteIcon },
    { path: '/auth/analytics', label: 'Analytics', icon: BarChart2 },
    { path: '/auth/locations', label: 'Locations', icon: MapPin },
    { path: '/auth/trip-history', label: 'Trip History', icon: History },
    { path: '/auth/add-vehicle', label: 'Add Vehicle', icon: Truck },
    { path: '/auth/view-vehicles', label: 'View Vehicles', icon: Warehouse },
    { path: '/auth/view-drivers', label: 'View Drivers', icon: User },
    { path: '/auth/view-users', label: 'View Users', icon: Users }
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 w-64 bg-slate-100 flex flex-col py-6 gap-y-2 z-50 border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with close button on mobile */}
        <div className="flex items-center justify-between px-6 mb-4 lg:hidden">
          <span className="font-heading font-bold text-lg text-emerald-800">Fleet Manager</span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-y-1">
          {navItems.map((item) => (
            <SidebarItem
              key={item.path}
              label={item.label}
              icon={item.icon}
              isActive={router.pathname.includes(item.path)}
              onClick={() => {
                router.push(item.path);
                onClose();
              }}
            />
          ))}
        </nav>

        <SignOutButton />
      </aside>
    </>
  );
};