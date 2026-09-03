"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FORM_STEPS } from "@/hooks/useAddCameraForm";

interface CameraFormStepperProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

export function CameraFormStepper({ currentStep, completedSteps, onStepClick }: CameraFormStepperProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-4 px-8 shadow-sm mb-6">
      <div className="flex items-center justify-between">
        {FORM_STEPS.map((step, idx) => {
          const isCompleted = completedSteps.has(step.id);
          const isActive = currentStep === step.id;
          const isPending = !isCompleted && !isActive;
          const isClickable = isCompleted || step.id <= currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-1.5 group transition-all",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                    isCompleted && "bg-green-500 text-white shadow-md shadow-green-200",
                    isActive && "bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-100",
                    isPending && "bg-slate-100 text-slate-400 border-2 border-slate-200"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-bold transition-colors whitespace-nowrap",
                    isCompleted && "text-green-600",
                    isActive && "text-blue-600",
                    isPending && "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {idx < FORM_STEPS.length - 1 && (
                <div className="flex-1 mx-3 mt-[-18px]">
                  <div
                    className={cn(
                      "h-0.5 rounded-full transition-all duration-500",
                      completedSteps.has(step.id) ? "bg-green-400" :
                      isActive ? "bg-blue-300" : "bg-slate-200"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
