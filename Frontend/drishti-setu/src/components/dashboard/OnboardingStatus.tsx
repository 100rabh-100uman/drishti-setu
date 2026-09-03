import { OnboardingData } from "@/types/scroll2";
import { ArrowRight, FileText, UploadCloud, RefreshCw, AlertCircle, XCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function OnboardingStatus({ data }: { data: OnboardingData }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-slate-800">Onboarding Status</h2>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">View All</button>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-20 overflow-hidden flex justify-center">
          {/* Half donut chart */}
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-180">
              <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" strokeDasharray="50, 100" />
              <path className="text-green-500" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" strokeDasharray={`${data.percentageOnboarded / 2}, 100`} />
            </svg>
            <div className="absolute top-10 left-0 right-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800">{data.percentageOnboarded}%</span>
              <span className="text-[9px] text-slate-500 font-medium">Data Onboarded</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center"><FileText className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700">Manual Requests</span>
          </div>
          <span className="text-xs font-bold text-slate-800">{data.manualRequests}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-50 text-green-600 flex items-center justify-center"><UploadCloud className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700">Bulk Imports</span>
          </div>
          <span className="text-xs font-bold text-slate-800">{data.bulkImports}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-50 text-yellow-600 flex items-center justify-center"><RefreshCw className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700">API / System Sync</span>
          </div>
          <span className="text-xs font-bold text-slate-800">{data.apiSystemSync}</span>
        </div>

        <div className="w-full h-px bg-slate-100 my-1"></div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-orange-50 text-orange-600 flex items-center justify-center"><AlertCircle className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700">Needs Review</span>
          </div>
          <span className="text-xs font-bold text-slate-800">{data.needsReview}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-50 text-red-600 flex items-center justify-center"><XCircle className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700">Failed Records</span>
          </div>
          <span className="text-xs font-bold text-slate-800">{data.failedRecords}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700">Completed</span>
          </div>
          <span className="text-xs font-bold text-slate-800">{data.completed}</span>
        </div>

      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <Link href="/onboarding/history" className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800">
          View Import History <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

    </div>
  );
}
