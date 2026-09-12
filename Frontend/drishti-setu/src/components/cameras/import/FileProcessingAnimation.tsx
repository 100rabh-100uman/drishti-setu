"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Search,
  ShieldCheck,
  CheckCircle2,
  FileText,
  RefreshCw,
  X,
  Sparkles,
  Shield,
  Check,
  Clock,
} from "lucide-react";

export interface FileProcessingAnimationProps {
  fileName: string;
  fileSize: string;
  onComplete: () => void;
  onCancel: () => void;
  onChangeFile: () => void;
}

interface ProcessingStage {
  id: number;
  name: string;
  shortLabel: string;
  description: string;
  icon: React.ElementType;
  startPct: number;
  endPct: number;
}

const STAGES: ProcessingStage[] = [
  {
    id: 1,
    name: "UPLOADING FILE",
    shortLabel: "Upload",
    description:
      "Establishing secure TLS connection with Gujarat Ingestion Gateway. Validating transport payload integrity...",
    icon: UploadCloud,
    startPct: 0,
    endPct: 20,
  },
  {
    id: 2,
    name: "READING DATASET",
    shortLabel: "Read",
    description:
      "Decoding raw byte stream, extracting headers, delimiter matrix, and column-to-registry schema mappings...",
    icon: FileSpreadsheet,
    startPct: 20,
    endPct: 42,
  },
  {
    id: 3,
    name: "SCANNING RECORDS",
    shortLabel: "Scan",
    description:
      "Analyzing hardware serial numbers, device UUIDs, RTSP stream specifications, and IPv4 network topologies...",
    icon: Search,
    startPct: 42,
    endPct: 68,
  },
  {
    id: 4,
    name: "VALIDATING STRUCTURE",
    shortLabel: "Validate",
    description:
      "Executing Gujarat GIS geo-boundary spatial checks, department codes, and cross-referencing uniqueness constraints...",
    icon: ShieldCheck,
    startPct: 68,
    endPct: 90,
  },
  {
    id: 5,
    name: "READY FOR IMPORT",
    shortLabel: "Ready",
    description:
      "Dataset validation complete with 0 fatal schema anomalies. Staging assets for operator pre-import inspection...",
    icon: CheckCircle2,
    startPct: 90,
    endPct: 100,
  },
];

const TOTAL_DURATION_MS = 6800; // 6.8 seconds total processing time
const STAGE_DURATION_MS = TOTAL_DURATION_MS / STAGES.length; // 1360ms per stage

