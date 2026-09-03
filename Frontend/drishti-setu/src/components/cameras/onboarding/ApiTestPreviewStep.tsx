"use client";

import { TestConnectionResult, PreviewCameraRecord, ValidationSummary } from "@/types/api-onboarding";
import { ApiConnectionStatus } from "./ApiConnectionStatus";
import { ApiPreviewTable } from "./ApiPreviewTable";
import { Activity, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";

interface ApiTestPreviewStepProps {
  isTesting: boolean;
  testResult: TestConnectionResult | null;
  onTestConnection: () => void;
  records: PreviewCameraRecord[];
  isValidating: boolean;
  validationSummary: ValidationSummary | null;
  onValidateData: () => void;
}

export function ApiTestPreviewStep({
  isTesting,
  testResult,
  onTestConnection,
  records,
  isValidating,
  validationSummary,
  onValidateData,
}: ApiTestPreviewStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0a1b3f]">Handshake Test & Schema Preview</h3>
            <p className="text-xs text-slate-500">Verify network reachability and preview remote sample payload</p>
          </div>
        </div>

        {/* Action Button: Test Connection */}
        <button
          type="button"
          onClick={onTestConnection}
          disabled={isTesting}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          {isTesting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing Handshake...
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" /> Test Connection
            </>
          )}
        </button>
      </div>

      {/* Connection Diagnostic Card */}
      <ApiConnectionStatus isTesting={isTesting} result={testResult} onRetry={onTestConnection} />

      {/* Preview Records Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Sample Remote Payload Preview</h4>
            <p className="text-xs text-slate-500">Live sample records returned from the connected endpoint</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Demo Payload
            </span>
            <button
              type="button"
              onClick={onValidateData}
              disabled={isValidating || records.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" /> Validating...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3" /> Validate Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table */}
        <ApiPreviewTable records={records} />

        {/* Validation Results Strip */}
        {validationSummary && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Frontend Preview Validation Report:
              </span>
              <span className="text-[11px] text-slate-400 italic">
                Client-side preliminary check (backend validation runs on ingestion)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Valid Records</div>
                  <div className="text-xs font-bold text-slate-800">{validationSummary.valid_records}</div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Missing Fields</div>
                  <div className="text-xs font-bold text-slate-800">{validationSummary.missing_fields}</div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Invalid Geocodes</div>
                  <div className="text-xs font-bold text-slate-800">{validationSummary.invalid_coordinates}</div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Duplicate IDs</div>
                  <div className="text-xs font-bold text-slate-800">{validationSummary.duplicate_ids}</div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Invalid Records</div>
                  <div className="text-xs font-bold text-slate-800">{validationSummary.invalid_records}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
