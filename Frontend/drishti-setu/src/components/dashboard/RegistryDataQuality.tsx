import { RegistryQuality } from "@/types/scroll2";
import { CheckCircle2, Copy, FileWarning, XCircle } from "lucide-react";

export function RegistryDataQuality({ data }: { data: RegistryQuality }) {
  return (
    <div className="bg-white dark:bg-[#0c162d] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Registry Data Quality</h2>
        <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">View Details</button>
      </div>

      <div className="flex flex-col gap-6">
        
        <div className="flex justify-center relative h-32">
          {/* SVG Donut */}
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path className="text-slate-100 dark:text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-green-500" strokeDasharray={`${data.overallScore}, 100`} strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{data.overallScore}%</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-1">Overall Quality Score</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Valid Records</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-white">{data.validRecords}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Duplicate Records</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-white">{data.duplicateRecords}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Incomplete Records</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-white">{data.incompleteRecords}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Invalid Records</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-white">{data.invalidRecords}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
