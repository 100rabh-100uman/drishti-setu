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
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        lineColorClass="bg-blue-200"
        icon={<Video className="w-5 h-5 text-blue-600" />}
      />

      <KpiCard
        title="Online Cameras"
        value={data.onlineCameras}
        subtitle="Operational"
        trend={data.onlineCamerasTrend}
        trendSubtitle="of total"
        iconBgColor="bg-green-50"
        iconColor="text-green-600"
        lineColorClass="bg-green-300"
        icon={<div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>}
      />

      <KpiCard
        title="Offline Cameras"
        value={data.offlineCameras}
        subtitle="Attention Required"
        trend={data.offlineCamerasTrend}
        trendSubtitle={`${data.offlineCamerasPercentage}% of total`}
        iconBgColor="bg-red-50"
        iconColor="text-red-600"
        lineColorClass="bg-red-300"
        icon={<div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>}
      />

      <KpiCard
        title="Under Maintenance"
        value={data.underMaintenance}
        subtitle="In Progress"
        trend={data.underMaintenanceTrend}
        trendSubtitle={`${data.underMaintenancePercentage}% of total`}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
        lineColorClass="bg-amber-300"
        icon={<Wrench className="w-5 h-5 text-amber-500" />}
      />

      <KpiCard
        title="Needs Review"
        value={data.needsReview}
        subtitle="Data Validation"
        trend={data.needsReviewTrend}
        trendSubtitle={`${data.needsReviewPercentage}% of total`}
        iconBgColor="bg-purple-50"
        iconColor="text-purple-600"
        lineColorClass="bg-purple-300"
        icon={<ShieldCheck className="w-5 h-5 text-purple-600" />}
      />

    </div>
  );
}
