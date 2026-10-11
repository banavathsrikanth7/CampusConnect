import React from 'react';

interface Props {
  categoryCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  total: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Electrical: '#f59e0b', // amber-500
  Plumbing: '#06b6d4', // cyan-500
  Hostel: '#6366f1', // indigo-500
  Cleaning: '#10b981', // emerald-500
  Internet: '#3b82f6', // blue-500
  Security: '#ef4444', // red-500
  'Lost and Found': '#8b5cf6', // violet-500
  Academic: '#14b8a6', // teal-500
  Transport: '#0284c7', // sky-600
  Other: '#64748b', // slate-500
};

export const CategoryChart: React.FC<Props> = ({ categoryCounts, priorityCounts, total }) => {
  const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Complaint Categories Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time distribution from campus database</p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {total} Total Tickets
        </span>
      </div>

      {total === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">No complaints registered yet.</div>
      ) : (
        <>
          {/* Multi-segment stacked bar */}
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 my-4 shadow-inner">
            {categories.map(([cat, count]) => {
              const pct = (count / total) * 100;
              const color = CATEGORY_COLORS[cat] || '#94a3b8';
              return (
                <div
                  key={cat}
                  style={{ width: `${pct}%`, backgroundColor: color }}
                  className="h-full transition-all duration-300 relative group"
                  title={`${cat}: ${count} (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>

          {/* Category detail list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            {categories.map(([cat, count]) => {
              const pct = Math.round((count / total) * 100);
              const color = CATEGORY_COLORS[cat] || '#94a3b8';

              return (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-slate-700 truncate">{cat}</span>
                  </div>
                  <span className="font-semibold text-slate-900 ml-2">
                    {count} <span className="text-slate-400 text-[10px]">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Priority distribution */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Priority Distribution:</h4>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                Critical: <strong>{priorityCounts['Critical'] || 0}</strong>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                High: <strong>{priorityCounts['High'] || 0}</strong>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                Medium: <strong>{priorityCounts['Medium'] || 0}</strong>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                Low: <strong>{priorityCounts['Low'] || 0}</strong>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
