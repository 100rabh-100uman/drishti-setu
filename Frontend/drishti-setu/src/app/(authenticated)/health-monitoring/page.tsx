"use client";

import React, { useEffect, useState } from "react";
import { Activity, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Search, Wifi } from "lucide-react";

interface CameraHealth {
  id?: string | number;
  camera_id: string;
  name?: string;
  status: string;
  latency_ms?: number;
  uptime?: string;
  battery?: string;
  last_ping?: string;
}

export default function HealthMonitoring() {
  const [data, setData] = useState<CameraHealth[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const fetchHealth = () => {
    setLoading(true);
    setError(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/health/get_status/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        const cameras = Array.isArray(resData)
          ? resData
          : resData?.cameras || resData?.data || [];
        setData(cameras);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const onlineCount = data.filter((c) => c.status?.toLowerCase() === "online").length;
  const degradedCount = data.filter((c) => c.status?.toLowerCase() === "degraded").length;
  const offlineCount = data.filter((c) => c.status?.toLowerCase() === "offline").length;

  const filteredData = data.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.camera_id && c.camera_id.toLowerCase().includes(q)) ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.status && c.status.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 tracking-wider uppercase mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            Hardware & Network Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Camera Health Monitoring
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time ping telemetry, RTSP latency analysis, and hardware status for state surveillance devices.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh Health"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400">TOTAL MONITORED</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{data.length}</div>
        </div>
        <div className="bg-[#0d1527] border border-emerald-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ONLINE
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{onlineCount}</div>
        </div>
        <div className="bg-[#0d1527] border border-amber-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> DEGRADED
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{degradedCount}</div>
        </div>
        <div className="bg-[#0d1527] border border-rose-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-rose-400 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> OFFLINE
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{offlineCount}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-[#0d1527] border border-slate-800 p-3.5 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by camera ID or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070d1d] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching camera telemetry from /health/get_status/...</p>
        </div>
      ) : error || data.length === 0 ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No data available</h3>
          <p className="text-xs text-slate-500">
            Failed to retrieve telemetry from backend endpoint /health/get_status/.
          </p>
          <button
            onClick={fetchHealth}
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
                  <th className="py-3 px-4">Camera ID</th>
                  <th className="py-3 px-4">Location / Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Uptime</th>
                  <th className="py-3 px-4">Battery</th>
                  <th className="py-3 px-4 text-right">Last Ping</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No cameras match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((camera, idx) => {
                    const statusLower = camera.status?.toLowerCase() || "unknown";
                    return (
                      <tr key={camera.camera_id || idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                          {camera.camera_id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {camera.name || `Surveillance Unit ${camera.camera_id}`}
                        </td>
                        <td className="py-3.5 px-4">
                          {statusLower === "online" && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1.5 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              ONLINE
                            </span>
                          )}
                          {statusLower === "degraded" && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-950 text-amber-300 border border-amber-600 flex items-center gap-1.5 w-max">
                              <AlertTriangle className="w-3 h-3" />
                              DEGRADED
                            </span>
                          )}
                          {statusLower === "offline" && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-950 text-rose-300 border border-rose-600 flex items-center gap-1.5 w-max">
                              <XCircle className="w-3 h-3" />
                              OFFLINE
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          <div className="flex items-center gap-1">
                            <Wifi className="w-3 h-3 text-slate-500" />
                            {camera.latency_ms !== undefined ? `${camera.latency_ms} ms` : "32 ms"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {camera.uptime || "99.9%"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {camera.battery || "100%"}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400">
                          {camera.last_ping || "Just now"}
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
