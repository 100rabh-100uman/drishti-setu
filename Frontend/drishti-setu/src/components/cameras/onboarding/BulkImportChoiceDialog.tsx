"use client";

import { useRouter } from "next/navigation";
import { FileSpreadsheet, Plug, X, ArrowRight, UploadCloud } from "lucide-react";

interface BulkImportChoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkImportChoiceDialog({ isOpen, onClose }: BulkImportChoiceDialogProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0a1b3f]">Onboard Camera Assets</h2>
              <p className="text-xs text-slate-500">How would you like to onboard camera data?</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Body */}
        <div className="p-6 space-y-4">
          
          {/* Option 1: File Upload */}
          <div
            onClick={() => {
              onClose();
              router.push("/cameras/import");
            }}
            className="group flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 cursor-pointer transition-all shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  Upload File
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Import camera data using CSV/Excel or the backend-supported file format with pre-validation.
              </p>
            </div>
          </div>

          {/* Option 2: API Onboarding */}
          <div
            onClick={() => {
              onClose();
              router.push("/cameras/api-onboarding");
            }}
            className="group flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 cursor-pointer transition-all shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-100/80 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
              <Plug className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                  API Onboarding
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect an external department, vendor, or CCTV system API and synchronize camera metadata automatically.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/cameras/import");
            }}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/cameras/api-onboarding");
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            API Onboarding
          </button>
        </div>

      </div>
    </div>
  );
}
