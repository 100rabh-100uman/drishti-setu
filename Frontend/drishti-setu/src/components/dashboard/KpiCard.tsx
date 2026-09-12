import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: number;
  trendSubtitle?: string;
  iconBgColor: string;
  iconColor: string;
  icon: React.ReactNode;
  lineColorClass?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendSubtitle,
  iconBgColor,
  iconColor,
  icon,
  lineColorClass = "bg-slate-200"
}: KpiCardProps) {
  const isPositiveTrend = trend !== undefined && trend > 0;
  const isNegativeTrend = trend !== undefined && trend < 0;

  return (
    <div className="bg-white dark:bg-[#0c162d] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconBgColor)}>
            {icon}
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">{title}</h3>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{value.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mt-auto pt-1">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{subtitle}</span>
        
        {trend !== undefined && (
          <div className="flex flex-col items-end">
            <div className={cn(
              "flex items-center gap-0.5 text-[11px] font-bold",
              isPositiveTrend ? "text-green-600 dark:text-green-400" : isNegativeTrend ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
            )}>
              {isPositiveTrend ? <ArrowUpRight className="w-3 h-3" /> : isNegativeTrend ? <ArrowDownRight className="w-3 h-3" /> : null}
              {Math.abs(trend)}%
            </div>
            {trendSubtitle && (
              <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{trendSubtitle}</span>
            )}
          </div>
        )}
      </div>

      {/* Subtle decorative bottom line like in the reference */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50 dark:bg-slate-800">
         {/* Using a pseudo-svg or just a simple colored border for the "line chart" look at the bottom */}
         <div className={cn("h-full w-full opacity-30", lineColorClass)}></div>
      </div>
    </div>
  );
}
