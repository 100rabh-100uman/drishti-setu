"use client";

import { ArrowLeft, Save, CheckCircle, Loader2 } from "lucide-react";

interface FormNavigationProps {
  currentStep: number;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => Promise<void>;
  onSaveDraft: () => void;
  onSubmit: () => Promise<void>;
}

export function FormNavigation({
  currentStep,
  isSubmitting,
  onBack,
  onNext,
  onSaveDraft,
  onSubmit,
}: FormNavigationProps) {
  return (
    <div className="bg-white border-t border-slate-200 px-6 py-4 sticky bottom-0 z-20 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {/* Left - Back Button on EVERY step */}
      <div>
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {currentStep === 1 ? (
            <>
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Dashboard</span>
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back</span>
            </>
          )}
        </button>
      </div>

      {/* Center & Right */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 active:scale-[0.98] px-5 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-slate-500" />
          <span>Save Draft</span>
        </button>

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] px-8 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-70"
          >
            <span>Continue</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:scale-[0.98] px-8 py-2.5 rounded-xl transition-all shadow-md shadow-green-500/20 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Camera...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Create Camera</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
