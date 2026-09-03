"use client";

import Link from "next/link";
import { ChevronRight, Camera, LayoutDashboard, ArrowLeft } from "lucide-react";

export function AddCameraHeader() {
  return (
    <div className="mb-6">
      {/* Breadcrumb & Navigation Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-slate-500 hover:text-blue-600 transition-colors font-medium flex items-center gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/cameras" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">
            CCTV Registry
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-blue-600 font-semibold">Add Camera</span>
        </div>

        {/* Quick Back to Dashboard Button */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Title Card */}
      <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0a1b3f]">Add New CCTV Camera</h1>
            <p className="text-sm text-slate-500 mt-0.5">Register a CCTV asset into the DRISHTI SETU registry.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
