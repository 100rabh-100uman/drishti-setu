"use client";

import { UseFormReturn } from "react-hook-form";
import { CameraFormData, CAMERA_STATUS_OPTIONS } from "@/types/camera";
import { Activity, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraStatusStepProps {
  form: UseFormReturn<CameraFormData>;
}

const STATUS_DOTS: Record<string, string> = {
  Active: "bg-green-500",
  Inactive: "bg-slate-400",
  Maintenance: "bg-amber-500",
  Offline: "bg-red-500",
};

export function CameraStatusStep({ form }: CameraStatusStepProps) {
  const { watch, setValue, formState: { errors }, trigger } = form;
  const selectedStatus = watch("status");
  const needsReview = watch("needs_review");

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Activity className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#0a1b3f]">Operational Status</h3>
          <p className="text-xs text-slate-500">Set the current operational status of this camera</p>
        </div>
      </div>

      {/* Status cards */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-[#0a1b3f]">
          Status <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {CAMERA_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { setValue("status", option.value); trigger("status"); }}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                selectedStatus === option.value
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div className={cn("w-3 h-3 rounded-full", STATUS_DOTS[option.value])} />
              <span className={cn(
                "text-sm font-bold",
                selectedStatus === option.value ? "text-blue-700" : "text-slate-700"
              )}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
        {errors.status && <p className="text-xs text-red-500 font-medium">{errors.status.message}</p>}
      </div>

      {/* Needs Review toggle */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mt-0.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <label htmlFor="needs_review" className="text-sm font-bold text-[#0a1b3f] cursor-pointer">
                Requires Manual Review
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Mark this camera for verification by an authorized operator.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="needs_review"
            role="switch"
            aria-checked={needsReview}
            onClick={() => setValue("needs_review", !needsReview)}
            className={cn(
              "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              needsReview ? "bg-blue-600" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                needsReview ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
