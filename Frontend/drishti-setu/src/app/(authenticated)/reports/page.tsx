"use client";

import React, { useEffect, useState } from "react";
import { FileText, RefreshCw, Download, FileSpreadsheet, AlertTriangle, Search, CheckCircle } from "lucide-react";

interface IntelligenceReport {
  id?: string | number;
  title: string;
  category: string;
  period?: string;
  author?: string;
  status: string;
  format?: string;
  file_size?: string;
}

interface SystemSummary {
  total_cameras?: number;
  uptime_percentage?: string;
  active_maintenance_tickets?: number;
  recorded_archives_count?: number;
}

export default function Reports() {
  const [data, setData] = useState<IntelligenceReport[]>([]);
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const fetchReports = () => {
    setLoading(true);
    setError(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/reports/get_reports/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        const reports = Array.isArray(resData)
          ? resData
          : resData?.reports || resData?.data || [];
        setData(reports);
        if (resData?.system_summary) {
          setSummary(resData.system_summary);
        }
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = data.filter((rep) => {
    const q = search.toLowerCase();
    return (
      (rep.title && rep.title.toLowerCase().includes(q)) ||
      (rep.category && rep.category.toLowerCase().includes(q)) ||
      (rep.author && rep.author.toLowerCase().includes(q)) ||
      (rep.status && rep.status.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 tracking-wider uppercase mb-1">
            <FileText className="w-4 h-4 text-blue-400" />
            Executive Intelligence & Briefs
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Surveillance Reports & Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generated weekly crime surveillance summaries, OpenCV alert audits, and corridor telemetry compliance reports.
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh Reports"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
        </button>
      </div>

      {/* KPI Cards — Dynamic System-Wide Sync */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0d1527] border border-cyan-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-cyan-400">STATE CAMERA GRID</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">
            {summary?.total_cameras ?? "500+"}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Total Monitored Nodes</div>
        </div>
        <div className="bg-[#0d1527] border border-emerald-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> GRID UPTIME
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
            {summary?.uptime_percentage ?? "98.5%"}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Live Telemetry Rate</div>
        </div>
        <div className="bg-[#0d1527] border border-amber-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-amber-400">MAINTENANCE TICKETS</div>
          <div className="text-2xl font-extrabold text-amber-300 mt-1 font-mono">
            {summary?.active_maintenance_tickets ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Pending Service Requests</div>
        </div>
        <div className="bg-[#0d1527] border border-blue-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-blue-400 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> 15-DAY ARCHIVES
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">
            {summary?.recorded_archives_count ?? "500+"}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Retention Compliant</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-[#0d1527] border border-slate-800 p-3.5 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reports by title, category, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070d1d] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching reports from /reports/get_reports/...</p>
        </div>
      ) : error || data.length === 0 ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No data available</h3>
          <p className="text-xs text-slate-500">
            No intelligence reports returned from /reports/get_reports/.
          </p>
          <button
            onClick={fetchReports}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow"
          >
            Retry Fetch
          </button>
        </div>
      ) : (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#070d1d] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Coverage Period</th>
                  <th className="py-3 px-4">Authoring Wing</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Format / Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No reports match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report, idx) => (
                    <tr key={report.id || idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {report.id || `REP-${idx + 1}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white max-w-sm">
                        {report.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 text-[10px] rounded bg-slate-800 border border-slate-700">
                          {report.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {report.period || "Current Month"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {report.author || "DGP Office"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                          {report.status || "Published"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Exporting ${report.title} (${report.format || 'PDF'})`)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 rounded text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center gap-1.5"
                        >
                          {report.format?.toUpperCase() === "XLSX" ? (
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                          <span>{report.format || "PDF"}</span>
                          <span className="text-[10px] text-slate-400">({report.file_size || "1.2 MB"})</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
