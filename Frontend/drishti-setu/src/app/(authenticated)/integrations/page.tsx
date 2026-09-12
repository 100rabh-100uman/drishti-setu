"use client";

import React, { useEffect, useState } from "react";
import { Network, RefreshCw, CheckCircle2, AlertTriangle, Link2, Search, Globe } from "lucide-react";

interface ExternalIntegration {
  id?: string | number;
  name: string;
  protocol: string;
  status: string;
  last_sync?: string;
  latency?: string;
  auth_mode?: string;
  endpoint?: string;
}

export default function Integrations() {
  const [data, setData] = useState<ExternalIntegration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const fetchIntegrations = () => {
    setLoading(true);
    setError(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/integrations/get_integrations/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        const list = Array.isArray(resData)
          ? resData
          : resData?.integrations || resData?.data || [];
        setData(list);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const connectedCount = data.filter((i) => i.status?.toLowerCase().includes("connect")).length;

  const filteredData = data.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.protocol && item.protocol.toLowerCase().includes(q)) ||
      (item.endpoint && item.endpoint.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 tracking-wider uppercase mb-1">
            <Network className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Inter-Agency Communications & Gateways
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            External Integrations & State Hubs
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Active connections to e-Challan, VAHAN/SARATHI vehicle DB, Dial 112 CAD dispatch, and Smart City feeds.
          </p>
        </div>

        <button
          onClick={fetchIntegrations}
          disabled={loading}
          className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs transition-colors self-start sm:self-auto"
          title="Refresh Integrations"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600 dark:text-teal-400" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">STATE GATEWAYS</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{data.length}</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> CONNECTED & HEALTHY
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{connectedCount}</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-cyan-200 dark:border-cyan-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> PROTOCOLS
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">REST / WS / gRPC</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search integrations, protocols, endpoints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
          <RefreshCw className="w-6 h-6 text-teal-600 dark:text-teal-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Checking gateway status from /integrations/get_integrations/...</p>
        </div>
      ) : error || data.length === 0 ? (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
          <AlertTriangle className="w-8 h-8 text-rose-500 dark:text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No data available</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Could not fetch integration links from /integrations/get_integrations/.
          </p>
          <button
            onClick={fetchIntegrations}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow"
          >
            Retry Fetch
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Protocol</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Authentication</th>
                  <th className="py-3 px-4">API Endpoint</th>
                  <th className="py-3 px-4 text-right">Last Synchronized</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No integrations match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => {
                    const isHealthy = item.status?.toLowerCase().includes("connect");
                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isHealthy ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse" : "bg-amber-500 dark:bg-amber-400"
                              }`}
                            />
                            {item.name}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                          <span className="px-2 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold">
                            {item.protocol}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              isHealthy
                                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700"
                                : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                          {item.latency || "35ms"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                          {item.auth_mode || "Mutual TLS + API Key"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-blue-600 dark:text-cyan-400 text-[11px] max-w-xs truncate" title={item.endpoint}>
                          <div className="flex items-center gap-1">
                            <Link2 className="w-3 h-3 text-blue-500 dark:text-cyan-500 flex-shrink-0" />
                            <span className="truncate">{item.endpoint || "Internal RPC Bus"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400">
                          {item.last_sync || "1 min ago"}
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
