"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { CameraFormData } from "@/types/camera";
import { CheckCircle2, Circle, Camera, Building2, MapPin, Activity } from "lucide-react";
import { FORM_STEPS } from "@/hooks/useAddCameraForm";
import { cn } from "@/lib/utils";

interface RegistrationSummaryProps {
  form: UseFormReturn<CameraFormData>;
  currentStep: number;
  completedSteps: Set<number>;
}

export function RegistrationSummary({ form, currentStep, completedSteps }: RegistrationSummaryProps) {
  const values = useWatch({ control: form.control });

  return (
    <div className="bg-white/80 dark:bg-[#0c162d]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm sticky top-24 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 p-4">
        <h3 className="font-bold text-[#0a1b3f] dark:text-white">Registration Progress</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Real-time status</p>
      </div>

      <div className="p-5 space-y-6">
        {/* Step list */}
        <div className="space-y-4">
          {FORM_STEPS.map((step) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 dark:border-blue-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <div>
                  <div className={cn(
                    "text-xs font-bold",
                    isCompleted ? "text-slate-800 dark:text-slate-200" : isCurrent ? "text-blue-700 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                  )}>
                    {step.description}
                  </div>
                  <div className={cn(
                    "text-[10px] font-medium",
                    isCompleted ? "text-green-600 dark:text-green-400" : isCurrent ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                  )}>
                    {isCompleted ? "Complete" : isCurrent ? "In Progress" : "Pending"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        {/* Live Preview */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Live Preview</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <Camera className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5" />
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Camera ID</div>
                <div className={cn("text-xs font-bold truncate w-40", values.camera_id ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic font-normal")}>
                  {values.camera_id || "Not set"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5" />
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Department</div>
                <div className={cn("text-xs font-bold truncate w-40", values.department ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic font-normal")}>
                  {values.department || "Not set"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5" />
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Location</div>
                <div className={cn("text-xs font-bold", (values.latitude && values.longitude) ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic font-normal")}>
                  {(values.latitude && values.longitude) ? `${values.latitude}, ${values.longitude}` : "Not set"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Activity className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5" />
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Status</div>
                {values.status ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      values.status === 'Active' ? 'bg-green-500' :
                      values.status === 'Maintenance' ? 'bg-amber-500' :
                      values.status === 'Offline' ? 'bg-red-500' : 'bg-slate-400'
                    }`} />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{values.status}</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 dark:text-slate-500 italic">Not set</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
