"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApiOnboarding } from "@/hooks/useApiOnboarding";
import { ApiOnboardingWizard } from "@/components/cameras/onboarding/ApiOnboardingWizard";
import { ApiConnectionStep } from "@/components/cameras/onboarding/ApiConnectionStep";
import { ApiAuthenticationStep } from "@/components/cameras/onboarding/ApiAuthenticationStep";
import { ApiFieldMappingStep } from "@/components/cameras/onboarding/ApiFieldMappingStep";
import { ApiTestPreviewStep } from "@/components/cameras/onboarding/ApiTestPreviewStep";
import { ApiSyncStep } from "@/components/cameras/onboarding/ApiSyncStep";
import {
  Plug,
  LayoutDashboard,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Video,
  FileSpreadsheet
} from "lucide-react";

export default function ApiOnboardingPageClient() {
  const router = useRouter();
  const {
    currentStep,
    completedSteps,
    departments,
    connectionConfig,
    setConnectionConfig,
    connectionErrors,
    authConfig,
    setAuthConfig,
    authErrors,
    fieldMappings,
    updateMapping,
    autoMapFields,
    isTesting,
    testResult,
    runTestConnection,
    previewRecords,
    isValidating,
    validationSummary,
    runValidateData,
    isSyncing,
    syncProgress,
    syncStepText,
    syncResult,
    runStartSync,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
  } = useApiOnboarding();

  const handleBack = () => {
    if (currentStep > 1) {
      prevStep();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent pb-20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Navigation & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <Link href="/cameras" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              CCTV Registry
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">API Onboarding</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Back to Dashboard
            </Link>
            <Link
              href="/cameras/import"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              File Upload Mode
            </Link>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-white/80 dark:bg-[#0c162d] backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-teal-500/25">
              <Plug className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">API Onboarding</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
                Connect an external department, vendor or CCTV system and onboard camera metadata into the DRISHTI SETU registry.
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Step Wizard Stepper */}
        <ApiOnboardingWizard
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />

        {/* Wizard Form Area */}
        <div className="bg-white dark:bg-[#0c162d] rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-8 min-h-[500px]">
          {currentStep === 1 && (
            <ApiConnectionStep
              config={connectionConfig}
              onChange={(updated) => setConnectionConfig((prev) => ({ ...prev, ...updated }))}
              errors={connectionErrors}
              departments={departments}
            />
          )}

          {currentStep === 2 && (
            <ApiAuthenticationStep
              config={authConfig}
              onChange={(updated) => setAuthConfig((prev) => ({ ...prev, ...updated }))}
              errors={authErrors}
            />
          )}

          {currentStep === 3 && (
            <ApiFieldMappingStep
              mappings={fieldMappings}
              onUpdateMapping={updateMapping}
              onAutoMap={autoMapFields}
            />
          )}

          {currentStep === 4 && (
            <ApiTestPreviewStep
              isTesting={isTesting}
              testResult={testResult}
              onTestConnection={runTestConnection}
              records={previewRecords}
              isValidating={isValidating}
              validationSummary={validationSummary}
              onValidateData={runValidateData}
            />
          )}

          {currentStep === 5 && (
            <ApiSyncStep
              connection={connectionConfig}
              mappings={fieldMappings}
              isSyncing={isSyncing}
              syncProgress={syncProgress}
              syncStepText={syncStepText}
              syncResult={syncResult}
              onStartSync={runStartSync}
              onReset={resetWizard}
            />
          )}

          {/* Navigation Controls (Hidden on Step 5 if sync completed) */}
          {(!syncResult || currentStep < 5) && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={isSyncing}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                {currentStep === 1 ? "Back to Dashboard" : "Back to Previous Step"}
              </button>

              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-7 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.98] rounded-xl shadow-md shadow-blue-500/25 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
