"use client";

import React, { useEffect, useState } from "react";
import { Wrench, RefreshCw, AlertTriangle, CheckCircle, Clock, Search, User } from "lucide-react";

interface MaintenanceLog {
  id?: string | number;
  camera_id: string;
  issue: string;
  priority: string;
  status: string;
  technician?: string;
  scheduled_date?: string;
}

export default function Maintenance() {
  const [data, setData] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const fetchLogs = () => {
    setLoading(true);
    setError(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/maintenance/get_logs/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        const logs = Array.isArray(resData)
          ? resData
          : resData?.logs || resData?.data || [];
        setData(logs);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = data.filter((log) => {
    const q = search.toLowerCase();
    return (
      (log.camera_id && log.camera_id.toLowerCase().includes(q)) ||
      (log.issue && log.issue.toLowerCase().includes(q)) ||
      (log.technician && log.technician.toLowerCase().includes(q)) ||
      (log.status && log.status.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase mb-1">
            <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Field Operations & Repairs
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Surveillance Maintenance & Service Tickets
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Sensor recalibration, optic lens cleaning, RTSP jitter repairs, and field technician dispatch logs.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          title="Refresh Logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">TOTAL TICKETS</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{data.length}</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-rose-200 dark:border-rose-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> CRITICAL / HIGH
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-white mt-1 font-mono">
            {data.filter((l) => ["critical", "high"].includes(l.priority?.toLowerCase())).length}
          </div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> IN PROGRESS
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-white mt-1 font-mono">
            {data.filter((l) => l.status?.toLowerCase().includes("progress") || l.status?.toLowerCase().includes("scheduled")).length}
          </div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> RESOLVED
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-white mt-1 font-mono">
            {data.filter((l) => l.status?.toLowerCase().includes("resolved")).length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, cameras, technicians..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 shadow-xs">
          <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Fetching maintenance tickets from /maintenance/get_logs/...</p>
        </div>
      ) : error || data.length === 0 ? (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 shadow-xs">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">No data available</h3>
          <p className="text-xs text-slate-500">
            No maintenance tickets returned from /maintenance/get_logs/.
          </p>
          <button
            onClick={fetchLogs}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Retry Fetch
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Camera</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Tech</th>
                  <th className="py-3 px-4 text-right">Scheduled / Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No maintenance tickets match criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const prioLower = log.priority?.toLowerCase() || "low";
                    return (
                      <tr key={log.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-cyan-400">
                          {log.id || `MNT-${idx + 101}`}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-900 dark:text-white font-bold">
                          {log.camera_id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200 max-w-sm">
                          {log.issue}
                        </td>
                        <td className="py-3.5 px-4">
                          {prioLower === "critical" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-600">
                              CRITICAL
                            </span>
                          )}
                          {prioLower === "high" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-600">
                              HIGH
                            </span>
                          )}
                          {prioLower === "medium" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-600">
                              MEDIUM
                            </span>
                          )}
                          {prioLower === "low" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                              LOW
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {log.technician || "Unassigned"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                          {log.scheduled_date || "2026-03-10"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
