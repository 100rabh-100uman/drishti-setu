"use client";

import Link from "next/link";
import { CheckCircle2, History, Video, RefreshCw } from "lucide-react";
import { ApiSyncResultData } from "@/types/api-onboarding";

interface ApiSyncResultProps {
  result: ApiSyncResultData;
  onReset: () => void;
}

export function ApiSyncResult({ result, onReset }: ApiSyncResultProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center animate-in fade-in zoom-in-95 duration-300">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/60 shadow-sm">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>

      <h2 className="text-2xl font-bold text-[#0a1b3f] mb-1.5">API Onboarding Initiated Successfully</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto mb-8">
        Remote synchronization job for <strong className="text-slate-800 font-bold">{result.integration_name}</strong> has been registered and ingested into DRISHTI SETU.
      </p>

      {/* 4 Ingestion Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase text-slate-400">Records Received</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{result.records_received}</div>
          <span className="text-[10px] text-slate-500">From remote API</span>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100">
          <span className="text-[10px] font-bold uppercase text-emerald-600">Records Accepted</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{result.records_accepted}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Auto-registered</span>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-100">
          <span className="text-[10px] font-bold uppercase text-amber-600">Need Review</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{result.records_needing_review}</div>
          <span className="text-[10px] text-amber-600 font-medium">Flagged for operator</span>
        </div>

        <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-100">
          <span className="text-[10px] font-bold uppercase text-rose-600">Rejected</span>
          <div className="text-2xl font-bold text-rose-700 mt-1">{result.records_rejected}</div>
          <span className="text-[10px] text-rose-600 font-medium">Malformed schema</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/cameras"
          className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 transition-all"
        >
          <Video className="w-4 h-4" />
          Go to Camera Registry
        </Link>
        <Link
          href="/cameras/history"
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
        >
          <History className="w-4 h-4 text-slate-500" />
          View Import History
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          New Integration
        </button>
      </div>
    </div>
  );
}
