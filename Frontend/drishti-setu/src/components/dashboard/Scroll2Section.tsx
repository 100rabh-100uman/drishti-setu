"use client";

import { useEffect, useState } from "react";
import { RecentActivity } from "./RecentActivity";
import { CoverageGapCard } from "./CoverageGapCard";
import { AgeingInfrastructure } from "./AgeingInfrastructure";
import { OnboardingStatus } from "./OnboardingStatus";
import { IntegrationReadiness } from "./IntegrationReadiness";
import { RegistryDataQuality } from "./RegistryDataQuality";
import { DepartmentCameraDistribution } from "./DepartmentCameraDistribution";
import { HealthMaintenanceTrend } from "./HealthMaintenanceTrend";
import { MaintenanceSummary } from "./MaintenanceSummary";
import { DashboardFooter } from "./DashboardFooter";
import { scroll2Service } from "@/services/scroll2.service";
import { mockScroll2Data } from "@/mock/dashboard-scroll2";
import { Scroll2Data } from "@/types/scroll2";

export function Scroll2Section({ initialData }: { initialData?: Scroll2Data } = {}) {
  const [data, setData] = useState<Scroll2Data>(initialData || mockScroll2Data);

  useEffect(() => {
    scroll2Service.getScroll2Data().then((res) => {
      if (res) setData(res);
    });
  }, []);

  return (
    <div className="mt-6 flex flex-col gap-6">
      
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RecentActivity items={data.activities} />
        <CoverageGapCard data={data.coverage} />
        <AgeingInfrastructure data={data.ageing} />
        <OnboardingStatus data={data.onboarding} />
      </div>

      {/* Row 2 (Full Width) */}
      <IntegrationReadiness data={data.integrations} />

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RegistryDataQuality data={data.registryQuality} />
        <DepartmentCameraDistribution data={data.departments} />
        <HealthMaintenanceTrend data={data.healthTrend} />
        <MaintenanceSummary data={data.maintenance} />
      </div>

      {/* Footer */}
      <DashboardFooter />

    </div>
  );
}