export default function FileProcessingAnimation({
  fileName,
  fileSize,
  onComplete,
  onCancel,
  onChangeFile,
}: FileProcessingAnimationProps) {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;

      // Determine current stage index (0 to 4)
      const stageIdx = Math.min(
        Math.floor(elapsed / STAGE_DURATION_MS),
        STAGES.length - 1
      );
      setCurrentStageIdx(stageIdx);

      const currentStage = STAGES[stageIdx];
      const stageElapsed = elapsed - stageIdx * STAGE_DURATION_MS;
      const stageFraction = Math.min(stageElapsed / STAGE_DURATION_MS, 1);

      // Interpolate progress within stage bounds
      const interpolatedProgress = Math.round(
        currentStage.startPct +
          stageFraction * (currentStage.endPct - currentStage.startPct)
      );

      setProgress(Math.min(interpolatedProgress, 100));

      if (elapsed >= TOTAL_DURATION_MS) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setProgress(100);
        setCurrentStageIdx(STAGES.length - 1);
        setIsDone(true);

        // Pause briefly on Stage 5 "READY FOR IMPORT" (100% verified) before displaying preview
        completeTimeoutRef.current = setTimeout(() => {
          onComplete();
        }, 700);
      }
    }, 35);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
    };
  }, [onComplete]);

  const activeStage = STAGES[currentStageIdx];
  const ActiveIcon = activeStage.icon;

  const secondsRemaining = Math.max(
    0,
    Math.ceil((TOTAL_DURATION_MS - (progress / 100) * TOTAL_DURATION_MS) / 1000)
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in zoom-in-[0.99] duration-300">
      
      {/* Top Header & File Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800 flex items-center justify-center flex-shrink-0 shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight font-mono">
                {fileName}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                ({fileSize})
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
                SECURITY SCANNING
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              DRISHTI SETU Unified State Surveillance Ingestion Pipeline
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onChangeFile}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
          >
            Change File
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100/80 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      </div>

      {/* Hero Animated Processing Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100/70 dark:from-slate-800/60 dark:to-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 text-center">
        
        {/* Subtle decorative background scanner grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

        {/* Animated Scanner Hub */}
        <div className="relative inline-flex items-center justify-center mb-5">
          {/* Pulsing outer radar glow rings */}
          <div className="absolute w-24 h-24 rounded-full bg-blue-500/10 dark:bg-blue-400/10 animate-ping duration-1000" />
          <div className="absolute w-20 h-20 rounded-full border border-blue-500/30 dark:border-blue-400/30 animate-spin duration-3000" />
          
          {/* Inner Stage Icon Container */}
          <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
            isDone
              ? "bg-emerald-600 text-white shadow-emerald-500/30 scale-105"
              : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/30"
          }`}>
            <ActiveIcon className={`w-8 h-8 transition-transform duration-300 ${isDone ? "scale-110" : "animate-pulse"}`} />
          </div>
        </div>

        {/* Stage Name & Subtitle */}
        <div className="space-y-1.5 max-w-lg mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 mb-1">
            <span>STAGE {activeStage.id} OF {STAGES.length}</span>
            <span className="w-1 h-1 rounded-full bg-blue-400" />
            <span>{activeStage.name}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#0a1b3f] dark:text-slate-100 tracking-tight">
            {activeStage.name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal min-h-[36px]">
            {activeStage.description}
          </p>
        </div>

        {/* Progress Metric & Bar */}
        <div className="max-w-xl mx-auto space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
              {isDone ? "Integrity check finalized" : "Processing batch payload..."}
            </span>
            <div className="flex items-center gap-3">
              {!isDone && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{secondsRemaining}s remaining
                </span>
              )}
              <span className="font-mono font-bold text-sm text-blue-700 dark:text-blue-400">
                {progress}%
              </span>
            </div>
          </div>

          {/* Smooth High-Tech Progress Bar */}
          <div className="w-full bg-slate-200/80 dark:bg-slate-700/60 rounded-full h-3 p-0.5 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-150 ease-out shadow-sm ${
                isDone
                  ? "bg-emerald-500 shadow-emerald-500/50"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>

      {/* 5-Stage Stepper Track */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2">
        {STAGES.map((stg, idx) => {
          const isCompleted = currentStageIdx > idx || isDone;
          const isCurrent = currentStageIdx === idx && !isDone;
          const StgIcon = stg.icon;

          return (
            <div
              key={stg.id}
              className={`rounded-xl p-3.5 border transition-all duration-300 flex flex-col justify-between ${
                isCompleted
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300"
                  : isCurrent
                  ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-sm ring-1 ring-blue-500/20 text-blue-900 dark:text-blue-200"
                  : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  STAGE 0{stg.id}
                </span>

                <div className="flex items-center">
                  {isCompleted ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : isCurrent ? (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center">
                      {stg.id}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold truncate tracking-tight">
                  {stg.name}
                </div>
                <div className="text-[10px] font-medium mt-0.5 truncate">
                  {isCompleted ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Passed
                    </span>
                  ) : isCurrent ? (
                    <span className="text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                      Scanning...
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">
                      Queued
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Compliance Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-400 dark:text-slate-500 text-[11px]">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span>Security Standard: Gujarat Command & Control Center Unified Telemetry Ingestion v2.4</span>
        </div>
        <div className="font-mono text-[10px]">
          STATUS: <strong className="text-slate-700 dark:text-slate-300">{activeStage.name}</strong>
        </div>
      </div>

    </div>
  );
}
