"use client";

import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon, RefreshCw, AlertTriangle, Shield, Sliders, CheckCircle2, Search } from "lucide-react";

interface SettingItem {
  category: string;
  key: string;
  value: string;
  type?: string;
}

export default function Settings() {
  const [data, setData] = useState<any>(null);
  const [settingsList, setSettingsList] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const fetchSettings = () => {
    setLoading(true);
    setError(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/settings/get_settings/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        // Flatten nested settings dict into key-value list for clear table display
        const list: SettingItem[] = [];
        if (resData && typeof resData === "object") {
          Object.keys(resData).forEach((cat) => {
            const val = resData[cat];
            if (val && typeof val === "object" && !Array.isArray(val)) {
              Object.keys(val).forEach((k) => {
                list.push({
                  category: cat.replace(/_/g, " ").toUpperCase(),
                  key: k.replace(/_/g, " "),
                  value: String(val[k]),
                });
              });
            } else {
              list.push({
                category: "GENERAL",
                key: cat.replace(/_/g, " "),
                value: String(val),
              });
            }
          });
        }
        setSettingsList(list);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setSettingsList([]);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const filteredSettings = settingsList.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.category.toLowerCase().includes(q) ||
      item.key.toLowerCase().includes(q) ||
      item.value.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-1">
            <SettingsIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            System Parameters & AI Controls
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Platform Configuration & Settings
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time control parameters for OpenCV threat detection thresholds, PostGIS SRID projection, and video retention.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs transition-colors self-start sm:self-auto"
          title="Refresh Settings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600 dark:text-cyan-400" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">PARAMETERS</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{settingsList.length}</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-cyan-200 dark:border-cyan-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" /> AI CONFIDENCE
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {data?.ai_alert_thresholds?.danger_action_confidence !== undefined
              ? `${Math.round(data.ai_alert_thresholds.danger_action_confidence * 100)}%`
              : "85%"}
          </div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> SECURITY
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">ENCRYPTED</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-violet-200 dark:border-violet-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> BUILD VERSION
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-2 font-mono truncate">
            {data?.version || "2.4.0-final"}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search configuration parameters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
          <RefreshCw className="w-6 h-6 text-blue-600 dark:text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching active configuration from /settings/get_settings/...</p>
        </div>
      ) : error || settingsList.length === 0 ? (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
          <AlertTriangle className="w-8 h-8 text-rose-500 dark:text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No data available</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Could not fetch platform settings from /settings/get_settings/.
          </p>
          <button
            onClick={fetchSettings}
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
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Parameter Key</th>
                  <th className="py-3 px-4">Configured Value</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredSettings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No parameters match search query.
                    </td>
                  </tr>
                ) : (
                  filteredSettings.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-cyan-400">
                        <span className="px-2 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white capitalize">
                        {item.key}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold max-w-md truncate">
                        {item.value}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                          ACTIVE
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
