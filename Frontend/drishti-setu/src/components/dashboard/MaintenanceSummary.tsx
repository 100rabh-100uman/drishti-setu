import { MaintenanceSummary as MaintenanceSummaryType } from "@/types/scroll2";
import { ArrowDownRight, CheckCircle2, Clock, Wrench } from "lucide-react";

export function MaintenanceSummary({ data }: { data: MaintenanceSummaryType }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-bold text-slate-800">Maintenance Summary</h2>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">View Details</button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0 shadow-sm">
          <Wrench className="w-7 h-7" />
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-black text-slate-800 leading-none">{data.underMaintenance}</span>
          <span className="text-xs font-bold text-slate-600 mt-1">Under Maintenance</span>
          <div className="flex items-center gap-1 text-green-600 mt-1">
            <ArrowDownRight className="w-3 h-3 text-green-500" />
            <span className="text-[10px] font-bold">{data.trendPercentage}% <span className="text-slate-400 font-medium">vs last 7 days</span></span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center"><Wrench className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700">Open Requests</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">{data.openRequests}</span>
            <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center"><Clock className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">{data.inProgress}</span>
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div>
            <span className="text-[11px] font-semibold text-slate-700">Resolved (Last 7 Days)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">{data.resolved}</span>
            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
