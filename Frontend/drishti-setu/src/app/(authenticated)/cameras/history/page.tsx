"use client";

import Link from "next/link";
import {
  History,
  LayoutDashboard,
  ChevronRight,
  Video,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from "lucide-react";

export default function ImportHistoryPage() {
  const mockHistory = [
    {
      id: "IMP-2026-003",
      fileName: "ahmedabad_zone_west_cctv_batch2.xlsx",
      date: "02 Sept 2026, 15:30",
      totalRecords: 142,
      successful: 142,
      failed: 0,
      status: "Completed",
      department: "Gujarat Police"
    },
    {
      id: "IMP-2026-002",
      fileName: "traffic_junctions_phase4.csv",
      date: "28 Aug 2026, 11:15",
      totalRecords: 85,
      successful: 81,
      failed: 4,
      status: "Partial",
      department: "Traffic Management"
    },
    {
      id: "IMP-2026-001",
      fileName: "gandhinagar_smart_city_cams.xlsx",
      date: "14 Aug 2026, 09:45",
      totalRecords: 220,
      successful: 220,
      failed: 0,
      status: "Completed",
      department: "Municipal Corporation"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navigation & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
            <span className="text-blue-600 font-semibold">Import History</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
              Back to Dashboard
            </Link>
            <Link
              href="/cameras/import"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
            >
              Bulk Import
            </Link>
          </div>
        </div>

        {/* Page Banner */}
        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0a1b3f]">Batch Import History</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit trail and batch processing records of bulk camera onboarding sheets
              </p>
            </div>
          </div>
        </div>

        {/* Table of past imports */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Batch ID</th>
                  <th className="py-3.5 px-5">File Name</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-5">Records</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {mockHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-blue-600">{row.id}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-slate-800">{row.fileName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">{row.department}</td>
                    <td className="py-4 px-5 text-slate-500">{row.date}</td>
                    <td className="py-4 px-5">
                      <span className="text-emerald-600 font-bold">{row.successful}</span> / {row.totalRecords}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        row.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {row.status === "Completed" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
