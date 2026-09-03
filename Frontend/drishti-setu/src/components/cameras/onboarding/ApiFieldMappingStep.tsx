"use client";

import { FieldMappingItem, DrishtiCameraField } from "@/types/api-onboarding";
import { ApiFieldMappingTable } from "./ApiFieldMappingTable";
import { Sparkles, Layers, AlertTriangle, Info } from "lucide-react";

interface ApiFieldMappingStepProps {
  mappings: FieldMappingItem[];
  onUpdateMapping: (externalField: string, drishtiField: DrishtiCameraField | '') => void;
  onAutoMap: () => void;
}

export function ApiFieldMappingStep({ mappings, onUpdateMapping, onAutoMap }: ApiFieldMappingStepProps) {
  const mappedCount = mappings.filter((m) => Boolean(m.drishti_field)).length;
  const unmappedRequiredCount = mappings.filter((m) => m.required && !m.drishti_field).length;

  return (
    <div className="space-y-6">
      {/* Header with Auto-map button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0a1b3f]">Schema Field Mapping</h3>
            <p className="text-xs text-slate-500">
              Map remote API attributes to official DRISHTI SETU surveillance registry properties
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAutoMap}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Auto-Map Obvious Matches
          </button>
        </div>
      </div>

      {/* Info Callout */}
      <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-800">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold">Human-Readable Entity Mapping: </span>
          Operators do not need raw database foreign keys. Department and Zone names are mapped directly to administrative entities, and geographic coordinates are validated automatically.
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Mapped Fields: <strong className="text-slate-900 font-bold">{mappedCount}</strong> of {mappings.length}
          </span>
          {unmappedRequiredCount > 0 && (
            <span className="flex items-center gap-1.5 text-red-600 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Missing Required: {unmappedRequiredCount}
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-500">
          Target Schema: <code className="font-mono text-blue-600">DRISHTI_SETU_V1_SPEC</code>
        </span>
      </div>

      {/* Mapping Table */}
      <ApiFieldMappingTable mappings={mappings} onUpdateMapping={onUpdateMapping} />
    </div>
  );
}
