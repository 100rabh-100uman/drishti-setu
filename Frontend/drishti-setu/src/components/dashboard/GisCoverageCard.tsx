"use client";

import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

// Dynamically load Leaflet MapDashboard client-side only (disables SSR window issues)
const MapDashboard = dynamic(() => import("@/components/MapDashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-[560px] bg-slate-50 dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6">
      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center animate-spin mb-3 shadow-sm border border-blue-100 dark:border-blue-900/60">
        <RefreshCw className="w-5 h-5" />
      </div>
      <p className="text-xs font-bold text-slate-800 dark:text-white tracking-wide uppercase">Initializing Gujarat Police Leaflet GIS</p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Connecting to Supabase PostGIS geometry network...</p>
    </div>
  ),
});

export function GisCoverageCard({ className }: { className?: string } = {}) {
  return (
    <div className={className || "col-span-1 lg:col-span-3"}>
      <MapDashboard className="h-[620px]" />
    </div>
  );
}

export default GisCoverageCard;
