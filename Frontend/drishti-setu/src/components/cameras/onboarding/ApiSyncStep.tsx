"use client";

import { ApiConnectionConfig, FieldMappingItem, ApiSyncResultData } from "@/types/api-onboarding";
import { ApiSyncResult } from "./ApiSyncResult";
import { RefreshCw, Play, CheckCircle2, Layers, Building2, Globe } from "lucide-react";

interface ApiSyncStepProps {
  connection: ApiConnectionConfig;
  mappings: FieldMappingItem[];
  isSyncing: boolean;
  syncProgress: number;
  syncStepText: string;
  syncResult: ApiSyncResultData | null;
  onStartSync: () => void;
  onReset: () => void;
}

export function ApiSyncStep({
  connection,
  mappings,
  isSyncing,
  syncProgress,
  syncStepText,
  syncResult,
  onStartSync,
  onReset,
}: ApiSyncStepProps) {
  if (syncResult) {
    return <ApiSyncResult result={syncResult} onReset={onReset} />;
  }

  const mappedCount = mappings.filter((m) => Boolean(m.drishti_field)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-[#0a1b3f]">Pre-Sync Final Review</h3>
        <p className="text-xs text-slate-500">
          Verify configuration parameters and initiate automated onboarding synchronization
        </p>
      </div>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold mb-1">
            <Building2 className="w-3.5 h-3.5" /> Department Source
          </div>
          <div className="text-sm font-bold text-slate-800">{connection.department}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{connection.integration_name}</div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold mb-1">
            <Globe className="w-3.5 h-3.5" /> Remote Resource
          </div>
          <div className="text-sm font-bold font-mono text-blue-600">/{connection.api_version}/{connection.endpoint}</div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">{connection.base_url}</div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold mb-1">
            <Layers className="w-3.5 h-3.5" /> Schema Mapping
          </div>
          <div className="text-sm font-bold text-emerald-600">{mappedCount} Fields Mapped</div>
          <div className="text-[11px] text-slate-500 mt-0.5">DRISHTI SETU v1 standard</div>
        </div>
      </div>

      {/* Sync Parameters Details List */}
      <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200 space-y-3 text-xs">
        <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
          <span className="text-slate-500 font-medium">Estimated Records to Fetch</span>
          <span className="font-bold text-slate-800">482 Camera Units</span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
          <span className="text-slate-500 font-medium">Geo-boundary Enforcement</span>
          <span className="font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Gujarat State Boundary Filter Active
          </span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
          <span className="text-slate-500 font-medium">Duplicate Resolution Policy</span>
          <span className="font-bold text-slate-800">Skip Duplicates & Log Audit</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-slate-500 font-medium">Backend Integration Hook</span>
          <span className="font-mono text-slate-600 font-semibold">POST /api/v1/integrations/sync</span>
        </div>
      </div>

      {/* Animated Sync Progress Bar */}
      {isSyncing && (
        <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-blue-950 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              {syncStepText}
            </span>
            <span className="font-mono font-bold text-blue-700">{syncProgress}%</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Execution Trigger Bar */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Ready to establish synchronization pipeline with <strong className="text-slate-800 font-bold">{connection.integration_name}</strong>.
        </div>

        <button
          type="button"
          onClick={onStartSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-8 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.98] rounded-xl shadow-md shadow-blue-500/25 transition-all disabled:opacity-70"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executing Sync...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Start Sync</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
