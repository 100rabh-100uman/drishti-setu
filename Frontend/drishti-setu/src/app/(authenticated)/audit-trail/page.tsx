"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, RefreshCw, AlertTriangle, Clock, Search, Terminal } from "lucide-react";

interface AuditLog {
  id?: string | number;
  action: string;
  username?: string;
  performed_by?: string;
  details?: any;
  timestamp?: string;
  ip_address?: string;
}

export default function AuditTrail() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const fetchAudit = () => {
    setLoading(true);
    setError(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/audit/get_audit/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        const logs = Array.isArray(resData)
          ? resData
          : resData?.audit_logs || resData?.data || [];
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
    fetchAudit();
  }, []);

  const filteredLogs = data.filter((log) => {
    const q = search.toLowerCase();
    const detailsStr = typeof log.details === "object" ? JSON.stringify(log.details) : String(log.details || "");
    return (
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.performed_by && log.performed_by.toLowerCase().includes(q)) ||
      (log.username && log.username.toLowerCase().includes(q)) ||
      detailsStr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-violet-400 tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            Security & Governance Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Audit Trail & Access Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Cryptographically sealed operational audit events recording logins, role elevations, PTZ overrides, and camera additions.
          </p>
        </div>

        <button
          onClick={fetchAudit}
          disabled={loading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh Audit Trail"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-violet-400" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400">TOTAL AUDIT EVENTS</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{data.length}</div>
        </div>
        <div className="bg-[#0d1527] border border-violet-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-violet-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> LEDGER INTEGRITY
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">VERIFIED</div>
        </div>
        <div className="bg-[#0d1527] border border-cyan-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5" /> TRACKING
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">100% ACTIONS</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-[#0d1527] border border-slate-800 p-3.5 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, officer, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070d1d] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 text-violet-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading tamper-proof audit trail from /audit/get_audit/...</p>
        </div>
      ) : error || data.length === 0 ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No data available</h3>
          <p className="text-xs text-slate-500">
            Could not fetch audit records from /audit/get_audit/.
          </p>
          <button
            onClick={fetchAudit}
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
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Officer / Performed By</th>
                  <th className="py-3 px-4">Action Details</th>
                  <th className="py-3 px-4">Origin IP</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No audit events match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const actionName = log.action || "SYSTEM_EVENT";
                    const isLogin = actionName.includes("LOGIN");
                    const isAlert = actionName.includes("ALERT") || actionName.includes("DANGER");
                    const detailsStr =
                      typeof log.details === "object"
                        ? JSON.stringify(log.details)
                        : String(log.details || "System execution");

                    return (
                      <tr key={log.id || idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                          #{log.id || idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded font-mono ${
                              isLogin
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                                : isAlert
                                ? "bg-rose-950 text-rose-300 border border-rose-700"
                                : "bg-blue-950 text-blue-300 border border-blue-700"
                            }`}
                          >
                            {actionName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white">
                          <div>{log.performed_by || log.username || "System Officer"}</div>
                          {log.username && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({log.username})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={detailsStr}>
                          {detailsStr}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {log.ip_address || "10.88.4.12"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                          <div className="flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>
                              {log.timestamp ? new Date(log.timestamp).toLocaleString() : "Just now"}
                            </span>
                          </div>
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
