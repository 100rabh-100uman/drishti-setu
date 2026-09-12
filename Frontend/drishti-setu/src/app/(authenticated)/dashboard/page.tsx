"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardKpiGrid } from "@/components/dashboard/DashboardKpiGrid";
import { GisCoverageCard } from "@/components/dashboard/GisCoverageCard";
import { AttentionRequired } from "@/components/dashboard/AttentionRequired";
import { Scroll2Section } from "@/components/dashboard/Scroll2Section";
import IncidentCorner from "@/components/dashboard/IncidentCorner";
import { dashboardService } from "@/services/dashboard.service";
import { mockDashboardData } from "@/mock/dashboard";
import { DashboardData } from "@/types/dashboard";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(mockDashboardData);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLiveSummary = useCallback(async () => {
    try {
      const data = await dashboardService.getDashboardSummary();
      if (data && data.kpi) {
        setDashboardData(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveSummary();
    const interval = setInterval(fetchLiveSummary, 10000); // 10s live pulse
    return () => clearInterval(interval);
  }, [fetchLiveSummary]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto pb-20">
      <DashboardHeader />
      
      <DashboardKpiGrid data={dashboardData.kpi} />
      
      {/* Primary Operational Section with Right-Side Incident Corner ("Need Corner") */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
        {/* Left 8 Cols: GIS Map & Attention Required Grid */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <GisCoverageCard className="col-span-1 lg:col-span-3" />
            <AttentionRequired items={dashboardData.attentionItems} actions={dashboardData.quickActions} />
          </div>
        </div>

        {/* Right 4 Cols: Need Corner / Incident Activity Sidebar */}
        <div className="xl:col-span-4">
          <IncidentCorner className="w-full" maxHeight="h-[620px]" />
        </div>
      </div>

      {/* CONTINUATION: SCROLL 2 - Investigation & Operations */}
      <Scroll2Section />

    </div>
  );
}

