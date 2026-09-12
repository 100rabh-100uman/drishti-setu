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
    <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 px-8 shadow-sm mb-6">
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
                    isCompleted && "bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-none",
                    isActive && "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none ring-4 ring-blue-100 dark:ring-blue-900/40",
                    isPending && "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-bold transition-colors whitespace-nowrap",
                    isCompleted && "text-green-600 dark:text-green-400",
                    isActive && "text-blue-600 dark:text-blue-400",
                    isPending && "text-slate-400 dark:text-slate-500"
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
                      completedSteps.has(step.id) ? "bg-green-400 dark:bg-green-500" :
                      isActive ? "bg-blue-300 dark:bg-blue-500" : "bg-slate-200 dark:bg-slate-800"
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
