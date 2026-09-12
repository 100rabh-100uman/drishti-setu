import { MaintenanceSummary as MaintenanceSummaryType } from "@/types/scroll2";
import { ArrowDownRight, CheckCircle2, Clock, Wrench } from "lucide-react";

export function MaintenanceSummary({ data }: { data: MaintenanceSummaryType }) {
  return (
    <div className="bg-white dark:bg-[#0c162d] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Maintenance Summary</h2>
        <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">View Details</button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 flex-shrink-0 shadow-sm">
          <Wrench className="w-7 h-7" />
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">{data.underMaintenance}</span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">Under Maintenance</span>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mt-1">
            <ArrowDownRight className="w-3 h-3 text-green-500 dark:text-green-400" />
            <span className="text-[10px] font-bold">{data.trendPercentage}% <span className="text-slate-400 dark:text-slate-500 font-medium">vs last 7 days</span></span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center"><Wrench className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Open Requests</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-white">{data.openRequests}</span>
            <div className="w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Clock className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-white">{data.inProgress}</span>
            <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Resolved (Last 7 Days)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-white">{data.resolved}</span>
            <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-950/60 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
