"use client";

import { TestConnectionResult } from "@/types/api-onboarding";
import { CheckCircle2, RefreshCw } from "lucide-react";

interface ApiConnectionStatusProps {
  isTesting: boolean;
  result: TestConnectionResult | null;
  onRetry: () => void;
}

export function ApiConnectionStatus({ isTesting, result, onRetry }: ApiConnectionStatusProps) {
  if (isTesting) {
    return (
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 flex items-center gap-4 animate-in fade-in">
        <RefreshCw className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
        <div>
          <div className="text-sm font-bold text-blue-950">Performing Live Diagnostic Handshake...</div>
          <p className="text-xs text-blue-700 mt-0.5">
            Testing host resolution, TLS handshake, API key validation, and endpoint latency.
          </p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Endpoint Connection Established</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full font-mono">
                {result.status_code} OK
              </span>
            </div>
            <p className="text-xs text-slate-500">Latency: {result.latency_ms}ms • TLS 1.3 Active</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Re-test
        </button>
      </div>

      {/* Step Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {result.steps.map((step, idx) => (
          <div key={idx} className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">{step.step}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{step.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
