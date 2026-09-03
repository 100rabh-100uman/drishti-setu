import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardKpiGrid } from "@/components/dashboard/DashboardKpiGrid";
import { GisCoverageCard } from "@/components/dashboard/GisCoverageCard";
import { AttentionRequired } from "@/components/dashboard/AttentionRequired";
import { Scroll2Section } from "@/components/dashboard/Scroll2Section";
import { dashboardService } from "@/services/dashboard.service";

export default async function DashboardPage() {
  // Fetch summary data server-side
  const dashboardData = await dashboardService.getDashboardSummary();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto pb-20">
      <DashboardHeader />
      
      <DashboardKpiGrid data={dashboardData.kpi} />
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <GisCoverageCard />
        <AttentionRequired items={dashboardData.attentionItems} actions={dashboardData.quickActions} />
      </div>

      {/* CONTINUATION: SCROLL 2 - Investigation & Operations */}
      <Scroll2Section />

    </div>
  );
}
