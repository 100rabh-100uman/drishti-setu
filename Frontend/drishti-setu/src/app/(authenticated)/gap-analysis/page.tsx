"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, RefreshCw, AlertOctagon, ShieldAlert, Video, Search } from "lucide-react";

interface CoverageGap {
  id?: string | number;
  zone_name: string;
  risk_level: string;
  coverage_pct?: string;
  blindspot_desc: string;
  recommended_cameras?: number;
  priority?: string;
}

export default function GapAnalysis() {
  const [data, setData] = useState<CoverageGap[]>([]);
  const [avgCoverage, setAvgCoverage] = useState<string>("66.6%");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const fetchGaps = () => {
    setLoading(true);
    setError(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/gap-analysis/get_data/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        const gaps = Array.isArray(resData)
          ? resData
          : resData?.gaps || resData?.data || [];
        setData(gaps);
        if (resData?.avg_coverage) {
          setAvgCoverage(resData.avg_coverage);
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
    fetchGaps();
  }, []);

  const criticalCount = data.filter((g) => g.risk_level?.toLowerCase() === "critical").length;
  const highCount = data.filter((g) => g.risk_level?.toLowerCase() === "high").length;

  const filteredGaps = data.filter((g) => {
    const q = search.toLowerCase();
    return (
      (g.zone_name && g.zone_name.toLowerCase().includes(q)) ||
      (g.blindspot_desc && g.blindspot_desc.toLowerCase().includes(q)) ||
      (g.risk_level && g.risk_level.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 dark:text-rose-400 tracking-wider uppercase mb-1">
            <BarChart3 className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            Corridor Blindspot Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Surveillance Gap Analysis & Blindspots
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            PostGIS spatial density analysis identifying unmonitored road intersections, underpasses, and PTZ camera recommendations.
          </p>
        </div>

        <button
          onClick={fetchGaps}
          disabled={loading}
          className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs transition-colors self-start sm:self-auto"
          title="Refresh Gap Analysis"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-rose-500" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">BLINDSPOTS IDENTIFIED</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{data.length}</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-cyan-200 dark:border-cyan-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">AVERAGE COVERAGE</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{avgCoverage}</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-rose-200 dark:border-rose-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5" /> CRITICAL GAPS
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{criticalCount}</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> HIGH RISK
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{highCount}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search blindspots, zones, risk levels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
          <RefreshCw className="w-6 h-6 text-rose-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Computing corridor coverage stats from /gap-analysis/get_data/...</p>
        </div>
      ) : error || data.length === 0 ? (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
          <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No data available</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Could not fetch gap analysis data from /gap-analysis/get_data/.
          </p>
          <button
            onClick={fetchGaps}
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
                  <th className="py-3 px-4">Gap ID</th>
                  <th className="py-3 px-4">Surveillance Zone</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Coverage</th>
                  <th className="py-3 px-4">Blindspot Description</th>
                  <th className="py-3 px-4">Recommended Hardware</th>
                  <th className="py-3 px-4 text-right">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredGaps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No blindspot records match criteria.
                    </td>
                  </tr>
                ) : (
                  filteredGaps.map((gap, idx) => {
                    const riskLower = gap.risk_level?.toLowerCase() || "medium";
                    return (
                      <tr key={gap.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-rose-500 dark:text-rose-400">
                          {gap.id || `GAP-${idx + 1}`}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {gap.zone_name}
                        </td>
                        <td className="py-3.5 px-4">
                          {riskLower === "critical" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-600">
                              CRITICAL
                            </span>
                          )}
                          {riskLower === "high" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-600">
                              HIGH
                            </span>
                          )}
                          {riskLower === "medium" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-600">
                              MEDIUM
                            </span>
                          )}
                          {riskLower === "low" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                              LOW
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-blue-600 dark:text-cyan-400 font-bold">
                          {gap.coverage_pct || "50%"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-sm">
                          {gap.blindspot_desc}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1">
                            <Video className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                            <span>+{gap.recommended_cameras || 2} Cameras</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                          {gap.priority || "P2 - High"}
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
