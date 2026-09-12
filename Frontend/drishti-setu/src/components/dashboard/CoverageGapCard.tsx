import { CoverageData } from "@/types/scroll2";
import { ArrowUpRight, ArrowDownRight, Users, EyeOff, LayoutGrid } from "lucide-react";

export function CoverageGapCard({ data }: { data: CoverageData }) {
  return (
    <div className="bg-white dark:bg-[#0c162d] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Coverage / Gap Analysis</h2>
        <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">View Details</button>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <path className="text-slate-100 dark:text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="text-green-500" strokeDasharray={`${data.coveragePercentage}, 100`} strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-green-600 dark:text-green-400 leading-none">{data.coveragePercentage}%</span>
            <span className="text-[8px] text-slate-500 dark:text-slate-400 font-medium">Area Coverage</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Covered Areas</span>
              <span className="text-sm font-bold text-slate-800 dark:text-white">{data.coveragePercentage}%</span>
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-[10px] font-bold">
              <ArrowUpRight className="w-3 h-3" /> 4.3%
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Potential Gaps</span>
              <span className="text-sm font-bold text-slate-800 dark:text-white">{data.gapPercentage}%</span>
            </div>
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-[10px] font-bold">
              <ArrowDownRight className="w-3 h-3" /> 2.1%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700/60">
           <div className="flex items-center gap-1.5 mb-1 text-red-600 dark:text-red-400">
             <EyeOff className="w-3 h-3" />
             <span className="text-sm font-bold leading-none text-slate-800 dark:text-white">{data.priorityGaps}</span>
           </div>
           <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Priority Gaps</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700/60">
           <div className="flex items-center gap-1.5 mb-1 text-orange-600 dark:text-orange-400">
             <Users className="w-3 h-3" />
             <span className="text-sm font-bold leading-none text-slate-800 dark:text-white">{data.mediumPriority}</span>
           </div>
           <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Medium Priority</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700/60">
           <div className="flex items-center gap-1.5 mb-1 text-blue-600 dark:text-blue-400">
             <LayoutGrid className="w-3 h-3" />
             <span className="text-sm font-bold leading-none text-slate-800 dark:text-white">{data.lowPriority}</span>
           </div>
           <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Low Priority</span>
        </div>
      </div>

      <div className="mt-auto">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">Priority Zones Requiring Attention</span>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          {data.priorityZones.map((zone, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{zone.name}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                zone.priority === 'High' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50' :
                zone.priority === 'Medium' ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/50' :
                'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900/50'
              }`}>{zone.priority}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
