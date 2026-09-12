import { Video, ShieldCheck, AlertCircle, Wrench, FileWarning } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { KpiSummary } from "@/types/dashboard";

interface DashboardKpiGridProps {
  data: KpiSummary;
}

export function DashboardKpiGrid({ data }: DashboardKpiGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      
      <KpiCard
        title="Total Cameras"
        value={data.totalCameras}
        subtitle="All Locations"
        trend={data.totalCamerasTrend}
        trendSubtitle="vs last 7 days"
        iconBgColor="bg-blue-50 dark:bg-blue-950/60"
        iconColor="text-blue-600 dark:text-blue-400"
        lineColorClass="bg-blue-200 dark:bg-blue-800"
        icon={<Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      />

      <KpiCard
        title="Online Cameras"
        value={data.onlineCameras}
        subtitle="Operational"
        trend={data.onlineCamerasTrend}
        trendSubtitle="of total"
        iconBgColor="bg-green-50 dark:bg-green-950/60"
        iconColor="text-green-600 dark:text-green-400"
        lineColorClass="bg-green-300 dark:bg-green-800"
        icon={<div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>}
      />

      <KpiCard
        title="Offline Cameras"
        value={data.offlineCameras}
        subtitle="Attention Required"
        trend={data.offlineCamerasTrend}
        trendSubtitle={`${data.offlineCamerasPercentage}% of total`}
        iconBgColor="bg-red-50 dark:bg-red-950/60"
        iconColor="text-red-600 dark:text-red-400"
        lineColorClass="bg-red-300 dark:bg-red-800"
        icon={<div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>}
      />

      <KpiCard
        title="Under Maintenance"
        value={data.underMaintenance}
        subtitle="In Progress"
        trend={data.underMaintenanceTrend}
        trendSubtitle={`${data.underMaintenancePercentage}% of total`}
        iconBgColor="bg-amber-50 dark:bg-amber-950/60"
        iconColor="text-amber-600 dark:text-amber-400"
        lineColorClass="bg-amber-300 dark:bg-amber-800"
        icon={<Wrench className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
      />

      <KpiCard
        title="Needs Review"
        value={data.needsReview}
        subtitle="Data Validation"
        trend={data.needsReviewTrend}
        trendSubtitle={`${data.needsReviewPercentage}% of total`}
        iconBgColor="bg-purple-50 dark:bg-purple-950/60"
        iconColor="text-purple-600 dark:text-purple-400"
        lineColorClass="bg-purple-300 dark:bg-purple-800"
        icon={<ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
      />

    </div>
  );
}
