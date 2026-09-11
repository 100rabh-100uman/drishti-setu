"use client";

import React, { useEffect, useState } from "react";
import { Building2, RefreshCw, AlertTriangle, Shield, Search, Building } from "lucide-react";

interface Department {
  id?: string | number;
  name: string;
  code?: string;
  description?: string;
}

export default function Departments() {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const fetchDepartments = () => {
    setLoading(true);
    setError(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/departments/get_departments/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        const list = Array.isArray(resData)
          ? resData
          : resData?.departments || resData?.data || [];
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
    fetchDepartments();
  }, []);

  const filteredDepts = data.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.code && d.code.toLowerCase().includes(q)) ||
      (d.id && String(d.id).includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 tracking-wider uppercase mb-1">
            <Building2 className="w-4 h-4 text-blue-400" />
            Inter-Agency Multi-Department Grid
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Departments & Municipal Authorities
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Unified multi-tenant government agencies connected to the DRISHTI SETU surveillance and dispatch pipeline.
          </p>
        </div>

        <button
          onClick={fetchDepartments}
          disabled={loading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh Departments"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400">LINKED AGENCIES</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{data.length}</div>
        </div>
        <div className="bg-[#0d1527] border border-blue-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-blue-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> SECURITY SECTOR
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">POLICE & TRAFFIC</div>
        </div>
        <div className="bg-[#0d1527] border border-emerald-500/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <Building className="w-3.5 h-3.5" /> CIVIC BODIES
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">AMC / GMC / GSDMA</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-[#0d1527] border border-slate-800 p-3.5 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search department name or agency code..."
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
          <p className="text-sm font-medium">Fetching registered state departments from /departments/get_departments/...</p>
        </div>
      ) : error || data.length === 0 ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No data available</h3>
          <p className="text-xs text-slate-500">
            No departments found from /departments/get_departments/.
          </p>
          <button
            onClick={fetchDepartments}
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
                  <th className="py-3 px-4">Dept ID</th>
                  <th className="py-3 px-4">Agency / Department Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Operational Domain</th>
                  <th className="py-3 px-4 text-right">Integration Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDepts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No departments match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDepts.map((dept, idx) => (
                    <tr key={dept.id || idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        #{dept.id || idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span>{dept.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 border border-slate-700">
                          {dept.code || `DEPT-${dept.id || idx + 1}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {dept.description || "State Command Surveillance & Dispatch"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                          FEDERATED
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
