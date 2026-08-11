// ==========================================
// StatCard — Statistics display card
// ==========================================

import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  value: string | number;
  unit?: string;
  color?: string;
}

export default function StatCard({ icon, title, subtitle, value, unit, color = 'var(--color-primary-500)' }: StatCardProps) {
  return (
    <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 p-4 hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider truncate">{subtitle}</p>
          <p className="text-sm font-semibold text-slate-600 mt-0.5 truncate">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold" style={{ color }}>{value}</span>
            {unit && <span className="text-sm text-slate-400 font-medium">{unit}</span>}
          </div>
        </div>
        <div
          className="shrink-0 p-2.5 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
