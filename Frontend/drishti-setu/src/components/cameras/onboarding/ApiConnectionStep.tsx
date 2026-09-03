"use client";

import { ApiConnectionConfig } from "@/types/api-onboarding";
import { Department } from "@/types/camera";
import { Plug, Building2, Globe, Hash, Info, Layers } from "lucide-react";

interface ApiConnectionStepProps {
  config: ApiConnectionConfig;
  onChange: (updated: Partial<ApiConnectionConfig>) => void;
  errors: Record<string, string>;
  departments: Department[];
}

export function ApiConnectionStep({ config, onChange, errors, departments }: ApiConnectionStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Plug className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#0a1b3f]">Connection Parameters</h3>
          <p className="text-xs text-slate-500">Configure remote endpoint and organizational jurisdiction</p>
        </div>
      </div>

      {/* Demo Values Alert */}
      <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-800">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold">Prototype Integration Mode: </span>
          Pre-filled values represent demo endpoints. No live external government connections are established without backend authentication.
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Integration Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0a1b3f] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Integration Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Ahmedabad Traffic CCTV"
            value={config.integration_name}
            onChange={(e) => onChange({ integration_name: e.target.value })}
            className={`w-full px-4 py-2.5 text-xs bg-white border ${
              errors.integration_name ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
            } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-800`}
          />
          {errors.integration_name && <p className="text-[11px] text-red-500">{errors.integration_name}</p>}
        </div>

        {/* Source / Department Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0a1b3f] uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Source / Department <span className="text-red-500">*</span>
          </label>
          <select
            value={config.department}
            onChange={(e) => onChange({ department: e.target.value })}
            className={`w-full px-4 py-2.5 text-xs bg-white border ${
              errors.department ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
            } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-800`}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
          {errors.department && <p className="text-[11px] text-red-500">{errors.department}</p>}
        </div>

        {/* API Base URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0a1b3f] uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            API Base URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="https://example.gov/api"
            value={config.base_url}
            onChange={(e) => onChange({ base_url: e.target.value })}
            className={`w-full px-4 py-2.5 text-xs font-mono bg-white border ${
              errors.base_url ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
            } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800`}
          />
          {errors.base_url && <p className="text-[11px] text-red-500">{errors.base_url}</p>}
        </div>

        {/* Version & Endpoint in 2 Cols */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0a1b3f] uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              API Version <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="v1"
              value={config.api_version}
              onChange={(e) => onChange({ api_version: e.target.value })}
              className={`w-full px-4 py-2.5 text-xs font-mono bg-white border ${
                errors.api_version ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
              } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800`}
            />
            {errors.api_version && <p className="text-[11px] text-red-500">{errors.api_version}</p>}
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-[#0a1b3f] uppercase tracking-wider flex items-center gap-1.5">
              <Plug className="w-3.5 h-3.5 text-slate-400" />
              Endpoint Resource Path <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">/</span>
              <input
                type="text"
                placeholder="cameras"
                value={config.endpoint}
                onChange={(e) => onChange({ endpoint: e.target.value })}
                className={`w-full pl-7 pr-4 py-2.5 text-xs font-mono bg-white border ${
                  errors.endpoint ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800`}
              />
            </div>
            {errors.endpoint && <p className="text-[11px] text-red-500">{errors.endpoint}</p>}
          </div>
        </div>

        {/* Resolved Preview URL */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Target Sync URL:</span>
          <span className="font-mono text-blue-600 font-bold">
            {config.base_url.replace(/\/$/, "")}/{config.api_version}/{config.endpoint.replace(/^\//, "")}
          </span>
        </div>
      </div>
    </div>
  );
}
