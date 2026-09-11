"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, RefreshCw, Layers, Shield, Search } from "lucide-react";

interface Zone {
  id?: string | number;
  zone_id?: string;
  name: string;
  code?: string;
  description?: string;
  location?: string;
  department_id?: number;
  color?: string;
  latlngs?: number[][];
}

export default function GisMap() {
  const [data, setData] = useState<Zone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const fetchZones = () => {
    setLoading(true);
    setError(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/zones/get_zones/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        const zones = Array.isArray(resData)
          ? resData
          : resData?.zones || resData?.data || [];
        setData(zones);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const filteredZones = data.filter((zone) => {
    const q = search.toLowerCase();
    return (
      (zone.name && zone.name.toLowerCase().includes(q)) ||
      (zone.code && zone.code.toLowerCase().includes(q)) ||
      (zone.zone_id && zone.zone_id.toLowerCase().includes(q)) ||
      (zone.description && zone.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-wider uppercase mb-1">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Gujarat Police Spatial Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            GIS Map & Surveillance Corridors
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time geospatial boundaries, CCTV surveillance corridors, and PostGIS polygon geometries across Gujarat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Live Tactical Grid
          </Link>
          <button
            onClick={fetchZones}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Refresh Zones"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search & Counter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d1527] border border-slate-800 p-3.5 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search surveillance zones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070d1d] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 self-end sm:self-center">
          Total Zones: <span className="text-cyan-400 font-bold">{data.length}</span>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching surveillance zones from backend...</p>
        </div>
      ) : error || data.length === 0 ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <Shield className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No data available</h3>
          <p className="text-xs text-slate-500">
            Could not retrieve zone geometries from /zones/get_zones/. Ensure the backend is online.
          </p>
          <button
            onClick={fetchZones}
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
                  <th className="py-3 px-4">Zone ID</th>
                  <th className="py-3 px-4">Zone Name</th>
                  <th className="py-3 px-4">Corridor Code</th>
                  <th className="py-3 px-4">Description / Location</th>
                  <th className="py-3 px-4">Geometry</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredZones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No zones match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredZones.map((zone, idx) => (
                    <tr key={zone.id || zone.zone_id || idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {zone.zone_id || zone.id || `Z${idx + 1}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: zone.color || "#3b82f6" }}
                          />
                          {zone.name}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {zone.code || "GUJ-SURV"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-md">
                        {zone.description || zone.location || "Gujarat Police high-security coverage perimeter"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {zone.latlngs && Array.isArray(zone.latlngs)
                          ? `${zone.latlngs.length} polygon vertices`
                          : "Polygon WKT (PostGIS)"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                          ACTIVE CORRIDOR
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
