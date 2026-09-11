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
  zone?: string;
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
      (log.status && log.status.toLowerCase().includes(q)) ||
      (log.zone && log.zone.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wider uppercase mb-1">
            <Wrench className="w-4 h-4 text-amber-400" />
            Field Operations & Repairs
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Surveillance Maintenance & Service Tickets
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sensor recalibration, optic lens cleaning, RTSP jitter repairs, and field technician dispatch logs.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh Logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400">TOTAL TICKETS</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{data.length}</div>
        </div>
        <div className="bg-[#0d1527] border border-rose-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> CRITICAL / HIGH
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">
            {data.filter((l) => ["critical", "high"].includes(l.priority?.toLowerCase())).length}
          </div>
        </div>
        <div className="bg-[#0d1527] border border-amber-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> IN PROGRESS
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">
            {data.filter((l) => l.status?.toLowerCase().includes("progress") || l.status?.toLowerCase().includes("scheduled")).length}
          </div>
        </div>
        <div className="bg-[#0d1527] border border-emerald-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> RESOLVED
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">
            {data.filter((l) => l.status?.toLowerCase().includes("resolved")).length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-[#0d1527] border border-slate-800 p-3.5 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, cameras, technicians..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070d1d] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching maintenance tickets from /maintenance/get_logs/...</p>
        </div>
      ) : error || data.length === 0 ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No data available</h3>
          <p className="text-xs text-slate-500">
            No maintenance tickets returned from /maintenance/get_logs/.
          </p>
          <button
            onClick={fetchLogs}
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
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Camera</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Tech</th>
                  <th className="py-3 px-4 text-right">Scheduled / Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
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
                      <tr key={log.id || idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                          {log.id || `MNT-${idx + 101}`}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-white font-bold">
                          {log.camera_id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-200 max-w-sm">
                          {log.issue}
                        </td>
                        <td className="py-3.5 px-4">
                          {prioLower === "critical" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-600">
                              CRITICAL
                            </span>
                          )}
                          {prioLower === "high" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-orange-950 text-orange-300 border border-orange-600">
                              HIGH
                            </span>
                          )}
                          {prioLower === "medium" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950 text-amber-300 border border-amber-600">
                              MEDIUM
                            </span>
                          )}
                          {prioLower === "low" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                              LOW
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {log.technician || "Unassigned"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-400">
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
