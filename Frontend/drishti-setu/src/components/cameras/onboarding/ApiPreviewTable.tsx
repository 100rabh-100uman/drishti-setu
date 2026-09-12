"use client";

import { PreviewCameraRecord } from "@/types/api-onboarding";

interface ApiPreviewTableProps {
  records: PreviewCameraRecord[];
}

export function ApiPreviewTable({ records }: ApiPreviewTableProps) {
  if (records.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No preview records available yet. Run connection test.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4">Camera ID</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Camera Type</th>
              <th className="py-3 px-4">Address</th>
              <th className="py-3 px-4">Coordinates</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
            {records.map((rec) => (
              <tr key={rec.camera_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{rec.camera_id}</td>
                <td className="py-3 px-4">{rec.department}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {rec.camera_type}
                  </span>
                </td>
                <td className="py-3 px-4 max-w-xs truncate" title={rec.address}>
                  {rec.address}
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {rec.latitude.toFixed(4)}, {rec.longitude.toFixed(4)}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {rec.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
