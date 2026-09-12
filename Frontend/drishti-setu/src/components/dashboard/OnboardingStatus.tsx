import { OnboardingData } from "@/types/scroll2";
import { ArrowRight, FileText, UploadCloud, RefreshCw, AlertCircle, XCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function OnboardingStatus({ data }: { data: OnboardingData }) {
  return (
    <div className="bg-white dark:bg-[#0c162d] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Onboarding Status</h2>
        <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">View All</button>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-20 overflow-hidden flex justify-center">
          {/* Half donut chart */}
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-180">
              <path className="text-slate-100 dark:text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" strokeDasharray="50, 100" />
              <path className="text-green-500" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" strokeDasharray={`${data.percentageOnboarded / 2}, 100`} />
            </svg>
            <div className="absolute top-10 left-0 right-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800 dark:text-white">{data.percentageOnboarded}%</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Data Onboarded</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center"><FileText className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Manual Requests</span>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-white">{data.manualRequests}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center"><UploadCloud className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Bulk Imports</span>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-white">{data.bulkImports}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-50 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400 flex items-center justify-center"><RefreshCw className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">API / System Sync</span>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-white">{data.apiSystemSync}</span>
        </div>

        <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-1"></div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center"><AlertCircle className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Needs Review</span>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-white">{data.needsReview}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center"><XCircle className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Failed Records</span>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-white">{data.failedRecords}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Completed</span>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-white">{data.completed}</span>
        </div>

      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Link href="/cameras/history" className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
          View Import History <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

    </div>
  );
}
