"use client";

import { CheckCircle2, Camera, MapPin, Activity, Eye, PlusCircle, LayoutDashboard, X } from "lucide-react";
import { CameraCreateResponse } from "@/types/camera";

interface CameraCreatedDialogProps {
  result: CameraCreateResponse | null;
  onViewCamera: (cameraId: string) => void;
  onAddAnother: () => void;
  onBackToDashboard: () => void;
}

export function CameraCreatedDialog({
  result,
  onViewCamera,
  onAddAnother,
  onBackToDashboard,
}: CameraCreatedDialogProps) {
  if (!result) return null;

  const cameraId = result.camera.camera_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
        onClick={onBackToDashboard}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
        {/* Top-right close button */}
        <button
          type="button"
          onClick={onBackToDashboard}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors z-10"
          title="Close & Return to Dashboard"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Success Icon & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50/60">
              <CheckCircle2 className="w-10 h-10 text-green-500 stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-bold text-[#0a1b3f] mb-1.5">Camera Successfully Registered</h2>
            <p className="text-xs text-slate-500 max-w-xs">{result.message}</p>
          </div>

          {/* Camera Info Summary Card */}
          <div className="bg-slate-50/80 rounded-xl p-4 space-y-3.5 border border-slate-100 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Camera ID</span>
                <span className="text-sm font-bold text-slate-800 break-all">{result.camera.camera_id}</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity className="w-3.5 h-3.5 text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-bold text-green-600">{result.camera.status}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</span>
                <span className="text-xs font-semibold text-slate-700 line-clamp-2 mt-0.5">{result.camera.address}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            {/* 1. View Camera Details */}
            <button
              type="button"
              onClick={() => onViewCamera(cameraId)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md shadow-blue-500/25"
            >
              <Eye className="w-4 h-4" />
              View Camera Details
            </button>

            {/* 2. Add Another Camera */}
            <button
              type="button"
              onClick={onAddAnother}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.99] transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-slate-500" />
              Add Another Camera
            </button>

            {/* 3. Back to Dashboard */}
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 border border-transparent transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
