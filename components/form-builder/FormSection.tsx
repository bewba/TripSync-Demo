import React from 'react';

// ─── FormSection ──────────────────────────────

interface FormSectionProps {
  icon?: React.ReactNode;        // lucide icon or any node
  title: string;
  badge?: string;                // e.g. "optional"
  children: React.ReactNode;
}

/**
 * Wraps a group of fields under a titled, icon-labeled section header.
 * Mirrors the visual weight of the existing card container in PlanTripPage.
 */
export const FormSection = ({
  icon,
  title,
  badge,
  children,
}: FormSectionProps) => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
      {icon && (
        <span className="w-7 h-7 rounded-md bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary flex-shrink-0">
          {icon}
        </span>
      )}
      <span className="text-sm font-bold text-on-surface tracking-wide uppercase font-headline">
        {title}
      </span>
      {badge && (
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant border border-slate-200 rounded px-2 py-0.5">
          {badge}
        </span>
      )}
    </div>

    {/* Fields */}
    {children}
  </div>
);

// ─── FormGrid ─────────────────────────────────

type GridCols = 1 | 2 | 3;

interface FormGridProps {
  cols?: GridCols;
  children: React.ReactNode;
}

const colsMap: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
};

/**
 * Responsive grid wrapper for form fields.
 * Snaps to single column on mobile automatically.
 */
export const FormGrid = ({ cols = 2, children }: FormGridProps) => (
  <div className={`grid gap-4 ${colsMap[cols]}`}>{children}</div>
);

// ─── FormDivider ──────────────────────────────

/** Thin horizontal rule between sections. */
export const FormDivider = () => (
  <hr className="border-t border-slate-100" />
);