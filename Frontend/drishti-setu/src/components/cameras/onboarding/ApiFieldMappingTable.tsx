"use client";

import { FieldMappingItem, DrishtiCameraField } from "@/types/api-onboarding";
import { DRISHTI_TARGET_FIELDS } from "@/mock/api-onboarding";
import { ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiFieldMappingTableProps {
  mappings: FieldMappingItem[];
  onUpdateMapping: (externalField: string, drishtiField: DrishtiCameraField | '') => void;
}

export function ApiFieldMappingTable({ mappings, onUpdateMapping }: ApiFieldMappingTableProps) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto max-h-[460px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="py-3.5 px-4">External Source Field</th>
              <th className="py-3.5 px-4">Sample Value</th>
              <th className="py-3.5 px-2 text-center w-8"></th>
              <th className="py-3.5 px-4">DRISHTI SETU Field</th>
              <th className="py-3.5 px-4">Requirement</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {mappings.map((row) => {
              const isMapped = Boolean(row.drishti_field);

              return (
                <tr key={row.external_field} className="hover:bg-slate-50/70 transition-colors">
                  {/* External Field Name */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {row.external_field}
                  </td>

                  {/* Sample Value */}
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[160px] inline-block">
                      {row.sample_value || "—"}
                    </span>
                  </td>

                  {/* Mapping Arrow */}
                  <td className="py-3 px-2 text-center">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 mx-auto" />
                  </td>

                  {/* DRISHTI SETU Target Field Dropdown */}
                  <td className="py-3 px-4 min-w-[220px]">
                    <select
                      value={row.drishti_field}
                      onChange={(e) =>
                        onUpdateMapping(row.external_field, e.target.value as DrishtiCameraField | "")
                      }
                      className={cn(
                        "w-full px-3 py-1.5 text-xs rounded-lg border outline-none font-medium transition-all",
                        isMapped
                          ? "bg-blue-50/40 border-blue-200 text-blue-900 focus:border-blue-500"
                          : "bg-white border-amber-300 text-amber-900 focus:border-amber-500"
                      )}
                    >
                      <option value="">-- Unmapped / Ignore Field --</option>
                      {DRISHTI_TARGET_FIELDS.map((target) => (
                        <option key={target.value} value={target.value}>
                          {target.label} {target.required ? "*" : ""}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Required / Optional Tag */}
                  <td className="py-3 px-4">
                    {row.required ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                        Optional
                      </span>
                    )}
                  </td>

                  {/* Mapping Status */}
                  <td className="py-3 px-4">
                    {isMapped ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mapped
                      </span>
                    ) : row.required ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                        <AlertTriangle className="w-3.5 h-3.5" /> Missing
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Ignored</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
