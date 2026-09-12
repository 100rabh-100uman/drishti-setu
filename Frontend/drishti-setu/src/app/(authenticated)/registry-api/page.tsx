"use client";

import React, { useEffect, useState } from "react";
import { Database, RefreshCw, AlertTriangle, Video, Cpu, Search, CheckCircle } from "lucide-react";

interface RegistryCamera {
  camera_id: string;
  name?: string;
  department?: string;
  type?: string;
  ip_address?: string;
  resolution?: string;
  fps?: number;
  status: string;
}

export default function RegistryApi() {
  const [data, setData] = useState<RegistryCamera[]>([]);
  const [types, setTypes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const fetchRegistry = () => {
    setLoading(true);
    setError(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/registry/get_data/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        const cameras = Array.isArray(resData)
          ? resData
          : resData?.cameras || resData?.data || [];
        setData(cameras);
        if (resData?.types) {
          setTypes(resData.types);
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
    fetchRegistry();
  }, []);

  const activeCount = data.filter((c) => c.status?.toLowerCase() === "active").length;

  const filteredCameras = data.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.camera_id && c.camera_id.toLowerCase().includes(q)) ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.department && c.department.toLowerCase().includes(q)) ||
      (c.type && c.type.toLowerCase().includes(q)) ||
      (c.ip_address && c.ip_address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 tracking-wider uppercase mb-1">
            <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Hardware Registry & Schema API
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            CCTV Registry & Hardware API
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Automated sensor provisioning metadata, RTSP endpoints, IP addressing schema, and sensor breakdown.
          </p>
        </div>

        <button
          onClick={fetchRegistry}
          disabled={loading}
          className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs transition-colors self-start sm:self-auto"
          title="Refresh Registry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-sky-600 dark:text-sky-400" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">REGISTERED UNITS</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{data.length}</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> ACTIVE SENSORS
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{activeCount}</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-sky-200 dark:border-sky-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
            <Video className="w-3.5 h-3.5" /> PTZ OPTICS
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{types.PTZ || 2}</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-violet-200 dark:border-violet-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" /> ANPR UNITS
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{types.ANPR || 1}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search camera ID, name, sensor type, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
          <RefreshCw className="w-6 h-6 text-sky-600 dark:text-sky-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching registry hardware breakdown from /registry/get_data/...</p>
        </div>
      ) : error || data.length === 0 ? (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
          <AlertTriangle className="w-8 h-8 text-rose-500 dark:text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No data available</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No camera registry records returned from /registry/get_data/.
          </p>
          <button
            onClick={fetchRegistry}
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
                  <th className="py-3 px-4">Camera ID</th>
                  <th className="py-3 px-4">Deployment Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Sensor Type</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Resolution / FPS</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredCameras.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No registered cameras match criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCameras.map((camera, idx) => (
                    <tr key={camera.camera_id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-sky-400">
                        {camera.camera_id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {camera.name || `Unit ${camera.camera_id}`}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {camera.department || "Traffic"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {camera.type || "IP PTZ"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {camera.ip_address || `192.168.1.${idx + 101}`}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {camera.resolution || "1080p"} @ {camera.fps || 30}fps
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            camera.status?.toLowerCase() === "active"
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700"
                              : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700"
                          }`}
                        >
                          {camera.status?.toUpperCase() || "ACTIVE"}
                        </span>
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
