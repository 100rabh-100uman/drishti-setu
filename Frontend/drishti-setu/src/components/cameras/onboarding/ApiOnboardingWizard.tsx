"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_ONBOARDING_STEPS } from "@/hooks/useApiOnboarding";

interface ApiOnboardingWizardProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

export function ApiOnboardingWizard({ currentStep, completedSteps, onStepClick }: ApiOnboardingWizardProps) {
  return (
    <div className="bg-white/80 dark:bg-[#0c162d]/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 px-8 shadow-sm mb-8">
      <div className="flex items-center justify-between">
        {API_ONBOARDING_STEPS.map((step, idx) => {
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
                  isClickable ? "cursor-pointer" : "cursor-default opacity-80"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    isCompleted && "bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none",
                    isActive && "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none ring-4 ring-blue-100 dark:ring-blue-900/40",
                    isPending && "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.id}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-bold transition-colors whitespace-nowrap",
                    isCompleted && "text-emerald-700 dark:text-emerald-400",
                    isActive && "text-blue-700 dark:text-blue-400",
                    isPending && "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {idx < API_ONBOARDING_STEPS.length - 1 && (
                <div className="flex-1 mx-4 mt-[-18px]">
                  <div
                    className={cn(
                      "h-0.5 rounded-full transition-all duration-500",
                      completedSteps.has(step.id) ? "bg-emerald-400 dark:bg-emerald-600" :
                      isActive ? "bg-blue-300 dark:bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
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
